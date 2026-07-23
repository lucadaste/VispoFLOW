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

/**
 * Finds a blank signature line (a run of underscores on its own line) immediately followed by a
 * line starting with the signer's printed name, so the signature image can be placed there instead
 * of appended at the end of the document. Returns the source-line index of the underscore line, or
 * null if no such line is found (documents with multiple/unnamed signers fall back to the appended
 * block instead).
 */
export function findSignatureLineIndex(content: string, signerName: string): number | null {
  const target = signerName.trim().toLowerCase()
  if (!target) return null
  const lines = content.split("\n")
  for (let i = 0; i < lines.length - 1; i++) {
    if (!/^_{5,}$/.test(lines[i].trim())) continue
    if (lines[i + 1].trim().toLowerCase().startsWith(target)) return i
  }
  return null
}
