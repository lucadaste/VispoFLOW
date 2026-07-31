/**
 * Static consistency checker for the transaction document templates (lib/flow.ts +
 * lib/transaction-templates.ts). Renders every document with synthetic sample data — one shared
 * sample-value bag per TransactionGroup so same-named fields (companyName, shared dates, etc.)
 * stay identical across the documents in a package, the same way real prefill would — then scans
 * the rendered text for three heuristic bug classes:
 *
 *   1. Dangling attachment references: "attached hereto as Exhibit B" with no "EXHIBIT B" heading
 *      anywhere in the same rendered document (may be a legitimate external companion doc — flagged
 *      as advisory, not a hard failure).
 *   2. Cross-document exhibit/schedule letter mismatches: two documents in the same package refer
 *      to the same named attachment (e.g. "the Plan of Dissolution") under different letters.
 *   3. Possibly-undefined quoted terms: a capitalized quoted phrase used in the document that was
 *      never established via a "(the "X")"-style definition anywhere in the same document.
 *
 * This is advisory tooling, not a legal-correctness checker — it finds structural/authoring bugs
 * in the template source, not substantive legal issues. Run with `npm run check:templates`.
 */
import { TRANSACTION_CATEGORIES, type TransactionField, type TransactionItem } from "../lib/flow"
import { renderTransactionDocument } from "../lib/transaction-templates"

type SampleBag = Record<string, string>

const SAMPLE_DIRECTORS = ["Jordan Rivera", "Sam Patel"]
const SAMPLE_CEO = "Jordan Rivera"

function sampleValueFor(field: TransactionField, seq: number): string {
  if (field.type === "select" && field.options?.length) return field.options[0]
  if (field.type === "date") return "2026-03-15"
  if (field.type === "number") return "1000"
  if (field.type === "address") return "123 Main Street, Wilmington, DE 19801"
  if (/email/i.test(field.name)) return "hello@example.com"
  if (field.name === "companyName") return "Acme Technologies, Inc."

  if (field.placeholder) {
    const cleaned = field.placeholder.replace(/^e\.g\.?\s*/i, "").trim()
    if (cleaned) return cleaned
  }
  return `Sample ${field.label} ${seq}`
}

function buildGroupSampleBag(items: TransactionItem[]): SampleBag {
  const bag: SampleBag = {}
  let seq = 0
  for (const item of items) {
    for (const field of item.fields) {
      if (bag[field.name] !== undefined) continue
      seq += 1
      bag[field.name] = sampleValueFor(field, seq)
    }
  }
  // majority-stockholders-consent-dissolution reads these directly (not modeled as declared fields)
  bag.stockholder1Name ??= "Jordan Rivera"
  bag.stockholder1Shares ??= "5,000,000"
  bag.stockholder1Class ??= "Common Stock"
  bag.stockholder1Percentage ??= "60"
  return bag
}

const ATTACH_KEYWORDS = "(Exhibit|Schedule|Appendix)"
const ATTACH_REF = new RegExp(
  `\\b(?:attached\\s+(?:hereto|thereto|to this Agreement)\\s+as|set forth (?:on|in)|listed on)\\s+${ATTACH_KEYWORDS}\\s+([A-Z0-9]+)`,
  "gi",
)
const ATTACH_HEADING = new RegExp(`^\\s*${ATTACH_KEYWORDS}\\s+([A-Z0-9]+)\\s*$`, "gim")
const NAMED_ATTACH_REF = new RegExp(
  `the\\s+([A-Z][A-Za-z0-9 ,'-]{2,60}?)\\s+attached\\s+(?:hereto|thereto|to this Agreement)\\s+as\\s+${ATTACH_KEYWORDS}\\s+([A-Z0-9]+)`,
  "g",
)
// Two definition styles found in the templates: inline parenthetical ('the "Company"',
// 'this "Agreement"', bare '("Recipient")') and definitions-section style ('"Term" means ...').
const DEFINED_TERM_PAREN =
  /\((?:the\s+|this\s+|each\s+(?:individually\s+)?an?\s+|collectively,?\s+the\s+|or\s+(?:individually\s+)?an?\s+|)"([^"]{2,50})"\)/gi
const DEFINED_TERM_MEANS = /"([^"]{2,50})"\s+(?:means|shall mean|includes|is|refers to)\b/gi
const QUOTED_USAGE = /"([A-Z][A-Za-z][^"]{1,48})"/g

type Finding = { level: "warn" | "info"; docTitle: string; message: string }

function checkDanglingAttachments(docTitle: string, text: string): Finding[] {
  const declared = new Map<string, string>() // "Exhibit A" -> kind+letter key
  let m: RegExpExecArray | null
  ATTACH_REF.lastIndex = 0
  while ((m = ATTACH_REF.exec(text))) declared.set(`${m[1]} ${m[2]}`.toUpperCase(), `${m[1]} ${m[2]}`)

  const embedded = new Set<string>()
  ATTACH_HEADING.lastIndex = 0
  while ((m = ATTACH_HEADING.exec(text))) embedded.add(`${m[1]} ${m[2]}`.toUpperCase())

  const findings: Finding[] = []
  for (const [key, label] of declared) {
    if (!embedded.has(key)) {
      findings.push({
        level: "info",
        docTitle,
        message: `references "${label}" as attached, but no "${label.toUpperCase()}" heading appears in this document — confirm it's genuinely a separate companion document, not a missing attachment.`,
      })
    }
  }
  return findings
}

function checkUndefinedTerms(docTitle: string, text: string): Finding[] {
  const defined = new Set<string>()
  let m: RegExpExecArray | null
  DEFINED_TERM_PAREN.lastIndex = 0
  while ((m = DEFINED_TERM_PAREN.exec(text))) defined.add(m[1])
  DEFINED_TERM_MEANS.lastIndex = 0
  while ((m = DEFINED_TERM_MEANS.exec(text))) defined.add(m[1])

  const flagged = new Set<string>()
  QUOTED_USAGE.lastIndex = 0
  while ((m = QUOTED_USAGE.exec(text))) {
    const term = m[1]
    if (defined.has(term)) continue
    // Heuristic noise filter: only flag Title Case phrases of <=6 words with no sentence-ending punctuation.
    const words = term.split(/\s+/)
    if (words.length > 6) continue
    if (/[.!?;:]/.test(term)) continue
    if (!/^[A-Z]/.test(words[0])) continue
    flagged.add(term)
  }

  return [...flagged].map((term) => ({
    level: "info" as const,
    docTitle,
    message: `quotes "${term}" without an apparent "(the \\"${term}\\")"-style definition in this document (heuristic — verify manually).`,
  }))
}

function checkCrossDocAttachments(groupTitle: string, docs: { title: string; text: string }[]): Finding[] {
  const byName = new Map<string, { doc: string; letter: string }[]>()
  for (const { title, text } of docs) {
    let m: RegExpExecArray | null
    NAMED_ATTACH_REF.lastIndex = 0
    while ((m = NAMED_ATTACH_REF.exec(text))) {
      const name = m[1].trim().replace(/\s+/g, " ")
      const letter = `${m[2]} ${m[3]}`
      const list = byName.get(name) ?? []
      list.push({ doc: title, letter })
      byName.set(name, list)
    }
  }

  const findings: Finding[] = []
  for (const [name, refs] of byName) {
    const distinctLetters = new Set(refs.map((r) => r.letter))
    if (distinctLetters.size > 1) {
      const detail = refs.map((r) => `${r.doc} → ${r.letter}`).join(", ")
      findings.push({
        level: "warn",
        docTitle: groupTitle,
        message: `"${name}" is attached under different letters across documents in this package: ${detail}`,
      })
    }
  }
  return findings
}

function main() {
  let warnCount = 0
  let infoCount = 0

  for (const category of TRANSACTION_CATEGORIES) {
    for (const group of category.groups) {
      const bag = buildGroupSampleBag(group.items)
      const rendered: { title: string; text: string }[] = []

      for (const item of group.items) {
        const text = renderTransactionDocument(item.id, bag, SAMPLE_DIRECTORS, SAMPLE_CEO)
        if (text === null) {
          console.log(`\x1b[33m⚠\x1b[0m  ${item.title}: no renderer registered for id "${item.id}" — skipped`)
          continue
        }
        rendered.push({ title: item.title, text })
      }

      const allFindings: Finding[] = []
      for (const { title, text } of rendered) {
        allFindings.push(...checkDanglingAttachments(title, text))
        allFindings.push(...checkUndefinedTerms(title, text))
      }
      if (rendered.length > 1) {
        allFindings.push(...checkCrossDocAttachments(group.title, rendered))
      }

      if (allFindings.length === 0) {
        console.log(`\x1b[32m✓\x1b[0m  ${group.title} (${rendered.length} doc${rendered.length === 1 ? "" : "s"})`)
        continue
      }

      console.log(`\n${group.title} (${rendered.length} doc${rendered.length === 1 ? "" : "s"})`)
      for (const f of allFindings) {
        const icon = f.level === "warn" ? "\x1b[33m⚠\x1b[0m" : "\x1b[36mi\x1b[0m"
        console.log(`  ${icon} [${f.docTitle}] ${f.message}`)
        if (f.level === "warn") warnCount += 1
        else infoCount += 1
      }
    }
  }

  console.log(`\n${warnCount} warning(s), ${infoCount} info finding(s) across ${TRANSACTION_CATEGORIES.length} categories.`)
}

main()
