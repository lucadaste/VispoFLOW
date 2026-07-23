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

/** The plain-text "electronically signed" block appended to a document once it's signed. */
export function signatureBlockText({ signerName, signedAt }: { signerName: string; signedAt: string }): string {
  const formatted = new Date(signedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  return `\n\n— Electronically Signed —\n${signerName}\nSigned on ${formatted}`
}
