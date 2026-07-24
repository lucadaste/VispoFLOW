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
const OFFICER_TITLE_PRIORITY = ["CEO", "President", "Secretary", "Treasurer / CFO", "Manager"]

function primaryOfficerTitle(roles: string[]): string | null {
  return OFFICER_TITLE_PRIORITY.find((title) => roles.includes(title)) ?? null
}

/** Finds the "By:____" line of a "THE COMPANY:" execution block (By:/Name:/Title:), the pattern
 *  used for company-representative signatures in stock/option documents. */
function findCompanyByLineIndex(lines: string[]): number | null {
  for (let i = 0; i < lines.length; i++) {
    if (!/^THE COMPANY:$/i.test(lines[i].trim())) continue
    for (let j = i + 1; j <= Math.min(i + 8, lines.length - 1); j++) {
      if (/^By:_{3,}$/i.test(lines[j].trim())) return j
    }
  }
  return null
}

/**
 * Finds where the signer's signature image should be placed instead of appended at the end of the
 * document. Two patterns are recognized:
 *  1. A blank signature line (a run of underscores on its own line) with the signer's printed name
 *     within the next few lines (skipping blank lines and "(Signature)"/"(Print Name)" labels).
 *  2. A "THE COMPANY:" execution block's "By:____" line, used when the signer holds an officer-type
 *     role (roles that sign on the company's behalf, e.g. CEO/President/Secretary).
 * Returns the source-line index of the line to overlay the image on, or null if neither pattern is
 * found (falls back to the appended signature block instead).
 */
export function findSignatureLineIndex(content: string, signerName: string, roles: string[] = []): number | null {
  const target = signerName.trim().toLowerCase()
  const lines = content.split("\n")

  if (target) {
    for (let i = 0; i < lines.length; i++) {
      if (!/^_{5,}$/.test(lines[i].trim())) continue
      for (let j = i + 1; j <= Math.min(i + 4, lines.length - 1); j++) {
        const t = lines[j].trim()
        if (!t || /^\([^)]*\)$/.test(t)) continue
        if (t.toLowerCase().startsWith(target)) return i
        break
      }
    }
  }

  if (primaryOfficerTitle(roles)) {
    const byIndex = findCompanyByLineIndex(lines)
    if (byIndex !== null) return byIndex
  }

  return null
}

/**
 * Fills the blank "Name:____"/"Title:____" lines of a "THE COMPANY:" execution block with the
 * signer's name and officer title, so the printed block matches who actually signed on the By:
 * line. No-op if the signer holds no officer-type role or the document has no such block.
 */
export function fillCompanyExecutionBlock(content: string, signerName: string, roles: string[]): string {
  const officerTitle = primaryOfficerTitle(roles)
  if (!officerTitle) return content
  const lines = content.split("\n")
  const byIndex = findCompanyByLineIndex(lines)
  if (byIndex === null) return content
  for (let j = byIndex; j <= Math.min(byIndex + 6, lines.length - 1); j++) {
    if (/^Name:_{3,}$/i.test(lines[j].trim())) lines[j] = `Name: ${signerName}`
    if (/^Title:_{3,}$/i.test(lines[j].trim())) lines[j] = `Title: ${officerTitle}`
  }
  return lines.join("\n")
}
