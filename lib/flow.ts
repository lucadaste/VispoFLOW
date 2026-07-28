export const AUTHORIZED_SHARES = 10_000_000

/** Shared shape for a single field rendered by the one-at-a-time chat field composer. */
export type ChatField = {
  name: string
  label: string
  type?: "text" | "date" | "textarea" | "select" | "address"
  options?: string[]
  placeholder?: string
  hint?: string
  optional?: boolean
}

export type DocStatus = "pending" | "drafting" | "complete" | "filing"

export type LegalDoc = {
  id: string
  label: string
  short: string
  group: "Incorporation" | "Organizational Documents" | "Equity Allocation" | "Equity Plan"
  description: string
}

export const DOCUMENTS: LegalDoc[] = [
  {
    id: "coi",
    label: "Certificate of Incorporation",
    short: "TW COI",
    group: "Incorporation",
    description:
      "The document filed with the Delaware Secretary of State that legally creates the corporation. It sets the company's name, its authorized shares, and key liability protections for directors and officers.",
  },
  {
    id: "action-incorporator",
    label: "Action by Incorporator",
    short: "TW Action by Incorporator",
    group: "Organizational Documents",
    description:
      "The founding legal act taken right after filing: it adopts the bylaws and appoints the initial board of directors so the corporation can start acting through its own governance.",
  },
  {
    id: "bylaws",
    label: "Bylaws",
    short: "TW Bylaws",
    group: "Organizational Documents",
    description:
      "The corporation's internal rulebook: how board meetings are run, how officers are appointed, and what rights stockholders have. It governs day-to-day corporate operations.",
  },
  {
    id: "org-resolutions",
    label: "Organizational Resolutions",
    short: "TW Organizational Resolutions",
    group: "Organizational Documents",
    description:
      "Formal board resolutions covering the first housekeeping decisions a corporation needs — things like appointing officers, opening a bank account, and adopting a stock plan.",
  },
  {
    id: "option-pool",
    label: "Equity Incentive Plan",
    short: "TW Option Pool",
    group: "Equity Plan",
    description:
      "Reserves a pool of shares set aside for future equity grants — stock options or restricted stock — to employees, advisors, and contractors as the company grows.",
  },
  {
    id: "board-consent-option-pool",
    label: "Board Consent — Option Pool",
    short: "TW Board Consent Option Pool",
    group: "Equity Plan",
    description:
      "The board's formal approval adopting the Equity Incentive Plan and authorizing the shares reserved for it.",
  },
  {
    id: "stockholders-consent-option-pool",
    label: "Stockholders Consent — Option Pool",
    short: "TW Stockholders Consent Option Pool",
    description:
      "Stockholder-level approval — in addition to the board's — required to formally adopt the Equity Incentive Plan.",
    group: "Equity Plan",
  },
  {
    id: "founder-rspa",
    label: "Founder Restricted Stock Purchase Agreements",
    short: "TW Founder RSPAs",
    group: "Equity Allocation",
    description:
      "The agreements under which each founder purchases their shares, subject to a vesting schedule so shares are earned over time rather than owned outright from day one. Each also includes a PIIA confirming that IP founders create for the company — code, designs, inventions — belongs to the company, not to them personally.",
  },
  {
    id: "stockholder-consent-indemnification",
    label: "Stockholder Consent — Indemnification Agreement",
    short: "TW Stockholder Consent Indemnification Agreement",
    group: "Equity Allocation",
    description:
      "Majority stockholder approval authorizing the Company to enter into indemnification agreements with its present and future officers and directors.",
  },
  {
    id: "board-consent-founder-stock",
    label: "Board Consent — Founder Stock",
    short: "TW Board Consent Founder Stock",
    group: "Equity Allocation",
    description: "The board's formal approval authorizing the issuance of founder shares under the RSPAs.",
  },
  {
    id: "indemnification-agreement",
    label: "Indemnification Agreement",
    short: "TW Indemnification Agreement",
    group: "Equity Allocation",
    description:
      "The agreement itself, under which the Company indemnifies each officer and director against certain liabilities and expenses incurred in that role.",
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
  /** How this field is asked in chat mode — a natural question. Falls back to `label` if omitted. */
  question?: string
  type?: "text" | "date" | "textarea" | "select" | "address"
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
  /** Longer explanation shown in the info pop-up. Falls back to `description` if omitted. */
  explainer?: string
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
  explainer:
    "This filing bundles two IRS-adjacent documents into one step: (1) Form SS-4, Application for Employer Identification Number, and (2) a Delegated Third Party Declaration authorizing Vispo's filing preparer to submit the SS-4 and receive the EIN on your company's behalf. Once you complete the fields below and sign, your preparer files electronically with the IRS — EINs are typically issued the same day. The fields shown are the subset of Form SS-4 that applies to a newly formed Delaware C-Corp with no employees yet (the IRS's own \"started a new business, no employees\" path); lines specific to LLCs, trusts, nonprofits, and existing businesses are skipped, and \"Corporation\" / \"Delaware\" are filled in automatically for lines 9a/9b.",
  deadline: "Before opening a bank account",
  fields: [
    { name: "companyName", label: "Legal name of entity (Line 1)", question: "What's the official legal name of your entity?", prefillKey: "companyName", placeholder: "e.g. Acme Technologies, Inc." },
    { name: "tradeName", label: "Trade name / DBA, if different (Line 2)", question: "Does the business go by a trade name or DBA that's different from its legal name?", placeholder: "e.g. Acme", optional: true },
    { name: "mailingAddress", label: "Mailing address (Lines 4a–4b)", question: "What's the mailing address for the entity?", type: "address", prefillKey: "corpAddress", placeholder: "Street, City, State, ZIP" },
    { name: "county", label: "County and state of principal business (Line 6)", question: "Which county and state is the principal place of business in?", placeholder: "e.g. New Castle County, Delaware" },
    { name: "responsible", label: "Responsible party — full legal name (Line 7a)", question: "Who's the responsible party — what's their full legal name?", prefillKey: "incorporatorName", placeholder: "e.g. Jane Founder" },
    { name: "ssn", label: "Responsible party SSN or ITIN (Line 7b)", question: "What's the responsible party's Social Security Number or ITIN?", placeholder: "XXX-XX-XXXX" },
    { name: "reason", label: "Reason for applying (Line 10)", question: "Why are you applying for an EIN?", type: "select", options: ["Started new business", "Banking purpose", "Hired employees", "Changed type of organization", "Other"] },
    { name: "incorporationDate", label: "Date business started or acquired (Line 11)", question: "When did the business start or get acquired?", type: "date" },
    {
      name: "closingMonth",
      label: "Closing month of accounting year (Line 12)",
      question: "Which month does your accounting year close?",
      type: "select",
      options: ["December", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November"],
    },
    { name: "employeesExpected", label: "Employees expected in next 12 months (Line 13)", question: "How many employees do you expect to hire in the next 12 months?", placeholder: "0 if none expected yet" },
    { name: "principalActivity", label: "Principal line of business (Lines 16–17)", question: "What's the company's principal line of business?", placeholder: "e.g. Software development" },
    { name: "previousEin", label: "Previous EIN, if this entity ever received one before (Line 18)", question: "Has this entity ever received an EIN before? If so, what was it?", placeholder: "Leave blank if none", optional: true },
  ],
}

const EIGHTY_THREE_B: ComplianceItem = {
  id: "83b",
  title: "83(b) Elections",
  short: "83(b) Elections",
  description: "File 83(b) elections for founders holding stock subject to vesting, within 30 days of grant.",
  explainer:
    "IRS Form 15620, Section 83(b) Election. Filing this within 30 days of a founder's stock grant locks in today's value — typically at or near $0 — as the taxable event, instead of the higher value the shares will be worth as they vest later. Because a founder's purchase price is normally equal to the stock's fair market value at grant, this election usually results in $0 of taxable income. The 30-day deadline cannot be extended for any reason, so the signed form must be mailed to the IRS promptly, with a copy kept for the founder's and company's records.",
  deadline: "Within 30 days of stock purchase",
  fields: [
    { name: "companyName", label: "Legal company name", question: "What's the company's legal name?", prefillKey: "companyName", placeholder: "e.g. Acme Technologies, Inc." },
    { name: "taxpayer", label: "Taxpayer's full legal name (Box 1)", question: "Whose stock grant is this election for — what's their full legal name?", prefillKey: "incorporatorName" },
    { name: "taxpayerTin", label: "Taxpayer's SSN or ITIN (Box 1)", question: "What's the taxpayer's Social Security Number or ITIN?", placeholder: "XXX-XX-XXXX" },
    { name: "taxpayerAddress", label: "Taxpayer's address (Box 1)", question: "What's the taxpayer's mailing address?", type: "address", prefillKey: "incorporatorAddress", placeholder: "Street, City, State, ZIP" },
    { name: "grantDate", label: "Date property was transferred (Box 3)", question: "What date was the stock granted or purchased?", type: "date", prefillKey: "vestingStartDate", hint: "The election must be filed within 30 days of this date." },
    { name: "shares", label: "Number of shares purchased (Boxes 2, 6b, 7b)", question: "How many shares were purchased?", prefillKey: "founderShares", placeholder: "e.g. 4,000,000" },
    { name: "pricePerShare", label: "Price paid per share, in USD (Boxes 6a, 7a)", question: "What price per share was paid? This is normally also the shares' fair market value at grant.", placeholder: "e.g. 0.0001" },
    { name: "vestingSchedule", label: "Restrictions on the property (Box 5)", question: "What vesting schedule or restrictions apply to these shares?", type: "textarea", placeholder: "e.g. 4-year vesting, 1-year cliff" },
    { name: "companyAddress", label: "Company's address, for Box 9 (optional)", question: "What's the company's principal address? This is optional — Box 9 isn't required to make a valid election.", type: "address", prefillKey: "corpAddress", optional: true },
    { name: "companyEin", label: "Company's EIN, if issued yet, for Box 9 (optional)", question: "Has the company's EIN been issued yet? If so, what is it?", optional: true },
  ],
}

const DE_REGISTERED_AGENT: ComplianceItem = {
  id: "de-registered-agent",
  title: "DE Registered Agent Appointment",
  short: "DE Registered Agent",
  description: "Appoint a registered agent authorized to accept service of process in Delaware.",
  deadline: "At incorporation",
  fields: [
    { name: "companyName", label: "Legal company name", question: "What's the company's legal name?", prefillKey: "companyName", placeholder: "e.g. Acme Technologies, Inc." },
    { name: "deFileNumber", label: "Delaware file number", question: "Do you have a Delaware file number yet?", placeholder: "e.g. 1234567", optional: true },
    { name: "agentName", label: "Registered agent name", question: "Who's serving as the registered agent?", placeholder: "e.g. Corporation Service Company" },
    { name: "agentAddress", label: "Registered agent Delaware address", question: "What's the registered agent's Delaware address?", type: "address" },
  ],
}

const CA_QUALIFICATION: ComplianceItem = {
  id: "ca-qualification",
  title: "CA Qualification",
  short: "CA Qualification",
  description: "Qualify your out-of-state corporation to transact business in California (Form S&DC-S/N).",
  deadline: "Before transacting business in CA",
  fields: [
    { name: "companyName", label: "Legal company name", question: "What's the company's legal name?", prefillKey: "companyName", placeholder: "e.g. Acme Technologies, Inc." },
    { name: "stateOfIncorp", label: "State of incorporation", question: "Which state is the company incorporated in?", placeholder: "e.g. Delaware" },
    { name: "principalAddress", label: "Principal business address", question: "What's the company's principal business address?", type: "address", prefillKey: "corpAddress", placeholder: "Street, City, State, ZIP" },
    { name: "caAddress", label: "California office address (if any)", question: "Does the company have a California office address? If so, what is it?", type: "address", optional: true },
    { name: "ceoName", label: "Chief executive officer name", question: "Who's the CEO?", prefillKey: "incorporatorName" },
  ],
}

const CA_REGISTERED_AGENT: ComplianceItem = {
  id: "ca-registered-agent",
  title: "CA Registered Agent Appointment",
  short: "CA Registered Agent",
  description: "Designate VISPO.AI Inc. as the agent for service of process in California.",
  deadline: "Concurrent with CA qualification",
  fields: [
    { name: "companyName", label: "Legal company name", question: "What's the company's legal name?", prefillKey: "companyName", placeholder: "e.g. Acme Technologies, Inc." },
  ],
}

const NOTICE_25102F: ComplianceItem = {
  id: "25102f",
  title: "25102(f)",
  short: "25102(f)",
  description: "Limited offering exemption notice for securities sold in California (Section 25102(f)).",
  deadline: "Within 15 days of first sale",
  fields: [
    { name: "companyName", label: "Legal company name", question: "What's the company's legal name?", prefillKey: "companyName", placeholder: "e.g. Acme Technologies, Inc." },
    { name: "firstSaleDate", label: "Date of first sale of securities", question: "What date was the first sale of securities?", type: "date" },
    { name: "amount", label: "Aggregate amount raised in California (USD)", question: "What's the aggregate amount raised from California purchasers?" },
    { name: "purchasers", label: "Number of California purchasers", question: "How many California purchasers were there?" },
  ],
}

const NOTICE_25102O: ComplianceItem = {
  id: "25102o",
  title: "25102(o)",
  short: "25102(o)",
  description: "Notice of exemption for securities issued under a compensatory benefit plan (Section 25102(o)).",
  deadline: "Within 30 days of plan adoption",
  fields: [
    { name: "companyName", label: "Legal company name", question: "What's the company's legal name?", prefillKey: "companyName", placeholder: "e.g. Acme Technologies, Inc." },
    { name: "planName", label: "Equity incentive plan name", question: "What's the equity incentive plan called?", placeholder: "e.g. 2025 Equity Incentive Plan" },
    { name: "adoptionDate", label: "Plan adoption date", question: "When was the plan adopted?", type: "date" },
    { name: "poolShares", label: "Shares reserved under the plan", question: "How many shares are reserved under the plan?", prefillKey: "poolShares" },
  ],
}

const DE_ANNUAL_REPORT: ComplianceItem = {
  id: "de-annual-report",
  title: "Annual Report",
  short: "DE Annual Report",
  description: "File the Delaware annual report and pay the annual franchise tax.",
  deadline: "March 1 each year",
  fields: [
    { name: "companyName", label: "Legal company name", question: "What's the company's legal name?", prefillKey: "companyName", placeholder: "e.g. Acme Technologies, Inc." },
    { name: "reportYear", label: "Report year", question: "Which year is this report for?", placeholder: "e.g. 2025" },
    { name: "authorizedShares", label: "Total authorized shares", question: "How many total authorized shares does the company have?" },
    { name: "grossAssets", label: "Total gross assets (USD)", question: "What are the company's total gross assets?", hint: "Used to calculate franchise tax under the assumed par value method." },
    { name: "directors", label: "Names and addresses of all directors", question: "Who are the company's directors, and what are their addresses?", type: "textarea" },
  ],
}

const DE_AGENT_RENEWAL: ComplianceItem = {
  id: "de-agent-renewal",
  title: "DE Registered Agent Renewal",
  short: "DE Agent Renewal",
  description: "Renew your Delaware registered agent for the coming year.",
  deadline: "Annually",
  fields: [
    { name: "companyName", label: "Legal company name", question: "What's the company's legal name?", prefillKey: "companyName", placeholder: "e.g. Acme Technologies, Inc." },
    { name: "agentName", label: "Registered agent name", question: "Who's the registered agent being renewed?" },
    { name: "renewalPeriod", label: "Renewal period", question: "Which year is this renewal for?", type: "select", options: ["2025", "2026", "2027", "2028", "2029", "2030"] },
  ],
}

const CA_SOI: ComplianceItem = {
  id: "ca-soi",
  title: "CA Statement of Information",
  short: "CA Statement of Info",
  description: "File the California Statement of Information (Form SI-550).",
  deadline: "Within 90 days of CA qualification, then biennially",
  fields: [
    { name: "companyName", label: "Legal company name", question: "What's the company's legal name?", prefillKey: "companyName", placeholder: "e.g. Acme Technologies, Inc." },
    { name: "caEntityNumber", label: "California Secretary of State entity number", question: "What's the company's California entity number, if you have it?", placeholder: "e.g. C1234567", optional: true },
    { name: "principalAddress", label: "Street address of principal executive office", question: "What's the company's principal executive office address?", type: "address", prefillKey: "corpAddress", placeholder: "Street, City, State, ZIP" },
    { name: "mailingAddress", label: "Mailing address, if different from the principal executive office", question: "Is there a mailing address different from the principal executive office? If so, what is it?", type: "address", optional: true },
    { name: "caAddress", label: "Street address of principal office in California (if any)", question: "Does the company have a street address for a principal office in California? If so, what is it?", type: "address", optional: true },
    { name: "ceoName", label: "Chief executive officer name", question: "Who's the CEO?", prefillKey: "incorporatorName" },
    { name: "secretaryName", label: "Secretary name", question: "Who's the secretary?" },
    { name: "cfoName", label: "Chief financial officer name", question: "Who's the CFO?" },
    { name: "businessDescription", label: "Type of business or services", question: "How would you describe the company's type of business or services?", type: "textarea", placeholder: "e.g. Software development" },
    { name: "laborJudgment", label: "Outstanding final labor judgment", question: "Does any officer or director have an outstanding final judgment issued by the Labor Commissioner or a court of law?", type: "select", options: ["No", "Yes"] },
    { name: "notificationEmail", label: "Email address for entity notifications (optional)", question: "Want to opt in an email address for Secretary of State entity notifications?", optional: true },
  ],
}

const CA_AGENT_RENEWAL: ComplianceItem = {
  id: "ca-agent-renewal",
  title: "CA Registered Agent Renewal",
  short: "CA Agent Renewal",
  description: "Renew VISPO.AI Inc. as the California agent for service of process.",
  deadline: "Annually",
  fields: [
    { name: "companyName", label: "Legal company name", question: "What's the company's legal name?", prefillKey: "companyName", placeholder: "e.g. Acme Technologies, Inc." },
    { name: "renewalPeriod", label: "Renewal period", question: "Which year is this renewal for?", type: "select", options: ["2025", "2026", "2027", "2028", "2029", "2030"] },
  ],
}

const ANNUAL_STOCKHOLDERS_CONSENT: ComplianceItem = {
  id: "annual-stockholders-consent",
  title: "Annual Stockholders Consent",
  short: "Annual Stockholders Consent",
  description: "Annual written consent of stockholders in lieu of a meeting.",
  deadline: "Annually",
  fields: [
    { name: "companyName", label: "Legal company name", question: "What's the company's legal name?", prefillKey: "companyName", placeholder: "e.g. Acme Technologies, Inc." },
    { name: "effectiveDate", label: "Effective date of consent", question: "What's the effective date of this consent?", type: "date" },
    { name: "directors", label: "Directors elected for the coming year", question: "Which directors are being elected for the coming year?", type: "textarea" },
    { name: "otherMatters", label: "Other matters approved", question: "Anything else being approved alongside this?", type: "textarea", placeholder: "e.g. ratification of prior board actions", optional: true },
  ],
}

const ANNUAL_BOARD_CONSENT: ComplianceItem = {
  id: "annual-board-consent",
  title: "Annual Board Consent",
  short: "Annual Board Consent",
  description: "Annual written consent of the board of directors in lieu of a meeting.",
  deadline: "Annually",
  fields: [
    { name: "companyName", label: "Legal company name", question: "What's the company's legal name?", prefillKey: "companyName", placeholder: "e.g. Acme Technologies, Inc." },
    { name: "effectiveDate", label: "Effective date of consent", question: "What's the effective date of this consent?", type: "date" },
    { name: "officers", label: "Officers appointed", question: "Which officers are being appointed?", type: "textarea" },
    { name: "otherMatters", label: "Other matters approved", question: "Anything else being approved alongside this?", type: "textarea", optional: true },
  ],
}

const SPECIAL_STOCKHOLDERS_CONSENT: ComplianceItem = {
  id: "special-stockholders-consent",
  title: "Special Stockholders Consent",
  short: "Special Stockholders Consent",
  description: "Special written consent of stockholders for a specific matter.",
  deadline: "As needed",
  fields: [
    { name: "companyName", label: "Legal company name", question: "What's the company's legal name?", prefillKey: "companyName", placeholder: "e.g. Acme Technologies, Inc." },
    { name: "effectiveDate", label: "Effective date of consent", question: "What's the effective date of this consent?", type: "date" },
    { name: "matter", label: "Matter being approved", question: "What matter is being approved?", type: "textarea", placeholder: "e.g. approval of a financing round" },
    { name: "sharesVoting", label: "Shares voting in favor", question: "How many shares are voting in favor?" },
  ],
}

const SPECIAL_BOARD_CONSENT: ComplianceItem = {
  id: "special-board-consent",
  title: "Special Board Consent",
  short: "Special Board Consent",
  description: "Special written consent of the board for a specific matter.",
  deadline: "As needed",
  fields: [
    { name: "companyName", label: "Legal company name", question: "What's the company's legal name?", prefillKey: "companyName", placeholder: "e.g. Acme Technologies, Inc." },
    { name: "effectiveDate", label: "Effective date of consent", question: "What's the effective date of this consent?", type: "date" },
    { name: "matter", label: "Matter being approved", question: "What matter is being approved?", type: "textarea", placeholder: "e.g. approval of stock option grants" },
    { name: "directors", label: "Directors approving", question: "Which directors are approving this?", type: "textarea" },
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
  type?: "text" | "date" | "textarea" | "select" | "address"
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
