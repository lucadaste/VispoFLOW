import type { StepInput } from "./steps"
import { AUTHORIZED_SHARES, type Allocation, type ChatField, type FlowAnswers } from "./flow"

/**
 * Steps whose widget collects several fields at once (e.g. name + address together)
 * get broken into individual one-at-a-time chat turns in Chat mode. Steps not handled
 * here (single-field steps like company name, or bespoke ones like paywall/vesting)
 * keep their existing all-at-once widget in both modes.
 */
export function getChatFields(
  input: StepInput,
  answers: FlowAnswers,
): { fields: ChatField[]; defaults: Record<string, string> } | null {
  switch (input.kind) {
    case "incorporator":
      return {
        fields: [
          { name: "incorporatorName", label: "Your full name" },
          { name: "incorporatorAddress", label: "Mailing address", type: "textarea" },
        ],
        defaults: {
          incorporatorName: answers.incorporatorName,
          incorporatorAddress: answers.incorporatorAddress,
        },
      }
    case "registeredAgent":
      return {
        fields: [
          { name: "registeredAgentName", label: "Registered agent name", placeholder: "e.g. Corporation Service Company" },
          { name: "registeredAgentAddress", label: "Registered agent Delaware address", type: "textarea" },
        ],
        defaults: {},
      }
    case "directorNames":
      return {
        fields: Array.from({ length: answers.directorCount }, (_, i) => ({
          name: `director_${i}`,
          label: `Director ${i + 1}`,
        })),
        defaults: {},
      }
    case "officers":
      return {
        fields: [
          { name: "CEO", label: "CEO name" },
          { name: "CFO", label: "CFO name" },
          { name: "Secretary", label: "Secretary name" },
        ],
        defaults: {
          CEO: answers.directors[1] ?? "",
          CFO: answers.directors[0] ?? "",
          Secretary: "",
        },
      }
    case "allocations": {
      const founders = answers.directors.length ? answers.directors : ["Founder"]
      const founderDefault = Math.floor((AUTHORIZED_SHARES * 0.8) / founders.length)
      return {
        fields: founders.map((name, i) => ({
          name: `alloc_${i}`,
          label: `${name} — how many shares?`,
          placeholder: String(founderDefault),
          hint: `Suggested: ${founderDefault.toLocaleString()} shares. The remainder goes to the option pool.`,
        })),
        defaults: Object.fromEntries(founders.map((_, i) => [`alloc_${i}`, String(founderDefault)])),
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
    case "registeredAgent":
      return {
        patch: {
          registeredAgentName: (values.registeredAgentName ?? "").trim(),
          registeredAgentAddress: (values.registeredAgentAddress ?? "").trim(),
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
      const shares = founders.map((_, i) => Math.max(0, parseInt(values[`alloc_${i}`] ?? "", 10) || 0))
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
