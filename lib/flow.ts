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

export type DocStatus = "pending" | "drafting" | "complete" | "filing" | "filed"

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
  /** Opts this field into the Compliance Center's cross-filing prefill fallback (see
   *  components/compliance-view.tsx's `prefillValue`) — filled in from another completed, not-
   *  deleted filing's same-named field. Deliberately opt-in rather than automatic: many fields
   *  across filings coincidentally share a `name` (e.g. "agentName" on the DE agent appointment
   *  vs. a future CA one, "otherMatters" on unrelated board consents) without meaning the same
   *  real-world value, so only set this where that filing's counterpart is confirmed to represent
   *  the literal same fact (e.g. the same Delaware registered agent being renewed). */
  shared?: boolean
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
    { name: "agentName", label: "Registered agent name", question: "Who's serving as the registered agent?", placeholder: "e.g. Corporation Service Company", shared: true },
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
    { name: "agentName", label: "Registered agent name", question: "Who's the registered agent being renewed?", shared: true },
    { name: "renewalPeriod", label: "Renewal period", question: "Which year is this renewal for?", type: "select", options: ["2025", "2026", "2027", "2028", "2029", "2030"], shared: true },
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
    { name: "renewalPeriod", label: "Renewal period", question: "Which year is this renewal for?", type: "select", options: ["2025", "2026", "2027", "2028", "2029", "2030"], shared: true },
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
    { name: "stockholders", label: "Stockholders signing this consent", question: "Which stockholders are signing this consent?", type: "textarea" },
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
    { name: "directors", label: "Directors signing this consent", question: "Which directors are signing this consent?", type: "textarea" },
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
  /** Conversational phrasing used when asking for this field one at a time in Chat mode.
   *  Falls back to `label` if omitted. */
  question?: string
  /** Opts this field into the Transaction Center's cross-document prefill fallback (see
   *  components/transactions-onboarding.tsx's `prefill`) — filled in from another completed, not-
   *  deleted document's same-named field. Deliberately opt-in rather than automatic: many fields
   *  across documents coincidentally share a `name` (e.g. "date" appears on nearly every
   *  document, meaning a different real-world date each time) without meaning the same real-world
   *  value, so only set this where that document's counterpart is confirmed to represent the
   *  literal same fact (e.g. the same Investor across a SAFE and its Pro Rata Side Letter). */
  shared?: boolean
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
    | "dissolution"
  label: string
  chatResponse: string
  groups: TransactionGroup[]
}

const companyNameField: TransactionField = {
  name: "companyName",
  label: "Legal company name",
  question: "What's the legal name of the company?",
  prefillKey: "companyName",
  placeholder: "e.g. Acme Technologies, Inc.",
}

// No profile field holds this (the saved profile only tracks company/personal addresses and the
// signer's own identity), so it isn't prefillable from FlowAnswers — instead it opts into the
// cross-document prefill fallback (`shared: true`) so it only has to be typed once per session,
// same as investorName across the SAFE family. Safe to share: it's the same real-world fact (the
// company's own contact email) on every Early Customers document, unlike a field such as "date".
const companyEmailField: TransactionField = {
  name: "companyEmail",
  label: "Company contact email",
  question: "What's the best contact email for the company?",
  placeholder: "e.g. hello@acme.com",
  shared: true,
}

/* ---- Financing ---- */

const SAFE_CAP: TransactionItem = {
  id: "safe-cap",
  title: "YC SAFE - Cap Only",
  short: "YC SAFE - Cap Only",
  description: "Y Combinator SAFE with a post-money valuation cap — convertible investment instrument for early-stage financing.",
  fields: [
    { name: "date", label: "Date of SAFE", type: "date", question: "What's the date of this SAFE?" },
    companyNameField,
    { name: "stateOfIncorporation", label: "State of incorporation", question: "What state is the company incorporated in?", placeholder: "e.g. Delaware", shared: true },
    { name: "investorName", label: "Investor name", question: "Who's the Investor purchasing this SAFE?", placeholder: "e.g. Jane Ventures", shared: true },
    { name: "purchaseAmount", label: "Purchase amount", question: "How much is the Investor paying for this SAFE?", placeholder: "e.g. 100,000" },
    { name: "valuationCap", label: "Post-money valuation cap", question: "What's the post-money valuation cap?", placeholder: "e.g. 8,000,000" },
    { name: "governingLaw", label: "Governing law jurisdiction", question: "Which state's law should govern this agreement?", placeholder: "e.g. Delaware", shared: true },
  ],
}

const SAFE_MFN: TransactionItem = {
  id: "safe-mfn",
  title: "YC SAFE - MFN Only",
  short: "YC SAFE - MFN Only",
  description: "Y Combinator SAFE with a most-favored-nation provision — convertible investment instrument for early-stage financing.",
  fields: [
    { name: "date", label: "Date of SAFE", type: "date", question: "What's the date of this SAFE?" },
    companyNameField,
    { name: "stateOfIncorporation", label: "State of incorporation", question: "What state is the company incorporated in?", placeholder: "e.g. Delaware", shared: true },
    { name: "investorName", label: "Investor name", question: "Who's the Investor purchasing this SAFE?", placeholder: "e.g. Jane Ventures", shared: true },
    { name: "purchaseAmount", label: "Purchase amount", question: "How much is the Investor paying for this SAFE?", placeholder: "e.g. 100,000" },
    { name: "governingLaw", label: "Governing law jurisdiction", question: "Which state's law should govern this agreement?", placeholder: "e.g. Delaware", shared: true },
  ],
}

const SAFE_DISCOUNT: TransactionItem = {
  id: "safe-discount",
  title: "YC SAFE - Discount Only",
  short: "YC SAFE - Discount Only",
  description: "Y Combinator SAFE with a discount rate — convertible investment instrument for early-stage financing.",
  fields: [
    { name: "date", label: "Date of SAFE", type: "date", question: "What's the date of this SAFE?" },
    companyNameField,
    { name: "stateOfIncorporation", label: "State of incorporation", question: "What state is the company incorporated in?", placeholder: "e.g. Delaware", shared: true },
    { name: "investorName", label: "Investor name", question: "Who's the Investor purchasing this SAFE?", placeholder: "e.g. Jane Ventures", shared: true },
    { name: "purchaseAmount", label: "Purchase amount", question: "How much is the Investor paying for this SAFE?", placeholder: "e.g. 100,000" },
    {
      name: "discountPercent",
      label: "Discount",
      question: "What discount will the Investor get on the price per share, as a percentage?",
      placeholder: "e.g. 20",
      hint: "The document's Discount Rate is shown as 100 minus this number (a 20% discount becomes an 80% Discount Rate).",
    },
    { name: "governingLaw", label: "Governing law jurisdiction", question: "Which state's law should govern this agreement?", placeholder: "e.g. Delaware", shared: true },
  ],
}

const PRO_RATA_SIDE_LETTER: TransactionItem = {
  id: "pro-rata-side-letter",
  title: "YC Pro Rata Side Letter",
  short: "YC Pro Rata Side Letter",
  description: "Grants a SAFE investor the right to purchase their pro rata share of Preferred Stock in the company's next priced equity round.",
  fields: [
    { name: "date", label: "Date", type: "date", question: "What's the date of this agreement?" },
    companyNameField,
    { name: "investorName", label: "Investor name", question: "Who's the Investor this side letter is with?", placeholder: "e.g. Jane Ventures", shared: true },
  ],
}

const FOUNDER_LOAN: TransactionItem = {
  id: "founder-loan",
  title: "Founder Loan",
  short: "Founder Loan",
  description: "Loan agreement between a founder and the company.",
  fields: [
    { name: "date", label: "Date", type: "date", question: "What's the date of this loan agreement?" },
    companyNameField,
    {
      name: "founderName",
      label: "Name of founder (the Lender)",
      question: "Who's the founder lending the money — that's the Lender on this agreement?",
      placeholder: "e.g. Jane Founder",
    },
    { name: "loanAmount", label: "Loan amount", question: "How much is the loan for?", placeholder: "e.g. 25,000" },
    { name: "interestRate", label: "Interest rate", question: "What interest rate will apply to the loan?", placeholder: "e.g. 5" },
    {
      name: "interestRateNumber",
      label: "Interest rate, as a decimal",
      question: "And what's that rate as a decimal?",
      placeholder: "e.g. 0.05",
      hint: "5% would be 0.05.",
    },
    { name: "choiceOfLaw", label: "Choice of law", question: "Which state's law should govern this agreement?", placeholder: "e.g. Delaware" },
    { name: "venue", label: "Venue", question: "And which state should be the venue for resolving any disputes?", placeholder: "e.g. Delaware" },
  ],
}

/* ---- Developers and Early Contributors ---- */

const SERVICES_AGREEMENT: TransactionItem = {
  id: "services-agreement",
  title: "Service Provider Agreement",
  short: "Service Provider Agreement",
  description: "Agreement covering development or other services performed for the company.",
  fields: [
    { name: "date", label: "Date", question: "What's the date of this agreement?", type: "date" },
    companyNameField,
    {
      name: "serviceProviderName",
      label: "Name of Service Provider",
      question: "Who's the service provider on this agreement?",
      placeholder: "e.g. Jane Developer",
    },
    { name: "startDate", label: "Start date", question: "When does the Service Provider start providing services?", type: "date" },
    {
      name: "servicesDescription",
      label: "Description of services",
      question: "How would you describe the services being provided?",
      type: "textarea",
      placeholder: "e.g. Software development services and assistance to achieve the Company's goals.",
    },
    {
      name: "compensationDescription",
      label: "Description of compensation",
      question: "How is the Service Provider being compensated?",
      type: "textarea",
      placeholder: "e.g. $5,000 per month in gross cash and 500 options per month",
    },
    {
      name: "choiceOfLawState",
      label: "Choice of law and venue state",
      question: "Which state should govern this agreement, and be the venue for any disputes?",
      placeholder: "e.g. Delaware",
    },
    {
      name: "availability",
      label: "Availability (days/hours)",
      question: "What's the Service Provider's availability?",
      placeholder: "e.g. 3 days per week, 6 hours per day",
    },
  ],
}

const PROMISED_OPTIONS_LETTER: TransactionItem = {
  id: "promised-options-letter",
  title: "Promised Options Letter",
  short: "Promised Options Letter",
  description: "Letter confirming an intended future stock option grant.",
  fields: [
    { name: "date", label: "Date", question: "What's the date of this letter?", type: "date" },
    companyNameField,
    {
      name: "recipientName",
      label: "Name of Recipient",
      question: "Who's this letter addressed to — the recipient of the promised options?",
      placeholder: "e.g. Jane Developer",
    },
    { name: "hoursPerWeek", label: "Hours per week", question: "How many hours per week will they work?", placeholder: "e.g. 10" },
    {
      name: "companyProFormaValuation",
      label: "Company pro forma valuation",
      question: "What's the company's pro forma valuation?",
      placeholder: "e.g. 10,000,000",
      hint: "Used to calculate the per-share value automatically.",
    },
    {
      name: "optionsVestingPerWeek",
      label: "Options vesting per week",
      question: "How many options vest per week?",
      placeholder: "e.g. 500",
    },
    {
      name: "termWeeks",
      label: "Term (weeks)",
      question: "What's the term, in weeks?",
      placeholder: "e.g. 104",
      hint: "Total options are calculated automatically as vesting-per-week times this term.",
    },
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
    { name: "letterDate", label: "Letter date", question: "What's the date of this letter?", type: "date" },
    { name: "employeeName", label: "Employee name", question: "Who's this offer letter for?", placeholder: "e.g. Jane Employee" },
    { name: "employeePosition", label: "Employee position", question: "What position are they being offered?", placeholder: "e.g. Head of Engineering" },
    { name: "startDate", label: "Start date", question: "What's their start date?", type: "date" },
    { name: "annualSalary", label: "Annual salary", question: "What's the annual salary?", placeholder: "e.g. $150,000" },
    {
      name: "salaryIncreaseClause",
      label: "Include a salary increase clause tied to the next financing?",
      question: "Should this offer include a clause increasing salary upon the company's next financing round?",
      type: "select",
      options: ["No", "Yes"],
    },
    {
      name: "nextFinancingAmount",
      label: "Minimum next financing amount that triggers the increase",
      question: "What's the minimum size of the next financing round that triggers the increase?",
      placeholder: "e.g. $2,000,000",
      optional: true,
      hint: "Only needed if you're including the salary increase clause.",
    },
    {
      name: "updatedAnnualSalary",
      label: "Updated annual salary",
      question: "What will the salary increase to?",
      placeholder: "e.g. $170,000",
      optional: true,
      hint: "Only needed if you're including the salary increase clause.",
    },
    { name: "numberOfOptions", label: "Number of stock options", question: "How many stock options will they be granted?", placeholder: "e.g. 40,000" },
    { name: "signatureDate", label: "Signature date", question: "What's the signature date?", type: "date" },
  ],
}

const CONSULTING_AGREEMENT: TransactionItem = {
  id: "consulting-agreement",
  title: "Consulting Agreement",
  short: "Consulting Agreement",
  description: "Agreement engaging an independent consultant.",
  fields: [
    { name: "date", label: "Effective date", question: "What's the effective date of this agreement?", type: "date" },
    companyNameField,
    { name: "consultantName", label: "Name of Consultant", question: "Who's the consultant on this agreement?", placeholder: "e.g. Jane Consultant" },
    {
      name: "servicesDescription",
      label: "Description of services (Exhibit A)",
      question: "How would you describe the services the consultant will provide?",
      type: "textarea",
    },
    {
      name: "deliverablesDescription",
      label: "Description of deliverables (Exhibit A)",
      question: "What deliverables will the consultant produce?",
      type: "textarea",
    },
    { name: "deliverablesDueDate", label: "Deliverables due date (Exhibit A)", question: "When are those deliverables due?", type: "date" },
    {
      name: "cashCompensation",
      label: "Cash compensation (Exhibit B)",
      question: "What cash compensation, if any, will the consultant receive?",
      placeholder: "e.g. $5,000/month",
      optional: true,
      hint: "Leave blank if none.",
    },
    {
      name: "numberOfOptions",
      label: "Number of stock options (Exhibit B)",
      question: "How many stock options, if any, will the consultant receive?",
      placeholder: "e.g. 10,000",
      optional: true,
      hint: "Leave blank if none.",
    },
    {
      name: "otherCompensation",
      label: "Other compensation (Exhibit B)",
      question: "Any other compensation to note?",
      optional: true,
      hint: "Leave blank if none.",
    },
    { name: "signatureDate", label: "Signature date", question: "What's the signature date?", type: "date" },
    {
      name: "letterDate",
      label: "Letter date",
      question: "What's the letter date?",
      type: "date",
      optional: true,
      hint: "Listed on the source questionnaire but not otherwise referenced in the agreement body.",
    },
  ],
}

const ADVISOR_AGREEMENT: TransactionItem = {
  id: "advisor-agreement",
  title: "Advisor Agreement",
  short: "Advisor Agreement",
  description: "Agreement engaging an advisor, typically compensated in equity.",
  fields: [
    { name: "date", label: "Effective date", question: "What's the effective date of this agreement?", type: "date" },
    companyNameField,
    { name: "advisorName", label: "Name of Advisor", question: "Who's the advisor on this agreement?", placeholder: "e.g. Jane Advisor" },
    { name: "advisorEmail", label: "Advisor email", question: "What's the advisor's email address?", placeholder: "e.g. jane@example.com" },
    {
      name: "servicesDescription",
      label: "Description of services (Exhibit A)",
      question: "How would you describe the services the advisor will provide?",
      type: "textarea",
      placeholder: "e.g. Go-to-market strategy and introductions to potential customers.",
    },
    { name: "numberOfOptions", label: "Number of stock options (Exhibit B)", question: "How many stock options will the advisor be granted?", placeholder: "e.g. 10,000" },
    { name: "signatureDate", label: "Signature date", question: "What's the signature date?", type: "date" },
  ],
}

/* ---- Early Customers ---- */

const PILOT_AGREEMENT: TransactionItem = {
  id: "pilot-agreement",
  title: "Pilot Program Agreement",
  short: "Pilot Program Agreement",
  description: "Governs a limited pilot deployment of the company's beta service with a customer — scope, duties, confidentiality, and fees.",
  fields: [
    { name: "date", label: "Effective date", type: "date", question: "What's the effective date of this pilot agreement?" },
    companyNameField,
    companyEmailField,
    { name: "customerName", label: "Customer legal name", question: "What's the customer's legal name?", placeholder: "e.g. Acme Corp" },
    {
      name: "pilotBackground",
      label: "Pilot background",
      type: "textarea",
      question: "Give a bit of background — why is this pilot happening?",
      placeholder: "e.g. Customer wants to evaluate the Service with its sales team before committing to a paid subscription.",
    },
    {
      name: "serviceDescription",
      label: "Service being piloted",
      type: "textarea",
      question: "What Service is being piloted? Describe it briefly.",
      placeholder: "e.g. Company's AI-powered document review platform.",
    },
    {
      name: "pilotParameters",
      label: "Pilot parameters",
      type: "textarea",
      question: "What are the scope limits of the pilot — users, volume, environment, etc.?",
      placeholder: "e.g. Up to 10 named users, sandbox environment only, max 1,000 documents per month.",
    },
    {
      name: "pilotDuties",
      label: "Duties of each party",
      type: "textarea",
      question: "What are each party's duties or responsibilities during the pilot?",
      placeholder: "e.g. Company will provide onboarding support; Customer will designate a point of contact and provide weekly feedback.",
    },
    { name: "pilotTerm", label: "Pilot term", question: "How long does the pilot run — a fixed length, or until some event?", placeholder: "e.g. 60 days from the Effective Date" },
    { name: "pilotFee", label: "Pilot program fees", question: "Is there a fee for the pilot? Enter $0 if it's free.", placeholder: "e.g. $0 (no cost), or $2,500 flat fee for the pilot period" },
    { name: "customerSignerName", label: "Customer signer name", question: "Who's signing on behalf of the Customer?", placeholder: "e.g. Jane Smith" },
    { name: "customerSignerTitle", label: "Customer signer title", question: "What's their title?", placeholder: "e.g. VP of Operations" },
    { name: "customerEmail", label: "Customer signer email", question: "What's their email address?", placeholder: "e.g. jane@acmecorp.com" },
  ],
}

const USER_AGREEMENT: TransactionItem = {
  id: "user-agreement",
  title: "User Agreement",
  short: "User Agreement",
  description: "General user agreement governing use of the company's website, applications, and services, including an AI/LLM disclosure.",
  fields: [
    companyNameField,
    companyEmailField,
    {
      name: "isPaidService",
      label: "Free or paid service?",
      type: "select",
      options: ["Free", "Paid subscription"],
      question: "Is the Service free to use, or a paid subscription? The template has language for both, so I'll keep the license and payment terms consistent with whichever applies.",
    },
    {
      name: "usesAI",
      label: "Uses AI/LLM features?",
      type: "select",
      options: ["Yes", "No"],
      question: "Does the product actually use LLMs or other AI features (e.g. a Document Check, Co-Pilot, or Automated Transactions tool)? If not, I'll leave out the AI disclosure sections.",
    },
  ],
}

/* ---- IP, Licensing and NDAs ---- */

const NDA: TransactionItem = {
  id: "nda",
  title: "NDA",
  short: "NDA",
  description: "Mutual non-disclosure agreement protecting confidential information shared with a counterparty.",
  fields: [
    { name: "date", label: "Date", question: "What's the date of this agreement?", type: "date" },
    companyNameField,
    { name: "counterpartyName", label: "Name of Counterparty", question: "Who's the counterparty on this NDA?", placeholder: "e.g. Acme Corp" },
    {
      name: "includeNonSolicitation",
      label: "Include an employee non-solicitation clause?",
      question: "Would you like to include an employee non-solicitation clause?",
      type: "select",
      options: ["No", "Yes"],
    },
    {
      name: "includeResiduals",
      label: "Include a residuals clause?",
      question: "Would you like to include a residuals clause?",
      type: "select",
      options: ["No", "Yes"],
    },
    {
      name: "choiceOfLawState",
      label: "Choice of law and venue state",
      question: "Which state should govern this agreement, and be the venue for any disputes?",
      placeholder: "e.g. Delaware",
    },
  ],
}

const PRIVACY_POLICY: TransactionItem = {
  id: "privacy-policy",
  title: "Privacy Policy",
  short: "Privacy Policy",
  description: "Consumer-facing privacy notice covering personal data collection, use, and disclosure, plus California (CCPA) and EEA (GDPR) region-specific disclosures and a cookie notice.",
  fields: [
    companyNameField,
    { name: "companyWebsite", label: "Company website domain", question: "What's the company's primary website domain?", placeholder: "e.g. acme.com" },
    companyEmailField,
    {
      name: "companyPhone",
      label: "Toll-free support phone number",
      question: "What's the toll-free U.S. phone number for privacy-related requests (California rights requests and opt-outs)?",
      placeholder: "e.g. (800) 555-0100",
    },
  ],
}

const IP_LICENSE: TransactionItem = {
  id: "ip-license",
  title: "IP License",
  short: "IP License",
  description: "Agreement licensing the company's intellectual property to a third-party Licensee, including trademarks and license scope.",
  fields: [
    { name: "date", label: "Effective date", question: "What's the effective date of this agreement?", type: "date" },
    companyNameField,
    { name: "licenseeName", label: "Licensee's full legal name", question: "Who's the Licensee — the party receiving the license?", placeholder: "e.g. Acme Corp" },
    {
      name: "licensedProductsDescription",
      label: "Description of Licensed Products (Schedule 1)",
      question: "Describe the intellectual property / Licensed Products being licensed.",
      type: "textarea",
      placeholder: "e.g. The Company's proprietary document-review software, including all associated source code and documentation.",
    },
    {
      name: "marksDescription",
      label: "Trademarks / service marks being licensed (Schedule 2)",
      question: "List any trademarks or service marks included in the license — leave blank if none.",
      type: "textarea",
      optional: true,
      hint: "Leave blank if no trademarks or service marks are included in the license.",
    },
    { name: "licenseTerm", label: "License term (Schedule 3)", question: "What's the term of the license?", placeholder: "e.g. 3 years from the Effective Date" },
    { name: "licensingFee", label: "Licensing fee (Schedule 3)", question: "What's the licensing fee?", placeholder: "e.g. $10,000 upfront, plus 5% royalty on net revenue" },
    { name: "geography", label: "Geographic scope (Schedule 3)", question: "What's the geographic scope of the license?", placeholder: "e.g. Worldwide" },
    { name: "exclusivity", label: "Exclusive or non-exclusive? (Schedule 3)", question: "Is this an exclusive or non-exclusive license?", type: "select", options: ["Exclusive", "Non-exclusive"] },
  ],
}

/* ---- Commercial Agreements ---- */

const AGENT_MARKETING_AGREEMENT: TransactionItem = {
  id: "agent-marketing-agreement",
  title: "Agent Marketing Agreement",
  short: "Agent Marketing Agreement",
  description: "Agreement engaging an agent to run a marketing campaign promoting the company's business or service.",
  fields: [
    companyNameField,
    { name: "date", label: "Effective date", type: "date", question: "What's the effective date of this agreement?" },
    { name: "agentName", label: "Agent's full legal name", placeholder: "e.g. Jane Agent" },
    { name: "companyServiceDescription", label: "Description of the Company's service", type: "textarea", placeholder: "e.g. a mobile app for tracking fitness goals" },
    { name: "servicesDescription", label: "Services / deliverables the Agent will provide (Exhibit A)", type: "textarea", placeholder: "e.g. 4 sponsored Instagram posts per month promoting the Company Service" },
    { name: "compensationTerms", label: "Compensation terms (Exhibit B)", type: "textarea", placeholder: "e.g. $2,000 per month, paid net 30 following invoice" },
  ],
}

const SAAS_RESELLER_AGREEMENT: TransactionItem = {
  id: "saas-reseller-agreement",
  title: "Saas Reseller Agreement",
  short: "Saas Reseller Agreement",
  description: "Agreement appointing a reseller to license the company's SaaS product to customers within a territory.",
  fields: [
    companyNameField,
    { name: "effectiveDate", label: "Effective date", type: "date", question: "What's the effective date of this agreement?" },
    { name: "companyStateOfIncorporation", label: "Company's state of incorporation", placeholder: "e.g. Delaware" },
    { name: "companyAddress", label: "Company's principal place of business", type: "address", prefillKey: "corpAddress", placeholder: "Street, City, State, ZIP" },
    { name: "resellerName", label: "Reseller's full legal name", placeholder: "e.g. Acme Reseller, Inc." },
    { name: "resellerStateOfIncorporation", label: "Reseller's state of incorporation", placeholder: "e.g. California" },
    { name: "resellerAddress", label: "Reseller's principal place of business", type: "address", placeholder: "Street, City, State, ZIP" },
    { name: "productsAndPricing", label: "Products and pricing (Exhibit A — Statement of Work)", type: "textarea", placeholder: "e.g. Pro plan at $50/seat/month, billed annually" },
    { name: "territory", label: "Territory", placeholder: "e.g. North America" },
    { name: "commissionRate", label: "Commission rate on identified direct sales", placeholder: "e.g. 20%" },
    { name: "reportCardDeadline", label: "Report-card / customer-identification deadline", placeholder: "e.g. 15 days" },
  ],
}

const DISTRIBUTION_AGREEMENT: TransactionItem = {
  id: "distribution-agreement",
  title: "Distribution Agreement",
  short: "Distribution Agreement",
  description: "Agreement appointing a non-exclusive distributor to purchase and resell the company's products.",
  fields: [
    companyNameField,
    { name: "date", label: "Effective date", type: "date", question: "What's the effective date of this agreement?" },
    { name: "distributorName", label: "Distributor's full legal name", placeholder: "e.g. Acme Distribution, Inc." },
    { name: "territory", label: "Territory", type: "textarea", placeholder: "e.g. North America" },
    { name: "fieldDefinition", label: "Field (permitted product / use scope)", type: "textarea", placeholder: "e.g. use in consumer electronics" },
    { name: "terminationDate", label: "Initial term end date", type: "date", question: "What date does the initial term end, before auto-renewal kicks in?" },
  ],
}

/* ---- Founder Separation ---- */

const FOUNDER_SEPARATION_AGREEMENT: TransactionItem = {
  id: "founder-separation-agreement",
  title: "Founder Separation Agreement",
  short: "Founder Separation Agreement",
  description: "Agreement documenting the terms of a departing founder's separation from the company, including share cancellation/repurchase and mutual releases.",
  fields: [
    companyNameField,
    { name: "departingFounder", label: "Departing founder", question: "Who's the departing founder?", placeholder: "e.g. Jane Founder" },
    { name: "date", label: "Effective date", type: "date", question: "What's the effective date of this agreement?" },
    { name: "separationDate", label: "Separation date", type: "date", question: "What date is the Founder leaving the Company and ceasing to be a service provider?" },
    { name: "sharesHeld", label: "Shares currently held by Founder", question: "How many shares of common stock does the Founder currently hold?", placeholder: "e.g. 1,000,000" },
    { name: "vestedSharesCancelled", label: "Vested shares being cancelled", question: "How many vested shares of common stock will be cancelled?", placeholder: "e.g. 600,000" },
    { name: "unvestedSharesRepurchased", label: "Unvested shares being repurchased", question: "How many unvested shares of common stock will the Company repurchase?", placeholder: "e.g. 400,000" },
    { name: "repurchaseAmount", label: "Aggregate repurchase payment", question: "What's the aggregate dollar amount the Company will pay for the repurchase?", placeholder: "e.g. 1,000" },
  ],
}

const FOUNDERS_REORGANIZATION_AGREEMENT: TransactionItem = {
  id: "founders-reorganization-agreement",
  title: "Founders Reorganization Agreement",
  short: "Founders Reorganization Agreement",
  description: "Agreement among the founders reallocating equity via a share transfer between them.",
  fields: [
    companyNameField,
    { name: "date", label: "Effective date", type: "date", question: "What's the effective date of this agreement?" },
    { name: "founder1Name", label: "Founder 1 (transferring shares)", question: "Who's Founder 1 — the founder transferring shares?", placeholder: "e.g. Jane Founder" },
    { name: "founder2Name", label: "Founder 2 (receiving shares)", question: "Who's Founder 2 — the founder receiving shares?", placeholder: "e.g. Alex Founder" },
    { name: "founder1SharesBefore", label: "Founder 1's shares before the transfer", question: "How many shares of common stock does Founder 1 hold before the transfer?", placeholder: "e.g. 2,000,000" },
    { name: "founder2SharesBefore", label: "Founder 2's shares before the transfer", question: "How many shares of common stock does Founder 2 hold before the transfer?", placeholder: "e.g. 1,000,000" },
    { name: "founder1SharesAfter", label: "Founder 1's shares after the transfer", question: "How many shares will Founder 1 hold after the transfer?", placeholder: "e.g. 1,000,000" },
    { name: "founder2SharesAfter", label: "Founder 2's shares after the transfer", question: "How many shares will Founder 2 hold after the transfer?", placeholder: "e.g. 2,000,000" },
    { name: "paymentAmount", label: "Payment from Founder 2 to Founder 1", question: "How much will Founder 2 pay Founder 1 for the transferred shares?", placeholder: "e.g. 10,000" },
  ],
}

/* ---- Dissolution ---- */

const PLAN_OF_DISSOLUTION: TransactionItem = {
  id: "plan-of-dissolution",
  title: "Plan of Dissolution",
  short: "Plan of Dissolution",
  description: "Plan setting out how the company will wind down its affairs, settle liabilities, and distribute remaining assets, pursuant to the board's and stockholders' approval to dissolve.",
  fields: [
    companyNameField,
    { name: "boardConsentDate", label: "Board consent date", type: "date", question: "What date did the Board adopt its written consent approving the dissolution?", shared: true },
    { name: "stockholderConsentDate", label: "Stockholder consent date", type: "date", question: "What date did the stockholders adopt their written consent approving the dissolution?", shared: true },
    { name: "dissolutionDeadlineYear", label: "Certificate of Dissolution filing deadline year", question: "By what year must the Certificate of Dissolution be filed with Delaware (e.g. the current year)?", placeholder: "e.g. 2026", shared: true },
    { name: "date", label: "Date on signature page", type: "date", question: "What's the date on the Plan of Dissolution's signature page?" },
  ],
}

const CERTIFICATE_OF_DISSOLUTION: TransactionItem = {
  id: "certificate-of-dissolution",
  title: "Certificate of Dissolution",
  short: "Certificate of Dissolution",
  description: "Certificate filed with the Delaware Secretary of State to formally dissolve the corporation under DGCL Section 275.",
  fields: [
    companyNameField,
    { name: "incorporationDate", label: "Original incorporation date", type: "date", question: "What date was the Certificate of Incorporation originally filed with Delaware?" },
    { name: "boardConsentDate", label: "Board consent date", type: "date", question: "What date did the Board adopt its written consent approving the dissolution?", shared: true },
    { name: "stockholderConsentDate", label: "Stockholder consent date", type: "date", question: "What's the date of the stockholders' written consent approving the dissolution?", shared: true },
    {
      name: "directorsListText",
      label: "Directors — name and address",
      question: "List each director's name and address, one per line.",
      type: "textarea",
      placeholder: "Jane Founder | 123 Main St, Wilmington, DE 19801",
      hint: 'One per line, formatted as "Name | Address".',
    },
    {
      name: "officersListText",
      label: "Officers — name, title, and address",
      question: "List each officer's name, title, and address, one per line.",
      type: "textarea",
      placeholder: "Jane Founder | Chief Executive Officer, Treasurer, Secretary | 123 Main St, Wilmington, DE 19801",
      hint: 'One per line, formatted as "Name | Title | Address".',
    },
    { name: "executionDate", label: "Certificate execution date", type: "date", question: "What date is this certificate being executed?" },
  ],
}

const BOARD_CONSENT_DISSOLUTION: TransactionItem = {
  id: "board-consent-dissolution",
  title: "Board Consent re Dissolution",
  short: "Board Consent re Dissolution",
  description: "Board consent approving the dissolution of the company and the Plan of Dissolution, attached as Exhibit A. Every director on file signs their own line.",
  fields: [
    companyNameField,
    { name: "boardConsentDate", label: "Board consent date", type: "date", question: "What's the date of this Board consent?", shared: true },
    { name: "stockholderConsentDate", label: "Stockholder consent date", type: "date", question: "What date did (or will) the stockholders adopt their written consent approving the dissolution? Leave blank if not yet known.", shared: true, optional: true },
    { name: "dissolutionDeadlineYear", label: "Certificate of Dissolution filing deadline year", question: "By what year must the Certificate of Dissolution be filed with Delaware (e.g. the current year)?", placeholder: "e.g. 2026", shared: true },
  ],
}

const MAJORITY_STOCKHOLDERS_CONSENT_DISSOLUTION: TransactionItem = {
  id: "majority-stockholders-consent-dissolution",
  title: "Majority Stockholders Consent re Dissolution",
  short: "Majority Stockholders Consent re Dissolution",
  description: "Majority stockholder consent approving the dissolution of the company and the Plan of Dissolution, attached as Exhibit A.",
  fields: [
    companyNameField,
    { name: "boardConsentDate", label: "Board consent date", type: "date", question: "What date did the Board adopt its written consent approving the dissolution?", shared: true },
    { name: "stockholderConsentDate", label: "Stockholder consent date", type: "date", question: "What's the date of this stockholders' consent?", shared: true },
    { name: "dissolutionDeadlineYear", label: "Certificate of Dissolution filing deadline year", question: "By what year must the Certificate of Dissolution be filed with Delaware (e.g. the current year)?", placeholder: "e.g. 2026", shared: true },
    { name: "stockholder1Name", label: "Majority stockholder 1", question: "Who's the first majority stockholder signing this consent?", placeholder: "e.g. Jane Founder" },
    { name: "stockholder1Class", label: "Stockholder 1's stock class", question: "What class of stock does this stockholder hold?", placeholder: "e.g. Common" },
    { name: "stockholder1Shares", label: "Stockholder 1's number of shares held", placeholder: "e.g. 4,000,000" },
    { name: "stockholder1Percentage", label: "Stockholder 1's percentage of that class", placeholder: "e.g. 60" },
    { name: "stockholder2Name", label: "Majority stockholder 2", question: "Is there a second majority stockholder signing? If so, who? (leave blank if not)", placeholder: "e.g. Alex Founder", optional: true },
    { name: "stockholder2Class", label: "Stockholder 2's stock class", placeholder: "e.g. Series Seed Preferred", optional: true },
    { name: "stockholder2Shares", label: "Stockholder 2's number of shares held", placeholder: "e.g. 1,000,000", optional: true },
    { name: "stockholder2Percentage", label: "Stockholder 2's percentage of that class", placeholder: "e.g. 100", optional: true },
  ],
}

/* ---- categories ---- */

export const TRANSACTION_CATEGORIES: TransactionCategory[] = [
  {
    id: "financing",
    label: "Financing",
    chatResponse: "Here are the financing documents available — SAFEs, term sheets, and founder loans. Select which one you'd like to prepare by clicking it on the right — I'll walk you through it.",
    groups: [{ id: "financing-docs", title: "Financing", items: [SAFE_CAP, SAFE_MFN, SAFE_DISCOUNT, PRO_RATA_SIDE_LETTER, FOUNDER_LOAN] }],
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
    groups: [{ id: "customers-docs", title: "Early Customers", items: [PILOT_AGREEMENT, USER_AGREEMENT] }],
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
    groups: [{ id: "commercial-docs", title: "Commercial Agreements", items: [AGENT_MARKETING_AGREEMENT, SAAS_RESELLER_AGREEMENT, DISTRIBUTION_AGREEMENT] }],
  },
  {
    id: "separation",
    label: "Founder Matters",
    chatResponse: "Here are the founder matters documents. Select which one you'd like to prepare by clicking it on the right — I'll walk you through it.",
    groups: [{ id: "separation-docs", title: "Founder Matters", items: [FOUNDER_SEPARATION_AGREEMENT, FOUNDERS_REORGANIZATION_AGREEMENT] }],
  },
  {
    id: "dissolution",
    label: "Dissolution",
    chatResponse: "Here are the dissolution documents. Select which one you'd like to prepare by clicking it on the right — I'll walk you through it.",
    groups: [{ id: "dissolution-docs", title: "Dissolution", items: [PLAN_OF_DISSOLUTION, CERTIFICATE_OF_DISSOLUTION, BOARD_CONSENT_DISSOLUTION, MAJORITY_STOCKHOLDERS_CONSENT_DISSOLUTION] }],
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
  registeredAgentName: "A Registered Agent, Inc.",
  registeredAgentAddress: "8 The Green Suite A, Dover, DE 19901",
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
