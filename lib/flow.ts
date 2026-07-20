export const AUTHORIZED_SHARES = 10_000_000

export type DocStatus = "pending" | "drafting" | "complete" | "filing"

export type LegalDoc = {
  id: string
  label: string
  short: string
  group: "Formation" | "Equity"
}

export const DOCUMENTS: LegalDoc[] = [
  { id: "coi", label: "Certificate of Incorporation", short: "TW COI", group: "Formation" },
  {
    id: "action-incorporator",
    label: "Action by Incorporator",
    short: "TW Action by Incorporator",
    group: "Formation",
  },
  {
    id: "org-resolutions",
    label: "Organizational Resolutions",
    short: "TW Organizational Resolutions",
    group: "Formation",
  },
  { id: "bylaws", label: "Bylaws", short: "TW Bylaws", group: "Formation" },
  {
    id: "option-pool",
    label: "Equity Incentive Plan",
    short: "TW Option Pool",
    group: "Equity",
  },
  {
    id: "board-consent-option-pool",
    label: "Board Consent — Option Pool",
    short: "TW Board Consent Option Pool",
    group: "Equity",
  },
  {
    id: "founder-rspa",
    label: "Founder Restricted Stock Purchase Agreements",
    short: "TW Founder RSPAs",
    group: "Equity",
  },
  {
    id: "founder-piia",
    label: "Founder PIIAs (IP Assignment)",
    short: "TW Founder PIIAs",
    group: "Equity",
  },
  {
    id: "board-consent-founder-stock",
    label: "Board Consent — Founder Stock",
    short: "TW Board Consent Founder Stock",
    group: "Equity",
  },
  {
    id: "stockholders-consent-option-pool",
    label: "Stockholders Consent — Option Pool",
    short: "TW Stockholders Consent Option Pool",
    group: "Equity",
  },
]

export function docShorts(ids: string[]): string {
  return ids
    .map((id) => DOCUMENTS.find((d) => d.id === id)?.label ?? id)
    .join(", ")
}

/* ---------------- Compliance Center ---------------- */

export type ComplianceField = {
  name: string
  label: string
  type?: "text" | "date" | "textarea"
  prefillKey?: keyof FlowAnswers | "computed"
  placeholder?: string
}

export type ComplianceItem = {
  id: string
  title: string
  short: string
  description: string
  deadline: string
  fields: ComplianceField[]
}

export type ComplianceGroup = {
  id: string
  title: string
  items: ComplianceItem[]
}

export const COMPLIANCE_GROUPS: ComplianceGroup[] = [
  {
    id: "federal",
    title: "Federal Filings",
    items: [
      {
        id: "ein",
        title: "EIN — Employer Identification Number",
        short: "EIN",
        description:
          "Obtain a federal tax ID from the IRS (Form SS-4). Required to open a bank account and hire employees.",
        deadline: "Before opening a bank account",
        fields: [
          { name: "entity", label: "Legal entity name", prefillKey: "companyName" },
          { name: "responsible", label: "Responsible party", prefillKey: "incorporatorName" },
          { name: "ssn", label: "Responsible party SSN / ITIN", placeholder: "XXX-XX-XXXX" },
        ],
      },
      {
        id: "83b",
        title: "83(b) Elections",
        short: "83(b) Elections",
        description:
          "Each founder receiving restricted stock should file an 83(b) election with the IRS within 30 days of the stock purchase.",
        deadline: "Within 30 days of stock purchase",
        fields: [
          { name: "founders", label: "Founders filing 83(b)", prefillKey: "foundersList" },
          { name: "purchaseDate", label: "Stock purchase date", type: "date", prefillKey: "vestingStartDate" },
          { name: "shares", label: "Total restricted shares", prefillKey: "founderShares" },
        ],
      },
    ],
  },
  {
    id: "corporate",
    title: "Corporate Filings",
    items: [
      {
        id: "ca-qualification",
        title: "California Qualification (Form S&DC-S/N)",
        short: "CA Qualification",
        description:
          "A Delaware corporation doing business in California must qualify with the CA Secretary of State as a foreign corporation.",
        deadline: "Before transacting business in CA",
        fields: [
          { name: "entity", label: "Corporation name", prefillKey: "companyName" },
          { name: "address", label: "Principal CA address", prefillKey: "corpAddress" },
          { name: "agent", label: "CA agent for service of process", prefillKey: "incorporatorName" },
        ],
      },
      {
        id: "ca-registered-agent",
        title: "CA Registered Agent Appointment",
        short: "CA Registered Agent Appointment",
        description:
          "Appoint a registered agent with a physical California address to accept legal service on behalf of the corporation.",
        deadline: "Concurrent with CA qualification",
        fields: [
          { name: "agentName", label: "Registered agent name", prefillKey: "incorporatorName" },
          { name: "agentAddress", label: "Agent street address", prefillKey: "corpAddress" },
        ],
      },
    ],
  },
  {
    id: "securities",
    title: "Securities Compliance Filings",
    items: [
      {
        id: "25102f",
        title: "Section 25102(f) Notice",
        short: "25102(f)",
        description:
          "California limited-offering exemption notice for the sale of founder stock. File with the CA Department of Financial Protection & Innovation.",
        deadline: "Within 15 days of first sale",
        fields: [
          { name: "issuer", label: "Issuer", prefillKey: "companyName" },
          { name: "purchasers", label: "Number of purchasers", placeholder: "e.g. 2" },
          { name: "amount", label: "Aggregate amount raised", placeholder: "$" },
        ],
      },
      {
        id: "25102o",
        title: "Section 25102(o) Notice",
        short: "25102(o)",
        description:
          "California exemption notice covering securities issued under a qualified equity compensation plan (the option pool).",
        deadline: "Within 30 days of plan adoption",
        fields: [
          { name: "issuer", label: "Issuer", prefillKey: "companyName" },
          { name: "plan", label: "Equity plan name", placeholder: "2026 Equity Incentive Plan" },
          { name: "poolShares", label: "Shares reserved under plan", prefillKey: "poolShares" },
        ],
      },
    ],
  },
]

/* ---------------- Answers captured through the flow ---------------- */

export type Officer = { title: string; name: string }
export type Allocation = { name: string; shares: number; isPool?: boolean }

export type FlowAnswers = {
  companyName: string
  incorporatorName: string
  incorporatorAddress: string
  corpAddress: string
  directorCount: number
  directors: string[]
  officers: Officer[]
  allocations: Allocation[]
  vestingStartDate: string
  vestingUsesEarlierDate: boolean
  // derived display helpers
  foundersList: string
  founderShares: string
  poolShares: string
}

export const initialAnswers: FlowAnswers = {
  companyName: "",
  incorporatorName: "",
  incorporatorAddress: "",
  corpAddress: "",
  directorCount: 2,
  directors: [],
  officers: [],
  allocations: [],
  vestingStartDate: "",
  vestingUsesEarlierDate: false,
  foundersList: "",
  founderShares: "",
  poolShares: "",
}
