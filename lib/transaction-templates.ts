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

By:_________________________
(Signature)

Name:_________________________
Title:_________________________


LENDER:

_________________________
(Signature)

${v.founderName}`
}

function parseAmount(s: string): number {
  const n = parseFloat((s ?? "").replace(/[^0-9.]/g, ""))
  return isNaN(n) ? 0 : n
}

function formatAmount(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 })
}

function formatPerShareValue(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })
}

function servicesAgreement(v: Record<string, string>): string {
  return `SERVICE PROVIDER AGREEMENT

This Service Provider Agreement (this "Agreement") is entered into as of the date first written below, by and between ${v.companyName}, a Delaware corporation (the "Company"), and ${v.serviceProviderName} ("Service Provider").

The parties agree as follows, effective as to the date when this Agreement is first executed:

1. Start Date. Service Provider agrees to start providing the Services (as defined below) on ${formatDate(v.startDate)}.

2. Services. Service Provider agrees to act as a service provider to the Company and to provide software development services and assistance to achieve the Company goals, as set forth in Exhibit A, and as determined by Service Provider and reasonably acceptable to the Company (collectively, the "Services").

3. Compensation. Service Provider shall be paid compensation as set forth in Exhibit A.

4. Expenses. The Company shall reimburse the Service Provider for reasonable expenses incurred in the course of performing services hereunder, provided, however, that all expenses shall be approved in advance by the Company. As a condition to receipt of reimbursement, Service Provider shall be required to submit to the Company reasonable evidence that the amount involved was both reasonable and necessary to the Services provided under this Agreement.

5. Term and Termination. The term of this Agreement shall be on a month to month basis. Sections 7 through 11, and 13 of this Agreement shall survive termination or expiration of this Agreement in accordance with their terms.

6. Independent Contractor. Service Provider's relationship with the Company will be that of an independent contractor and not that of an employee. Service Provider will not be eligible for any employee benefits, nor will the Company make deductions from payments made to Service Provider for employment or income taxes, all of which will be Service Provider's responsibility. Service Provider will be responsible for the payment of all taxes and for work eligibility, and agrees to indemnify and hold the Company harmless from any liability for, or assessment of, any such taxes, fines, penalties, costs and other liabilities imposed on the Company by relevant taxing and governmental authorities. Service Provider will have no authority to enter into contracts that bind the Company or create obligations on the part of the Company without the prior written authorization of the Company.

7. Nondisclosure of Confidential Information.

(a) Agreement Not to Disclose. Service Provider agrees not to use any Confidential Information (as defined below) disclosed to Service Provider by the Company for Service Provider's own use or for any purpose other than to carry out discussions concerning, and the undertaking of, the Services. Service Provider shall not disclose or permit disclosure of any Confidential Information of the Company to third parties. Service Provider agrees to take all reasonable measures to protect the secrecy of and avoid disclosure or use of Confidential Information of the Company in order to prevent it from falling into the public domain or the possession of persons other than those persons authorized under this Agreement to have any such information. Service Provider further agrees to notify the Company in writing of any actual or suspected misuse, misappropriation or unauthorized disclosure of the Company's Confidential Information which may come to Service Provider's attention.

(b) Definition of Confidential Information. "Confidential Information" means any information, technical data or know-how (whether disclosed before or after the date of this Agreement), including, but not limited to, information relating to business and product or service plans, financial projections, customer lists, business forecasts, sales and merchandising, human resources, patents, patent applications, computer object or source code, research, inventions, processes, designs, drawings, engineering, marketing or finance that is marked or designated in writing as confidential or proprietary, or if given orally, is confirmed in writing as having been disclosed as confidential or proprietary within a reasonable time (not to exceed thirty (30) days) after the oral disclosure, or which information would (even if not marked, designated, or confirmed in writing), under the circumstances, appear to a reasonable person to be confidential or proprietary. Confidential Information does not include information, technical data or know-how which: (i) is in the possession of Service Provider at the time of disclosure, as shown by Service Provider's files and records immediately prior to the time of disclosure; or (ii) becomes part of the public knowledge or literature, not as a direct or indirect result of any improper inaction or action of Service Provider.

(c) Exceptions. Notwithstanding the above, Service Provider shall not have liability to the Company or any of its subsidiaries with regard to any Confidential Information of the Company which Service Provider can prove:

(i) is disclosed with the prior written approval of the Company; or

(ii) is disclosed pursuant to the order or requirement of a court, administrative agency, or other governmental body; provided, however, that Service Provider shall provide prompt notice of such court order or requirement to the Company to enable the Company or its appropriate subsidiary to seek a protective order or otherwise prevent or restrict such disclosure.

(d) U.S. Defend Trade Secrets Act. Notwithstanding the foregoing, the U.S. Defend Trade Secrets Act of 2016 ("DTSA") provides that an individual shall not be held criminally or civilly liable under any federal or state trade secret law for the disclosure of a trade secret that is made (i) in confidence to a federal, state, or local government official, either directly or indirectly, or to an attorney; and (ii) solely for the purpose of reporting or investigating a suspected violation of law; or (iii) in a complaint or other document filed in a lawsuit or other proceeding, if such filing is made under seal. In addition, DTSA provides that an individual who files a lawsuit for retaliation by an employer for reporting a suspected violation of law may disclose the trade secret to the attorney of the individual and use the trade secret information in the court proceeding, if the individual (A) files any document containing the trade secret under seal; and (B) does not disclose the trade secret, except pursuant to court order.

8. No Duplication; Return of Materials. Service Provider agrees, except as otherwise expressly authorized by the Company, not to make any copies or duplicates of any of the Company's Confidential Information. Any materials or documents that have been furnished by the Company to Service Provider in connection with the Services shall be promptly returned by Service Provider to the Company, accompanied by all copies of such documentation, within ten days after the earlier of (a) the date on which the Services have been concluded or (b) the date of written request of the Company.

9. No Rights Granted. Nothing in this Agreement shall be construed as granting any rights under any patent, copyright or other intellectual property right of the Company, nor shall this Agreement grant Service Provider any rights in or to the Company's Confidential Information, except the limited right to use the Confidential Information in connection with the Services.

10. Assignment of Inventions. To the extent that, in connection with performing the Services, Service Provider jointly or solely conceives, develops, or reduces to practice any inventions, original works of authorship, developments, concepts, know-how, improvements or trade secrets, whether or not patentable or registrable under copyright or similar laws, Service Provider hereby assigns all rights, titles and interest to such inventions to the Company.

11. Duty to Assist. As requested by the Company, Service Provider shall take all steps reasonably necessary to assist the Company in obtaining and enforcing in its own name any patent, copyright or other protection which the Company elects to obtain or enforce for its inventions, original works of authorship, developments, concepts, know-how, improvements and trade secrets. Service Provider's obligation to assist the Company in obtaining and enforcing patents, copyrights and other protections shall continue beyond the termination of Service Provider's relationship with the Company, but the Company shall compensate Service Provider at a reasonable rate after the termination of such relationship for time actually spent at the Company's request providing such assistance.

12. No Conflicts. Service Provider represents that Service Provider's compliance with the terms of this Agreement and provision of Services hereunder will not violate any duty which Service Provider may have to any other person or entity (such as a present or former employer), including obligations concerning providing services to others, confidentiality of proprietary information and assignment of inventions, ideas, patents or copyrights, and Service Provider agrees that Service Provider will not do anything in the performance of Services hereunder that would violate any such duty. In addition, Service Provider agrees that, during the term of this Agreement, prior to performing any services for or otherwise participating in a company developing or commercializing new software, services, methods, devices, or other technology that may be competitive with the Company, Service Provider shall first notify the Company in writing. It is understood that in such event, the Company will review whether Service Provider's activities are consistent with Service Provider continuing to provide Services to the Company.

13. Miscellaneous. Any term of this Agreement may be amended or waived only with the written consent of the parties. This Agreement, including any exhibits hereto, constitutes the sole agreement of the parties and supersedes all oral negotiations and prior writings with respect to the subject matter hereof. Any notice required or permitted by this Agreement shall be in writing and shall be deemed sufficient when delivered personally or by overnight courier or sent by e-mail, or 48 hours after being deposited in the U.S. mail as certified or registered mail with postage prepaid, addressed to the party to be notified at such party's address as set forth on the signature page herein, or as subsequently modified by written notice. The validity, interpretation, construction and performance of this Agreement shall be governed by the laws of the state of ${v.choiceOfLawState}, without giving effect to the principles of conflict of laws. The venue for any disputes shall be ${v.choiceOfLawState}. This Agreement may be executed in counterparts, each of which shall be deemed an original, but all of which together will constitute one and the same instrument.

[Signature Page Follows]

The parties have executed this Agreement as of the date first written below.

THE COMPANY:

${v.companyName}

By:_________________________
(Signature)

Name:_________________________
Title:_________________________

Date: ${formatDate(v.date)}


SERVICE PROVIDER:

_________________________
(Signature)

${v.serviceProviderName}

Address:_________________________

Email:_________________________

Date: ${formatDate(v.date)}


Exhibit A

Services

${v.servicesDescription}

Compensation

${v.compensationDescription}

Availability: ${v.availability}, with flexible work schedule.`
}

function promisedOptionsLetter(v: Record<string, string>): string {
  const valuation = parseAmount(v.companyProFormaValuation)
  const perShareValue = valuation / 10000000
  const vestingPerWeek = parseAmount(v.optionsVestingPerWeek)
  const termWeeks = parseAmount(v.termWeeks)
  const totalOptions = vestingPerWeek * termWeeks

  return `${formatDate(v.date)}

${v.recipientName}

VIA EMAIL

Re: Promised Stock Options

Dear ${v.recipientName}:

This letter is to memorialize that ${v.companyName} (the "Company") shall grant to you ("Recipient" or "you") a stock option grant to purchase shares of the Company's Common Stock (the "Option") on the following terms and conditions, and subject to the Company's Board approval and its incentive equity plan:

Hours Per Week: ${v.hoursPerWeek}
Company ProForma Valuation: $${formatAmount(valuation)}
Per Share ProForma Value: $${formatPerShareValue(perShareValue)}
Options Vesting Per Week: ${formatAmount(vestingPerWeek)}
Term: ${formatAmount(termWeeks)} weeks
Total Options: ${formatAmount(totalOptions)}

Subject to the above, as soon as the Company is set up on Carta, you will receive a formal notice of the Option grant. The exercise price of the shares subject to each Option grant shall be equal to the price determined by the Board in reliance upon a 409A valuation then in effect.

To the extent that you render services to the Company, all work product generated as part of such services exclusively belongs to the Company without residual rights to you. Each of you and the Company represents and warrants that no third party authorizations, permits, licenses or consents are required to perform their respective obligations under this agreement.

This letter is intended to confirm, in writing, our agreement and is a valid and binding agreement between the parties as of the date first written above.

Thanks again you for your support.

Sincerely,

THE COMPANY:

${v.companyName}

By:_________________________
(Signature)

Name:_________________________
Title:_________________________


ACCEPTED AND AGREED:

RECIPIENT:

_________________________
(Signature)

${v.recipientName}

Date:_________________________`
}

const RENDERERS: Partial<Record<string, (v: Record<string, string>) => string>> = {
  "founder-loan": founderLoan,
  "services-agreement": servicesAgreement,
  "promised-options-letter": promisedOptionsLetter,
}

export function renderTransactionDocument(docId: string, values: Record<string, string>): string | null {
  return RENDERERS[docId]?.(values) ?? null
}
