/** Live XXX-XX-XXXX formatting for the responsible party's SSN/ITIN input (see lib/number-format.ts
 *  for the same pattern applied to numeric fields) — re-inserts the dashes as the user types so the
 *  value always matches the shape Form SS-4's box 7b expects, and caps input at 9 digits. */
export function formatSsnInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 9)
  if (digits.length <= 3) return digits
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
}
