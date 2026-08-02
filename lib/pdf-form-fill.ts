import type { PDFTextField } from "pdf-lib"

/** IRS-published fillable PDFs sometimes give their text fields a colored default appearance —
 *  Form SS-4's read dark blue (`0 0 0.502 rg`), presumably meant to visually set a preparer's typed
 *  entry apart from the form's own black print in Acrobat — which reads as a stray color mismatch
 *  once the form is filled and flattened into an ordinary document. This rewrites the field's default
 *  appearance to render in plain black instead, before its text is set; call it on every text field a
 *  filing writes into, alongside setText. */
export function forceBlackText(field: PDFTextField): void {
  const da = field.acroField.getDefaultAppearance()
  if (!da) return
  const stripped = da.replace(/[\d.]+(?:\s+[\d.]+){0,3}\s+(?:rg|g|k)\s*$/, "").trim()
  field.acroField.setDefaultAppearance(`${stripped} 0 g`)
}
