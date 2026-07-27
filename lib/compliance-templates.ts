function today(): string {
  return new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}

function prettyDate(iso: string): string {
  if (!iso) return ""
  const d = new Date(`${iso}T00:00:00`)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}

function num(v: string): number {
  const n = parseFloat((v || "").replace(/[^0-9.-]/g, ""))
  return Number.isFinite(n) ? n : 0
}

function money(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Per-share prices are routinely fractions of a cent (e.g. $0.0001 par value) — rounding
// to 2 decimals like a dollar total would silently display them as $0.00.
function perShare(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })
}

function ein(v: Record<string, string>): string {
  return `FORM SS-4 APPLICATION & DELEGATED THIRD PARTY DECLARATION

Prepared for: ${v.companyName}
Date prepared: ${today()}

APPLICATION FOR EMPLOYER IDENTIFICATION NUMBER (IRS FORM SS-4)

Line 1 — Legal name of entity: ${v.companyName}
Line 2 — Trade name of business, if different: ${v.tradeName || "N/A"}
Lines 4a-4b — Mailing address: ${v.mailingAddress}
Line 6 — County and state where principal business is located: ${v.county}
Line 7a — Name of responsible party: ${v.responsible}
Line 7b — Responsible party SSN or ITIN: ${v.ssn}
Line 8a — Is this application for a limited liability company (LLC)? No
Line 9a — Type of entity: Corporation
Line 9b — State of incorporation: Delaware
Line 10 — Reason for applying: ${v.reason}
Line 11 — Date business started or acquired: ${v.incorporationDate}
Line 12 — Closing month of accounting year: ${v.closingMonth}
Line 13 — Highest number of employees expected in next 12 months: ${v.employeesExpected}
Lines 16-17 — Principal line of business: ${v.principalActivity}
Line 18 — Has the applicant entity ever applied for and received an EIN before? ${
    v.previousEin ? `Yes — Previous EIN: ${v.previousEin}` : "No"
  }

Under penalties of perjury, I declare that I have examined this application, and to the best of my knowledge and belief, it is true, correct, and complete.

DELEGATED THIRD PARTY DECLARATION

I the undersigned, ${v.responsible}, understand that I am authorizing the third party, Nicola Serragiotto, to apply for and receive the EIN on behalf of ${v.companyName}, and to answer questions about the completion of this Form SS-4 on my behalf.

By signing below, I certify under penalties of perjury that the information provided above is true, correct, and complete to the best of my knowledge, and I authorize the above delegation.


_________________________
${v.responsible}
Date: ${today()}`
}

function eightyThreeB(v: Record<string, string>): string {
  const shares = num(v.shares)
  const pricePerShare = num(v.pricePerShare)
  // A founder's purchase price is normally also the shares' fair market value at grant,
  // so Box 6 (FMV) and Box 7 (amount paid) use the same per-share price, and Box 8 is $0.
  const fmvTotal = shares * pricePerShare
  const paidTotal = shares * pricePerShare
  const grossIncome = fmvTotal - paidTotal

  return `FORM 15620 — SECTION 83(b) ELECTION

Prepared for: ${v.taxpayer}
Date prepared: ${today()}

The undersigned taxpayer hereby elects, pursuant to § 83(b) of the Internal Revenue Code of 1986, as amended, to include in gross income as compensation for services the excess (if any) of the fair market value of the property described below over the amount paid for the property.

1. Taxpayer's name, TIN, and address
Name: ${v.taxpayer}
TIN: ${v.taxpayerTin}
Address: ${v.taxpayerAddress}

2. The property subject to this election is
${shares.toLocaleString()} shares of common stock of ${v.companyName}

3. The date the property is transferred
${prettyDate(v.grantDate)}

4. Taxable year for which the election is being made
Calendar year ${v.grantDate ? new Date(`${v.grantDate}T00:00:00`).getFullYear() : ""}

5. The property is subject to the following restrictions
${v.vestingSchedule}

6. The total fair market value of the property at the time of transfer is
   a. Value per share: $${perShare(pricePerShare)}
   b. Quantity: ${shares.toLocaleString()}
   c. Total fair market value: $${money(fmvTotal)}

7. The total amount paid for the property is
   a. Price paid per share: $${perShare(pricePerShare)}
   b. Quantity: ${shares.toLocaleString()}
   c. Total price paid: $${money(paidTotal)}

8. The total amount to include in gross income for the taxable year is (Box 6c minus Box 7c)
$${money(grossIncome)}

9. Name, TIN, and address of the person for whom the taxpayer is providing services (optional)
Name: ${v.companyName}
TIN: ${v.companyEin || "N/A"}
Address: ${v.companyAddress || "N/A"}

The undersigned taxpayer is the person performing the services in connection with which the property is transferred. The undersigned taxpayer agrees to provide a copy of the election to (i) the person for whom the services are performed and (ii) the transferee of the property, if the taxpayer and the transferee of the property are not the same person.

Under penalties of perjury, the undersigned taxpayer declares that, to the best of the undersigned taxpayer's knowledge and belief, the information entered on this Form 15620 is true, correct, and complete.


_________________________
${v.taxpayer}
Date signed: ${today()}

This election must be mailed to the IRS office where the taxpayer files their federal income tax return, no later than 30 days after the date in Box 3, with a copy provided to ${v.companyName || "the company"}.`
}

function caQualification(v: Record<string, string>): string {
  return `CALIFORNIA SECRETARY OF STATE — FORM S&DC-S/N
STATEMENT AND DESIGNATION BY FOREIGN CORPORATION

Prepared for: ${v.companyName}
Date prepared: ${today()}

Must be submitted together with a current Certificate of Good Standing issued by the government agency where the corporation was formed.

1. Corporate name
${v.companyName}

2. Jurisdiction (state, foreign country, or place where this corporation is formed — must match the Certificate of Good Standing provided)
${v.stateOfIncorp}

3. Business addresses
   a. Principal executive office (do not enter a P.O. box)
      ${v.principalAddress}
   b. Street address of principal office in California, if any (do not enter a P.O. box)
      ${v.caAddress || "N/A — no California office"}

5. Read and sign
I am a corporate officer and am authorized to sign on behalf of the foreign corporation.


_________________________
${v.ceoName}
Chief Executive Officer
Date: ${today()}`
}

function caRegisteredAgent(v: Record<string, string>): string {
  return `CALIFORNIA SECRETARY OF STATE — FORM S&DC-S/N
DESIGNATION OF AGENT FOR SERVICE OF PROCESS (ITEM 4)

Prepared for: ${v.companyName}
Date prepared: ${today()}

This designation is filed as part of the Statement and Designation by Foreign Corporation (Form S&DC-S/N) submitted to the California Secretary of State, and appoints the agent named below to accept service of process on behalf of ${v.companyName} in California.

4. California agent for service of process
Name: ${v.agentName}
California street address: ${v.agentAddress}

Note: if the designated agent is itself a corporation authorized to act as agent for service of process in California, only its name is required on the form (Item 4c) and no street address is listed (Items 4a/4b are left blank in that case). If the agent is a natural person, both name and street address are required (Items 4a and 4b).


_________________________
${v.companyName}, by its authorized officer
Date: ${today()}`
}

const RENDERERS: Partial<Record<string, (v: Record<string, string>) => string>> = {
  ein,
  "83b": eightyThreeB,
  "ca-qualification": caQualification,
  "ca-registered-agent": caRegisteredAgent,
}

/** Renders the filled document for a completed compliance filing, from its submitted field
 *  values. Returns null for items that don't have a document template yet (not all compliance
 *  filings produce a Vispo-generated document — some are pure external checklist items). */
export function renderComplianceDocument(itemId: string, values: Record<string, string>): string | null {
  return RENDERERS[itemId]?.(values) ?? null
}
