import type { StepInput } from "./steps"
import { AUTHORIZED_SHARES, type Allocation, type ChatField, type FlowAnswers } from "./flow"
import { parseNumberInput } from "./number-format"

/**
 * Steps whose widget collects several fields at once (e.g. name + address together)
 * get broken into individual one-at-a-time chat turns in Chat mode. Steps not handled
 * here (single-field steps like company name, or bespoke ones like paywall/vesting)
 * keep their existing all-at-once widget in both modes.
 */
export function getChatFields(
  input: StepInput,
  answers: FlowAnswers,
): { fields: ChatField[]; defaults: Record<string, string>; skipFirstPrompt?: boolean } | null {
  switch (input.kind) {
    case "incorporator":
      return {
        fields: [
          { name: "incorporatorName", label: "What's your full name?" },
          { name: "incorporatorAddress", label: "What's your mailing address?", type: "address" },
        ],
        defaults: {
          incorporatorName: answers.incorporatorName,
          incorporatorAddress: answers.incorporatorAddress,
        },
      }
    case "directorNames":
      return {
        fields: Array.from({ length: answers.directorCount }, (_, i) => ({
          name: `director_${i}`,
          label: `What is the name of director ${i + 1}?`,
        })),
        defaults: {},
      }
    case "officers": {
      // Only prefilled when the signer's saved profile says they actually hold that title —
      // director order doesn't reliably predict who's CEO/CFO/Secretary, so no more guessing.
      const savedName = (title: string) => answers.officers.find((o) => o.title === title)?.name ?? ""
      return {
        fields: [
          { name: "CEO", label: "Who will be the CEO?" },
          { name: "CFO", label: "Who will be the CFO?" },
          { name: "Secretary", label: "Who will be the Secretary?" },
        ],
        defaults: { CEO: savedName("CEO"), CFO: savedName("CFO"), Secretary: savedName("Secretary") },
      }
    }
    case "allocations": {
      const founders = answers.directors.length ? answers.directors : ["Founder"]
      const founderDefault = Math.floor((AUTHORIZED_SHARES * 0.8) / founders.length)
      return {
        fields: founders.map((name, i) => ({
          name: `alloc_${i}`,
          label: `How many shares will ${name} hold?`,
          type: "number" as const,
          // A computed even split, shown only as a placeholder/hint (never pre-filled as a
          // real value) — it's a suggestion, not data from the profile or an earlier answer.
          placeholder: String(founderDefault),
          hint: `Suggested: ${founderDefault.toLocaleString()} shares. The remainder goes to the option pool.`,
        })),
        defaults: {},
      }
    }
    default:
      return null
  }
}

function pct(shares: number) {
  return ((shares / AUTHORIZED_SHARES) * 100).toFixed(1).replace(/\.0$/, "")
}

/** Reassembles the field-by-field chat answers into the same patch shape the all-at-once widget would submit. */
export function assembleChatAnswers(
  input: StepInput,
  values: Record<string, string>,
  answers: FlowAnswers,
): { patch: Partial<FlowAnswers>; note?: string } {
  switch (input.kind) {
    case "incorporator":
      return {
        patch: {
          incorporatorName: (values.incorporatorName ?? "").trim(),
          incorporatorAddress: (values.incorporatorAddress ?? "").trim(),
        },
      }
    case "directorNames": {
      const clean = Array.from({ length: answers.directorCount }, (_, i) => (values[`director_${i}`] ?? "").trim())
      return { patch: { directors: clean, foundersList: clean.join(" & ") } }
    }
    case "officers": {
      const officers = ["CEO", "CFO", "Secretary"].map((title) => ({ title, name: (values[title] ?? "").trim() }))
      return { patch: { officers } }
    }
    case "allocations": {
      const founders = answers.directors.length ? answers.directors : ["Founder"]
      const shares = founders.map((_, i) => Math.max(0, Math.floor(parseNumberInput(values[`alloc_${i}`] ?? ""))))
      const used = shares.reduce((s, n) => s + n, 0)
      const overAllocated = used > AUTHORIZED_SHARES
      const pool = overAllocated ? 0 : AUTHORIZED_SHARES - used
      const rows: Allocation[] = [
        ...founders.map((name, i) => ({ name, shares: shares[i] })),
        { name: "Option Pool", shares: pool, isPool: true },
      ]
      const note = overAllocated
        ? `Heads up — that totals ${used.toLocaleString()} shares, more than the ${AUTHORIZED_SHARES.toLocaleString()} authorized. I've set the option pool to 0 for now; switch to Questionnaire mode anytime to fine-tune the exact split.`
        : `Got it — that leaves ${pool.toLocaleString()} shares (${pct(pool)}%) for the option pool.`
      return {
        patch: { allocations: rows, founderShares: used.toLocaleString(), poolShares: pool.toLocaleString() },
        note,
      }
    }
    default:
      return { patch: {} }
  }
}
