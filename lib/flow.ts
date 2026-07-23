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
  type?: "text" | "date" | "textarea" | "select"
  options?: string[]
  prefillKey?: keyof FlowAnswers | "computed"
  placeholder?: string
  hint?: string
  optional?: boolean
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
  description: "Apply for a federal Employer Identification Number with the IRS. Required to open a bank account, hire employees, and file taxes.",
  deadline: "Before opening a bank account",
  fields: [
    { name: "companyName", label: "Legal company name", prefillKey: "companyName", placeholder: "e.g. Acme Technologies, Inc." },
    { name: "incorporationDate", label: "Date of incorporation", type: "date" },
    { name: "entityType", label: "Entity type", type: "select", options: ["C Corporation", "S Corporation", "LLC", "Partnership", "Sole Proprietor"] },
    { name: "responsible", label: "Responsible party (full legal name)", prefillKey: "incorporatorName", placeholder: "e.g. Jane Founder" },
    { name: "ssn", label: "Responsible party SSN / ITIN", placeholder: "XXX-XX-XXXX" },
    { name: "address", label: "Principal business address", type: "textarea", prefillKey: "corpAddress", placeholder: "Street, City, State, ZIP" },
    { name: "reason", label: "Reason for applying", type: "select", options: ["Started new business", "Hired employees", "Banking purpose", "Changed type of organization", "Purchased going business", "Created a trust", "Other"] },
  ],
}

const EIGHTY_THREE_B: ComplianceItem = {
  id: "83b",
  title: "83(b) Elections",
  short: "83(b) Elections",
  description: "File 83(b) elections for founders holding stock subject to vesting, within 30 days of grant.",
  deadline: "Within 30 days of stock purchase",
  fields: [
    { name: "companyName", label: "Legal company name", prefillKey: "companyName", placeholder: "e.g. Acme Technologies, Inc." },
    { name: "taxpayer", label: "Taxpayer (founder) full legal name", prefillKey: "incorporatorName" },
    { name: "grantDate", label: "Date of stock grant / purchase", type: "date", prefillKey: "vestingStartDate", hint: "The 83(b) election must be filed within 30 days of this date." },
    { name: "shares", label: "Number of shares purchased", prefillKey: "founderShares", placeholder: "e.g. 4,000,000" },
    { name: "pricePerShare", label: "Price paid per share (USD)", placeholder: "e.g. 0.0001" },
    { name: "vestingSchedule", label: "Vesting schedule", type: "textarea", placeholder: "e.g. 4-year vesting, 1-year cliff" },
  ],
}

const DE_REGISTERED_AGENT: ComplianceItem = {
  id: "de-registered-agent",
  title: "DE Registered Agent Appointment",
  short: "DE Registered Agent",
  description: "Appoint a registered agent authorized to accept service of process in Delaware.",
  deadline: "At incorporation",
  fields: [
    { name: "companyName", label: "Legal company name", prefillKey: "companyName", placeholder: "e.g. Acme Technologies, Inc." },
    { name: "deFileNumber", label: "Delaware file number", placeholder: "e.g. 1234567", optional: true },
    { name: "agentName", label: "Registered agent name", placeholder: "e.g. Corporation Service Company" },
    { name: "agentAddress", label: "Registered agent Delaware address", type: "textarea" },
  ],
}

const CA_QUALIFICATION: ComplianceItem = {
  id: "ca-qualification",
  title: "CA Qualification",
  short: "CA Qualification",
  description: "Qualify your out-of-state corporation to transact business in California (Form S&DC-S/N).",
  deadline: "Before transacting business in CA",
  fields: [
    { name: "companyName", label: "Legal company name", prefillKey: "companyName", placeholder: "e.g. Acme Technologies, Inc." },
    { name: "stateOfIncorp", label: "State of incorporation", placeholder: "e.g. Delaware" },
    { name: "principalAddress", label: "Principal business address", type: "textarea", prefillKey: "corpAddress", placeholder: "Street, City, State, ZIP" },
    { name: "caAddress", label: "California office address (if any)", type: "textarea", optional: true },
    { name: "ceoName", label: "Chief executive officer name", prefillKey: "incorporatorName" },
  ],
}

const CA_REGISTERED_AGENT: ComplianceItem = {
  id: "ca-registered-agent",
  title: "CA Registered Agent Appointment",
  short: "CA Registered Agent",
  description: "Designate an agent for service of process in California.",
  deadline: "Concurrent with CA qualification",
  fields: [
    { name: "companyName", label: "Legal company name", prefillKey: "companyName", placeholder: "e.g. Acme Technologies, Inc." },
    { name: "agentName", label: "California agent name" },
    { name: "agentAddress", label: "California agent street address", type: "textarea" },
  ],
}

const NOTICE_25102F: ComplianceItem = {
  id: "25102f",
  title: "25102(f)",
  short: "25102(f)",
  description: "Limited offering exemption notice for securities sold in California (Section 25102(f)).",
  deadline: "Within 15 days of first sale",
  fields: [
    { name: "companyName", label: "Legal company name", prefillKey: "companyName", placeholder: "e.g. Acme Technologies, Inc." },
    { name: "firstSaleDate", label: "Date of first sale of securities", type: "date" },
    { name: "amount", label: "Aggregate amount raised in California (USD)" },
    { name: "purchasers", label: "Number of California purchasers" },
  ],
}

const NOTICE_25102O: ComplianceItem = {
  id: "25102o",
  title: "25102(o)",
  short: "25102(o)",
  description: "Notice of exemption for securities issued under a compensatory benefit plan (Section 25102(o)).",
  deadline: "Within 30 days of plan adoption",
  fields: [
    { name: "companyName", label: "Legal company name", prefillKey: "companyName", placeholder: "e.g. Acme Technologies, Inc." },
    { name: "planName", label: "Equity incentive plan name", placeholder: "e.g. 2025 Equity Incentive Plan" },
    { name: "adoptionDate", label: "Plan adoption date", type: "date" },
    { name: "poolShares", label: "Shares reserved under the plan", prefillKey: "poolShares" },
  ],
}

const DE_ANNUAL_REPORT: ComplianceItem = {
  id: "de-annual-report",
  title: "Annual Report",
  short: "DE Annual Report",
  description: "File the Delaware annual report and pay the annual franchise tax.",
  deadline: "March 1 each year",
  fields: [
    { name: "companyName", label: "Legal company name", prefillKey: "companyName", placeholder: "e.g. Acme Technologies, Inc." },
    { name: "reportYear", label: "Report year", placeholder: "e.g. 2025" },
    { name: "authorizedShares", label: "Total authorized shares" },
    { name: "grossAssets", label: "Total gross assets (USD)", hint: "Used to calculate franchise tax under the assumed par value method." },
    { name: "directors", label: "Names and addresses of all directors", type: "textarea" },
  ],
}

const DE_AGENT_RENEWAL: ComplianceItem = {
  id: "de-agent-renewal",
  title: "DE Registered Agent Renewal",
  short: "DE Agent Renewal",
  description: "Renew your Delaware registered agent for the coming year.",
  deadline: "Annually",
  fields: [
    { name: "companyName", label: "Legal company name", prefillKey: "companyName", placeholder: "e.g. Acme Technologies, Inc." },
    { name: "agentName", label: "Registered agent name" },
    { name: "renewalPeriod", label: "Renewal period", type: "select", options: ["2025", "2026", "2027", "2028", "2029", "2030"] },
  ],
}

const CA_SOI: ComplianceItem = {
  id: "ca-soi",
  title: "CA Statement of Information",
  short: "CA Statement of Info",
  description: "File the California Statement of Information (Form SI-550).",
  deadline: "Within 90 days of CA qualification, then biennially",
  fields: [
    { name: "companyName", label: "Legal company name", prefillKey: "companyName", placeholder: "e.g. Acme Technologies, Inc." },
    { name: "caEntityNumber", label: "California entity number", placeholder: "e.g. C1234567", optional: true },
    { name: "principalAddress", label: "Principal business address", type: "textarea", prefillKey: "corpAddress", placeholder: "Street, City, State, ZIP" },
    { name: "ceoName", label: "Chief executive officer name", prefillKey: "incorporatorName" },
    { name: "secretaryName", label: "Secretary name" },
    { name: "agent", label: "Agent for service of process" },
  ],
}

const CA_AGENT_RENEWAL: ComplianceItem = {
  id: "ca-agent-renewal",
  title: "CA Registered Agent Renewal",
  short: "CA Agent Renewal",
  description: "Renew the California agent for service of process.",
  deadline: "Annually",
  fields: [
    { name: "companyName", label: "Legal company name", prefillKey: "companyName", placeholder: "e.g. Acme Technologies, Inc." },
    { name: "agentName", label: "California agent name" },
    { name: "renewalPeriod", label: "Renewal period", type: "select", options: ["2025", "2026", "2027", "2028", "2029", "2030"] },
  ],
}

const ANNUAL_STOCKHOLDERS_CONSENT: ComplianceItem = {
  id: "annual-stockholders-consent",
  title: "Annual Stockholders Consent",
  short: "Annual Stockholders Consent",
  description: "Annual written consent of stockholders in lieu of a meeting.",
  deadline: "Annually",
  fields: [
    { name: "companyName", label: "Legal company name", prefillKey: "companyName", placeholder: "e.g. Acme Technologies, Inc." },
    { name: "effectiveDate", label: "Effective date of consent", type: "date" },
    { name: "directors", label: "Directors elected for the coming year", type: "textarea" },
    { name: "otherMatters", label: "Other matters approved", type: "textarea", placeholder: "e.g. ratification of prior board actions", optional: true },
  ],
}

const ANNUAL_BOARD_CONSENT: ComplianceItem = {
  id: "annual-board-consent",
  title: "Annual Board Consent",
  short: "Annual Board Consent",
  description: "Annual written consent of the board of directors in lieu of a meeting.",
  deadline: "Annually",
  fields: [
    { name: "companyName", label: "Legal company name", prefillKey: "companyName", placeholder: "e.g. Acme Technologies, Inc." },
    { name: "effectiveDate", label: "Effective date of consent", type: "date" },
    { name: "officers", label: "Officers appointed", type: "textarea" },
    { name: "otherMatters", label: "Other matters approved", type: "textarea", optional: true },
  ],
}

const SPECIAL_STOCKHOLDERS_CONSENT: ComplianceItem = {
  id: "special-stockholders-consent",
  title: "Special Stockholders Consent",
  short: "Special Stockholders Consent",
  description: "Special written consent of stockholders for a specific matter.",
  deadline: "As needed",
  fields: [
    { name: "companyName", label: "Legal company name", prefillKey: "companyName", placeholder: "e.g. Acme Technologies, Inc." },
    { name: "effectiveDate", label: "Effective date of consent", type: "date" },
    { name: "matter", label: "Matter being approved", type: "textarea", placeholder: "e.g. approval of a financing round" },
    { name: "sharesVoting", label: "Shares voting in favor" },
  ],
}

const SPECIAL_BOARD_CONSENT: ComplianceItem = {
  id: "special-board-consent",
  title: "Special Board Consent",
  short: "Special Board Consent",
  description: "Special written consent of the board for a specific matter.",
  deadline: "As needed",
  fields: [
    { name: "companyName", label: "Legal company name", prefillKey: "companyName", placeholder: "e.g. Acme Technologies, Inc." },
    { name: "effectiveDate", label: "Effective date of consent", type: "date" },
    { name: "matter", label: "Matter being approved", type: "textarea", placeholder: "e.g. approval of stock option grants" },
    { name: "directors", label: "Directors approving", type: "textarea" },
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
      { id: "governance", title: "Consents & Resolutions", items: [ANNUAL_STOCKHOLDERS_CONSENT, ANNUAL_BOARD_CONSENT, SPECIAL_STOCKHOLDERS_CONSENT, SPECIAL_BOARD_CONSENT] },
    ],
  },
]

/* ---- legacy flat list (kept for backwards compat) ---- */
export const COMPLIANCE_GROUPS: ComplianceGroup[] = COMPLIANCE_CATEGORIES.flatMap((c) => c.groups)

/* ---------------- Transaction Center ---------------- */

export type TransactionField = {
  name: string
  label: string
  type?: "text" | "date" | "textarea" | "select"
  options?: string[]
  prefillKey?: keyof FlowAnswers | "computed"
  placeholder?: string
  hint?: string
  optional?: boolean
}

export type TransactionItem = {
  id: string
  title: string
  short: string
  description: string
  fields: TransactionField[]
}

export type TransactionGroup = {
  id: string
  title: string
  items: TransactionItem[]
}

export type TransactionCategory = {
  id:
    | "financing"
    | "contributors"
    | "employees"
    | "customers"
    | "ip-nda"
    | "commercial"
    | "separation"
  label: string
  chatResponse: string
  groups: TransactionGroup[]
}

const companyNameField: TransactionField = {
  name: "companyName",
  label: "Legal company name",
  prefillKey: "companyName",
  placeholder: "e.g. Acme Technologies, Inc.",
}

/* ---- Financing ---- */

const SAFE: TransactionItem = {
  id: "safe",
  title: "SAFE",
  short: "SAFE",
  description: "Simple Agreement for Future Equity — convertible investment instrument used for early-stage financing.",
  fields: [
    companyNameField,
    { name: "investorName", label: "Investor name", placeholder: "e.g. Jane Ventures" },
    { name: "investmentAmount", label: "Investment amount", placeholder: "e.g. $100,000" },
    { name: "valuationCap", label: "Valuation cap", placeholder: "e.g. $8,000,000" },
    { name: "discountRate", label: "Discount rate", placeholder: "e.g. 20%", optional: true, hint: "Leave blank if none." },
  ],
}

const FOUNDER_LOAN: TransactionItem = {
  id: "founder-loan",
  title: "Founder Loan",
  short: "Founder Loan",
  description: "Loan agreement between a founder and the company.",
  fields: [
    companyNameField,
    { name: "lendingFounder", label: "Lending founder", placeholder: "e.g. Jane Founder" },
    { name: "loanAmount", label: "Loan amount", placeholder: "e.g. $25,000" },
    { name: "interestRate", label: "Interest rate", placeholder: "e.g. 5% per annum" },
    { name: "maturityDate", label: "Repayment / maturity date", type: "date" },
  ],
}

const SAFE_CHECK: TransactionItem = {
  id: "safe-check",
  title: "SAFE Check",
  short: "SAFE Check",
  description: "Record receipt of funds against a previously issued SAFE.",
  fields: [
    companyNameField,
    { name: "relatedInvestor", label: "Which SAFE / investor is this payment for?", placeholder: "e.g. Jane Ventures" },
    { name: "amountReceived", label: "Amount received", placeholder: "e.g. $100,000" },
    { name: "dateReceived", label: "Date received", type: "date" },
    { name: "paymentMethod", label: "Payment method", type: "select", options: ["Wire", "Check", "ACH", "Other"] },
  ],
}

const SAFE_TERM_SHEET: TransactionItem = {
  id: "safe-term-sheet",
  title: "SAFE Term Sheet",
  short: "SAFE Term Sheet",
  description: "Non-binding summary of proposed SAFE terms ahead of a financing.",
  fields: [
    companyNameField,
    { name: "investorName", label: "Investor name", placeholder: "e.g. Jane Ventures" },
    { name: "proposedAmount", label: "Proposed investment amount", placeholder: "e.g. $250,000" },
    { name: "proposedValuationCap", label: "Proposed valuation cap", placeholder: "e.g. $10,000,000" },
    { name: "proRataRights", label: "Pro-rata rights included?", type: "select", options: ["Yes", "No"] },
  ],
}

/* ---- Developers and Early Contributors ---- */

const SERVICES_AGREEMENT: TransactionItem = {
  id: "services-agreement",
  title: "Services Agreement",
  short: "Services Agreement",
  description: "Agreement covering development or other services performed for the company.",
  fields: [
    companyNameField,
    { name: "contractorName", label: "Contractor / company name", placeholder: "e.g. Acme Dev Studio" },
    { name: "scopeOfServices", label: "Scope of services", type: "textarea" },
    { name: "paymentTerms", label: "Payment terms", placeholder: "e.g. $10,000 flat fee, or $150/hr" },
    { name: "startDateAndDuration", label: "Start date and duration", placeholder: "e.g. Starting Jan 1, 3 months" },
  ],
}

const PROMISED_OPTIONS_LETTER: TransactionItem = {
  id: "promised-options-letter",
  title: "Promised Options Letter",
  short: "Promised Options Letter",
  description: "Letter confirming an intended future stock option grant.",
  fields: [
    companyNameField,
    { name: "recipientName", label: "Recipient name", placeholder: "e.g. Jane Developer" },
    { name: "optionsPromised", label: "Number of options promised", placeholder: "e.g. 25,000" },
    { name: "vestingSchedule", label: "Vesting schedule", placeholder: "e.g. 4-year, 1-year cliff" },
    { name: "expectedGrantDate", label: "Expected grant date", type: "date" },
  ],
}

/* ---- Employees, Consultants and Advisors ---- */

const OFFER_LETTER: TransactionItem = {
  id: "offer-letter",
  title: "Offer Letter",
  short: "Offer Letter",
  description: "Employment offer letter for a new hire.",
  fields: [
    companyNameField,
    { name: "candidateName", label: "Candidate name", placeholder: "e.g. Jane Employee" },
    { name: "jobTitle", label: "Job title", placeholder: "e.g. Head of Engineering" },
    { name: "startDate", label: "Start date", type: "date" },
    { name: "salary", label: "Salary", placeholder: "e.g. $150,000/year" },
    { name: "equityOffered", label: "Equity offered", placeholder: "e.g. 50,000 options", optional: true },
  ],
}

const CONSULTING_AGREEMENT: TransactionItem = {
  id: "consulting-agreement",
  title: "Consulting Agreement",
  short: "Consulting Agreement",
  description: "Agreement engaging an independent consultant.",
  fields: [
    companyNameField,
    { name: "consultantName", label: "Consultant name", placeholder: "e.g. Jane Consultant" },
    { name: "scopeOfWork", label: "Scope of work", type: "textarea" },
    { name: "feeStructure", label: "Fee structure", placeholder: "e.g. $200/hr, or $5,000/month retainer" },
    { name: "termLength", label: "Term length", placeholder: "e.g. 6 months" },
  ],
}

const ADVISOR_AGREEMENT: TransactionItem = {
  id: "advisor-agreement",
  title: "Advisor Agreement",
  short: "Advisor Agreement",
  description: "Agreement engaging an advisor, typically compensated in equity.",
  fields: [
    companyNameField,
    { name: "advisorName", label: "Advisor name", placeholder: "e.g. Jane Advisor" },
    { name: "roleExpertise", label: "Area of expertise / role", placeholder: "e.g. Go-to-market strategy" },
    { name: "optionsGranted", label: "Options granted", placeholder: "e.g. 10,000" },
    { name: "vestingSchedule", label: "Vesting schedule", placeholder: "e.g. 2-year monthly vesting" },
  ],
}

/* ---- Early Customers ---- */

const BETA_LICENSE: TransactionItem = {
  id: "beta-license",
  title: "Beta License",
  short: "Beta License",
  description: "License granting a customer access to a beta product or feature.",
  fields: [
    companyNameField,
    { name: "customerName", label: "Beta customer name", placeholder: "e.g. Acme Corp" },
    { name: "productFeature", label: "Product / feature being tested", placeholder: "e.g. New analytics dashboard" },
    { name: "licenseTerm", label: "License term", placeholder: "e.g. 3 months, starting Jan 1" },
    { name: "feedbackObligations", label: "Feedback obligations?", type: "select", options: ["Yes", "No"] },
  ],
}

const PILOT_AGREEMENT: TransactionItem = {
  id: "pilot-agreement",
  title: "Pilot Agreement",
  short: "Pilot Agreement",
  description: "Agreement covering a limited pilot deployment with a customer.",
  fields: [
    companyNameField,
    { name: "customerName", label: "Customer name", placeholder: "e.g. Acme Corp" },
    { name: "pilotScope", label: "Pilot scope / use case", type: "textarea" },
    { name: "duration", label: "Duration", placeholder: "e.g. 60 days" },
    { name: "pilotFee", label: "Pilot fee", placeholder: "e.g. $0 (free), or $2,000", optional: true },
  ],
}

const USER_AGREEMENT: TransactionItem = {
  id: "user-agreement",
  title: "User Agreement",
  short: "User Agreement",
  description: "Agreement governing end-user use of the product.",
  fields: [
    companyNameField,
    { name: "productName", label: "Product / service name", placeholder: "e.g. Acme App" },
    { name: "governingState", label: "Governing state", placeholder: "e.g. Delaware" },
    { name: "specialTerms", label: "Any special terms", type: "textarea", placeholder: "e.g. data usage, arbitration", optional: true },
  ],
}

const TERMS_OF_SERVICE: TransactionItem = {
  id: "terms-of-service",
  title: "Terms of Service",
  short: "Terms of Service",
  description: "General terms of service for the product or website.",
  fields: [
    companyNameField,
    { name: "productName", label: "Product / website name", placeholder: "e.g. acme.com" },
    { name: "governingState", label: "Governing state", placeholder: "e.g. Delaware" },
    { name: "subscriptionTerms", label: "Subscription / payment terms", type: "textarea", optional: true },
  ],
}

/* ---- IP, Licensing and NDAs ---- */

const NDA: TransactionItem = {
  id: "nda",
  title: "NDA",
  short: "NDA",
  description: "Non-disclosure agreement protecting confidential information shared with a counterparty.",
  fields: [
    companyNameField,
    { name: "counterpartyName", label: "Counterparty name", placeholder: "e.g. Acme Corp" },
    { name: "purpose", label: "Purpose of disclosure", type: "textarea" },
    { name: "mutualOrOneWay", label: "Mutual or one-way?", type: "select", options: ["Mutual", "One-way"] },
    { name: "termLength", label: "Confidentiality term length", placeholder: "e.g. 2 years" },
  ],
}

const PRIVACY_POLICY: TransactionItem = {
  id: "privacy-policy",
  title: "Privacy Policy",
  short: "Privacy Policy",
  description: "Policy describing how the company collects and uses personal data.",
  fields: [
    companyNameField,
    { name: "productName", label: "Product / website name", placeholder: "e.g. acme.com" },
    { name: "dataCollected", label: "What personal data is collected", type: "textarea" },
    { name: "governingState", label: "Governing state", placeholder: "e.g. Delaware" },
    { name: "contactEmail", label: "Privacy contact email", placeholder: "e.g. privacy@acme.com" },
  ],
}

const IP_LICENSE: TransactionItem = {
  id: "ip-license",
  title: "IP License",
  short: "IP License",
  description: "Agreement licensing intellectual property to or from a third party.",
  fields: [
    companyNameField,
    { name: "licenseeName", label: "Licensee name", placeholder: "e.g. Acme Corp" },
    { name: "ipDescription", label: "IP being licensed", type: "textarea", placeholder: "e.g. patent, trademark, software" },
    { name: "exclusivity", label: "Exclusive or non-exclusive?", type: "select", options: ["Exclusive", "Non-exclusive"] },
    { name: "royaltyTerms", label: "Royalty / fee terms", placeholder: "e.g. 5% of net revenue" },
  ],
}

/* ---- Commercial Agreements ---- */

const SALES_AGREEMENT: TransactionItem = {
  id: "sales-agreement",
  title: "Sales Agreement",
  short: "Sales Agreement",
  description: "Agreement for the sale of a product or service to a customer.",
  fields: [
    companyNameField,
    { name: "customerName", label: "Customer name", placeholder: "e.g. Acme Corp" },
    { name: "productService", label: "Product / service sold", placeholder: "e.g. Enterprise license" },
    { name: "priceAndPaymentTerms", label: "Price and payment terms", placeholder: "e.g. $50,000, net 30" },
    { name: "deliveryTerms", label: "Delivery terms", placeholder: "e.g. FOB origin, delivered within 30 days" },
  ],
}

const RESELLER_AGREEMENT: TransactionItem = {
  id: "reseller-agreement",
  title: "Reseller Agreement",
  short: "Reseller Agreement",
  description: "Agreement authorizing a reseller to sell the company's product.",
  fields: [
    companyNameField,
    { name: "resellerName", label: "Reseller name", placeholder: "e.g. Acme Distribution" },
    { name: "territory", label: "Territory", placeholder: "e.g. North America" },
    { name: "discountTerms", label: "Discount / margin terms", placeholder: "e.g. 20% off list price" },
    { name: "termLength", label: "Term length", placeholder: "e.g. 1 year, auto-renewing" },
  ],
}

const SAAS_AGREEMENT: TransactionItem = {
  id: "saas-agreement",
  title: "SaaS Agreement",
  short: "SaaS Agreement",
  description: "Subscription agreement for access to the company's SaaS product.",
  fields: [
    companyNameField,
    { name: "customerName", label: "Customer name", placeholder: "e.g. Acme Corp" },
    { name: "subscriptionTier", label: "Subscription tier / plan", placeholder: "e.g. Enterprise" },
    { name: "contractTerm", label: "Contract term", type: "select", options: ["Monthly", "Annual"] },
    { name: "pricing", label: "Pricing", placeholder: "e.g. $2,000/month" },
  ],
}

const DISTRIBUTION_AGREEMENT: TransactionItem = {
  id: "distribution-agreement",
  title: "Distribution Agreement",
  short: "Distribution Agreement",
  description: "Agreement authorizing a distributor to distribute the company's product.",
  fields: [
    companyNameField,
    { name: "distributorName", label: "Distributor name", placeholder: "e.g. Acme Distribution" },
    { name: "territory", label: "Territory", placeholder: "e.g. EMEA" },
    { name: "exclusivity", label: "Exclusive or non-exclusive?", type: "select", options: ["Exclusive", "Non-exclusive"] },
    { name: "termLength", label: "Term length", placeholder: "e.g. 2 years" },
  ],
}

/* ---- Founder Separation and Dissolution ---- */

const FOUNDER_SEPARATION_AGREEMENT: TransactionItem = {
  id: "founder-separation-agreement",
  title: "Founder Separation Agreement",
  short: "Founder Separation Agreement",
  description: "Agreement documenting the terms of a departing founder's separation from the company.",
  fields: [
    companyNameField,
    { name: "departingFounder", label: "Departing founder", placeholder: "e.g. Jane Founder" },
    { name: "separationDate", label: "Separation date", type: "date" },
    { name: "equityTreatment", label: "Equity treatment", type: "textarea", placeholder: "e.g. unvested shares repurchased, vested shares retained" },
    { name: "severanceTerms", label: "Severance terms", type: "textarea", optional: true },
  ],
}

const CORPORATE_DISSOLUTION: TransactionItem = {
  id: "corporate-dissolution",
  title: "Corporate Dissolution",
  short: "Corporate Dissolution",
  description: "Documentation to formally wind down and dissolve the corporation.",
  fields: [
    companyNameField,
    { name: "dissolutionBasis", label: "Basis for dissolution", placeholder: "e.g. board and shareholder approval" },
    { name: "effectiveDate", label: "Effective date", type: "date" },
    { name: "assetDistributionPlan", label: "Asset distribution plan", type: "textarea" },
    { name: "outstandingLiabilities", label: "Outstanding liabilities to resolve", type: "textarea", optional: true },
  ],
}

/* ---- categories ---- */

export const TRANSACTION_CATEGORIES: TransactionCategory[] = [
  {
    id: "financing",
    label: "Financing",
    chatResponse: "Here are the financing documents available — SAFEs, term sheets, and founder loans. Select which one you'd like to prepare by clicking it on the right — I'll walk you through it.",
    groups: [{ id: "financing-docs", title: "Financing", items: [SAFE, FOUNDER_LOAN, SAFE_CHECK, SAFE_TERM_SHEET] }],
  },
  {
    id: "contributors",
    label: "Developers and Early Contributors",
    chatResponse: "Here are the agreements for developers and early contributors. Select which one you'd like to prepare by clicking it on the right — I'll walk you through it.",
    groups: [{ id: "contributors-docs", title: "Developers and Early Contributors", items: [SERVICES_AGREEMENT, PROMISED_OPTIONS_LETTER] }],
  },
  {
    id: "employees",
    label: "Employees, Consultants and Advisors",
    chatResponse: "Here are the agreements for employees, consultants, and advisors. Select which one you'd like to prepare by clicking it on the right — I'll walk you through it.",
    groups: [{ id: "employees-docs", title: "Employees, Consultants and Advisors", items: [OFFER_LETTER, CONSULTING_AGREEMENT, ADVISOR_AGREEMENT] }],
  },
  {
    id: "customers",
    label: "Early Customers",
    chatResponse: "Here are the agreements for early customers. Select which one you'd like to prepare by clicking it on the right — I'll walk you through it.",
    groups: [{ id: "customers-docs", title: "Early Customers", items: [BETA_LICENSE, PILOT_AGREEMENT, USER_AGREEMENT, TERMS_OF_SERVICE] }],
  },
  {
    id: "ip-nda",
    label: "IP, Licensing and NDAs",
    chatResponse: "Here are the IP, licensing, and confidentiality documents. Select which one you'd like to prepare by clicking it on the right — I'll walk you through it.",
    groups: [{ id: "ip-nda-docs", title: "IP, Licensing and NDAs", items: [NDA, PRIVACY_POLICY, IP_LICENSE] }],
  },
  {
    id: "commercial",
    label: "Commercial Agreements",
    chatResponse: "Here are the commercial agreements available. Select which one you'd like to prepare by clicking it on the right — I'll walk you through it.",
    groups: [{ id: "commercial-docs", title: "Commercial Agreements", items: [SALES_AGREEMENT, RESELLER_AGREEMENT, SAAS_AGREEMENT, DISTRIBUTION_AGREEMENT] }],
  },
  {
    id: "separation",
    label: "Founder Separation and Dissolution",
    chatResponse: "Here are the founder separation and dissolution documents. Select which one you'd like to prepare by clicking it on the right — I'll walk you through it.",
    groups: [{ id: "separation-docs", title: "Founder Separation and Dissolution", items: [FOUNDER_SEPARATION_AGREEMENT, CORPORATE_DISSOLUTION] }],
  },
]

/* ---------------- Answers captured through the flow ---------------- */

export type Officer = { title: string; name: string }
export type Allocation = { name: string; shares: number; isPool?: boolean }

export type FlowAnswers = {
  companyName: string
  incorporatorName: string
  incorporatorAddress: string
  registeredAgentName: string
  registeredAgentAddress: string
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
  registeredAgentName: "",
  registeredAgentAddress: "",
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
