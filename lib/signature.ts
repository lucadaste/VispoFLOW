/** Renders a typed name as a script-font signature and returns a PNG data URL. */
export function renderTypedSignature(name: string): string {
  const width = 480
  const height = 140
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) return ""

  ctx.fillStyle = "#1a1a1a"
  ctx.textBaseline = "middle"
  ctx.textAlign = "center"

  let fontSize = 64
  ctx.font = `${fontSize}px "Brush Script MT", "Segoe Script", cursive`
  while (ctx.measureText(name).width > width - 40 && fontSize > 24) {
    fontSize -= 2
    ctx.font = `${fontSize}px "Brush Script MT", "Segoe Script", cursive`
  }

  ctx.fillText(name, width / 2, height / 2)
  return canvas.toDataURL("image/png")
}

export function formatSignedDate(signedAt: string): string {
  return new Date(signedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}

/** The plain-text "electronically signed" block appended to a document once it's signed. */
export function signatureBlockText({ signerName, signedAt }: { signerName: string; signedAt: string }): string {
  return `\n\n— Electronically Signed —\n${signerName}\nSigned on ${formatSignedDate(signedAt)}`
}

/** Titles that sign "on behalf of the Company" (the By:/Name:/Title: execution block), in the
 *  order preferred when a signer holds more than one such title. */
export const OFFICER_TITLE_PRIORITY = ["CEO", "President", "Secretary", "Treasurer / CFO", "Manager"]

export function primaryOfficerTitle(roles: string[]): string | null {
  return OFFICER_TITLE_PRIORITY.find((title) => roles.includes(title)) ?? null
}

/** Finds every "By:____" line of a header's execution block (By:/Name:/Title:) — a document can
 *  repeat the same header once per party (e.g. a combined multi-founder agreement), so every
 *  occurrence needs its own signature image. */
function findByLineIndices(lines: string[], headerPattern: RegExp): number[] {
  const results: number[] = []
  for (let i = 0; i < lines.length; i++) {
    if (!headerPattern.test(lines[i].trim())) continue
    for (let j = i + 1; j <= Math.min(i + 8, lines.length - 1); j++) {
      if (/^By:_{3,}$/i.test(lines[j].trim())) { results.push(j); break }
    }
  }
  return results
}

function isSignatureLabel(line: string): boolean {
  return /^\(\s*signature/i.test(line.trim())
}

/** Finds every blank signature line followed within a few lines by a "Date:" line — the pattern
 *  used by standalone one-signer letters (EIN, 83(b), CA compliance filings) that end in a bare
 *  blank line rather than a "THE COMPANY:" execution block. */
function findDateAdjacentLines(lines: string[]): number[] {
  const results: number[] = []
  for (let i = 0; i < lines.length; i++) {
    if (!/^_{5,}$/.test(lines[i].trim())) continue
    for (let j = i + 1; j <= Math.min(i + 4, lines.length - 1); j++) {
      if (/^Date:/i.test(lines[j].trim())) { results.push(i); break }
    }
  }
  return results
}

/** Finds every blank signature line under a header whose block has no name pre-printed (e.g. an
 *  Optionee/Purchaser block that's just "____ (PRINT NAME) / ____ (Signature)") — identified as
 *  the blank line immediately followed by a "(Signature)" label. */
function findHeaderSignatureLines(lines: string[], headerPattern: RegExp): number[] {
  const results: number[] = []
  for (let i = 0; i < lines.length; i++) {
    if (!headerPattern.test(lines[i].trim())) continue
    for (let j = i + 1; j <= Math.min(i + 10, lines.length - 1); j++) {
      if (!/^_{5,}$/.test(lines[j].trim())) continue
      if (isSignatureLabel(lines[j + 1]?.trim() ?? "")) { results.push(j); break }
    }
  }
  return results
}

/** Finds every blank "____ (PRINT NAME)" line under the same kind of header `findHeaderSignatureLines`
 *  resolves the signature line for — the blank line immediately followed by a "(PRINT NAME)" label. */
function findPrintedNameLineIndices(lines: string[], headerPattern: RegExp): number[] {
  const results: number[] = []
  for (let i = 0; i < lines.length; i++) {
    if (!headerPattern.test(lines[i].trim())) continue
    for (let j = i + 1; j <= Math.min(i + 10, lines.length - 1); j++) {
      if (!/^_{5,}$/.test(lines[j].trim())) continue
      if (/^\(\s*print name\s*\)/i.test(lines[j + 1]?.trim() ?? "")) { results.push(j); break }
    }
  }
  return results
}

/** Fills the "____ (PRINT NAME)" blank of a "generic"-kind slot (see SignatureRouting) with the
 *  signer's name — the counterpart, for a block with no pre-printed name, to what the Name:____
 *  line is for an officer block. No-op if the block has no such line (most generic blocks are
 *  fine without one; only Option Pool's Optionee currently has this shape). */
export function fillPrintedNameBlank(content: string, headerPattern: RegExp, signerName: string): string {
  const lines = content.split("\n")
  for (const idx of findPrintedNameLineIndices(lines, headerPattern)) lines[idx] = signerName
  return lines.join("\n")
}

/** Finds every blank signature line (a run of underscores on its own line) followed within a few
 *  lines by the signer's printed name (skipping blank lines and "(Signature)"/"(Print Name)"
 *  labels) — the pattern used wherever a party's name is already known when the document renders. */
function findAllNameLineIndices(lines: string[], signerName: string): number[] {
  const target = signerName.trim().toLowerCase()
  if (!target) return []
  const results: number[] = []
  for (let i = 0; i < lines.length; i++) {
    if (!/^_{5,}$/.test(lines[i].trim())) continue
    for (let j = i + 1; j <= Math.min(i + 4, lines.length - 1); j++) {
      const t = lines[j].trim()
      if (!t || /^\([^)]*\)$/.test(t)) continue
      if (t.toLowerCase().startsWith(target)) results.push(i)
      break
    }
  }
  return results
}

/** The minimal shape `resolveSignatureLines` needs from a signer slot (see lib/document-signers.ts,
 *  whose richer `SignerSlot` satisfies this structurally). */
export type SignatureRouting = {
  kind: "officer" | "named" | "generic"
  matchName?: string
  headerPattern?: RegExp
}

/**
 * Finds every line where a given slot's signature image should be placed instead of appended at
 * the end of the document. A document can require the same slot's mark at multiple lines (e.g. a
 * combined multi-founder agreement repeats the company's execution block once per founder), so
 * this returns every match rather than just the first.
 */
export function resolveSignatureLines(content: string, slot: SignatureRouting, signerName: string): number[] {
  const lines = content.split("\n")
  if (slot.kind === "named") return findAllNameLineIndices(lines, slot.matchName ?? signerName)
  if (slot.kind === "generic") return slot.headerPattern ? findHeaderSignatureLines(lines, slot.headerPattern) : []
  const companyLines = findByLineIndices(lines, slot.headerPattern ?? /^THE COMPANY:$/i)
  return companyLines.length > 0 ? companyLines : findDateAdjacentLines(lines)
}

/** The single-line blanks that can appear in a party's execution block in a form simple enough to
 *  fill unambiguously — a label immediately followed by a run of underscores on the same line.
 *  "Title" is included so an external counterparty (who has no `roles` for `primaryOfficerTitle`
 *  to resolve, e.g. a SAFE's Investor) still gets asked for and has their title filled in via
 *  `extraFields`, same as Address/Email — see the officerTitle guard in
 *  `fillCompanyExecutionBlock` below, which skips this for the company's own officer block since
 *  that one already fills Title from `roles`. */
const EXTRA_BLOCK_FIELD_LABELS = ["Address", "Email", "Title"]

/** Matches a blank line meant to hold one line of a multi-line address — a run of underscores,
 *  optionally split into a couple of groups by whitespace (the "city, state zip" line's shape,
 *  e.g. "__________ ______"). */
function isBlankAddressLine(line: string): boolean {
  return /^_{3,}(\s+_{2,})*$/.test(line.trim())
}

/** Finds the blank line(s) under a bare "Address:" label — the shape used when a party's address
 *  doesn't fit inline (e.g. the NDA's execution blocks: "Address:" on its own line, then one or
 *  more blank continuation lines). Returns at most two indices, since that's all a street +
 *  city/state/zip split ever needs. Stops at the first line that isn't blank or a blank-address
 *  line — a fixed value like "United States", another field's label, or the next party's header —
 *  so it never wanders into unrelated content. Returns [] if the window has no bare "Address:"
 *  line (the inline "Address:____" shape is handled separately, by the caller's own regex).
 */
function findMultilineAddressBlanks(lines: string[], from: number, to: number): number[] {
  let labelIndex = -1
  for (let i = from; i <= to; i++) {
    if (/^Address:$/i.test(lines[i].trim())) { labelIndex = i; break }
  }
  if (labelIndex === -1) return []
  const blanks: number[] = []
  for (let j = labelIndex + 1; j <= Math.min(to, labelIndex + 6) && blanks.length < 2; j++) {
    const trimmed = lines[j].trim()
    if (!trimmed) continue
    if (isBlankAddressLine(trimmed)) { blanks.push(j); continue }
    break
  }
  return blanks
}

/** Fills the blank line(s) found by `findMultilineAddressBlanks`, splitting `address` on its
 *  first comma so the street goes on the first blank line and city/state/zip on the second — a
 *  single blank line gets the whole address. Leftover blank lines beyond what `address` has parts
 *  for are left as-is (there's nothing more specific to put there). */
function fillMultilineAddressBlanks(lines: string[], blanks: number[], address: string): void {
  const commaIndex = address.indexOf(",")
  const parts =
    blanks.length > 1 && commaIndex !== -1
      ? [address.slice(0, commaIndex).trim(), address.slice(commaIndex + 1).trim()]
      : [address]
  blanks.forEach((lineIndex, i) => {
    if (parts[i]) lines[lineIndex] = parts[i]
  })
}

/**
 * Fills the blank "Name:____"/"Title:____" lines of a party's execution block with the signer's
 * name and officer title, so the printed block matches who actually signed on the By: line. Name
 * fills unconditionally (it's just who signed); Title fills from a recognized officer-type role if
 * the signer holds one (the company's own officer signing on its own behalf), otherwise from
 * `extraFields.Title` if supplied (an external counterparty, e.g. a SAFE's Investor, has no such
 * role — they're asked for their title directly, same as Address/Email). `extraFields`
 * additionally fills any of `EXTRA_BLOCK_FIELD_LABELS` present with a non-empty value — Address
 * either inline ("Address:____") or, if the block instead uses a bare "Address:" label with blank
 * continuation lines, spread across those (see findMultilineAddressBlanks). No-op if the document
 * has no block matching `headerPattern` (default "THE COMPANY:"; a document can use a different
 * party label, e.g. a loan agreement's "BORROWER:").
 */
export function fillCompanyExecutionBlock(
  content: string,
  signerName: string,
  roles: string[],
  headerPattern: RegExp = /^THE COMPANY:$/i,
  extraFields?: Record<string, string>,
): string {
  const officerTitle = primaryOfficerTitle(roles)
  const lines = content.split("\n")
  for (const byIndex of findByLineIndices(lines, headerPattern)) {
    const windowEnd = Math.min(byIndex + 16, lines.length - 1)
    for (let j = byIndex; j <= windowEnd; j++) {
      const trimmed = lines[j].trim()
      if (/^Name:_{3,}$/i.test(trimmed)) lines[j] = `Name: ${signerName}`
      if (officerTitle && /^Title:_{3,}$/i.test(trimmed)) lines[j] = `Title: ${officerTitle}`
      for (const label of EXTRA_BLOCK_FIELD_LABELS) {
        if (label === "Title" && officerTitle) continue // already filled from roles above
        const value = extraFields?.[label]
        if (value && new RegExp(`^${label}:_{3,}$`, "i").test(trimmed)) lines[j] = `${label}: ${value}`
      }
    }
    const address = extraFields?.Address
    if (address) {
      const blanks = findMultilineAddressBlanks(lines, byIndex, windowEnd)
      if (blanks.length > 0) fillMultilineAddressBlanks(lines, blanks, address)
    }
  }
  return lines.join("\n")
}

/**
 * The extra fields (from `EXTRA_BLOCK_FIELD_LABELS`) that appear as blanks — inline or, for
 * Address, spread across multi-line continuation blanks too — in a party's execution block. Used
 * at "send to sign" time to ask an invited signer for exactly the extra fields their block
 * actually requires, instead of only ever collecting a signature/name/date.
 */
export function findBlankFieldLabels(content: string, headerPattern: RegExp = /^THE COMPANY:$/i): string[] {
  const lines = content.split("\n")
  const found = new Set<string>()
  for (const byIndex of findByLineIndices(lines, headerPattern)) {
    const windowEnd = Math.min(byIndex + 16, lines.length - 1)
    for (let j = byIndex; j <= windowEnd; j++) {
      const trimmed = lines[j].trim()
      for (const label of EXTRA_BLOCK_FIELD_LABELS) {
        if (new RegExp(`^${label}:_{3,}$`, "i").test(trimmed)) found.add(label)
      }
    }
    if (findMultilineAddressBlanks(lines, byIndex, windowEnd).length > 0) found.add("Address")
  }
  return [...found]
}

/**
 * Fills the first blank "Date:____" line found within a few lines after a signer's resolved
 * signature line with the date they actually signed — so a printed date reflects reality instead
 * of staying blank forever. No-op if the block has no such blank line (most don't) or it's already
 * been filled with a fixed value (e.g. a document's own effective date, filled at render time).
 */
export function fillSignedDateLine(content: string, signatureLineIndex: number, signedAt: string): string {
  const lines = content.split("\n")
  for (let j = signatureLineIndex; j <= Math.min(signatureLineIndex + 6, lines.length - 1); j++) {
    if (/^Date:_{3,}$/i.test(lines[j].trim())) {
      lines[j] = `Date: ${formatSignedDate(signedAt)}`
      break
    }
  }
  return lines.join("\n")
}
