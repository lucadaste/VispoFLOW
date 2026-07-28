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
  const companyLines = findByLineIndices(lines, /^THE COMPANY:$/i)
  return companyLines.length > 0 ? companyLines : findDateAdjacentLines(lines)
}

/**
 * Fills the blank "Name:____"/"Title:____" lines of every "THE COMPANY:" execution block with the
 * signer's name and officer title, so the printed block matches who actually signed on the By:
 * line. No-op if the signer holds no officer-type role or the document has no such block.
 */
export function fillCompanyExecutionBlock(content: string, signerName: string, roles: string[]): string {
  const officerTitle = primaryOfficerTitle(roles)
  if (!officerTitle) return content
  const lines = content.split("\n")
  for (const byIndex of findByLineIndices(lines, /^THE COMPANY:$/i)) {
    for (let j = byIndex; j <= Math.min(byIndex + 6, lines.length - 1); j++) {
      if (/^Name:_{3,}$/i.test(lines[j].trim())) lines[j] = `Name: ${signerName}`
      if (/^Title:_{3,}$/i.test(lines[j].trim())) lines[j] = `Title: ${officerTitle}`
    }
  }
  return lines.join("\n")
}
