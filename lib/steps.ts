export type StepInput =
  | { kind: "start" }
  | { kind: "text"; field: string; placeholder?: string; prefill?: string; submitLabel?: string }
  | { kind: "incorporator" }
  | { kind: "paywall" }
  | { kind: "corpAddress" }
  | { kind: "directorCount" }
  | { kind: "directorNames" }
  | { kind: "officers" }
  | { kind: "allocations" }
  | { kind: "vesting" }
  | { kind: "continue"; label: string; action: "compliance" }

export type Step = {
  id: string
  messages: string[]
  widget?: "name-check" | "formed"
  input?: StepInput
  /** doc ids drafted when leaving this step */
  completes?: string[]
  /** runs special side effects */
  special?: "file-coi"
  /** advance with no user input */
  autoAdvance?: boolean
}

export const STEPS: Step[] = [
  {
    id: "welcome",
    messages: ["Hello, how can I help you today?"],
    input: { kind: "start" },
  },
  {
    id: "intro",
    messages: [
      "Great — let's get started with incorporating your Delaware corporation.",
      "I'll ask you a few questions to complete the documents required for a typical Silicon Valley–style startup formation. We'll use our standard template with 10,000,000 authorized common shares.",
    ],
    autoAdvance: true,
  },
  {
    id: "company-name",
    messages: ["First, what is the name of your company?"],
    input: { kind: "text", field: "companyName", placeholder: "Acme Inc." },
  },
  {
    id: "verify-name",
    messages: ["Thanks — give me a few seconds to verify name availability in Delaware."],
    widget: "name-check",
    autoAdvance: true,
  },
  {
    id: "incorporator",
    messages: ["Perfect, that name is available. What is your name and address? You'll be the incorporator who signs the initial filing."],
    input: { kind: "incorporator" },
    completes: ["coi"],
  },
  {
    id: "paywall",
    messages: [
      "Thank you. You'll now be taken to a secure checkout. As soon as payment is complete, I'll file your Certificate of Incorporation with Delaware and resume the formation process.",
    ],
    input: { kind: "paywall" },
  },
  {
    id: "resume",
    messages: [
      "Welcome back — payment received.",
      "I'll now gather a bit more information to complete the rest of your formation documents. Everything is prepared now and sent for signature automatically as soon as Delaware confirms the official filing date of your Certificate of Incorporation.",
    ],
    special: "file-coi",
    autoAdvance: true,
  },
  {
    id: "corp-address",
    messages: [
      "What is the corporation's principal address? If you don't have one yet, you can purchase a registered address from our Compliance Center before continuing.",
    ],
    input: { kind: "corpAddress" },
  },
  {
    id: "director-count",
    messages: [
      "How many directors will the corporation have? Usually one (the main founder) — or one per founder if you have several.",
    ],
    input: { kind: "directorCount" },
  },
  {
    id: "director-names",
    messages: ["Great. What are their names?"],
    input: { kind: "directorNames" },
    completes: ["action-incorporator"],
  },
  {
    id: "officers",
    messages: [
      "Who will be the officers? Typically you'll have a CEO, CFO, and Secretary. One person can hold all roles, or you can split them among founders or others.",
    ],
    input: { kind: "officers" },
    completes: ["org-resolutions", "bylaws"],
  },
  {
    id: "allocations",
    messages: [
      "Let's set founder stock allocations. Typically 80–90% of authorized stock goes to founders and 10–20% is reserved in the option pool. You have 10,000,000 authorized common shares.",
    ],
    input: { kind: "allocations" },
    completes: ["option-pool", "board-consent-option-pool"],
  },
  {
    id: "vesting",
    messages: [
      "Founder stock is normally subject to 4-year vesting with a 1-year cliff for 25% of the shares, then monthly vesting over the next three years for the remaining 75%. Vesting starts when a founder began contributing to the project — the incorporation date (recommended default, and required if you were previously employed elsewhere) or an earlier date (optional, if you were already working on the project independently).",
    ],
    input: { kind: "vesting" },
    completes: [
      "founder-rspa",
      "founder-piia",
      "board-consent-founder-stock",
      "stockholders-consent-option-pool",
    ],
  },
  {
    id: "formed",
    messages: ["Congratulations — your corporation has been validly formed!"],
    widget: "formed",
    input: {
      kind: "continue",
      label: "Continue to Compliance Center",
      action: "compliance",
    },
  },
]
