function today(): string {
  return new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
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

const RENDERERS: Partial<Record<string, (v: Record<string, string>) => string>> = {
  ein,
}

/** Renders the filled document for a completed compliance filing, from its submitted field
 *  values. Returns null for items that don't have a document template yet (not all compliance
 *  filings produce a Vispo-generated document — some are pure external checklist items). */
export function renderComplianceDocument(itemId: string, values: Record<string, string>): string | null {
  return RENDERERS[itemId]?.(values) ?? null
}
