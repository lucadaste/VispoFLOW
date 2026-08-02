/** Renders the 83(b) election compliance filing as the actual IRS Form 15620 (Rev. 4-2025) — the
 *  government's own published PDF, filled in — rather than a plain-text summary, mirroring how
 *  lib/ein-document.ts renders Form SS-4. `public/forms/irs-form-15620-blank.pdf` is that published
 *  PDF (a US government work, public domain) with its AcroForm fields still intact; this module only
 *  fills those fields. Unlike the SS-4, Form 15620 is a single page with no Vispo-authored page to
 *  append. Field names below (`form1[0].page1[0].taxpayerInformation[0].taxpayerName[0]`, etc.) come
 *  from Adobe LiveCycle, which is how the IRS authors this form — reverse-engineered by inspecting
 *  the PDF's own AcroForm dictionary the same way as the SS-4's. */

import { PDFDocument, PDFName } from "pdf-lib"
import { SENSITIVE_FIELD_PLACEHOLDER } from "@/lib/sensitive-field"

export type EightyThreeBSignature = { dataUrl: string; signerName: string; signedAt: string }

const P = "form1[0].page1[0]"

const FIELD = {
  taxpayerName: `${P}.taxpayerInformation[0].taxpayerName[0]`,
  taxpayerSsn: `${P}.taxpayerInformation[0].taxpayerSSN[0]`,
  taxpayerStreet: `${P}.taxpayerInformation[0].taxpayerAddress[0]`,
  taxpayerCity: `${P}.taxpayerInformation[0].taxpayerCityTown[0]`,
  taxpayerState: `${P}.taxpayerInformation[0].taxpayerState[0]`,
  taxpayerZip: `${P}.taxpayerInformation[0].taxpayerZIPCode[0]`,
  taxpayerCountry: `${P}.taxpayerInformation[0].taxpayerCountry[0]`,
  property: `${P}.describePropertyQuantity[0]`,
  transferDate: `${P}.propertyTransferred[0]`,
  taxableYear: `${P}.taxableYear[0]`,
  restrictions: `${P}.propertyRestrictions[0]`,
  fmvPerItem: `${P}.fairMarketValue[0].valuePerItem[0]`,
  fmvQuantity: `${P}.fairMarketValue[0].qunaityTransferred[0]`,
  fmvTotal: `${P}.fairMarketValue[0].fairMarketValue[0]`,
  paidPerItem: `${P}.undersignedPaid[0].paidPerItem[0]`,
  paidQuantity: `${P}.undersignedPaid[0].qunatityTransferred[0]`,
  paidTotal: `${P}.undersignedPaid[0].totalPricePaid[0]`,
  grossIncome: `${P}.taxableYearGrossIncome[0]`,
  serviceRecipientName: `${P}.personEntityInformation[0].personEntityName[0]`,
  serviceRecipientTin: `${P}.personEntityInformation[0].personEntityTIN[0]`,
  serviceRecipientStreet: `${P}.personEntityInformation[0].personAddress[0]`,
  serviceRecipientCity: `${P}.personEntityInformation[0].personCityTown[0]`,
  serviceRecipientState: `${P}.personEntityInformation[0].personState[0]`,
  serviceRecipientZip: `${P}.personEntityInformation[0].personZIPCode[0]`,
  serviceRecipientCountry: `${P}.personEntityInformation[0].personCountry[0]`,
  dateSigned: `${P}.dateSigned[0]`,
} as const

/** Splits an address collected as one free-text field (see lib/ein-document.ts's identical
 *  first-comma convention) into the separate street / city / state / ZIP boxes this form uses. */
function splitAddress(address: string): { street: string; city: string; state: string; zip: string } {
  const [street = "", city = "", stateZip = ""] = address.split(",").map((p) => p.trim())
  const match = stateZip.match(/^(.*\S)\s+(\S+)$/)
  return { street, city, state: match ? match[1] : stateZip, zip: match ? match[2] : "" }
}

function num(v: string | undefined): number {
  const n = parseFloat((v || "").replace(/[^0-9.-]/g, ""))
  return Number.isFinite(n) ? n : 0
}

function money(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Per-share prices are routinely fractions of a cent (e.g. $0.0001 par value) — rounding to 2
// decimals like a dollar total would silently display them as $0.00 (see lib/compliance-templates.ts's
// identical perShare()).
function perShare(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })
}

function formatDateShort(iso: string): string {
  if (!iso) return ""
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })
}

/** Builds the filled Form 15620 as a PDF, from a completed 83(b) filing's field values (see
 *  lib/flow.ts's `EIGHTY_THREE_B` ComplianceItem) and, once signed, the taxpayer's signature (see
 *  components/document-library.tsx's default signer slot — the 83(b) filing uses no `headerPattern`,
 *  so it's always the single default "officer" slot). */
export async function buildEightyThreeBPdfBytes(values: Record<string, string>, signature?: EightyThreeBSignature): Promise<Uint8Array> {
  const templateBytes = await fetch("/forms/irs-form-15620-blank.pdf").then((r) => r.arrayBuffer())
  const pdfDoc = await PDFDocument.load(templateBytes)

  // The IRS publishes this as a hybrid AcroForm/XFA file, same as the SS-4 — see lib/ein-document.ts's
  // identical fix for why the XFA entry has to go for the AcroForm values filled below to show up.
  const acroForm = pdfDoc.catalog.lookup(PDFName.of("AcroForm"))
  if (acroForm && "delete" in acroForm) (acroForm as { delete(key: PDFName): void }).delete(PDFName.of("XFA"))

  const form = pdfDoc.getForm()
  const setText = (name: string, value: string | undefined) => {
    if (!value) return
    try {
      form.getTextField(name).setText(value)
    } catch {
      // A future IRS revision may rename/remove a field — skip rather than fail the whole document.
    }
  }

  const taxpayerAddr = splitAddress(values.taxpayerAddress || "")
  setText(FIELD.taxpayerName, values.taxpayer)
  // A redacted SSN (see lib/sensitive-field.ts) reads as a full sentence — far too long for the
  // box's width — so it's left blank here rather than overflowing the box; the account holder still
  // gets a clear "reopen this filing to re-enter" cue from the Doc Library card itself.
  setText(FIELD.taxpayerSsn, values.taxpayerTin === SENSITIVE_FIELD_PLACEHOLDER ? undefined : values.taxpayerTin)
  setText(FIELD.taxpayerStreet, taxpayerAddr.street)
  setText(FIELD.taxpayerCity, taxpayerAddr.city)
  setText(FIELD.taxpayerState, taxpayerAddr.state)
  setText(FIELD.taxpayerZip, taxpayerAddr.zip)
  setText(FIELD.taxpayerCountry, values.taxpayerAddress ? "United States" : undefined)

  const shares = num(values.shares)
  const pricePerShare = num(values.pricePerShare)
  // A founder's purchase price is normally also the shares' fair market value at grant (see
  // lib/compliance-templates.ts's identical eightyThreeB() judgment call), so Box 6 (FMV) and Box 7
  // (amount paid) use the same per-share price, and Box 8 is $0.
  const fmvTotal = shares * pricePerShare
  const paidTotal = shares * pricePerShare
  const grossIncome = fmvTotal - paidTotal

  setText(FIELD.property, values.shares ? `${shares.toLocaleString()} shares of common stock of ${values.companyName || ""}` : undefined)
  setText(FIELD.transferDate, formatDateShort(values.grantDate))
  setText(FIELD.taxableYear, values.grantDate ? `Calendar year ${new Date(`${values.grantDate}T00:00:00`).getFullYear()}` : undefined)
  setText(FIELD.restrictions, values.vestingSchedule)

  setText(FIELD.fmvPerItem, values.pricePerShare ? `$${perShare(pricePerShare)}` : undefined)
  setText(FIELD.fmvQuantity, values.shares ? shares.toLocaleString() : undefined)
  setText(FIELD.fmvTotal, values.shares ? `$${money(fmvTotal)}` : undefined)

  setText(FIELD.paidPerItem, values.pricePerShare ? `$${perShare(pricePerShare)}` : undefined)
  setText(FIELD.paidQuantity, values.shares ? shares.toLocaleString() : undefined)
  setText(FIELD.paidTotal, values.shares ? `$${money(paidTotal)}` : undefined)

  setText(FIELD.grossIncome, values.shares ? `$${money(grossIncome)}` : undefined)

  // Box 9 (service recipient) is optional on the form itself — only fill it once there's something
  // to put there, rather than leaving a half-filled name/blank-address combination.
  if (values.companyName || values.companyAddress || values.companyEin) {
    const companyAddr = splitAddress(values.companyAddress || "")
    setText(FIELD.serviceRecipientName, values.companyName)
    setText(FIELD.serviceRecipientTin, values.companyEin)
    setText(FIELD.serviceRecipientStreet, companyAddr.street)
    setText(FIELD.serviceRecipientCity, companyAddr.city)
    setText(FIELD.serviceRecipientState, companyAddr.state)
    setText(FIELD.serviceRecipientZip, companyAddr.zip)
    setText(FIELD.serviceRecipientCountry, values.companyAddress ? "United States" : undefined)
  }

  setText(FIELD.dateSigned, signature ? formatDateShort(signature.signedAt.slice(0, 10)) : undefined)

  // The signature box has an AcroForm field, but it's flagged read-only — the IRS still expects a
  // wet or image signature there, same as the SS-4's signature line (which has no field at all) — so
  // it's drawn directly onto the page rather than through the form API.
  if (signature) {
    const page = pdfDoc.getPages()[0]
    const bytes = await fetch(signature.dataUrl).then((r) => r.arrayBuffer())
    const img = signature.dataUrl.startsWith("data:image/png") ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes)
    const imgHeight = 14
    const imgWidth = (img.width / img.height) * imgHeight
    page.drawImage(img, { x: 40, y: 39, width: imgWidth, height: imgHeight })
  }

  form.flatten()

  return pdfDoc.save()
}
