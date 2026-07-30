/**
 * Live thousands-separator formatting for numeric text inputs (share counts, dollar amounts,
 * percentages, etc). Kept comma-aware so downstream parsing (parseFloat/parseInt after stripping
 * non-digit characters) always works regardless of whether the field was formatted or not.
 */

/** Reformats raw user input as the user types: strips anything but digits and one decimal point, then re-inserts thousands commas. */
export function formatNumberInput(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, "")
  const firstDot = cleaned.indexOf(".")
  const intPart = firstDot === -1 ? cleaned : cleaned.slice(0, firstDot)
  const decPart = firstDot === -1 ? "" : "." + cleaned.slice(firstDot + 1).replace(/\./g, "")
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  return withCommas + decPart
}

/** Strips thousands separators and parses the underlying numeric value (0 if unparseable). */
export function parseNumberInput(formatted: string): number {
  const n = parseFloat((formatted ?? "").replace(/,/g, ""))
  return Number.isFinite(n) ? n : 0
}
