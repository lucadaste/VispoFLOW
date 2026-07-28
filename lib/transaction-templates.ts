/** Document templates for the Transaction Center flows (see lib/flow.ts's TRANSACTION_CATEGORIES).
 *  Each renderer fills the blanks of a real legal template supplied by the user with that
 *  transaction's collected field values — see lib/document-templates.ts for the equivalent
 *  formation-flow renderers and the same fill-don't-rewrite rule. */

function formatDate(iso: string): string {
  if (!iso) return ""
  const d = new Date(`${iso}T00:00:00`)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}

function founderLoan(v: Record<string, string>): string {
  return `FOUNDER LOAN AGREEMENT

In consideration of any financial accommodation given, or to be given or continued pursuant to this Founder Loan Agreement ("Loan Agreement") by ${v.founderName} ("Lender") to ${v.companyName}, a Delaware Corporation ("Borrower"), Borrower hereby represents, warrants, and agrees as follows, unless Lender waives compliance in writing:

1. Effective Date. The effective date of this Loan Agreement shall be ${formatDate(v.date)} ("Effective Date").

2. Loan Amount. Lender shall loan or make available for Borrower to draw the principal sum of up to $${v.loanAmount} ("Loan"). Borrower confirms that any and all amounts borrowed by Borrower on the Loan ("Advances") received on or after the Effective Date of this Agreement under the Loan are subject to the terms of this Loan Agreement. Any request for an Advance may be made from time to time and in such amounts as Borrower may choose; provided, however, any requested Advance will not, when added to the outstanding principal balance of all previous advances, exceed the amount of the Loan.

3. Interest Rate. Any Advances shall be subject to a fixed rate of interest equal to ${v.interestRate} percent (${v.interestRateNumber}), subject to adjustment as required under U.S. law to be no less than the minimum rate of interest as published from time to time by the Internal Revenue Service. Interest shall accrue in United States Dollars.

4. Repayment of Loan Advances. Borrower shall repay Lender all outstanding Advances (and all accrued interest on such Advances) under this Loan on demand.

5. Prepayment. There shall be no prepayment penalty should Borrower repay the Loan and all accrued interest in advance of the term deadline.

6. Assignment. Lender shall be entitled to assign this Loan Agreement without the consent of Borrower. Borrower shall not be entitled to assign this Loan Agreement or be permitted to allow another lender to assume this Loan Agreement without the written consent of Lender which consent can be withheld by Lender at its sole discretion.

7. Nature of Business. Borrower is a Delaware corporation and the business operated by Borrower is technology services (the "Business").

8. Purpose of Loan. Borrower shall utilize the Loan only for the following purposes of the Business: (a) financing the Business; (b) funding of daily operating expenses; and (c) such other matters that in the opinion of management are necessary to carry out the purposes of the Borrower.

9. Event of Default and Acceleration. On the occurrence of any of the following events or circumstances, Lender at its election may terminate any or all commitments, and other obligations of Lender to Borrower and declare all amounts outstanding in respect of the Loan to be immediately due after ten (10) days written notice ("Notice Period") of default to Borrower and Borrower fails to cure such default within the Notice Period:

(a) Any failure on the part of Borrower to pay any amounts owing in respect of the Loan when due, or any breach or default by Borrower of or under any term, condition, provision, warranty; or representation made herein; or

(b) If Borrower becomes insolvent, is generally not paying its debts as such debts become due, suffers a material adverse change of financial condition, or defaults with respect to any order, judgment, injunction, decree, writ or demand of any court or other public authority.

All amounts outstanding in respect of the Loan shall be in default, and immediately due and payable in full, and all commitments and other obligations of Lender to Borrower shall be terminated, without declaration, demand or notice to Borrower if Borrower:

(a) Makes an assignment for the benefit of creditors; or

(b) Is the subject of any voluntary or involuntary case commenced under the federal bankruptcy laws, as now constituted or hereafter amended, or any other proceeding under other applicable laws regarding bankruptcy, insolvency, reorganization, adjustment of debts or other forms of relief for debtors in any jurisdiction; or

(c) Consents to the appointment of a receiver, trustee, custodian or similar official for substantially all of its property or permits a decree order such appointment to remain in effect and unstayed for 60 days; or

(d) Is the subject of any dissolution or liquidation proceeding; or

(e) Has issued against it or its property any writ of attachment, execution, or other legal process involving an amount or risk deemed material by Lender; or

(f) Has filed or recorded against it or its property any notice of levy, notice to withhold, or other claim for taxes other than real property taxes not yet delinquent involving an amount deemed material by Lender.

The events described in this Paragraph 9 shall be events of default if such events of default are not cured within the Notice Period.

10. Due on Sale. If Borrower should merge with any entity, sell or transfer all or substantially all of its shares of capital stock to another entity, change ownership, or in Lender's discretion dispose of all or substantially all of its assets, such an event shall, at the election of Lender, result in the entire Loan, plus accrued interest, becoming due and payable.

11. Miscellaneous. On transfer of all or any part of the Loan or a participation interest therein, Lender may transfer all or any part of its interests herein. The Loan Agreement benefits Lender's successors and assigns and binds Borrower's heirs, legatees, personal representatives, successors, and assigns. Borrower may not delegate or assign any of its obligations hereunder and may not assert against any assignee of Lender any claim or defense it may have against Lender. This Loan Agreement shall be governed by the laws of the State of ${v.choiceOfLaw}. The venue for any disputes shall be ${v.venue}. Titles preceding any paragraph of this Loan Agreement are for convenience only and are not a part of this Loan Agreement. This Loan Agreement shall continue as long as any amounts owing in respect of the Loan remain unpaid. Unless otherwise provided in this Loan Agreement, all accounting terms shall be construed in accordance with generally accepted accounting principles consistently applied.

In WITNESS WHEREOF, the parties have executed this Loan Agreement as of the Effective Date.


BORROWER:

${v.companyName}

_________________________

By: ${v.companySignerName}
Title: ${v.companySignerTitle}


LENDER:

${v.founderName}

_________________________`
}

const RENDERERS: Partial<Record<string, (v: Record<string, string>) => string>> = {
  "founder-loan": founderLoan,
}

export function renderTransactionDocument(docId: string, values: Record<string, string>): string | null {
  return RENDERERS[docId]?.(values) ?? null
}
