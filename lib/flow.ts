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

export type ComplianceCategory = {
  id: "post-incorporation" | "annual-filings" | "corporate-governance"
  label: string
  chatResponse: string
  groups: ComplianceGroup[]
}

/* ---- individual items ---- */

const EIN: ComplianceItem = {
  id: "ein",
  title: "EIN — Employer Identification Number",
  short: "EIN",
  description: "Obtain a federal tax ID from the IRS (Form SS-4). Required to open a bank account and hire employees.",
  deadline: "Before opening a bank account",
  fields: [
    { name: "entity", label: "Legal entity name", prefillKey: "companyName" },
    { name: "responsible", label: "Responsible party", prefillKey: "incorporatorName" },
    { name: "ssn", label: "Responsible party SSN / ITIN", placeholder: "XXX-XX-XXXX" },
  ],
}

const EIGHTY_THREE_B: ComplianceItem = {
  id: "83b",
  title: "83(b) Elections",
  short: "83(b) Elections",
  description: "Each founder receiving restricted stock should file an 83(b) election with the IRS within 30 days of the stock purchase.",
  deadline: "Within 30 days of stock purchase",
  fields: [
    { name: "founders", label: "Founders filing 83(b)", prefillKey: "foundersList" },
    { name: "purchaseDate", label: "Stock purchase date", type: "date", prefillKey: "vestingStartDate" },
    { name: "shares", label: "Total restricted shares", prefillKey: "founderShares" },
  ],
}

const DE_REGISTERED_AGENT: ComplianceItem = {
  id: "de-registered-agent",
  title: "DE Registered Agent Appointment",
  short: "DE Registered Agent",
  description: "Appoint a registered agent with a physical Delaware address to receive legal and official documents on behalf of your corporation.",
  deadline: "At incorporation",
  fields: [
    { name: "agentName", label: "Registered agent name", placeholder: "Agent name or service" },
    { name: "agentAddress", label: "Delaware agent address", placeholder: "Street address, Wilmington, DE" },
  ],
}

const CA_QUALIFICATION: ComplianceItem = {
  id: "ca-qualification",
  title: "California Qualification (Form S&DC-S/N)",
  short: "CA Qualification",
  description: "A Delaware corporation doing business in California must qualify with the CA Secretary of State as a foreign corporation.",
  deadline: "Before transacting business in CA",
  fields: [
    { name: "entity", label: "Corporation name", prefillKey: "companyName" },
    { name: "address", label: "Principal CA address", prefillKey: "corpAddress" },
    { name: "agent", label: "CA agent for service of process", prefillKey: "incorporatorName" },
  ],
}

const CA_REGISTERED_AGENT: ComplianceItem = {
  id: "ca-registered-agent",
  title: "CA Registered Agent Appointment",
  short: "CA Registered Agent",
  description: "Appoint a registered agent with a physical California address to accept legal service on behalf of the corporation.",
  deadline: "Concurrent with CA qualification",
  fields: [
    { name: "agentName", label: "Registered agent name", prefillKey: "incorporatorName" },
    { name: "agentAddress", label: "Agent street address", prefillKey: "corpAddress" },
  ],
}

const NOTICE_25102F: ComplianceItem = {
  id: "25102f",
  title: "Section 25102(f) Notice",
  short: "25102(f)",
  description: "California limited-offering exemption notice for the sale of founder stock. File with the CA DFPI.",
  deadline: "Within 15 days of first sale",
  fields: [
    { name: "issuer", label: "Issuer", prefillKey: "companyName" },
    { name: "purchasers", label: "Number of purchasers", placeholder: "e.g. 2" },
    { name: "amount", label: "Aggregate amount raised", placeholder: "$" },
  ],
}

const NOTICE_25102O: ComplianceItem = {
  id: "25102o",
  title: "Section 25102(o) Notice",
  short: "25102(o)",
  description: "California exemption notice covering securities issued under a qualified equity compensation plan (the option pool).",
  deadline: "Within 30 days of plan adoption",
  fields: [
    { name: "issuer", label: "Issuer", prefillKey: "companyName" },
    { name: "plan", label: "Equity plan name", placeholder: "2026 Equity Incentive Plan" },
    { name: "poolShares", label: "Shares reserved under plan", prefillKey: "poolShares" },
  ],
}

const DE_ANNUAL_REPORT: ComplianceItem = {
  id: "de-annual-report",
  title: "Delaware Annual Report",
  short: "DE Annual Report",
  description: "File the annual report and pay franchise tax with the Delaware Secretary of State each year by March 1.",
  deadline: "March 1 each year",
  fields: [
    { name: "entity", label: "Corporation name", prefillKey: "companyName" },
    { name: "year", label: "Tax year", placeholder: "e.g. 2026" },
  ],
}

const DE_AGENT_RENEWAL: ComplianceItem = {
  id: "de-agent-renewal",
  title: "DE Registered Agent Renewal",
  short: "DE Agent Renewal",
  description: "Renew your Delaware registered agent appointment annually to maintain good standing.",
  deadline: "Annually",
  fields: [
    { name: "agentName", label: "Registered agent name", placeholder: "Agent name or service" },
    { name: "renewalDate", label: "Renewal date", type: "date" },
  ],
}

const CA_SOI: ComplianceItem = {
  id: "ca-soi",
  title: "CA Statement of Information",
  short: "CA Statement of Info",
  description: "File a Statement of Information with the California Secretary of State. Due within 90 days of qualification and biennially thereafter.",
  deadline: "Within 90 days of CA qualification, then biennially",
  fields: [
    { name: "entity", label: "Corporation name", prefillKey: "companyName" },
    { name: "address", label: "Principal office address", prefillKey: "corpAddress" },
  ],
}

const CA_AGENT_RENEWAL: ComplianceItem = {
  id: "ca-agent-renewal",
  title: "CA Registered Agent Renewal",
  short: "CA Agent Renewal",
  description: "Renew your California registered agent appointment to remain in good standing.",
  deadline: "Annually",
  fields: [
    { name: "agentName", label: "Registered agent name", prefillKey: "incorporatorName" },
    { name: "renewalDate", label: "Renewal date", type: "date" },
  ],
}

const ANNUAL_STOCKHOLDERS_CONSENT: ComplianceItem = {
  id: "annual-stockholders-consent",
  title: "Annual Stockholders Consent",
  short: "Annual Stockholders Consent",
  description: "Annual written consent of stockholders approving the election of directors and other routine corporate matters.",
  deadline: "Annually",
  fields: [
    { name: "entity", label: "Corporation name", prefillKey: "companyName" },
    { name: "date", label: "Consent date", type: "date" },
  ],
}

const ANNUAL_BOARD_CONSENT: ComplianceItem = {
  id: "annual-board-consent",
  title: "Annual Board Consent",
  short: "Annual Board Consent",
  description: "Annual written consent of the board of directors approving officer appointments and other routine corporate actions.",
  deadline: "Annually",
  fields: [
    { name: "entity", label: "Corporation name", prefillKey: "companyName" },
    { name: "date", label: "Consent date", type: "date" },
  ],
}

const SPECIAL_STOCKHOLDERS_CONSENT: ComplianceItem = {
  id: "special-stockholders-consent",
  title: "Special Stockholders Consent",
  short: "Special Stockholders Consent",
  description: "Written consent of stockholders approving a specific corporate action outside of the annual cycle.",
  deadline: "As needed",
  fields: [
    { name: "entity", label: "Corporation name", prefillKey: "companyName" },
    { name: "action", label: "Action being approved", placeholder: "Describe the corporate action" },
    { name: "date", label: "Consent date", type: "date" },
  ],
}

const SPECIAL_BOARD_CONSENT: ComplianceItem = {
  id: "special-board-consent",
  title: "Special Board Consent",
  short: "Special Board Consent",
  description: "Written consent of the board of directors approving a specific action outside of the annual cycle.",
  deadline: "As needed",
  fields: [
    { name: "entity", label: "Corporation name", prefillKey: "companyName" },
    { name: "action", label: "Action being approved", placeholder: "Describe the corporate action" },
    { name: "date", label: "Consent date", type: "date" },
  ],
}

/* ---- categories ---- */

export const COMPLIANCE_CATEGORIES: ComplianceCategory[] = [
  {
    id: "post-incorporation",
    label: "Post-Incorporation",
    chatResponse: "Here are the filings you'll need to complete right after incorporating. These cover your federal tax ID, registered agents, California qualification, and securities exemptions. Select which filing you'd like to begin with by clicking it on the right — I'll guide you through each one.",
    groups: [
      { id: "federal-tax", title: "Federal Tax Filings", items: [EIN, EIGHTY_THREE_B] },
      { id: "de-corporate", title: "Delaware Corporate Filings", items: [DE_REGISTERED_AGENT] },
      { id: "ca-corporate", title: "California Corporate Filings", items: [CA_QUALIFICATION, CA_REGISTERED_AGENT] },
      { id: "ca-securities", title: "California Securities Filings", items: [NOTICE_25102F, NOTICE_25102O] },
    ],
  },
  {
    id: "annual-filings",
    label: "Annual State Filings",
    chatResponse: "Here are your recurring annual filings. These keep your corporation in good standing with Delaware and California each year. Select which filing you'd like to begin with by clicking it on the right — I'll guide you through each one.",
    groups: [
      { id: "de-annual", title: "Delaware Corporate and Tax Filings", items: [DE_ANNUAL_REPORT, DE_AGENT_RENEWAL] },
      { id: "ca-annual", title: "California Corporate Filings", items: [CA_SOI, CA_AGENT_RENEWAL] },
    ],
  },
  {
    id: "corporate-governance",
    label: "Corporate Governance",
    chatResponse: "These are your governance documents — annual and special consents required to authorize corporate actions and maintain proper records. Select which document you'd like to begin with by clicking it on the right — I'll guide you through each one.",
    groups: [
      { id: "governance", title: "Corporate Governance Documents", items: [ANNUAL_STOCKHOLDERS_CONSENT, ANNUAL_BOARD_CONSENT, SPECIAL_STOCKHOLDERS_CONSENT, SPECIAL_BOARD_CONSENT] },
    ],
  },
]

/* ---- legacy flat list (kept for backwards compat) ---- */
export const COMPLIANCE_GROUPS: ComplianceGroup[] = COMPLIANCE_CATEGORIES.flatMap((c) => c.groups)

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
