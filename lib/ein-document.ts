/** Renders the EIN compliance filing as the actual IRS Form SS-4 (Rev. 12-2025) — the government's
 *  own published PDF, filled in — rather than a plain-text summary, since the point of this filing
 *  is a document that has to look like the real form. `public/forms/irs-ss4-blank.pdf` is that
 *  published PDF (a US government work, public domain) with its AcroForm fields still intact; this
 *  module only fills those fields and appends a Delegated Third Party Declaration as a second page.
 *  Field names below (`topmostSubform[0].Page1[0].f1_2[0]`, etc.) come from Adobe LiveCycle, which
 *  is how the IRS authors this form — they were reverse-engineered by inspecting the PDF's own
 *  AcroForm dictionary (there's no public field-name reference), so any future IRS revision that
 *  reflows the form would require re-deriving them the same way. */

import { PDFDocument, PDFFont, PDFName, StandardFonts, rgb } from "pdf-lib"

export type EinSignature = { dataUrl: string; signerName: string; signedAt: string }

const P = "topmostSubform[0].Page1[0]"

const FIELD = {
  legalName: `${P}.f1_2[0]`,
  tradeName: `${P}.f1_3[0]`,
  mailingStreet: `${P}.Line4ReadOrder[0].f1_5[0]`,
  mailingCityStateZip: `${P}.Line4ReadOrder[0].f1_6[0]`,
  countyState: `${P}.f1_9[0]`,
  responsibleName: `${P}.f1_10[0]`,
  responsibleSsn: `${P}.f1_11[0]`,
  corpFormNumber: `${P}.f1_16[0]`,
  incorpState: `${P}.f1_21[0]`,
  newBusinessSpecify: `${P}.f1_25[0]`,
  dateStarted: `${P}.f1_31[0]`,
  closingMonth: `${P}.f1_32[0]`,
  employeesAgricultural: `${P}.f1_33[0]`,
  employeesHousehold: `${P}.f1_34[0]`,
  employeesOther: `${P}.f1_35[0]`,
  principalActivityOtherSpecify: `${P}.f1_37[0]`,
  merchandiseLine: `${P}.f1_38[0]`,
  previousEin: `${P}.f1_39[0]`,
  applicantNameTitle: `${P}.f1_44[0]`,
} as const

const CHECKBOX = {
  llcNo: `${P}.c1_1[1]`,
  corporation: `${P}.c1_3[4]`,
  reason: {
    "Started new business": `${P}.c1_4[0]`,
    "Changed type of organization": `${P}.c1_4[1]`,
    "Hired employees": `${P}.c1_4[3]`,
    "Banking purpose": `${P}.c1_4[8]`,
    Other: `${P}.c1_4[7]`,
  } as Record<string, string>,
  activityOther: `${P}.c1_6[11]`,
  previousEinYes: `${P}.c1_7[0]`,
  previousEinNo: `${P}.c1_7[1]`,
} as const

/** Splits an address collected as one free-text field (see lib/signature.ts's identical
 *  first-comma convention) into the SS-4's separate street / city-state-zip boxes. */
function splitAddress(address: string): { street: string; cityStateZip: string } {
  const commaIndex = address.indexOf(",")
  if (commaIndex === -1) return { street: address, cityStateZip: "" }
  return { street: address.slice(0, commaIndex).trim(), cityStateZip: address.slice(commaIndex + 1).trim() }
}

function formatDateShort(iso: string): string {
  if (!iso) return ""
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })
}

function formatDateLong(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}

async function embedSignatureImage(pdfDoc: PDFDocument, signature: EinSignature) {
  const bytes = await fetch(signature.dataUrl).then((r) => r.arrayBuffer())
  return signature.dataUrl.startsWith("data:image/png") ? pdfDoc.embedPng(bytes) : pdfDoc.embedJpg(bytes)
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = []
  let current = ""
  for (const word of text.split(" ")) {
    const test = current ? `${current} ${word}` : word
    if (current && font.widthOfTextAtSize(test, size) > maxWidth) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

/** Appends the Delegated Third Party Declaration as page 2 — Vispo's own document (no official
 *  government layout to match), so it's drawn plainly rather than filled into a template. */
async function appendDelegationPage(pdfDoc: PDFDocument, values: Record<string, string>, signature?: EinSignature) {
  const page = pdfDoc.addPage([612, 792])
  const margin = 72
  const maxWidth = 612 - margin * 2
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica)
  let y = 720

  page.drawText("DELEGATED THIRD PARTY DECLARATION", { x: margin, y, size: 15, font: bold })
  y -= 20
  page.drawText(`Prepared for: ${values.companyName ?? ""}`, { x: margin, y, size: 10, font: regular, color: rgb(0.35, 0.35, 0.35) })
  y -= 14
  page.drawText(`Date prepared: ${formatDateLong(new Date().toISOString())}`, { x: margin, y, size: 10, font: regular, color: rgb(0.35, 0.35, 0.35) })
  y -= 40

  const paragraphs = [
    `I, the undersigned — ${values.responsible || "[Responsible Party]"} — understand that I am authorizing the third party, Nicola Serragiotto, to apply for and receive the Employer Identification Number (EIN) on behalf of ${values.companyName || "the Company"}, and to answer questions on my behalf about the completion of the attached Form SS-4.`,
    "By signing below, I certify under penalties of perjury that the information provided on the attached Form SS-4 is true, correct, and complete to the best of my knowledge, and I authorize the above delegation.",
  ]
  for (const para of paragraphs) {
    for (const line of wrapText(para, regular, 11, maxWidth)) {
      page.drawText(line, { x: margin, y, size: 11, font: regular })
      y -= 16
    }
    y -= 14
  }

  y -= 40
  const lineWidth = 260
  page.drawLine({ start: { x: margin, y }, end: { x: margin + lineWidth, y }, thickness: 1, color: rgb(0.2, 0.2, 0.2) })

  if (signature) {
    const img = await embedSignatureImage(pdfDoc, signature)
    const imgHeight = 30
    const imgWidth = (img.width / img.height) * imgHeight
    page.drawImage(img, { x: margin, y: y + 4, width: Math.min(imgWidth, lineWidth), height: imgHeight })
  }

  y -= 16
  page.drawText(values.responsible || "", { x: margin, y, size: 11, font: regular })
  y -= 16
  page.drawText(`Date: ${signature ? formatDateLong(signature.signedAt) : "_____________________"}`, { x: margin, y, size: 11, font: regular })
}

/** Builds the filled Form SS-4 (page 1) plus the Delegated Third Party Declaration (page 2) as one
 *  PDF, from a completed EIN filing's field values (see lib/flow.ts's `EIN` ComplianceItem) and,
 *  once signed, the officer's signature (see components/document-library.tsx's default signer slot
 *  — the EIN filing uses no `headerPattern`, so it's always the single default "officer" slot). */
export async function buildEinPdfBytes(values: Record<string, string>, signature?: EinSignature): Promise<Uint8Array> {
  const templateBytes = await fetch("/forms/irs-ss4-blank.pdf").then((r) => r.arrayBuffer())
  const pdfDoc = await PDFDocument.load(templateBytes)

  // The IRS publishes this as a hybrid AcroForm/XFA file — Adobe Acrobat/Reader renders the XFA
  // data island (still showing a blank form) instead of the AcroForm widget values filled below
  // unless that XFA entry is removed, which forces every viewer onto the AcroForm we just filled.
  const acroForm = pdfDoc.catalog.lookup(PDFName.of("AcroForm"))
  if (acroForm && "delete" in acroForm) (acroForm as { delete(key: PDFName): void }).delete(PDFName.of("XFA"))

  const form = pdfDoc.getForm()
  const setText = (name: string, value: string | undefined, fontSize?: number) => {
    if (!value) return
    try {
      const field = form.getTextField(name)
      if (fontSize !== undefined) field.setFontSize(fontSize)
      field.setText(value)
    } catch {
      // A future IRS revision may rename/remove a field — skip rather than fail the whole document.
    }
  }
  const check = (name: string | undefined) => {
    if (!name) return
    try {
      form.getCheckBox(name).check()
    } catch {
      // See setText's catch above.
    }
  }

  const { street, cityStateZip } = splitAddress(values.mailingAddress || "")

  setText(FIELD.legalName, values.companyName)
  setText(FIELD.tradeName, values.tradeName)
  setText(FIELD.mailingStreet, street)
  setText(FIELD.mailingCityStateZip, cityStateZip)
  setText(FIELD.countyState, values.county)
  setText(FIELD.responsibleName, values.responsible)
  setText(FIELD.responsibleSsn, values.ssn)

  check(CHECKBOX.llcNo) // this app only ever forms Delaware C-Corps, never LLCs

  check(CHECKBOX.corporation)
  setText(FIELD.corpFormNumber, "1120")
  setText(FIELD.incorpState, "Delaware")

  check(CHECKBOX.reason[values.reason] ?? CHECKBOX.reason.Other)
  if (values.reason === "Started new business") setText(FIELD.newBusinessSpecify, values.principalActivity, 7)

  setText(FIELD.dateStarted, formatDateShort(values.incorporationDate))
  setText(FIELD.closingMonth, values.closingMonth)

  setText(FIELD.employeesAgricultural, "0")
  setText(FIELD.employeesHousehold, "0")
  setText(FIELD.employeesOther, values.employeesExpected || "0")

  // Line 16 has no field in the flow's own data model for which of the IRS's 12 fixed categories
  // the business falls under, so — same judgment call the plain-text renderer already made by
  // combining lines 16–17 — this always checks "Other (specify)" and writes the collected
  // free-text principal-activity description into its blank.
  check(CHECKBOX.activityOther)
  setText(FIELD.principalActivityOtherSpecify, values.principalActivity, 7)
  setText(FIELD.merchandiseLine, values.principalActivity)

  if (values.previousEin) {
    check(CHECKBOX.previousEinYes)
    setText(FIELD.previousEin, values.previousEin)
  } else {
    check(CHECKBOX.previousEinNo)
  }

  setText(FIELD.applicantNameTitle, values.responsible)

  // The Signature/Date line has no AcroForm field of its own — the IRS excludes it even from the
  // fillable version of the form, since it still expects a wet or image signature — so it's drawn
  // directly onto the page rather than through the form API.
  if (signature) {
    const page = pdfDoc.getPages()[0]
    const img = await embedSignatureImage(pdfDoc, signature)
    const imgHeight = 16
    const imgWidth = (img.width / img.height) * imgHeight
    page.drawImage(img, { x: 40, y: 45, width: imgWidth, height: imgHeight })
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    page.drawText(formatDateShort(signature.signedAt.slice(0, 10)), { x: 350, y: 49, size: 10, font, color: rgb(0, 0, 0) })
  }

  form.flatten()

  await appendDelegationPage(pdfDoc, values, signature)

  return pdfDoc.save()
}
