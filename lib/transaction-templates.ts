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

/** Shared by all three YC SAFE variants: the standard signature page shape from the source
 *  templates — no printed name before the Investor's By: line (unlike the "THE COMPANY:" block,
 *  which prints the company name), so the Investor slot is routed as an "officer"-kind block
 *  keyed off its own header, same idea as the NDA's COUNTERPARTY block. */
function safeSignatureBlock(v: Record<string, string>): string {
  return `THE COMPANY:

${v.companyName}

By:_________________________
(Signature)

Name:_________________________
Title:_________________________

Address:_________________________

_________________________

Email:_________________________


INVESTOR:

By:_________________________
(Signature)

Name:_________________________
Title:_________________________

Address:_________________________

_________________________

Email:_________________________`
}

function safeCap(v: Record<string, string>): string {
  return `THIS INSTRUMENT AND ANY SECURITIES ISSUABLE PURSUANT HERETO HAVE NOT BEEN REGISTERED UNDER THE SECURITIES ACT OF 1933, AS AMENDED (THE "SECURITIES ACT"), OR UNDER THE SECURITIES LAWS OF CERTAIN STATES. THESE SECURITIES MAY NOT BE OFFERED, SOLD OR OTHERWISE TRANSFERRED, PLEDGED OR HYPOTHECATED EXCEPT AS PERMITTED IN THIS SAFE AND UNDER THE ACT AND APPLICABLE STATE SECURITIES LAWS PURSUANT TO AN EFFECTIVE REGISTRATION STATEMENT OR AN EXEMPTION THEREFROM.

${v.companyName}

SAFE
(Simple Agreement for Future Equity)

THIS CERTIFIES THAT in exchange for the payment by ${v.investorName} (the "Investor") of $${v.purchaseAmount} (the "Purchase Amount") on or about ${formatDate(v.date)}, ${v.companyName}, a ${v.stateOfIncorporation} corporation (the "Company"), issues to the Investor the right to certain shares of the Company's Capital Stock, subject to the terms described below.

This Safe is one of the forms available at http://ycombinator.com/documents and the Company and the Investor agree that neither one has modified the form, except to fill in blanks and bracketed terms.

The "Post-Money Valuation Cap" is $${v.valuationCap}. See Section 2 for certain additional defined terms.

1. Events

(a) Equity Financing. If there is an Equity Financing before the termination of this Safe, on the initial closing of such Equity Financing, this Safe will automatically convert into the greater of: (1) the number of shares of Standard Preferred Stock equal to the Purchase Amount divided by the lowest price per share of the Standard Preferred Stock; or (2) the number of shares of Safe Preferred Stock equal to the Purchase Amount divided by the Safe Price.

In connection with the automatic conversion of this Safe into shares of Standard Preferred Stock or Safe Preferred Stock, the Investor will execute and deliver to the Company all of the transaction documents related to the Equity Financing; provided, that such documents (i) are the same documents to be entered into with the purchasers of Standard Preferred Stock, with appropriate variations for the Safe Preferred Stock if applicable, and (ii) have customary exceptions to any drag-along applicable to the Investor, including (without limitation) limited representations, warranties, liability and indemnification obligations for the Investor.

(b) Liquidity Event. If there is a Liquidity Event before the termination of this Safe, the Investor will automatically be entitled (subject to the liquidation priority set forth in Section 1(d) below) to receive a portion of Proceeds, due and payable to the Investor immediately prior to, or concurrent with, the consummation of such Liquidity Event, equal to the greater of (i) the Purchase Amount (the "Cash-Out Amount") or (ii) the amount payable on the number of shares of Common Stock equal to the Purchase Amount divided by the Liquidity Price (the "Conversion Amount"). If any of the Company's securityholders are given a choice as to the form and amount of Proceeds to be received in a Liquidity Event, the Investor will be given the same choice, provided that the Investor may not choose to receive a form of consideration that the Investor would be ineligible to receive as a result of the Investor's failure to satisfy any requirement or limitation generally applicable to the Company's securityholders, or under any applicable laws.

Notwithstanding the foregoing, in connection with a Change of Control intended to qualify as a tax-free reorganization, the Company may reduce the cash portion of Proceeds payable to the Investor by the amount determined by its board of directors in good faith for such Change of Control to qualify as a tax-free reorganization for U.S. federal income tax purposes, provided that such reduction (A) does not reduce the total Proceeds payable to such Investor and (B) is applied in the same manner and on a pro rata basis to all securityholders who have equal priority to the Investor under Section 1(d).

(c) Dissolution Event. If there is a Dissolution Event before the termination of this Safe, the Investor will automatically be entitled (subject to the liquidation priority set forth in Section 1(d) below) to receive a portion of Proceeds equal to the Cash-Out Amount, due and payable to the Investor immediately prior to the consummation of the Dissolution Event.

(d) Liquidation Priority. In a Liquidity Event or Dissolution Event, this Safe is intended to operate like standard non-participating Preferred Stock. The Investor's right to receive its Cash-Out Amount is:

(i) Junior to payment of outstanding indebtedness and creditor claims, including contractual claims for payment and convertible promissory notes (to the extent such convertible promissory notes are not actually or notionally converted into Capital Stock);

(ii) On par with payments for other Safes and/or Preferred Stock, and if the applicable Proceeds are insufficient to permit full payments to the Investor and such other Safes and/or Preferred Stock, the applicable Proceeds will be distributed pro rata to the Investor and such other Safes and/or Preferred Stock in proportion to the full payments that would otherwise be due; and

(iii) Senior to payments for Common Stock.

The Investor's right to receive its Conversion Amount is (A) on par with payments for Common Stock and other Safes and/or Preferred Stock who are also receiving Conversion Amounts or Proceeds on a similar as-converted to Common Stock basis, and (B) junior to payments described in clauses (i) and (ii) above (in the latter case, to the extent such payments are Cash-Out Amounts or similar liquidation preferences).

(e) Termination. This Safe will automatically terminate (without relieving the Company of any obligations arising from a prior breach of or non-compliance with this Safe) immediately following the earliest to occur of: (i) the issuance of Capital Stock to the Investor pursuant to the automatic conversion of this Safe under Section 1(a); or (ii) the payment, or setting aside for payment, of amounts due the Investor pursuant to Section 1(b) or Section 1(c).

2. Definitions

"Capital Stock" means the capital stock of the Company, including, without limitation, the "Common Stock" and the "Preferred Stock."

"Change of Control" means (i) a transaction or series of related transactions in which any "person" or "group" (within the meaning of Section 13(d) and 14(d) of the Securities Exchange Act of 1934, as amended), becomes the "beneficial owner" (as defined in Rule 13d-3 under the Securities Exchange Act of 1934, as amended), directly or indirectly, of more than 50% of the outstanding voting securities of the Company having the right to vote for the election of members of the Company's board of directors, (ii) any reorganization, merger or consolidation of the Company, other than a transaction or series of related transactions in which the holders of the voting securities of the Company outstanding immediately prior to such transaction or series of related transactions retain, immediately after such transaction or series of related transactions, at least a majority of the total voting power represented by the outstanding voting securities of the Company or such other surviving or resulting entity or (iii) a sale, lease or other disposition of all or substantially all of the assets of the Company.

"Company Capitalization" is calculated as of immediately prior to the Equity Financing and (without double-counting, in each case calculated on an as-converted to Common Stock basis):

• Includes all shares of Capital Stock issued and outstanding;

• Includes all Converting Securities;

• Includes all (i) issued and outstanding Options and (ii) Promised Options; and

• Includes the Unissued Option Pool, except that any increase to the Unissued Option Pool in connection with the Equity Financing will only be included to the extent that the number of Promised Options exceeds the Unissued Option Pool prior to such increase.

"Converting Securities" includes this Safe and other convertible securities issued by the Company, including but not limited to: (i) other Safes; (ii) convertible promissory notes and other convertible debt instruments; and (iii) convertible securities that have the right to convert into shares of Capital Stock.

"Direct Listing" means the Company's initial listing of its Common Stock (other than shares of Common Stock not eligible for resale under Rule 144 under the Securities Act) on a national securities exchange by means of an effective registration statement on Form S-1 filed by the Company with the SEC that registers shares of existing capital stock of the Company for resale, as approved by the Company's board of directors. For the avoidance of doubt, a Direct Listing will not be deemed to be an underwritten offering and will not involve any underwriting services.

"Dissolution Event" means (i) a voluntary termination of operations, (ii) a general assignment for the benefit of the Company's creditors or (iii) any other liquidation, dissolution or winding up of the Company (excluding a Liquidity Event), whether voluntary or involuntary.

"Dividend Amount" means, with respect to any date on which the Company pays a dividend on its outstanding Common Stock, the amount of such dividend that is paid per share of Common Stock multiplied by (x) the Purchase Amount divided by (y) the Liquidity Price (treating the dividend date as a Liquidity Event solely for purposes of calculating such Liquidity Price).

"Equity Financing" means a bona fide transaction or series of transactions with the principal purpose of raising capital, pursuant to which the Company issues and sells Preferred Stock at a fixed valuation, including but not limited to, a pre-money or post-money valuation.

"Initial Public Offering" means the closing of the Company's first firm commitment underwritten initial public offering of Common Stock pursuant to a registration statement filed under the Securities Act.

"Liquidity Capitalization" is calculated as of immediately prior to the Liquidity Event, and (without double-counting, in each case calculated on an as-converted to Common Stock basis):

• Includes all shares of Capital Stock issued and outstanding;

• Includes all (i) issued and outstanding Options and (ii) to the extent receiving Proceeds, Promised Options;

• Includes all Converting Securities, other than any Safes and other convertible securities (including without limitation shares of Preferred Stock) where the holders of such securities are receiving Cash-Out Amounts or similar liquidation preference payments in lieu of Conversion Amounts or similar "as-converted" payments; and

• Excludes the Unissued Option Pool.

"Liquidity Event" means a Change of Control, a Direct Listing or an Initial Public Offering.

"Liquidity Price" means the price per share equal to the Post-Money Valuation Cap divided by the Liquidity Capitalization.

"Options" includes options, restricted stock awards or purchases, RSUs, SARs, warrants or similar securities, vested or unvested.

"Proceeds" means cash and other assets (including without limitation stock consideration) that are proceeds from the Liquidity Event or the Dissolution Event, as applicable, and legally available for distribution.

"Promised Options" means promised but ungranted Options that are the greater of those (i) promised pursuant to agreements or understandings made prior to the execution of, or in connection with, the term sheet or letter of intent for the Equity Financing or Liquidity Event, as applicable (or the initial closing of the Equity Financing or consummation of the Liquidity Event, if there is no term sheet or letter of intent), (ii) in the case of an Equity Financing, treated as outstanding Options in the calculation of the Standard Preferred Stock's price per share, or (iii) in the case of a Liquidity Event, treated as outstanding Options in the calculation of the distribution of the Proceeds.

"Safe" means an instrument containing a future right to shares of Capital Stock, similar in form and content to this instrument, purchased by investors for the purpose of funding the Company's business operations. References to "this Safe" mean this specific instrument.

"Safe Preferred Stock" means the shares of the series of Preferred Stock issued to the Investor in an Equity Financing, having the identical rights, privileges, preferences, seniority, liquidation multiple and restrictions as the shares of Standard Preferred Stock, except that any price-based preferences (such as the per share liquidation amount, initial conversion price and per share dividend amount) will be based on the Safe Price.

"Safe Price" means the price per share equal to the Post-Money Valuation Cap divided by the Company Capitalization.

"Standard Preferred Stock" means the shares of the series of Preferred Stock issued to the investors investing new money in the Company in connection with the initial closing of the Equity Financing.

"Unissued Option Pool" means all shares of Capital Stock that are reserved, available for future grant and not subject to any outstanding Options or Promised Options (but in the case of a Liquidity Event, only to the extent Proceeds are payable on such Promised Options) under any equity incentive or similar Company plan.

3. Company Representations

(a) The Company is a corporation duly organized, validly existing and in good standing under the laws of its state of incorporation, and has the power and authority to own, lease and operate its properties and carry on its business as now conducted.

(b) The execution, delivery and performance by the Company of this Safe is within the power of the Company and has been duly authorized by all necessary actions on the part of the Company (subject to section 3(d)). This Safe constitutes a legal, valid and binding obligation of the Company, enforceable against the Company in accordance with its terms, except as limited by bankruptcy, insolvency or other laws of general application relating to or affecting the enforcement of creditors' rights generally and general principles of equity. To its knowledge, the Company is not in violation of (i) its current certificate of incorporation or bylaws, (ii) any material statute, rule or regulation applicable to the Company or (iii) any material debt or contract to which the Company is a party or by which it is bound, where, in each case, such violation or default, individually, or together with all such violations or defaults, could reasonably be expected to have a material adverse effect on the Company.

(c) The performance and consummation of the transactions contemplated by this Safe do not and will not: (i) violate any material judgment, statute, rule or regulation applicable to the Company; (ii) result in the acceleration of any material debt or contract to which the Company is a party or by which it is bound; or (iii) result in the creation or imposition of any lien on any property, asset or revenue of the Company or the suspension, forfeiture, or nonrenewal of any material permit, license or authorization applicable to the Company, its business or operations.

(d) No consents or approvals are required in connection with the performance of this Safe, other than: (i) the Company's corporate approvals; (ii) any qualifications or filings under applicable securities laws; and (iii) necessary corporate approvals for the authorization of Capital Stock issuable pursuant to Section 1.

(e) To its knowledge, the Company owns or possesses (or can obtain on commercially reasonable terms) sufficient legal rights to all patents, trademarks, service marks, trade names, copyrights, trade secrets, licenses, information, processes and other intellectual property rights necessary for its business as now conducted and as currently proposed to be conducted, without any conflict with, or infringement of the rights of, others.

4. Investor Representations

(a) The Investor has full legal capacity, power and authority to execute and deliver this Safe and to perform its obligations hereunder. This Safe constitutes a valid and binding obligation of the Investor, enforceable in accordance with its terms, except as limited by bankruptcy, insolvency or other laws of general application relating to or affecting the enforcement of creditors' rights generally and general principles of equity.

(b) The Investor is an accredited investor as such term is defined in Rule 501 of Regulation D under the Securities Act, and acknowledges and agrees that if not an accredited investor at the time of an Equity Financing, the Company may void this Safe and return the Purchase Amount. The Investor has been advised that this Safe and the underlying securities have not been registered under the Securities Act, or any state securities laws and, therefore, cannot be resold unless they are registered under the Securities Act and applicable state securities laws or unless an exemption from such registration requirements is available. The Investor is purchasing this Safe and the securities to be acquired by the Investor hereunder for its own account for investment, not as a nominee or agent, and not with a view to, or for resale in connection with, the distribution thereof, and the Investor has no present intention of selling, granting any participation in, or otherwise distributing the same. The Investor has such knowledge and experience in financial and business matters that the Investor is capable of evaluating the merits and risks of such investment, is able to incur a complete loss of such investment without impairing the Investor's financial condition and is able to bear the economic risk of such investment for an indefinite period of time.

5. Miscellaneous

(a) Any provision of this Safe may be amended, waived or modified by written consent of the Company and either (i) the Investor or (ii) the majority-in-interest of all then-outstanding Safes with the same "Post-Money Valuation Cap" and "Discount Rate" as this Safe (and Safes lacking one or both of such terms will be considered to be the same with respect to such term(s)), provided that with respect to clause (ii): (A) the Purchase Amount may not be amended, waived or modified in this manner, (B) the consent of the Investor and each holder of such Safes must be solicited (even if not obtained), and (C) such amendment, waiver or modification treats all such holders in the same manner. "Majority-in-interest" refers to the holders of the applicable group of Safes whose Safes have a total Purchase Amount greater than 50% of the total Purchase Amount of all of such applicable group of Safes.

(b) Any notice required or permitted by this Safe will be deemed sufficient when delivered personally or by overnight courier or sent by email to the relevant address listed on the signature page, or 48 hours after being deposited in the U.S. mail as certified or registered mail with postage prepaid, addressed to the party to be notified at such party's address listed on the signature page, as subsequently modified by written notice.

(c) The Investor is not entitled, as a holder of this Safe, to vote or be deemed a holder of Capital Stock for any purpose other than tax purposes, nor will anything in this Safe be construed to confer on the Investor, as such, any rights of a Company stockholder or rights to vote for the election of directors or on any matter submitted to Company stockholders, or to give or withhold consent to any corporate action or to receive notice of meetings, until shares have been issued on the terms described in Section 1. However, if the Company pays a dividend on outstanding shares of Common Stock (that is not payable in shares of Common Stock) while this Safe is outstanding, the Company will pay the Dividend Amount to the Investor at the same time.

(d) Neither this Safe nor the rights in this Safe are transferable or assignable, by operation of law or otherwise, by either party without the prior written consent of the other; provided, however, that this Safe and/or its rights may be assigned without the Company's consent by the Investor (i) to the Investor's estate, heirs, executors, administrators, guardians and/or successors in the event of Investor's death or disability, or (ii) to any other entity who directly or indirectly, controls, is controlled by or is under common control with the Investor, including, without limitation, any general partner, managing member, officer or director of the Investor, or any venture capital fund now or hereafter existing which is controlled by one or more general partners or managing members of, or shares the same management company with, the Investor.

(e) In the event any one or more of the provisions of this Safe is for any reason held to be invalid, illegal or unenforceable, in whole or in part or in any respect, or in the event that any one or more of the provisions of this Safe operate or would prospectively operate to invalidate this Safe, then and in any such event, such provision(s) only will be deemed null and void and will not affect any other provision of this Safe and the remaining provisions of this Safe will remain operative and in full force and effect and will not be affected, prejudiced, or disturbed thereby.

(f) All rights and obligations hereunder will be governed by the laws of the State of ${v.governingLaw}, without regard to the conflicts of law provisions of such jurisdiction.

(g) The parties acknowledge and agree that for United States federal and state income tax purposes this Safe is, and at all times has been, intended to be characterized as stock, and more particularly as common stock for purposes of Sections 304, 305, 306, 354, 368, 1036 and 1202 of the Internal Revenue Code of 1986, as amended. Accordingly, the parties agree to treat this Safe consistent with the foregoing intent for all United States federal and state income tax purposes (including, without limitation, on their respective tax returns or other informational statements).

IN WITNESS WHEREOF, the undersigned have caused this Safe to be duly executed and delivered.

${safeSignatureBlock(v)}`
}

function safeMfn(v: Record<string, string>): string {
  return `THIS INSTRUMENT AND ANY SECURITIES ISSUABLE PURSUANT HERETO HAVE NOT BEEN REGISTERED UNDER THE SECURITIES ACT OF 1933, AS AMENDED (THE "SECURITIES ACT"), OR UNDER THE SECURITIES LAWS OF CERTAIN STATES. THESE SECURITIES MAY NOT BE OFFERED, SOLD OR OTHERWISE TRANSFERRED, PLEDGED OR HYPOTHECATED EXCEPT AS PERMITTED IN THIS SAFE AND UNDER THE ACT AND APPLICABLE STATE SECURITIES LAWS PURSUANT TO AN EFFECTIVE REGISTRATION STATEMENT OR AN EXEMPTION THEREFROM.

${v.companyName}

SAFE
(Simple Agreement for Future Equity)

THIS CERTIFIES THAT in exchange for the payment by ${v.investorName} (the "Investor") of $${v.purchaseAmount} (the "Purchase Amount") on or about ${formatDate(v.date)}, ${v.companyName}, a ${v.stateOfIncorporation} corporation (the "Company"), issues to the Investor the right to certain shares of the Company's Capital Stock, subject to the terms described below.

This Safe is one of the forms available at http://ycombinator.com/documents and the Company and the Investor agree that neither one has modified the form, except to fill in blanks and bracketed terms.

1. Events

(a) Equity Financing. If there is an Equity Financing before the termination of this Safe, on the initial closing of such Equity Financing, this Safe will automatically convert into the number of shares of Standard Preferred Stock equal to the Purchase Amount divided by the lowest price per share of the Standard Preferred Stock.

In connection with the automatic conversion of this Safe into shares of Standard Preferred Stock, the Investor will execute and deliver to the Company all of the transaction documents related to the Equity Financing; provided, that such documents (i) are the same documents to be entered into with the purchasers of Standard Preferred Stock, and (ii) have customary exceptions to any drag-along applicable to the Investor, including (without limitation) limited representations, warranties, liability and indemnification obligations for the Investor.

(b) Liquidity Event. If there is a Liquidity Event before the termination of this Safe, the Investor will automatically be entitled (subject to the liquidation priority set forth in Section 1(d) below and the "MFN" Amendment Provision in Section 3 below) to receive a portion of Proceeds, due and payable to the Investor immediately prior to, or concurrent with, the consummation of such Liquidity Event, equal to the Purchase Amount (the "Cash-Out Amount"). If any of the Company's securityholders are given a choice as to the form and amount of Proceeds to be received in a Liquidity Event, the Investor will be given the same choice, provided that the Investor may not choose to receive a form of consideration that the Investor would be ineligible to receive as a result of the Investor's failure to satisfy any requirement or limitation generally applicable to the Company's securityholders, or under any applicable laws.

Notwithstanding the foregoing, in connection with a Change of Control intended to qualify as a tax-free reorganization, the Company may reduce the cash portion of Proceeds payable to the Investor by the amount determined by its board of directors in good faith for such Change of Control to qualify as a tax-free reorganization for U.S. federal income tax purposes, provided that such reduction (A) does not reduce the total Proceeds payable to such Investor and (B) is applied in the same manner and on a pro rata basis to all securityholders who have equal priority to the Investor under Section 1(d).

(c) Dissolution Event. If there is a Dissolution Event before the termination of this Safe, the Investor will automatically be entitled (subject to the liquidation priority set forth in Section 1(d) below) to receive a portion of Proceeds equal to the Cash-Out Amount, due and payable to the Investor immediately prior to the consummation of the Dissolution Event.

(d) Liquidation Priority. In a Liquidity Event or Dissolution Event, this Safe is intended to operate like standard non-participating Preferred Stock. The Investor's right to receive its Cash-Out Amount is:

(i) Junior to payment of outstanding indebtedness and creditor claims, including contractual claims for payment and convertible promissory notes (to the extent such convertible promissory notes are not actually or notionally converted into Capital Stock);

(ii) On par with payments for other Safes and/or Preferred Stock, and if the applicable Proceeds are insufficient to permit full payments to the Investor and such other Safes and/or Preferred Stock, the applicable Proceeds will be distributed pro rata to the Investor and such other Safes and/or Preferred Stock in proportion to the full payments that would otherwise be due; and

(iii) Senior to payments for Common Stock.

The Investor's right to receive its Cash-Out Amount is (A) on par with payments for Common Stock and other Safes and/or Preferred Stock who are also receiving Cash-Out Amounts or Proceeds on a similar as-converted to Common Stock basis, and (B) junior to payments described in clauses (i) and (ii) above (in the latter case, to the extent such payments are Cash-Out Amounts or similar liquidation preferences).

(e) Termination. This Safe will automatically terminate (without relieving the Company of any obligations arising from a prior breach of or non-compliance with this Safe) immediately following the earliest to occur of: (i) the issuance of Capital Stock to the Investor pursuant to the automatic conversion of this Safe under Section 1(a); or (ii) the payment, or setting aside for payment, of amounts due the Investor pursuant to Section 1(b) or Section 1(c).

2. Definitions

"Capital Stock" means the capital stock of the Company, including, without limitation, the "Common Stock" and the "Preferred Stock."

"Change of Control" means (i) a transaction or series of related transactions in which any "person" or "group" (within the meaning of Section 13(d) and 14(d) of the Securities Exchange Act of 1934, as amended), becomes the "beneficial owner" (as defined in Rule 13d-3 under the Securities Exchange Act of 1934, as amended), directly or indirectly, of more than 50% of the outstanding voting securities of the Company having the right to vote for the election of members of the Company's board of directors, (ii) any reorganization, merger or consolidation of the Company, other than a transaction or series of related transactions in which the holders of the voting securities of the Company outstanding immediately prior to such transaction or series of related transactions retain, immediately after such transaction or series of related transactions, at least a majority of the total voting power represented by the outstanding voting securities of the Company or such other surviving or resulting entity or (iii) a sale, lease or other disposition of all or substantially all of the assets of the Company.

"Direct Listing" means the Company's initial listing of its Common Stock (other than shares of Common Stock not eligible for resale under Rule 144 under the Securities Act) on a national securities exchange by means of an effective registration statement on Form S-1 filed by the Company with the SEC that registers shares of existing capital stock of the Company for resale, as approved by the Company's board of directors. For the avoidance of doubt, a Direct Listing will not be deemed to be an underwritten offering and will not involve any underwriting services.

"Dissolution Event" means (i) a voluntary termination of operations, (ii) a general assignment for the benefit of the Company's creditors or (iii) any other liquidation, dissolution or winding up of the Company (excluding a Liquidity Event), whether voluntary or involuntary.

"Dividend Amount" means, with respect to any date on which the Company pays a dividend on its outstanding Common Stock, the amount of such dividend that is paid per share of Common Stock multiplied by (x) the Purchase Amount divided by (y) the Liquidity Price (treating the dividend date as a Liquidity Event solely for purposes of calculating such Liquidity Price).

"Equity Financing" means a bona fide transaction or series of transactions with the principal purpose of raising capital, pursuant to which the Company issues and sells Preferred Stock at a fixed valuation, including but not limited to, a pre-money or post-money valuation.

"Initial Public Offering" means the closing of the Company's first firm commitment underwritten initial public offering of Common Stock pursuant to a registration statement filed under the Securities Act.

"Liquidity Event" means a Change of Control, a Direct Listing or an Initial Public Offering.

"Liquidity Price" means the fair market value of the Common Stock at the time of the applicable Liquidity Event (determined by reference to the purchase price payable in connection with such Liquidity Event).

"Proceeds" means cash and other assets (including without limitation stock consideration) that are proceeds from the Liquidity Event or the Dissolution Event, as applicable, and legally available for distribution.

"Safe" means an instrument containing a future right to shares of Capital Stock, similar in form and content to this instrument, purchased by investors for the purpose of funding the Company's business operations. References to "this Safe" mean this specific instrument.

"Standard Preferred Stock" means the shares of the series of Preferred Stock issued to the investors investing new money in the Company in connection with the initial closing of the Equity Financing.

"Subsequent Convertible Securities" means convertible securities that the Company may issue after the issuance of this instrument with the principal purpose of raising capital, including but not limited to, other Safes, convertible debt instruments and other convertible securities. Subsequent Convertible Securities excludes: (i) side letters or ancillary agreements that do not amend or modify the terms of such convertible securities; and (ii) the following types of securities: (A) options issued pursuant to any equity incentive or similar plan of the Company; (B) convertible securities issued or issuable to (1) banks, equipment lessors, financial institutions or other persons engaged in the business of making loans pursuant to a debt financing or commercial leasing or (2) suppliers or third party service providers in connection with the provision of goods or services pursuant to transactions; and (C) convertible securities issued or issuable in connection with sponsored research, collaboration, technology license, development, OEM, marketing or other similar agreements or strategic partnerships.

3. "MFN" Amendment Provision. If the Company issues any Subsequent Convertible Securities with terms more favorable than those of this Safe (including, without limitation, a valuation cap and/or discount) prior to termination of this Safe, the Company will promptly provide the Investor with written notice thereof, together with a copy of such Subsequent Convertible Securities (the "MFN Notice") and, upon written request of the Investor, any additional information related to such Subsequent Convertible Securities as may be reasonably requested by the Investor. In the event the Investor determines that the terms of the Subsequent Convertible Securities are preferable to the terms of this instrument, the Investor will notify the Company in writing within 10 days of the receipt of the MFN Notice. Promptly after receipt of such written notice from the Investor, the Company agrees to amend and restate this instrument to be identical to the instrument(s) evidencing the Subsequent Convertible Securities.

4. Company Representations

(a) The Company is a corporation duly organized, validly existing and in good standing under the laws of its state of incorporation, and has the power and authority to own, lease and operate its properties and carry on its business as now conducted.

(b) The execution, delivery and performance by the Company of this Safe is within the power of the Company and has been duly authorized by all necessary actions on the part of the Company (subject to section 4(d)). This Safe constitutes a legal, valid and binding obligation of the Company, enforceable against the Company in accordance with its terms, except as limited by bankruptcy, insolvency or other laws of general application relating to or affecting the enforcement of creditors' rights generally and general principles of equity. To its knowledge, the Company is not in violation of (i) its current certificate of incorporation or bylaws, (ii) any material statute, rule or regulation applicable to the Company or (iii) any material debt or contract to which the Company is a party or by which it is bound, where, in each case, such violation or default, individually, or together with all such violations or defaults, could reasonably be expected to have a material adverse effect on the Company.

(c) The performance and consummation of the transactions contemplated by this Safe do not and will not: (i) violate any material judgment, statute, rule or regulation applicable to the Company; (ii) result in the acceleration of any material debt or contract to which the Company is a party or by which it is bound; or (iii) result in the creation or imposition of any lien on any property, asset or revenue of the Company or the suspension, forfeiture, or nonrenewal of any material permit, license or authorization applicable to the Company, its business or operations.

(d) No consents or approvals are required in connection with the performance of this Safe, other than: (i) the Company's corporate approvals; (ii) any qualifications or filings under applicable securities laws; and (iii) necessary corporate approvals for the authorization of Capital Stock issuable pursuant to Section 1.

(e) To its knowledge, the Company owns or possesses (or can obtain on commercially reasonable terms) sufficient legal rights to all patents, trademarks, service marks, trade names, copyrights, trade secrets, licenses, information, processes and other intellectual property rights necessary for its business as now conducted and as currently proposed to be conducted, without any conflict with, or infringement of the rights of, others.

5. Investor Representations

(a) The Investor has full legal capacity, power and authority to execute and deliver this Safe and to perform its obligations hereunder. This Safe constitutes a valid and binding obligation of the Investor, enforceable in accordance with its terms, except as limited by bankruptcy, insolvency or other laws of general application relating to or affecting the enforcement of creditors' rights generally and general principles of equity.

(b) The Investor is an accredited investor as such term is defined in Rule 501 of Regulation D under the Securities Act, and acknowledges and agrees that if not an accredited investor at the time of an Equity Financing, the Company may void this Safe and return the Purchase Amount. The Investor has been advised that this Safe and the underlying securities have not been registered under the Securities Act, or any state securities laws and, therefore, cannot be resold unless they are registered under the Securities Act and applicable state securities laws or unless an exemption from such registration requirements is available. The Investor is purchasing this Safe and the securities to be acquired by the Investor hereunder for its own account for investment, not as a nominee or agent, and not with a view to, or for resale in connection with, the distribution thereof, and the Investor has no present intention of selling, granting any participation in, or otherwise distributing the same. The Investor has such knowledge and experience in financial and business matters that the Investor is capable of evaluating the merits and risks of such investment, is able to incur a complete loss of such investment without impairing the Investor's financial condition and is able to bear the economic risk of such investment for an indefinite period of time.

6. Miscellaneous

(a) Any provision of this Safe may be amended, waived or modified by written consent of the Company and either (i) the Investor or (ii) the majority-in-interest of all then-outstanding Safes with the same "Post-Money Valuation Cap" and "Discount Rate" as this Safe (and Safes lacking one or both of such terms will be considered to be the same with respect to such term(s)), provided that with respect to clause (ii): (A) the Purchase Amount and Section 3 may not be amended, waived or modified in this manner, (B) the consent of the Investor and each holder of such Safes must be solicited (even if not obtained), and (C) such amendment, waiver or modification treats all such holders in the same manner. "Majority-in-interest" refers to the holders of the applicable group of Safes whose Safes have a total Purchase Amount greater than 50% of the total Purchase Amount of all of such applicable group of Safes.

(b) Any notice required or permitted by this Safe will be deemed sufficient when delivered personally or by overnight courier or sent by email to the relevant address listed on the signature page, or 48 hours after being deposited in the U.S. mail as certified or registered mail with postage prepaid, addressed to the party to be notified at such party's address listed on the signature page, as subsequently modified by written notice.

(c) The Investor is not entitled, as a holder of this Safe, to vote or be deemed a holder of Capital Stock for any purpose other than tax purposes, nor will anything in this Safe be construed to confer on the Investor, as such, any rights of a Company stockholder or rights to vote for the election of directors or on any matter submitted to Company stockholders, or to give or withhold consent to any corporate action or to receive notice of meetings, until shares have been issued on the terms described in Section 1. However, if the Company pays a dividend on outstanding shares of Common Stock (that is not payable in shares of Common Stock) while this Safe is outstanding, the Company will pay the Dividend Amount to the Investor at the same time.

(d) Neither this Safe nor the rights in this Safe are transferable or assignable, by operation of law or otherwise, by either party without the prior written consent of the other; provided, however, that this Safe and/or its rights may be assigned without the Company's consent by the Investor (i) to the Investor's estate, heirs, executors, administrators, guardians and/or successors in the event of Investor's death or disability, or (ii) to any other entity who directly or indirectly, controls, is controlled by or is under common control with the Investor, including, without limitation, any general partner, managing member, officer or director of the Investor, or any venture capital fund now or hereafter existing which is controlled by one or more general partners or managing members of, or shares the same management company with, the Investor.

(e) In the event any one or more of the provisions of this Safe is for any reason held to be invalid, illegal or unenforceable, in whole or in part or in any respect, or in the event that any one or more of the provisions of this Safe operate or would prospectively operate to invalidate this Safe, then and in any such event, such provision(s) only will be deemed null and void and will not affect any other provision of this Safe and the remaining provisions of this Safe will remain operative and in full force and effect and will not be affected, prejudiced, or disturbed thereby.

(f) All rights and obligations hereunder will be governed by the laws of the State of ${v.governingLaw}, without regard to the conflicts of law provisions of such jurisdiction.

(g) The parties acknowledge and agree that for United States federal and state income tax purposes this Safe is, and at all times has been, intended to be characterized as stock, and more particularly as common stock for purposes of Sections 304, 305, 306, 354, 368, 1036 and 1202 of the Internal Revenue Code of 1986, as amended. Accordingly, the parties agree to treat this Safe consistent with the foregoing intent for all United States federal and state income tax purposes (including, without limitation, on their respective tax returns or other informational statements).

IN WITNESS WHEREOF, the undersigned have caused this Safe to be duly executed and delivered.

${safeSignatureBlock(v)}`
}

function safeDiscount(v: Record<string, string>): string {
  const discountRate = 100 - parseAmount(v.discountPercent)
  return `THIS INSTRUMENT AND ANY SECURITIES ISSUABLE PURSUANT HERETO HAVE NOT BEEN REGISTERED UNDER THE SECURITIES ACT OF 1933, AS AMENDED (THE "SECURITIES ACT"), OR UNDER THE SECURITIES LAWS OF CERTAIN STATES. THESE SECURITIES MAY NOT BE OFFERED, SOLD OR OTHERWISE TRANSFERRED, PLEDGED OR HYPOTHECATED EXCEPT AS PERMITTED IN THIS SAFE AND UNDER THE ACT AND APPLICABLE STATE SECURITIES LAWS PURSUANT TO AN EFFECTIVE REGISTRATION STATEMENT OR AN EXEMPTION THEREFROM.

${v.companyName}

SAFE
(Simple Agreement for Future Equity)

THIS CERTIFIES THAT in exchange for the payment by ${v.investorName} (the "Investor") of $${v.purchaseAmount} (the "Purchase Amount") on or about ${formatDate(v.date)}, ${v.companyName}, a ${v.stateOfIncorporation} corporation (the "Company"), issues to the Investor the right to certain shares of the Company's Capital Stock, subject to the terms described below.

This Safe is one of the forms available at http://ycombinator.com/documents and the Company and the Investor agree that neither one has modified the form, except to fill in blanks and bracketed terms.

The "Discount Rate" is ${discountRate}%.

See Section 2 for certain additional defined terms.

1. Events

(a) Equity Financing. If there is an Equity Financing before the termination of this Safe, on the initial closing of such Equity Financing, this Safe will automatically convert into the number of shares of Safe Preferred Stock equal to the Purchase Amount divided by the Discount Price.

In connection with the automatic conversion of this Safe into shares of Safe Preferred Stock, the Investor will execute and deliver to the Company all of the transaction documents related to the Equity Financing; provided, that such documents (i) are the same documents to be entered into with the purchasers of Standard Preferred Stock, with appropriate variations for the Safe Preferred Stock if applicable, and (ii) have customary exceptions to any drag-along applicable to the Investor, including (without limitation) limited representations, warranties, liability and indemnification obligations for the Investor.

(b) Liquidity Event. If there is a Liquidity Event before the termination of this Safe, the Investor will automatically be entitled (subject to the liquidation priority set forth in Section 1(d) below) to receive a portion of Proceeds, due and payable to the Investor immediately prior to, or concurrent with, the consummation of such Liquidity Event, equal to the greater of (i) the Purchase Amount (the "Cash-Out Amount") or (ii) the amount payable on the number of shares of Common Stock equal to the Purchase Amount divided by the Liquidity Price (the "Conversion Amount"). If any of the Company's securityholders are given a choice as to the form and amount of Proceeds to be received in a Liquidity Event, the Investor will be given the same choice, provided that the Investor may not choose to receive a form of consideration that the Investor would be ineligible to receive as a result of the Investor's failure to satisfy any requirement or limitation generally applicable to the Company's securityholders, or under any applicable laws.

Notwithstanding the foregoing, in connection with a Change of Control intended to qualify as a tax-free reorganization, the Company may reduce the cash portion of Proceeds payable to the Investor by the amount determined by its board of directors in good faith for such Change of Control to qualify as a tax-free reorganization for U.S. federal income tax purposes, provided that such reduction (A) does not reduce the total Proceeds payable to such Investor and (B) is applied in the same manner and on a pro rata basis to all securityholders who have equal priority to the Investor under Section 1(d).

(c) Dissolution Event. If there is a Dissolution Event before the termination of this Safe, the Investor will automatically be entitled (subject to the liquidation priority set forth in Section 1(d) below) to receive a portion of Proceeds equal to the Cash-Out Amount, due and payable to the Investor immediately prior to the consummation of the Dissolution Event.

(d) Liquidation Priority. In a Liquidity Event or Dissolution Event, this Safe is intended to operate like standard non-participating Preferred Stock. The Investor's right to receive its Cash-Out Amount is:

(i) Junior to payment of outstanding indebtedness and creditor claims, including contractual claims for payment and convertible promissory notes (to the extent such convertible promissory notes are not actually or notionally converted into Capital Stock);

(ii) On par with payments for other Safes and/or Preferred Stock, and if the applicable Proceeds are insufficient to permit full payments to the Investor and such other Safes and/or Preferred Stock, the applicable Proceeds will be distributed pro rata to the Investor and such other Safes and/or Preferred Stock in proportion to the full payments that would otherwise be due; and

(iii) Senior to payments for Common Stock.

The Investor's right to receive its Conversion Amount is (A) on par with payments for Common Stock and other Safes and/or Preferred Stock who are also receiving Conversion Amounts or Proceeds on a similar as-converted to Common Stock basis, and (B) junior to payments described in clauses (i) and (ii) above (in the latter case, to the extent such payments are Cash-Out Amounts or similar liquidation preferences).

(e) Termination. This Safe will automatically terminate (without relieving the Company of any obligations arising from a prior breach of or non-compliance with this Safe) immediately following the earliest to occur of: (i) the issuance of Capital Stock to the Investor pursuant to the automatic conversion of this Safe under Section 1(a); or (ii) the payment, or setting aside for payment, of amounts due the Investor pursuant to Section 1(b) or Section 1(c).

2. Definitions

"Capital Stock" means the capital stock of the Company, including, without limitation, the "Common Stock" and the "Preferred Stock."

"Change of Control" means (i) a transaction or series of related transactions in which any "person" or "group" (within the meaning of Section 13(d) and 14(d) of the Securities Exchange Act of 1934, as amended), becomes the "beneficial owner" (as defined in Rule 13d-3 under the Securities Exchange Act of 1934, as amended), directly or indirectly, of more than 50% of the outstanding voting securities of the Company having the right to vote for the election of members of the Company's board of directors, (ii) any reorganization, merger or consolidation of the Company, other than a transaction or series of related transactions in which the holders of the voting securities of the Company outstanding immediately prior to such transaction or series of related transactions retain, immediately after such transaction or series of related transactions, at least a majority of the total voting power represented by the outstanding voting securities of the Company or such other surviving or resulting entity or (iii) a sale, lease or other disposition of all or substantially all of the assets of the Company.

"Direct Listing" means the Company's initial listing of its Common Stock (other than shares of Common Stock not eligible for resale under Rule 144 under the Securities Act) on a national securities exchange by means of an effective registration statement on Form S-1 filed by the Company with the SEC that registers shares of existing capital stock of the Company for resale, as approved by the Company's board of directors. For the avoidance of doubt, a Direct Listing will not be deemed to be an underwritten offering and will not involve any underwriting services.

"Discount Price" means the lowest price per share of the Standard Preferred Stock sold in the Equity Financing multiplied by the Discount Rate.

"Dissolution Event" means (i) a voluntary termination of operations, (ii) a general assignment for the benefit of the Company's creditors or (iii) any other liquidation, dissolution or winding up of the Company (excluding a Liquidity Event), whether voluntary or involuntary.

"Dividend Amount" means, with respect to any date on which the Company pays a dividend on its outstanding Common Stock, the amount of such dividend that is paid per share of Common Stock multiplied by (x) the Purchase Amount divided by (y) the Liquidity Price (treating the dividend date as a Liquidity Event solely for purposes of calculating such Liquidity Price).

"Equity Financing" means a bona fide transaction or series of transactions with the principal purpose of raising capital, pursuant to which the Company issues and sells Preferred Stock at a fixed valuation, including but not limited to, a pre-money or post-money valuation.

"Initial Public Offering" means the closing of the Company's first firm commitment underwritten initial public offering of Common Stock pursuant to a registration statement filed under the Securities Act.

"Liquidity Event" means a Change of Control, a Direct Listing or an Initial Public Offering.

"Liquidity Price" means the price per share equal to the fair market value of the Common Stock at the time of the Liquidity Event, as determined by reference to the purchase price payable in connection with such Liquidity Event, multiplied by the Discount Rate.

"Proceeds" means cash and other assets (including without limitation stock consideration) that are proceeds from the Liquidity Event or the Dissolution Event, as applicable, and legally available for distribution.

"Safe" means an instrument containing a future right to shares of Capital Stock, similar in form and content to this instrument, purchased by investors for the purpose of funding the Company's business operations. References to "this Safe" mean this specific instrument.

"Safe Preferred Stock" means the shares of the series of Preferred Stock issued to the Investor in an Equity Financing, having the identical rights, privileges, preferences, seniority, liquidation multiple and restrictions as the shares of Standard Preferred Stock, except that any price-based preferences (such as the per share liquidation amount, initial conversion price and per share dividend amount) will be based on the Discount Price.

"Standard Preferred Stock" means the shares of a series of Preferred Stock issued to the investors investing new money in the Company in connection with the initial closing of the Equity Financing.

3. Company Representations

(a) The Company is a corporation duly organized, validly existing and in good standing under the laws of its state of incorporation, and has the power and authority to own, lease and operate its properties and carry on its business as now conducted.

(b) The execution, delivery and performance by the Company of this Safe is within the power of the Company and has been duly authorized by all necessary actions on the part of the Company (subject to section 3(d)). This Safe constitutes a legal, valid and binding obligation of the Company, enforceable against the Company in accordance with its terms, except as limited by bankruptcy, insolvency or other laws of general application relating to or affecting the enforcement of creditors' rights generally and general principles of equity. To its knowledge, the Company is not in violation of (i) its current certificate of incorporation or bylaws, (ii) any material statute, rule or regulation applicable to the Company or (iii) any material debt or contract to which the Company is a party or by which it is bound, where, in each case, such violation or default, individually, or together with all such violations or defaults, could reasonably be expected to have a material adverse effect on the Company.

(c) The performance and consummation of the transactions contemplated by this Safe do not and will not: (i) violate any material judgment, statute, rule or regulation applicable to the Company; (ii) result in the acceleration of any material debt or contract to which the Company is a party or by which it is bound; or (iii) result in the creation or imposition of any lien on any property, asset or revenue of the Company or the suspension, forfeiture, or nonrenewal of any material permit, license or authorization applicable to the Company, its business or operations.

(d) No consents or approvals are required in connection with the performance of this Safe, other than: (i) the Company's corporate approvals; (ii) any qualifications or filings under applicable securities laws; and (iii) necessary corporate approvals for the authorization of Capital Stock issuable pursuant to Section 1.

(e) To its knowledge, the Company owns or possesses (or can obtain on commercially reasonable terms) sufficient legal rights to all patents, trademarks, service marks, trade names, copyrights, trade secrets, licenses, information, processes and other intellectual property rights necessary for its business as now conducted and as currently proposed to be conducted, without any conflict with, or infringement of the rights of, others.

4. Investor Representations

(a) The Investor has full legal capacity, power and authority to execute and deliver this Safe and to perform its obligations hereunder. This Safe constitutes a valid and binding obligation of the Investor, enforceable in accordance with its terms, except as limited by bankruptcy, insolvency or other laws of general application relating to or affecting the enforcement of creditors' rights generally and general principles of equity.

(b) The Investor is an accredited investor as such term is defined in Rule 501 of Regulation D under the Securities Act, and acknowledges and agrees that if not an accredited investor at the time of an Equity Financing, the Company may void this Safe and return the Purchase Amount. The Investor has been advised that this Safe and the underlying securities have not been registered under the Securities Act, or any state securities laws and, therefore, cannot be resold unless they are registered under the Securities Act and applicable state securities laws or unless an exemption from such registration requirements is available. The Investor is purchasing this Safe and the securities to be acquired by the Investor hereunder for its own account for investment, not as a nominee or agent, and not with a view to, or for resale in connection with, the distribution thereof, and the Investor has no present intention of selling, granting any participation in, or otherwise distributing the same. The Investor has such knowledge and experience in financial and business matters that the Investor is capable of evaluating the merits and risks of such investment, is able to incur a complete loss of such investment without impairing the Investor's financial condition and is able to bear the economic risk of such investment for an indefinite period of time.

5. Miscellaneous

(a) Any provision of this Safe may be amended, waived or modified by written consent of the Company and either (i) the Investor or (ii) the majority-in-interest of all then-outstanding Safes with the same "Post-Money Valuation Cap" and "Discount Rate" as this Safe (and Safes lacking one or both of such terms will be considered to be the same with respect to such term(s)), provided that with respect to clause (ii): (A) the Purchase Amount may not be amended, waived or modified in this manner, (B) the consent of the Investor and each holder of such Safes must be solicited (even if not obtained), and (C) such amendment, waiver or modification treats all such holders in the same manner. "Majority-in-interest" refers to the holders of the applicable group of Safes whose Safes have a total Purchase Amount greater than 50% of the total Purchase Amount of all of such applicable group of Safes.

(b) Any notice required or permitted by this Safe will be deemed sufficient when delivered personally or by overnight courier or sent by email to the relevant address listed on the signature page, or 48 hours after being deposited in the U.S. mail as certified or registered mail with postage prepaid, addressed to the party to be notified at such party's address listed on the signature page, as subsequently modified by written notice.

(c) The Investor is not entitled, as a holder of this Safe, to vote or be deemed a holder of Capital Stock for any purpose other than tax purposes, nor will anything in this Safe be construed to confer on the Investor, as such, any rights of a Company stockholder or rights to vote for the election of directors or on any matter submitted to Company stockholders, or to give or withhold consent to any corporate action or to receive notice of meetings, until shares have been issued on the terms described in Section 1. However, if the Company pays a dividend on outstanding shares of Common Stock (that is not payable in shares of Common Stock) while this Safe is outstanding, the Company will pay the Dividend Amount to the Investor at the same time.

(d) Neither this Safe nor the rights in this Safe are transferable or assignable, by operation of law or otherwise, by either party without the prior written consent of the other; provided, however, that this Safe and/or its rights may be assigned without the Company's consent by the Investor (i) to the Investor's estate, heirs, executors, administrators, guardians and/or successors in the event of Investor's death or disability, or (ii) to any other entity who directly or indirectly, controls, is controlled by or is under common control with the Investor, including, without limitation, any general partner, managing member, officer or director of the Investor, or any venture capital fund now or hereafter existing which is controlled by one or more general partners or managing members of, or shares the same management company with, the Investor.

(e) In the event any one or more of the provisions of this Safe is for any reason held to be invalid, illegal or unenforceable, in whole or in part or in any respect, or in the event that any one or more of the provisions of this Safe operate or would prospectively operate to invalidate this Safe, then and in any such event, such provision(s) only will be deemed null and void and will not affect any other provision of this Safe and the remaining provisions of this Safe will remain operative and in full force and effect and will not be affected, prejudiced, or disturbed thereby.

(f) All rights and obligations hereunder will be governed by the laws of the State of ${v.governingLaw}, without regard to the conflicts of law provisions of such jurisdiction.

(g) The parties acknowledge and agree that for United States federal and state income tax purposes this Safe is, and at all times has been, intended to be characterized as stock, and more particularly as common stock for purposes of Sections 304, 305, 306, 354, 368, 1036 and 1202 of the Internal Revenue Code of 1986, as amended. Accordingly, the parties agree to treat this Safe consistent with the foregoing intent for all United States federal and state income tax purposes (including, without limitation, on their respective tax returns or other informational statements).

IN WITNESS WHEREOF, the undersigned have caused this Safe to be duly executed and delivered.

${safeSignatureBlock(v)}`
}

function proRataSideLetter(v: Record<string, string>): string {
  return `${v.companyName}
PRO RATA AGREEMENT

This agreement (this "Agreement") is entered into on or about ${formatDate(v.date)} in connection with the purchase by ${v.investorName} (the "Investor") of that certain simple agreement for future equity with a "Post-Money Valuation Cap" (the "Investor's Safe") issued by ${v.companyName} (the "Company") on or about the date of this Agreement. As a material inducement to the Investor's investment, the Company agrees to the provisions set forth in this Agreement. Capitalized terms used herein shall have the meanings set forth in the Investor's Safe.

The Investor shall have the right to purchase its pro rata share of Standard Preferred Stock being sold in the Equity Financing (the "Pro Rata Right"). Pro rata share for purposes of this Pro Rata Right is the ratio of (x) the number of shares of Capital Stock issued from the conversion of all of the Investor's Safes with a "Post-Money Valuation Cap" to (y) the Company Capitalization. The Pro Rata Right described above shall automatically terminate upon the earlier of (i) the initial closing of the Equity Financing; (ii) immediately prior to the closing of a Liquidity Event; or (iii) immediately prior to the Dissolution Event.

Neither this Agreement nor the rights contained herein may be assigned, by operation of law or otherwise, by Investor without the prior written consent of the Company; provided, however, that this Agreement and/or the rights contained herein may be assigned without the Company's consent by the Investor to any other entity who directly or indirectly, controls, is controlled by or is under common control with the Investor, including, without limitation, any general partner, managing member, officer or director of the Investor, or any venture capital fund now or hereafter existing which is controlled by one or more general partners or managing members of, or shares the same management company with, the Investor.

Any provision of this Agreement may be amended, waived or modified upon the written consent of the Company and either (i) the holders of a majority of shares of Capital Stock issued from all Safes converted in connection with the Equity Financing held by the Investor and other Safe holders with Pro Rata Rights pursuant to agreements on the same form as this Agreement (available at http://ycombinator.com/documents), provided that such amendment, waiver or modification treats all such holders in the same manner, or (ii) the Investor. The Company will promptly notify the Investor of any amendment, waiver or modification that the Investor did not consent to. This Agreement is the form available at http://ycombinator.com/documents and the Company and the Investor agree that neither one has modified the form, except to fill in blanks and bracketed terms. The choice of law governing any dispute or claim arising out of or in connection with this Agreement shall be consistent with that set forth in the Investor's Safe.

IN WITNESS WHEREOF, the undersigned have caused this Agreement to be duly executed and delivered.

THE COMPANY:

${v.companyName}

By:_________________________
(Signature)

Name:_________________________
Title:_________________________


INVESTOR:

By:_________________________
(Signature)

Name:_________________________
Title:_________________________`
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

  return `PROMISED OPTIONS AGREEMENT

This Promised Options Agreement (this "Agreement") is made and entered into as of ${formatDate(v.date)}, by and between ${v.companyName} (the "Company") and ${v.recipientName} ("Recipient").

This Agreement memorializes that the Company shall grant to Recipient a stock option grant to purchase shares of the Company's Common Stock (the "Option") on the following terms and conditions, and subject to the Company's Board approval and its incentive equity plan:

Hours Per Week: ${v.hoursPerWeek}
Company ProForma Valuation: $${formatAmount(valuation)}
Per Share ProForma Value: $${formatPerShareValue(perShareValue)}
Options Vesting Per Week: ${formatAmount(vestingPerWeek)}
Term: ${formatAmount(termWeeks)} weeks
Total Options: ${formatAmount(totalOptions)}

Subject to the above, as soon as the Company is set up on Carta, Recipient will receive a formal notice of the Option grant. The exercise price of the shares subject to each Option grant shall be equal to the price determined by the Board in reliance upon a 409A valuation then in effect.

To the extent that Recipient renders services to the Company, all work product generated as part of such services exclusively belongs to the Company without residual rights to Recipient. Each of Recipient and the Company represents and warrants that no third party authorizations, permits, licenses or consents are required to perform their respective obligations under this Agreement.

This Agreement is intended to confirm, in writing, the parties' agreement and is a valid and binding agreement between the parties as of the date first written above.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

THE COMPANY:

${v.companyName}

By:_________________________
(Signature)

Name:_________________________
Title:_________________________


RECIPIENT:

_________________________
(Signature)

${v.recipientName}

Date:_________________________`
}

function advisorAgreement(v: Record<string, string>): string {
  return `ADVISOR AGREEMENT

This Advisor Agreement (this "Agreement") is entered into as of ${formatDate(v.date)}, by and between ${v.companyName}, a Delaware corporation (the "Company"), and ${v.advisorName} ("Advisor").

The parties agree as follows:

1. Services. Advisor agrees to act as an advisor to the Company and to provide advice and assistance to the Company as set forth in Exhibit A and as mutually agreed by the parties (collectively, the "Services").

2. Compensation. Advisor shall be entitled to compensation as set forth in Exhibit A.

3. Expenses. The Company shall reimburse Advisor for reasonable expenses incurred in the course of performing services hereunder, provided, however, that all expenses shall be approved in advance by the Company. As a condition to receipt of reimbursement, Advisor shall be required to submit to the Company reasonable evidence that the amount involved was both reasonable and necessary to the Services provided under this Agreement.

4. Term and Termination. The term of this Agreement shall be for a period of four years from the date hereof and may be renewed by mutual agreement of the parties; provided, however, that this Agreement may be terminated by either party for any reason upon five (5) business days prior written notice. Sections 4, 6 through 10, and 12 of this Agreement shall survive termination or expiration of this Agreement in accordance with their terms.

5. Independent Contractor. Advisor's relationship with the Company will be that of an independent contractor and not that of an employee. Advisor will not be eligible for any employee benefits, nor will the Company make deductions from payments made to Advisor for employment or income taxes, all of which will be Advisor's responsibility. Advisor agrees to indemnify and hold the Company harmless from any liability for, or assessment of, any such taxes imposed on the Company by relevant taxing authorities. Advisor will have no authority to enter into contracts that bind the Company or create obligations on the part of the Company without the prior written authorization of the Company.

6. Nondisclosure of Confidential Information.

(a) Agreement Not to Disclose. Advisor agrees not to use any Confidential Information (as defined below) disclosed to Advisor by the Company for Advisor's own use or for any purpose other than to carry out discussions concerning, and the undertaking of, the Services. Advisor shall not disclose or permit disclosure of any Confidential Information of the Company to third parties. Advisor agrees to take all reasonable measures to protect the secrecy of and avoid disclosure or use of Confidential Information of the Company in order to prevent it from falling into the public domain or the possession of persons other than those persons authorized under this Agreement to have any such information. Advisor further agrees to notify the Company in writing of any actual or suspected misuse, misappropriation or unauthorized disclosure of the Company's Confidential Information which may come to Advisor's attention.

(b) Definition of Confidential Information. "Confidential Information" means any information, technical data or know-how (whether disclosed before or after the date of this Agreement), including, but not limited to, information relating to business and product or service plans, financial projections, customer lists, business forecasts, sales and merchandising, human resources, patents, patent applications, computer object or source code, research, inventions, processes, designs, drawings, engineering, marketing or finance that is marked or designated in writing as confidential or proprietary, or if given orally, is confirmed in writing as having been disclosed as confidential or proprietary within a reasonable time (not to exceed thirty (30) days) after the oral disclosure, or which information would (even if not marked, designated, or confirmed in writing), under the circumstances, appear to a reasonable person to be confidential or proprietary. Confidential Information does not include information, technical data or know-how which: (i) is in the possession of Advisor at the time of disclosure, as shown by Advisor's files and records immediately prior to the time of disclosure; or (ii) becomes part of the public knowledge or literature, not as a direct or indirect result of any improper inaction or action of Advisor.

(c) Exceptions. Notwithstanding the above, Advisor shall not have liability to the Company or any of its subsidiaries with regard to any Confidential Information of the Company which Advisor can prove:

(i) is disclosed with the prior written approval of the Company; or

(ii) is disclosed pursuant to the order or requirement of a court, administrative agency, or other governmental body; provided, however, that Advisor shall provide prompt notice of such court order or requirement to the Company to enable the Company or its appropriate subsidiary to seek a protective order or otherwise prevent or restrict such disclosure.

(d) U.S. Defend Trade Secrets Act. Notwithstanding the foregoing, the U.S. Defend Trade Secrets Act of 2016 ("DTSA") provides that an individual shall not be held criminally or civilly liable under any federal or state trade secret law for the disclosure of a trade secret that is made (i) in confidence to a federal, state, or local government official, either directly or indirectly, or to an attorney; and (ii) solely for the purpose of reporting or investigating a suspected violation of law; or (iii) in a complaint or other document filed in a lawsuit or other proceeding, if such filing is made under seal. In addition, DTSA provides that an individual who files a lawsuit for retaliation by an employer for reporting a suspected violation of law may disclose the trade secret to the attorney of the individual and use the trade secret information in the court proceeding, if the individual (A) files any document containing the trade secret under seal; and (B) does not disclose the trade secret, except pursuant to court order.

7. No Duplication; Return of Materials. Advisor agrees, except as otherwise expressly authorized by the Company, not to make any copies or duplicates of any of the Company's Confidential Information. Any materials or documents that have been furnished by the Company to Advisor in connection with the Services shall be promptly returned by Advisor to the Company, accompanied by all copies of such documentation, within ten days after the earlier of (a) the date on which the Services have been concluded or (b) the date of written request of the Company.

8. No Rights Granted. Nothing in this Agreement shall be construed as granting any rights under any patent, copyright or other intellectual property right of the Company, nor shall this Agreement grant Advisor any rights in or to the Company's Confidential Information, except the limited right to use the Confidential Information in connection with the Services.

9. Assignment of Inventions. To the extent that, in connection with performing the Services, Advisor jointly or solely conceives, develops, or reduces to practice any inventions, original works of authorship, developments, concepts, know-how, improvements or trade secrets, whether or not patentable or registrable under copyright or similar laws, Advisor hereby assigns all rights, titles and interest to such inventions to the Company.

10. Duty to Assist. As requested by the Company, Advisor shall take all steps reasonably necessary to assist the Company in obtaining and enforcing in its own name any patent, copyright or other protection which the Company elects to obtain or enforce for its inventions, original works of authorship, developments, concepts, know-how, improvements and trade secrets. Advisor's obligation to assist the Company in obtaining and enforcing patents, copyrights and other protections shall continue beyond the termination of Advisor's relationship with the Company, but the Company shall compensate Advisor at a reasonable rate after the termination of such relationship for time actually spent at the Company's request providing such assistance.

11. No Conflicts. Advisor represents that Advisor's compliance with the terms of this Agreement and provision of Services hereunder will not violate any duty which Advisor may have to any other person or entity (such as a present or former employer), including obligations concerning providing services to others, confidentiality of proprietary information and assignment of inventions, ideas, patents or copyrights, and Advisor agrees that Advisor will not do anything in the performance of Services hereunder that would violate any such duty. In addition, Advisor agrees that, during the term of this Agreement, prior to performing any services for or otherwise participating in a company developing or commercializing new software, services, methods, devices, or other technology that may be competitive with the Company, Advisor shall first notify the Company in writing. It is understood that in such event, the Company will review whether Advisor's activities are consistent with Advisor continuing to provide Services to the Company.

12. Miscellaneous. Any term of this Agreement may be amended or waived only with the written consent of the parties. This Agreement, including any exhibits hereto, constitutes the sole agreement of the parties and supersedes all oral negotiations and prior writings with respect to the subject matter hereof. Any notice required or permitted by this Agreement shall be in writing and shall be deemed sufficient when delivered personally or by overnight courier or sent by e-mail, or 48 hours after being deposited in the U.S. mail as certified or registered mail with postage prepaid, addressed to the party to be notified at such party's address as set forth on the signature page herein, or as subsequently modified by written notice. The validity, interpretation, construction and performance of this Agreement shall be governed by the laws of the state of California, without giving effect to the principles of conflict of laws. This Agreement may be executed in counterparts, each of which shall be deemed an original, but all of which together will constitute one and the same instrument.

[Signature Page Follows]

The parties have executed this Agreement as of the date first written above.

THE COMPANY:

${v.companyName}

By:_________________________
(Signature)

Name:_________________________
Title:_________________________


ADVISOR:

_________________________
(Signature)

${v.advisorName}

Email: ${v.advisorEmail}


Exhibit A

Services and Compensation

Services

${v.servicesDescription}

Compensation

Subject to the approval of the Company's Board of Directors, Advisor will be granted a nonstatutory option to purchase ${v.numberOfOptions} shares of the Company's common stock. The option will be subject to the terms and conditions applicable to options granted under the Company's Stock Plan (the "Plan"), as described in that plan and the applicable stock option agreement, which Advisor will be required to sign (the "Stock Agreement").

So long as Advisor's Continuous Service Status (as defined in the Plan) does not terminate, the total shares will vest in 18 equal monthly installments thereafter during continuous service, as described in the Stock Agreement. Upon a Change of Control (as defined in the Stock Agreement or Plan), 100% of Advisor's then unvested shares will immediately vest (i.e., single trigger acceleration). The exercise price per share will be equal to the fair market value per share on the date the option is granted, as determined by the Company's Board of Directors in good faith in compliance with applicable guidance in order to avoid having the option be treated as deferred compensation under Section 409A of the Internal Revenue Code of 1986, as amended. There is no guarantee that the Internal Revenue Service will agree with this value. Advisor should consult with Advisor's own tax advisor concerning the tax risks associated with accepting an option to purchase the Company's common stock. Advisor shall have no right to any compensation except as set forth in this Exhibit A Although management of the Company will recommend to the Company's Board of Directors that Advisor be granted the option on the terms set forth herein, by execution of this letter, Advisor acknowledges that Advisor has no right to receive the option or any right to have the option subject to the specific terms set forth herein, unless the grant is approved by the Company's Board of Directors.`
}

function consultingAgreement(v: Record<string, string>): string {
  return `CONSULTING AGREEMENT

Consultant Name: ${v.consultantName} ("Consultant")

Effective Date: ${formatDate(v.date)}

As a condition of becoming retained (or Consultant's consulting relationship being continued) by ${v.companyName}, a Delaware corporation, or any of its current or future subsidiaries, affiliates, successors or assigns (collectively, the "Company"), and in consideration of Consultant's consulting relationship with the Company and receipt of the compensation now and hereafter paid by the Company, Consultant hereby agrees to the following:

1. Consulting Relationship. This Consulting Agreement (this "Agreement") will apply to Consultant's consulting relationship with the Company. If that relationship ends and the Company, within one (1) year thereafter, either employs Consultant or re-engages Consultant as a consultant, this Agreement will also apply to such later employment or consulting relationship, unless the parties hereto otherwise agree in writing. Any employment or consulting relationship between the parties hereto, whether commenced prior to, upon or after the date of this Agreement, is referred to herein as the "Relationship." During the term of this Agreement, Consultant will provide consulting services to the Company as described on Exhibit A hereto (the "Services"). Consultant represents that Consultant is duly licensed (as applicable) and has the qualifications, the experience and the ability to properly perform the Services. Consultant shall use Consultant's reasonable efforts to perform the Services such that the results are satisfactory to the Company.

2. Applicability to Past Activities. The Company and Consultant acknowledge that Consultant may have performed work, activities, services or made efforts on behalf of or for the benefit of the Company, or related to the current or prospective business of the Company in anticipation of Consultant's involvement with the Company, that would have been "Services" if performed during the term of this Agreement, for a period of time prior to the Effective Date of this Agreement (the "Prior Consulting Period"). Accordingly, if and to the extent that, during the Prior Consulting Period: (i) Consultant received access to any information from or on behalf of the Company that would have been Confidential Information (as defined below) if Consultant received access to such information during the term of this Agreement; or (ii) Consultant (a) conceived, created, authored, invented, developed or reduced to practice any item (including any intellectual property rights with respect thereto) on behalf of or for the benefit of the Company, or related to the current or prospective business of the Company in anticipation of Consultant's involvement with the Company, that would have been an Invention (as defined below) if conceived, created, authored, invented, developed or reduced to practice during the term of this Agreement; or (b) incorporated into any such item any pre-existing invention, improvement, development, concept, discovery or other proprietary information that would have been a Prior Invention (as defined below) if incorporated into such item during the term of this Agreement; then any such information shall be deemed "Confidential Information" hereunder and any such item shall be deemed an "Invention" or "Prior Invention" hereunder, and this Agreement shall apply to such activities, information or item as if disclosed, conceived, created, authored, invented, developed or reduced to practice during the term of this Agreement.

3. Fees. As consideration for the Services provided by Consultant and other obligations, the Company shall pay to Consultant the amounts specified in Exhibit B hereto at the times specified therein.

4. Expenses. Consultant shall not be authorized to incur on behalf of the Company any expenses and will be responsible for all expenses incurred while performing the Services except as otherwise agreed to by the Company's CEO. As a condition to receipt of reimbursement, Consultant shall be required to submit to the Company reasonable evidence that the amount involved was both reasonable and necessary to the Services provided under this Agreement.

5. Confidential Information.

(a) Protection of Information. Consultant understands that during the Relationship, the Company intends to provide Consultant with certain information, including Confidential Information (as defined below), without which Consultant would not be able to perform Consultant's duties to the Company. At all times during the term of the Relationship and thereafter, Consultant shall hold in strictest confidence, and not use, except for the benefit of the Company to the extent necessary to perform the Services, and not disclose to any person, firm, corporation or other entity, without written authorization from the Company in each instance, any Confidential Information that Consultant obtains from the Company or otherwise obtains, accesses or creates in connection with, or as a result of, the Services during the term of the Relationship, whether or not during working hours, until such Confidential Information becomes publicly and widely known and made generally available through no wrongful act of Consultant or of others who were under confidentiality obligations as to the item or items involved. Consultant shall not make copies of such Confidential Information except as authorized by the Company or in the ordinary course of the provision of Services.

(b) Confidential Information. Consultant understands that "Confidential Information" means any and all information and physical manifestations thereof not generally known or available outside the Company and information and physical manifestations thereof entrusted to the Company in confidence by third parties, whether or not such information is patentable, copyrightable or otherwise legally protectable. Confidential Information includes, without limitation: (i) Company Inventions (as defined below); and (ii) technical data, trade secrets, know-how, research, product or service ideas or plans, software codes and designs, algorithms, developments, inventions, patent applications, laboratory notebooks, processes, formulas, techniques, biological materials, mask works, engineering designs and drawings, hardware configuration information, agreements with third parties, lists of, or information relating to, employees and consultants of the Company (including, but not limited to, the names, contact information, jobs, compensation, and expertise of such employees and consultants), lists of, or information relating to, suppliers and customers (including, but not limited to, customers of the Company on whom Consultant called or with whom Consultant became acquainted during the Relationship), price lists, pricing methodologies, cost data, market share data, marketing plans, licenses, contract information, business plans, financial forecasts, historical financial data, budgets or other business information disclosed to Consultant by the Company either directly or indirectly, whether in writing, electronically, orally, or by observation.

(c) Third Party Information. Consultant's agreements in this Section 5 are intended to be for the benefit of the Company and any third party that has entrusted information or physical material to the Company in confidence. During the term of the Relationship and thereafter, Consultant will not improperly use or disclose to the Company any confidential, proprietary or secret information of Consultant's former clients or any other person, and Consultant will not bring any such information onto the Company's property or place of business.

(d) Other Rights. This Agreement is intended to supplement, and not to supersede, any rights the Company may have in law or equity with respect to the protection of trade secrets or confidential or proprietary information.

(e) U.S. Defend Trade Secrets Act. Notwithstanding the foregoing, the U.S. Defend Trade Secrets Act of 2016 ("DTSA") provides that an individual shall not be held criminally or civilly liable under any federal or state trade secret law for the disclosure of a trade secret that is made (i) in confidence to a federal, state, or local government official, either directly or indirectly, or to an attorney; and (ii) solely for the purpose of reporting or investigating a suspected violation of law; or (iii) in a complaint or other document filed in a lawsuit or other proceeding, if such filing is made under seal. In addition, DTSA provides that an individual who files a lawsuit for retaliation by an employer for reporting a suspected violation of law may disclose the trade secret to the attorney of the individual and use the trade secret information in the court proceeding, if the individual (A) files any document containing the trade secret under seal; and (B) does not disclose the trade secret, except pursuant to court order.

6. Ownership of Inventions.

(a) Inventions Retained and Licensed. Consultant has attached hereto, as Exhibit C, a complete list describing with particularity all Inventions (as defined below) that, as of the Effective Date: (i) have been created by Consultant or on behalf of Consultant, and/or (ii) are owned exclusively by Consultant or jointly by Consultant with others or in which Consultant has an interest, and that relate in any way to any of the Company's actual or proposed businesses, products, services, or research and development, and which are not assigned to the Company hereunder (collectively "Prior Inventions"); or, if no such list is attached, Consultant represents and warrants that there are no such Inventions at the time of signing this Agreement, and to the extent such Inventions do exist and are not listed on Exhibit C, Consultant hereby irrevocably and forever waives any and all rights or claims of ownership to such Inventions. Consultant understands that Consultant's listing of any Inventions on Exhibit C does not constitute an acknowledgement by the Company of the existence or extent of such Inventions, nor of Consultant's ownership of such Inventions. Consultant further understands that Consultant must receive the formal approval of the Company before commencing Consultant's Relationship with the Company.

(b) Use or Incorporation of Inventions. If in the course of the Relationship, Consultant uses or incorporates into any of the Company's products, services, processes or machines any Invention not assigned to the Company pursuant to Section 6(d) of this Agreement in which Consultant has an interest, Consultant will promptly so inform the Company in writing. Whether or not Consultant gives such notice, Consultant hereby irrevocably grants to the Company a nonexclusive, fully paid-up, royalty-free, assumable, perpetual, worldwide license, with right to transfer and to sublicense, to practice and exploit such Invention and to make, have made, copy, modify, make derivative works of, use, sell, import, and otherwise distribute such Invention under all applicable intellectual property laws without restriction of any kind.

(c) Inventions. Consultant understands that "Inventions" means discoveries, developments, concepts, designs, ideas, know how, modifications, improvements, derivative works, inventions, trade secrets and/or original works of authorship, whether or not patentable, copyrightable or otherwise legally protectable. Consultant understands this includes, but is not limited to, any new product, machine, article of manufacture, biological material, method, procedure, process, technique, use, equipment, device, apparatus, system, compound, formulation, composition of matter, design or configuration of any kind, or any improvement thereon. Consultant understands that "Company Inventions" means any and all Inventions that Consultant or Consultant's personnel may solely or jointly author, discover, develop, conceive, or reduce to practice in connection with, or as a result of, the Services performed for the Company or otherwise in connection with the Relationship, except as otherwise provided in Section 6(g) below.

(d) Assignment of Company Inventions. Consultant will promptly make full written disclosure to the Company, will hold in trust for the sole right and benefit of the Company, and hereby assigns to the Company, or its designee, all of Consultant's right, title and interest throughout the world in and to any and all Company Inventions and all patent, copyright, trademark, trade secret and other intellectual property rights and other proprietary rights therein. Consultant hereby waives and irrevocably quitclaims to the Company or its designee any and all claims, of any nature whatsoever, that Consultant now has or may hereafter have for infringement of any and all Company Inventions. Any assignment of Company Inventions includes all rights of attribution, paternity, integrity, modification, disclosure and withdrawal, and any other rights throughout the world that may be known as or referred to as "moral rights," "artist's rights," "droit moral," or the like (collectively, "Moral Rights"). To the extent that Moral Rights cannot be assigned under applicable law, Consultant hereby waives and agrees not to enforce any and all Moral Rights, including, without limitation, any limitation on subsequent modification, to the extent permitted under applicable law. If Consultant has any rights to the Company Inventions, other than Moral Rights, that cannot be assigned to the Company, Consultant hereby unconditionally and irrevocably grants to the Company during the term of such rights, an exclusive, irrevocable, perpetual, worldwide, fully paid and royalty-free license, with rights to sublicense through multiple levels of sublicensees, to reproduce, distribute, display, perform, prepare derivative works of and otherwise modify, make, have made, sell, offer to sell, import, practice methods, processes and procedures and otherwise use and exploit, such Company Inventions.

(e) Maintenance of Records. Consultant shall keep and maintain adequate and current written records of all Company Inventions made or conceived by Consultant or Consultant's personnel (solely or jointly with others) during the term of the Relationship. The records may be in the form of notes, sketches, drawings, flow charts, electronic data or recordings, laboratory notebooks, or any other format. The records will be available to and remain the sole property of the Company at all times. Consultant shall not remove such records from the Company's place of business or systems except as expressly permitted by Company policy which may, from time to time, be revised at the sole election of the Company for the purpose of furthering the Company's business. Consultant shall deliver all such records (including any copies thereof) to the Company at the time of termination of the Relationship as provided for in Section 7 and Section 8.

(f) Intellectual Property Rights. Consultant shall assist the Company, or its designee, at the Company's expense, in every proper way in securing the Company's, or its designee's, rights in the Company Inventions and any copyrights, patents, trademarks, mask work rights, Moral Rights, or other intellectual property rights relating thereto in any and all countries, including the disclosure to the Company or its designee of all pertinent information and data with respect thereto, the execution of all applications, specifications, oaths, assignments, recordations, and all other instruments that the Company or its designee shall deem necessary in order to apply for, obtain, maintain and transfer, or if not transferable, waive and never assert such rights, and in order to assign and convey to the Company or its designee, and any successors, assigns and nominees the sole and exclusive right, title and interest in and to such Company Inventions, and any copyrights, patents, mask work rights or other intellectual property rights relating thereto. Consultant's obligation to execute or cause to be executed, when it is in Consultant's power to do so, any such instrument or papers shall continue during and at all times after the end of the Relationship and until the expiration of the last such intellectual property right to expire in any country of the world. Consultant hereby irrevocably designates and appoints the Company and its duly authorized officers and agents as Consultant's agent and attorney-in-fact, to act for and in Consultant's behalf and stead to execute and file any such instruments and papers and to do all other lawfully permitted acts to further the application for, prosecution, issuance, maintenance or transfer of letters patent, copyright, mask work and other registrations related to such Company Inventions. This power of attorney is coupled with an interest and shall not be affected by Consultant's subsequent incapacity.

(g) Exception to Assignments. Subject to the requirements of applicable state law, if any, Consultant understands that the Company Inventions will not include, and the provisions of this Agreement requiring assignment of inventions to the Company do not apply to, any invention that qualifies fully for exclusion under the provisions of applicable state law. In order to assist in the determination of which inventions qualify for such exclusion, Consultant will advise the Company promptly in writing, during and for a period of twelve (12) months immediately following the termination of the Relationship, of all Inventions solely or jointly conceived or developed or reduced to practice by Consultant or Consultant's personnel in connection with, or as a result of, the Services performed for the Company during the period of the Relationship.

7. Company Property; Returning Company Documents. Consultant acknowledges that Consultant has no expectation of privacy with respect to the Company's telecommunications, networking or information processing systems (including, without limitation, files, e-mail messages, and voice messages) and that Consultant's activity and any files or messages on or using any of those systems may be monitored or reviewed at any time without notice. Consultant further acknowledges that any property situated on the Company's premises or systems and owned by the Company, including disks and other storage media, filing cabinets or other work areas, is subject to inspection by Company personnel at any time with or without notice. At the time of termination of the Relationship, Consultant will deliver to the Company (and will not keep in Consultant's possession, recreate or deliver to anyone else) any and all devices, records, data, notes, reports, proposals, lists, correspondence, specifications, drawings, blueprints, sketches, laboratory notebooks, materials, flow charts, equipment, other documents or property, or reproductions of any of the aforementioned items developed by Consultant or Consultant's personnel pursuant to the Relationship or otherwise belonging to the Company, its successors or assigns.

8. Termination Certification. In the event of the termination of the Relationship, Consultant shall sign and deliver the "Termination Certification" attached hereto as Exhibit D; however, Consultant's failure to sign and deliver the Termination Certification shall in no way diminish Consultant's continuing obligations under this Agreement.

9. Notice to Third Parties. During the periods of time during which Consultant is restricted in taking certain actions by the terms of Section 10 of this Agreement (the "Restriction Period"), Consultant shall inform any entity or person with whom Consultant may seek to enter into a business relationship (whether as an owner, employee, independent contractor or otherwise) of Consultant's contractual obligations under this Agreement. Consultant acknowledges that the Company may, with or without prior notice to Consultant and whether during or after the term of the Relationship, notify third parties of Consultant's agreements and obligations under this Agreement. Upon written request by the Company, Consultant will respond to the Company in writing regarding the status of Consultant's engagement or proposed engagement with any party during the Restriction Period.

10. Solicitation of Employees, Consultants and Other Parties. As described above, Consultant acknowledges that the Company's Confidential Information includes information relating to the Company's employees, consultants, customers and others, and Consultant will not use or disclose such Confidential Information except as authorized by the Company in advance in writing. Consultant further agrees as follows:

(a) Employees, Consultants. During the term of the Relationship, and for a period of twelve (12) months immediately following the termination of the Relationship for any reason, whether with or without cause, Consultant shall not, directly or indirectly, solicit any of the Company's employees or consultants to terminate their relationship with the Company, or attempt to solicit employees or consultants of the Company, either for Consultant or for any other person or entity.

(b) Other Parties. During the term of the Relationship, Consultant will not influence any of the Company's clients, licensors, licensees or customers from purchasing Company products or services or solicit or influence or attempt to influence any client, licensor, licensee, customer or other person either directly or indirectly, to direct any purchase of products and/or services to any person, firm, corporation, institution or other entity in competition with the business of the Company.

11. Indemnification. Consultant shall indemnify and hold harmless the Company and its affiliates and their directors, officers and employees from and against all taxes, losses, damages, liabilities, costs and expenses, including attorneys' fees and other legal expenses, arising directly or indirectly from or in connection with (i) any negligent, reckless or intentionally wrongful act of Consultant or Consultant's Assistants (as defined below), employees, contractors or agents, (ii) any breach by the Consultant or Consultant's Assistants, employees, contractors or agents of any of the covenants contained in this Agreement, (iii) any failure of Consultant to perform the Services in accordance with all applicable laws, rules and regulations, or (iv) any violation or claimed violation of a third party's rights resulting in whole or in part from the Company's use of the Inventions or other deliverables of Consultant under this Agreement.

12. Limitation of Liability. IN NO EVENT SHALL COMPANY BE LIABLE TO CONSULTANT OR TO ANY OTHER PARTY FOR ANY INDIRECT, INCIDENTAL, SPECIAL OR CONSEQUENTIAL DAMAGES, OR DAMAGES FOR LOST PROFITS OR LOSS OF BUSINESS, HOWEVER CAUSED AND UNDER ANY THEORY OF LIABILITY, WHETHER BASED IN CONTRACT, TORT (INCLUDING NEGLIGENCE) OR OTHER THEORY OF LIABILITY, REGARDLESS OF WHETHER COMPANY WAS ADVISED OF THE POSSIBILITY OF SUCH DAMAGES AND NOTWITHSTANDING THE FAILURE OF ESSENTIAL PURPOSE OF ANY LIMITED REMEDY. IN NO EVENT SHALL COMPANY'S LIABILITY ARISING OUT OF OR IN CONNECTION WITH THIS AGREEMENT EXCEED THE AMOUNTS PAID BY COMPANY TO CONSULTANT UNDER THIS AGREEMENT FOR THE SERVICES, DELIVERABLES OR INVENTIONS GIVING RISE TO SUCH LIABILITY.

13. Term and Termination.

(a) Term. Consultant shall serve as a consultant to the Company for a period as provided in Exhibit A hereto.

(b) Termination for Convenience. Notwithstanding the above, either party may terminate this Agreement at any time upon 10 business days' written notice. In the event of such termination, Consultant shall be paid for any portion of the Services that have been performed prior to the termination.

(c) Termination for Cause. Should either party default in the performance of this Agreement or materially breach any of its obligations under this Agreement, the non-breaching party may terminate this Agreement immediately if the breaching party fails to cure the breach within 5 business days after having received written notice by the non-breaching party of the breach or default.

(d) Survival. Sections 5-12, 13(d), 16 and 18 shall survive termination or expiration of this Agreement in accordance with their terms.

14. Independent Contractor. Consultant's relationship with the Company will be that of an independent contractor and not that of an employee.

(a) Method of Provision of Services. Consultant shall be solely responsible for determining the method, details and means of performing the Services. Consultant may, at Consultant's own expense, employ or engage the services of such employees, subcontractors, partners or agents, as Consultant deems necessary to perform the Services (collectively, the "Assistants"). The Assistants are not and shall not be employees of the Company, and Consultant shall be wholly responsible for the proper performance of the Services by the Assistants such that the results are satisfactory to the Company. Consultant shall expressly advise the Assistants of the terms of this Agreement, and shall require each Assistant to execute and deliver to the Company a Confidential Information and Invention Assignment Agreement substantially in the form acceptable to the Company. In no event shall any of the Services be performed for the Company at the facilities of a third party or using the resources of a third party.

(b) No Authority to Bind Company. Consultant acknowledges and agrees that Consultant and its Assistants have no authority to enter into contracts that bind the Company or create obligations on the part of the Company without the prior written authorization of the Company.

(c) No Benefits. Consultant acknowledges that Consultant and its Assistants shall not be eligible for any Company employee benefits and, to the extent Consultant otherwise would be eligible for any Company employee benefits but for the express terms of this Agreement, Consultant (on behalf of itself and its employees) hereby expressly declines to participate in such Company employee benefits.

(d) Taxes; Indemnification. Consultant shall have full responsibility for all applicable taxes for all compensation paid to Consultant or its Assistants under this Agreement, including any withholding requirements that apply to any such taxes, and for compliance with all applicable labor and employment requirements with respect to Consultant's self-employment, sole proprietorship or other form of business organization, and with respect to the Assistants, including state worker's compensation insurance coverage requirements and any U.S. immigration visa requirements. Consultant agrees to indemnify, defend and hold the Company harmless from any liability for, or assessment of, any claims or penalties or interest with respect to such taxes, labor or employment requirements, including any liability for, or assessment of, taxes imposed on the Company by the relevant taxing authorities with respect to any compensation paid to Consultant or its Assistants or any liability related to the withholding of such taxes.

15. Supervision of Consultant's Services. All of the services to be performed by Consultant, including but not limited to the Services, will be as agreed between Consultant and the Company's CEO. Consultant will be required to report to the CEO concerning the Services performed under this Agreement. The nature and frequency of these reports will be left to the discretion of the CEO.

16. Consulting or Other Services for Competitors. Consultant represents and warrants that Consultant does not presently perform or intend to perform, during the term of the Relationship, consulting or other services for, or engage in or intend to engage in an employment relationship with, companies whose businesses or proposed businesses in any way involve products or services which would be competitive with the Company's products or services, or those products or services proposed or in development by the Company during the term of the Relationship (except for those companies, if any, listed on Exhibit E hereto). If, however, Consultant decides to do so, in advance of accepting such work, Consultant will promptly notify the Company in writing, specifying the organization with which Consultant proposes to consult, become employed by, or to provide services to and to provide information sufficient to allow the Company to determine if such work would conflict with the terms of this Agreement, the interests of the Company or further services which the Company might request of Consultant. If the Company determines that such work conflicts with the terms of this Agreement, the Company reserves the right to terminate this Agreement immediately.

17. Conflicts with this Agreement. Consultant represents and warrants that neither Consultant nor any of the Assistants is under any pre-existing obligation in conflict or in any way inconsistent with the provisions of this Agreement. Consultant represents and warrants that Consultant's performance of all the terms of this Agreement will not breach any agreement to keep in confidence proprietary information acquired by Consultant in confidence or in trust prior to commencement of this Agreement. Consultant represents and warrants that Consultant has the right to disclose and/or or use all ideas, processes, techniques and other information, if any, which Consultant has gained from third parties or in the performance of services for third parties, and which Consultant discloses to the Company or uses in the course of performance of this Agreement, without liability to such third parties. Notwithstanding the foregoing, Consultant shall not bundle with or incorporate into any deliverables provided to the Company hereunder any third party products, ideas, processes, or other techniques, without the express, written prior approval of the Company. Consultant represents and warrants that Consultant has not granted and will not grant any rights or licenses to any intellectual property or technology that would conflict with Consultant's obligations under this Agreement. Consultant will not infringe upon any copyright, patent, trade secret or other property right of any former employer, client or third party in the performance of the Services. Consultant acknowledges and agrees that Consultant has listed on Exhibit E all agreements (e.g., non-competition agreements, non-solicitation of customers agreements, non-solicitation of employees agreements, confidentiality agreements, inventions agreements, etc.), if any, with a current or former client, employer, or any other person or entity, that may restrict Consultant's ability to perform services for the Company or Consultant's ability to recruit or engage customers or service providers on behalf of the Company, or otherwise relate to or restrict Consultant's ability to perform Consultant's duties for the Company or any obligation Consultant may have to the Company. Consultant shall not enter into any written or oral agreement that conflicts with the provisions of this Agreement.

18. Miscellaneous.

(a) Governing Law. The validity, interpretation, construction and performance of this Agreement, and all acts and transactions pursuant hereto and the rights and obligations of the parties hereto shall be governed, construed and interpreted in accordance with the laws of the state of California without giving effect to principles of conflicts of law.

(b) Entire Agreement. This Agreement sets forth the entire agreement and understanding of the parties relating to the subject matter herein and supersedes all prior or contemporaneous discussions, understandings and agreements, whether oral or written, between them relating to the subject matter hereof.

(c) Amendments and Waivers. No modification of or amendment to this Agreement, nor any waiver of any rights under this Agreement, shall be effective unless in writing signed by the parties to this Agreement. No delay or failure to require performance of any provision of this Agreement shall constitute a waiver of that provision as to that or any other instance.

(d) Successors and Assigns. Except as otherwise provided in this Agreement, this Agreement, and the rights and obligations of the parties hereunder, will be binding upon and inure to the benefit of their respective successors, assigns, heirs, executors, administrators and legal representatives. The Company may assign any of its rights and obligations under this Agreement. No other party to this Agreement may assign, whether voluntarily or by operation of law, any of its rights and obligations under this Agreement, except with the prior written consent of the Company.

(e) Notices. Any notice, demand or request required or permitted to be given under this Agreement shall be in writing and shall be deemed sufficient when delivered personally or by overnight courier or sent by email, or 48 hours after being deposited in the U.S. mail as certified or registered mail with postage prepaid, addressed to the party to be notified at such party's address as set forth on the signature page, as subsequently modified by written notice, or if no address is specified on the signature page, at the most recent address set forth in the Company's books and records.

(f) Severability. If one or more of the provisions in this Agreement are deemed void or unenforceable to any extent in any context, such provisions shall nevertheless be enforced to the fullest extent allowed by law in that and other contexts, and the validity and force of the remainder of this Agreement shall not be affected. The Company and Consultant have attempted to limit Consultant's right to use, maintain and disclose the Company's Confidential Information, and to limit Consultant's right to solicit employees and customers only to the extent necessary to protect the Company from unfair competition. Should a court of competent jurisdiction determine that the scope of the covenants contained in Section 10 exceeds the maximum restrictiveness such court deems reasonable and enforceable, the parties intend that the court should reform, modify and enforce the provision to such narrower scope as it determines to be reasonable and enforceable under the circumstances existing at that time. In the event that any court or government agency of competent jurisdiction determines that, notwithstanding the terms of this Agreement specifying Consultant's Relationship with the Company as that of an independent contractor, Consultant's provision of Services to the Company is not as an independent contractor but instead as an employee under the applicable laws, then solely to the extent that such determination is applicable, references in this Agreement to the Relationship between Consultant and the Company shall be interpreted to include an employment relationship, and this Agreement shall not be invalid and unenforceable but shall be read to the fullest extent as may be valid and enforceable under the applicable laws to carry out the intent and purpose of this Agreement.

(g) Remedies. Consultant acknowledges that violation of this Agreement by Consultant may cause the Company irreparable harm, and therefore that the Company will be entitled to seek extraordinary relief in court, including, but not limited to, temporary restraining orders, preliminary injunctions and permanent injunctions without the necessity of posting a bond or other security (or, where such a bond or security is required, that a $1,000 bond will be adequate), in addition to and without prejudice to any other rights or remedies that the Company may have for a breach of this Agreement.

(h) Facilitation of Agreement. Consultant agrees to execute promptly, both during and after the end of the Relationship, any proper oath, and to verify any proper document, required to carry out the terms of this Agreement, upon the Company's written request to do so.

(i) Voluntary Execution. Consultant certifies and acknowledges that Consultant has carefully read all of the provisions of this Agreement, that Consultant understands and has voluntarily accepted such provisions, and that Consultant will fully and faithfully comply with such provisions.

(j) Construction. This Agreement is the result of negotiations between and has been reviewed by each of the parties hereto and their respective counsel, if any; accordingly, this Agreement shall be deemed to be the product of all of the parties hereto, and no ambiguity shall be construed in favor of or against any one of the parties hereto.

(k) Counterparts. This Agreement may be executed in any number of counterparts, each of which when so executed and delivered shall be deemed an original, and all of which together shall constitute one and the same agreement. Execution of a facsimile or scanned copy will have the same force and effect as execution of an original, and a facsimile or scanned signature will be deemed an original and valid signature.

(l) Electronic Delivery. The Company may, in its sole discretion, decide to deliver any documents related to this Agreement or any notices required by applicable law or the Company's Certificate of Incorporation or Bylaws by email or any other electronic means. Consultant hereby consents to (i) conduct business electronically, (ii) receive such documents and notices by such electronic delivery and (iii) sign documents electronically and agrees to participate through an on-line or electronic system established and maintained by the Company or a third party designated by the Company.

[Signature Page Follows]

The parties have executed this Agreement on the respective dates set forth below, to be effective as of the Effective Date first above written.

THE COMPANY:

${v.companyName}

By:_________________________
(Signature)

Name:_________________________
Title:_________________________

CONSULTANT:

_________________________
(Signature)

${v.consultantName}

Address:_________________________

Email:_________________________

Date: ${formatDate(v.signatureDate)}


EXHIBIT A

SERVICES

${v.servicesDescription}

${v.deliverablesDescription}

Deliverables due date: ${formatDate(v.deliverablesDueDate)}


EXHIBIT B

COMPENSATION

Cash: ${v.cashCompensation || "N/A"}

Number of Stock Options: ${v.numberOfOptions || "N/A"}

Other: ${v.otherCompensation || "N/A"}


EXHIBIT C

LIST OF PRIOR INVENTIONS
AND ORIGINAL WORKS OF AUTHORSHIP
EXCLUDED UNDER SECTION 6(a)

The following is a list of all Inventions that, as of the Effective Date: (A) have been created by or on behalf of Consultant, and/or (B) are owned exclusively by Consultant or jointly by Consultant with others or in which Consultant has an interest, and that relate in any way to any of the Company's actual or proposed businesses, products, services, or research and development, and which are not assigned to the Company hereunder:

Title / Date / Identifying Number or Brief Description

Except as indicated above on this Exhibit, Consultant has no inventions, improvements or original works to disclose pursuant to Section 6(a) of this Agreement.

___ Additional sheets attached

Signature of Consultant: _________________________

Print Name of Consultant: _________________________

Date: _________________________


EXHIBIT D

TERMINATION CERTIFICATION

This is to certify that Consultant does not have in Consultant's possession, nor has Consultant failed to return, any devices, records, data, notes, reports, proposals, lists, correspondence, specifications, drawings, blueprints, sketches, laboratory notebooks, flow charts, materials, equipment, other documents or property, or copies or reproductions of any aforementioned items belonging to ${v.companyName}, its subsidiaries, affiliates, successors or assigns (collectively, the "Company").

Consultant further certifies that Consultant has complied with all the terms of the Consulting Agreement signed by Consultant (the "Consulting Agreement"), including the reporting of any Inventions (as defined therein), conceived or made by Consultant or Consultant's personnel (solely or jointly with others) covered by the Consulting Agreement, and Consultant acknowledges Consultant's continuing obligations under the Consulting Agreement.

Consultant further agrees that, in compliance with the Consulting Agreement, Consultant will preserve as confidential all trade secrets, confidential knowledge, data or other proprietary information relating to products, processes, know-how, designs, formulas, developmental or experimental work, computer programs, data bases, other original works of authorship, customer lists, business plans, financial information or other subject matter pertaining to any business of the Company or any of its employees, clients, consultants or licensees.

Consultant further agrees that for twelve (12) months immediately following the termination of Consultant's Relationship with the Company, Consultant shall not either directly or indirectly solicit any of the Company's employees or consultants to terminate their relationship with the Company, or attempt to solicit employees or consultants of the Company, either for Consultant or for any other person or entity.

Further, Consultant agrees that Consultant shall not use any Confidential Information of the Company to influence any of the Company's clients or customers from purchasing Company products or services or to solicit or influence or attempt to influence any client, customer or other person either directly or indirectly, to direct any purchase of products and/or services to any person, firm, corporation, institution or other entity in competition with the business of the Company.

Signature of Consultant: _________________________

Print Name of Consultant: _________________________

Date: _________________________


EXHIBIT E

LIST OF COMPANIES
EXCLUDED UNDER SECTION 16

___ No conflicts

___ Additional Sheets Attached

Signature of Consultant: _________________________

Print Name of Consultant: _________________________

Date: _________________________


EXHIBIT E

RESTRICTIVE AGREEMENTS UNDER SECTION 17

___ None

___ Additional Sheets Attached

Signature of Consultant: _________________________

Print Name of Consultant: _________________________

Date: _________________________`
}

function offerLetter(v: Record<string, string>): string {
  const salaryIncreaseText =
    v.salaryIncreaseClause === "Yes"
      ? ` Upon closing of our next financing round of at least ${v.nextFinancingAmount}, your annual salary will be increased to ${v.updatedAnnualSalary}, if you are still employed with the Company at that time.`
      : ""

  return `${v.companyName}

${formatDate(v.letterDate)}

${v.employeeName}

Re: Employment Offer Letter

Dear ${v.employeeName},

On behalf of ${v.companyName} (the "Company"), I am pleased to offer you employment with the Company in the position of ${v.employeePosition}, starting ${formatDate(v.startDate)} ("Start Date"). In that position, you will report to the CEO.

During your employment, your annual compensation will consist of a fixed annual gross salary of ${v.annualSalary}. Your gross salary will be paid once a month, in accordance with the Company's regular payroll process, and subject to applicable tax and other withholdings.${salaryIncreaseText} You will be an exempt employee, and as such, will not be eligible for any overtime pay. All compensation shall be subject to federal, state and local tax withholdings as required by law.

Stock Options: Subject to the approval of the Company's Board of Directors, and pursuant to the Company's Equity Incentive Plan (the "Plan"), you will be granted an option to purchase shares of the Company's common stock according to the following plan:

You shall receive an initial grant of ${v.numberOfOptions} ("Options") to purchase shares of common stock of the Company ("Shares"), with an exercise price per share equal to the fair market value of the common stock, as determined in good faith by the Board in reliance on a current 409A valuation. The Options have two distinct vesting events, as follows, subject to your continued employment with the Company:

- The "Initial Vesting Event" is when you have been continuously employed by the Company for at least one (1) full year, and on such date you will vest 25% of the Options.

- After the Initial Vesting Event, you will vest Options equal to 1/48th of the Shares on each monthly anniversary of your continuous employment at the Company after the initial vesting event, over the next three years.

Employee Benefits

a. Paid Time Off. You will be entitled to paid time off (PTO), holidays, and sick leave, based on the current PTO policy in effect from time to time.

b. Group Plans. The Company does not provide any benefit plans at this time. Eventually, if and when the Company shall provide such plans, the Company shall provide access to its group plans as available to other similarly situated employees, including medical, dental, vision, subject to any eligibility requirements imposed by such plans.

Pre-employment Conditions.

a. Confidentiality Agreement. By signing and agreeing to this Offer Letter, you also agree to be bound by the terms and conditions of the enclosed standard Employee's Non-Disclosure, Invention Assignment, and Confidential Information Agreement (the "Confidentiality Agreement"). We require that you sign the Confidentiality Agreement and return it to us with this Offer Letter prior to or on your Start Date.

b. Right to Work. For purposes of federal immigration law, in order to work in the United States you will be required to provide to the Company documentary evidence of your identity and eligibility for employment in the United States. Such documentation must be provided to us within three (3) business days of your Start Date, or our employment relationship with you may be terminated.

c. Verification of Information. This offer of employment is also contingent upon the successful verification of the information you provided to the Company during your application process, as well as a general background check performed by the Company to confirm your suitability for employment. By accepting this offer of employment, you warrant that all information provided by you is true and correct to the best of your knowledge, and you expressly release the Company from any claim or cause of action arising out of the Company's verification of such information. By signing this letter, you hereby agree to authorize such a verification and background check and agree to sign any and all documents necessary to enable the Company to conduct this verification and background check.

No Conflicting Obligations. You understand and agree that by accepting this offer of employment, you represent to the Company that your performance will not breach any other agreement to which you are a party and that you have not, and will not during the term of your employment with the Company, enter into any oral or written agreement in conflict with any of the provisions of this letter or the Company's policies. You are not to bring with you to the Company, or use or disclose to any person associated with the Company, any confidential or proprietary information belonging to any former employer or other person or entity with respect to which you owe an obligation of confidentiality under any agreement or otherwise. The Company does not need and will not use such information and we will assist you in any way possible to preserve and protect the confidentiality of proprietary information belonging to third parties. Also, we expect you to abide by any obligations to refrain from soliciting any person employed by or otherwise associated with any former employer and suggest that you refrain from having any contact with such persons until such time as any non-solicitation obligation expires.

Outside Activities. While you render services to the Company, you agree that you will not engage in any other employment, consulting or other business activity without the written consent of the Company. In addition, while you render services to the Company, you will not assist any person or entity in competing with the Company, in preparing to compete with the Company or in hiring any employees or consultants of the Company.

General Obligations. As an employee, you will be expected to adhere to the Company's standards of professionalism, loyalty, integrity, honesty, reliability and respect for all. You will also be expected to comply with the Company's policies and procedures. The Company is an equal opportunity employer.

At-Will Employment. Employment with the Company is for no specific period of time. Your employment with the Company will be on an "at will" basis, meaning that either you or the Company may terminate your employment at any time for any reason or no reason. The Company also reserves the right to modify or amend the terms of your employment at any time for any reason. Any contrary representations which may have been made to you are superseded by this offer. This is the full and complete agreement between you and the Company on this term. Although your job duties, title, compensation and benefits, as well as the Company's personnel policies and procedures, may change from time to time, the "at will" nature of your employment may only be changed in an express written agreement approved by the Company's Board of Directors.

Withholdings. All forms of compensation paid to you as an employee of the Company shall be less all applicable withholdings.

This letter supersedes and replaces any prior understandings or agreements, whether oral, written or implied, between you and the Company regarding the matters described in this letter. This letter will be governed by the laws of California, without regard to its conflict of law provisions.

Sincerely,

THE COMPANY:

${v.companyName}

By:_________________________
(Signature)

Name:_________________________
Title:_________________________

***********************

I hereby agree to and accept employment with the Company on the terms and conditions set forth in this offer letter.

_________________________
${v.employeeName}

Dated: ${formatDate(v.signatureDate)}`
}

/** The Employee Non-Solicitation and Residuals clauses are both optional and, when omitted, every
 *  section after them renumbers down — so sections are built as an ordered array and numbered by
 *  index rather than hardcoded, unlike every other renderer in this file. */
function ndaAgreement(v: Record<string, string>): string {
  const sections: string[] = [
    `Definition of Confidential Information. "Confidential Information" means information and physical material not generally known or available outside Discloser and information and physical material entrusted to Discloser in confidence by third parties. Confidential Information includes, without limitation: technical data, trade secrets, know-how, research, product or service ideas or plans, software codes and designs, algorithms, developments, inventions, patent applications, laboratory notebooks, processes, formulas, techniques, mask works, engineering designs and drawings, hardware configuration information, agreements with third parties, lists of, or information relating to, employees and consultants of the Discloser (including, but not limited to, the names, contact information, jobs, compensation, and expertise of such employees and consultants), lists of, or information relating to, suppliers and customers, price lists, pricing methodologies, cost data, market share data, marketing plans, licenses, contract information, business plans, financial forecasts, historical financial data, budgets or other business information disclosed by Discloser (whether by oral, written, graphic or machine-readable format), which Confidential Information is designated in writing to be confidential or proprietary, or if given orally, is confirmed in writing as having been disclosed as confidential or proprietary within a reasonable time (not to exceed thirty (30) days) after the oral disclosure, or which information would, under the circumstances, appear to a reasonable person to be confidential or proprietary. Notwithstanding any failure to so identify it, however, all of the Company's non-public materials disclosed to Counterparty under this Agreement shall be Confidential Information of the Company and all of Counterparty's non-public materials disclosed to Company under this Agreement shall be Confidential Information of Counterparty.`,
    `Nondisclosure of Confidential Information. Recipient shall not use any Confidential Information disclosed to it by Discloser for its own use or for any purpose other than to carry out discussions concerning, and the undertaking of, the Relationship. Recipient shall not disclose or permit disclosure of any Confidential Information of Discloser to third parties or to employees of Recipient, other than directors, officers, employees, consultants and agents of Recipient who are required to have the information in order to carry out the discussions regarding the Relationship. Recipient shall take reasonable measures to protect the secrecy of and avoid disclosure or use of Confidential Information of Discloser in order to prevent it from falling into the public domain or the possession of persons other than those persons authorized under this Agreement to have any such information. Such measures shall include the degree of care that Recipient utilizes to protect its own Confidential Information of a similar nature. Recipient shall notify Discloser of any misuse, misappropriation or unauthorized disclosure of Confidential Information of Discloser which may come to Recipient's attention.`,
    `Exceptions. Notwithstanding the above, information disclosed hereunder shall not be considered "Confidential Information" as defined herein where Recipient can prove that such information:

(a) was in the public domain at the time it was disclosed or has entered the public domain through no fault of Recipient;

(b) was known to Recipient, without restriction, at the time of disclosure, as demonstrated by files in existence at the time of disclosure;

(c) becomes known to Recipient, without restriction, from a source other than Discloser without breach of this Agreement by Recipient and otherwise not in violation of Discloser's rights;

(d) is disclosed with the prior written approval of Discloser; or

(e) is disclosed pursuant to the order or requirement of a court, administrative agency, or other governmental body; provided, however, that Recipient shall provide prompt notice of such court order or requirement to Discloser to enable Discloser to seek a protective order or otherwise prevent or restrict such disclosure.`,
    `Return or Destruction of Materials. Recipient shall, except as otherwise expressly authorized by Discloser, not make any copies or duplicates of any Confidential Information. Any materials or documents that have been furnished by Discloser to Recipient in connection with the Relationship, together with all copies of such documentation (if any), shall be promptly returned or destroyed by Recipient within ten (10) days after (a) the Relationship has been rejected or concluded or (b) the written request of Discloser; provided, however, that Recipient may retain copies of such materials or documents that are stored on Recipient's IT backup and disaster recovery systems until the ordinary course deletion thereof.`,
    `No Rights Granted. Nothing in this Agreement shall be construed as granting any rights under any patent, copyright or other intellectual property right of Discloser, nor shall this Agreement grant Recipient any rights in or to Discloser's Confidential Information other than the limited right to review such Confidential Information solely for the purpose of determining whether to enter into the Relationship. Nothing in this Agreement requires the disclosure of any Confidential Information, which shall be disclosed, if at all, solely at Discloser's option. Nothing in this Agreement requires the Discloser to proceed with the Relationship or any transaction in connection with which the Confidential Information may be disclosed.`,
    `No Representations Made. Recipient acknowledges that neither Discloser, nor any of its representatives, in the course of providing the Confidential Information as contemplated hereunder, is making any representation or warranty (express or implied) as to the accuracy or completeness of any such information, and Recipient assumes full responsibility for all conclusions derived from such information. Recipient shall be entitled to, and shall, rely solely on representations and warranties made in a definitive agreement, if any, relating to the Relationship.`,
    `No Reverse Engineering. Recipient shall not modify, reverse engineer, decompile, create other works from or disassemble any software programs contained in the Confidential Information of Discloser unless permitted in writing by Discloser.`,
    `Restrictions on Export. Recipient shall not export, directly or indirectly, any technical data acquired from Discloser pursuant to this Agreement or any product utilizing any such data to any country for which the U.S. Government or any agency thereof at the time of export requires an export license or other government approval without first obtaining such license or approval.`,
    `No Publicity. Neither party shall, without the prior consent of the other party, disclose to any other person the fact that Confidential Information of Discloser has been and/or may be disclosed under this Agreement, that discussions or negotiations are taking place between the parties, or any of the terms, conditions, status or other facts with respect thereto, except as required by law and then only with prior notice as soon as possible to the other party.`,
    `Notice of Compelled Disclosure. In the event that Recipient or any person to whom Recipient or its representatives transmit or have transmitted Confidential Information become legally compelled (by oral questions, interrogatories, requests for information or documents, subpoenas, civil investigative demands or otherwise) to disclose any such Confidential Information, the Recipient shall provide the Discloser with prompt written notice so that the Discloser may seek a protective order or other appropriate remedy, or both, or waive compliance with the provisions of this Agreement. In the event that the Discloser is unable to obtain a protective order or other appropriate remedy, or if it so directs the Recipient, the Recipient shall furnish only that portion of the Confidential Information that the Recipient is advised by written opinion of its counsel is legally required to be furnished by it and shall exercise its reasonable best efforts to obtain reliable assurance that confidential treatment shall be accorded such Confidential Information.`,
  ]

  if (v.includeNonSolicitation === "Yes") {
    sections.push(`Solicitation of Employees, Consultants and Other Parties. Recipient acknowledges and agrees that Discloser's Confidential Information includes information relating to Discloser's employees, consultants, customers and others and that Recipient may not use or disclose such Confidential Information except as permitted by this Agreement or authorized by Discloser. Recipient further agrees as follows:

(a) Employees, Consultants. For a period of twelve (12) months following the date of this Agreement, Recipient shall not use any Confidential Information of Discloser to directly or indirectly solicit, induce, recruit or encourage any of Discloser's employees or consultants to terminate their relationship with Discloser, or attempt to solicit, induce, recruit, encourage or take away employees or consultants of Discloser, either for itself or for any other person or entity.

(b) Other Parties. For a period of twelve (12) months following the date of this Agreement, Recipient shall not use any Confidential Information of Discloser to negatively influence any of Discloser's clients, licensors, licensees or customers from purchasing Discloser products or services or to solicit or influence or attempt to influence any client, licensor, licensee, customer or other person either directly or indirectly, to direct any purchase of products and/or services to any person, firm, corporation, institution or other entity in competition with the business of Discloser.`)
  }

  if (v.includeResiduals === "Yes") {
    sections.push(`Residuals. No person shall acquire any intellectual property rights under this Agreement (including, but not limited to, patent, copyright, trade secret and trademark rights) except the limited rights necessary to carry out the purposes set forth in this Agreement. Notwithstanding anything herein to the contrary, Counterparty recognizes that Company may in the future develop products or services related to or similar to the subject matter of Confidential Information disclosed under this Agreement. Accordingly, Company may use Residuals for any purpose, including without limitation, use in the acquisition, development, manufacture, promotion, sale, or maintenance of products and services; provided that this right to Residuals does not represent a license under any intellectual property or proprietary rights of Counterparty. The term "Residuals" means information that is retained in the unaided memories of Company's employees or representatives who have had access to Confidential Information pursuant to the terms of this Agreement. A person's memory is unaided if such person has not intentionally memorized the Confidential Information for the purpose of retaining and subsequently using or disclosing it. The Counterparty waives any right to allege willful infringement based on notice to or knowledge by Company of any patent identified by the Counterparty to Company (a) under this Agreement or (b) in any communication related to the transaction prior to the effective date of this Agreement.`)
  }

  sections.push(
    `Common Interest Agreement. To the extent that any Confidential Information provided or made available hereunder may include material subject to the attorney-client privilege, work product doctrine or any other applicable privilege concerning pending or threatened legal proceedings or governmental investigations, Recipient and Discloser understand and agree that they have a commonality of interest with respect to such matters and it is their desire, intention and mutual understanding that the sharing of such material is not intended to, and shall not, waive or diminish in any way the confidentiality of such material or its continued protection under the attorney-client privilege, work product doctrine or other applicable privilege. All Confidential Information provided or made available by Discloser that is entitled to protection under the attorney-client privilege, work product doctrine or other applicable privilege shall remain entitled to such protection under these privileges, this Agreement, and under the joint defense doctrine. Nothing in this Agreement obligates Discloser to reveal material subject to the attorney-client privilege, work product doctrine or any other applicable privilege.`,
    `Term. The foregoing commitments of each party shall survive any termination of the Relationship between the parties, and shall continue for a period terminating five (5) years from the date on which Confidential Information is last disclosed under this Agreement.`,
    `Independent Contractors. The parties are independent contractors, and nothing contained in this Agreement shall be construed to constitute the parties as partners, joint venturers, co-owners or otherwise as participants in a joint or common undertaking.`,
    `Remedies. Each party's obligations set forth in this Agreement are necessary and reasonable in order to protect Discloser and its business. Due to the unique nature of Discloser's Confidential Information, monetary damages may be inadequate to compensate Discloser for any breach by Recipient of its covenants and agreements set forth in this Agreement. Accordingly, the parties each agree and acknowledge that any such violation or threatened violation may cause irreparable injury to Discloser and, in addition to any other remedies that may be available, in law, in equity or otherwise, Discloser shall be entitled to obtain injunctive relief against the threatened breach of this Agreement or the continuation of any such breach by Recipient.`,
    `Miscellaneous.

(a) Governing Law; Jurisdiction. The validity, interpretation, construction and performance of this Agreement, and all acts and transactions pursuant hereto and the rights and obligations of the parties hereto shall be governed, construed and interpreted in accordance with the laws of the state of ${v.choiceOfLawState} without giving effect to principles of conflicts of law. Each of the parties hereto consents to the exclusive jurisdiction and venue of the courts of ${v.choiceOfLawState}.

(b) Entire Agreement. This Agreement sets forth the entire agreement and understanding of the parties relating to the subject matter herein and supersedes all prior or contemporaneous discussions, understandings and agreements, whether oral or written, between them relating to the subject matter hereof.

(c) Amendments and Waivers. No modification of or amendment to this Agreement, nor any waiver of any rights under this Agreement, shall be effective unless in writing signed by the parties to this Agreement. No delay or failure to require performance of any provision of this Agreement shall constitute a waiver of that provision as to that or any other instance.

(d) Successors and Assigns. Except as otherwise provided in this Agreement, this Agreement, and the rights and obligations of the parties hereunder, will be binding upon and inure to the benefit of their respective successors, assigns, heirs, executors, administrators and legal representatives. The Company may assign any of its rights and obligations under this Agreement. No other party to this Agreement may assign, whether voluntarily or by operation of law, any of its rights and obligations under this Agreement, except with the prior written consent of the Company. Notwithstanding the foregoing, Confidential Information of Discloser may not be assigned without the prior written consent of Discloser, unless the assignee shall be the successor entity to the assignor upon the dissolution of the assignor in its present form.

(e) Notices. Any notice, demand or request required or permitted to be given under this Agreement shall be in writing and shall be deemed sufficient when delivered personally or by overnight courier or sent by email, or 48 hours after being deposited in the U.S. mail as certified or registered mail with postage prepaid, addressed to the party to be notified at such party's address as set forth on the signature page, as subsequently modified by written notice, or if no address is specified on the signature page, at the most recent address set forth in the Company's books and records.

(f) Severability. If one or more provisions of this Agreement are held to be unenforceable under applicable law, the parties agree to renegotiate such provision in good faith. In the event that the parties cannot reach a mutually agreeable and enforceable replacement for such provision, then (i) such provision shall be excluded from this Agreement, (ii) the balance of the Agreement shall be interpreted as if such provision were so excluded and (iii) the balance of the Agreement shall be enforceable in accordance with its terms.

(g) Construction. This Agreement is the result of negotiations between and has been reviewed by each of the parties hereto and their respective counsel, if any; accordingly, this Agreement shall be deemed to be the product of all of the parties hereto, and no ambiguity shall be construed in favor of or against any one of the parties hereto.

(h) Counterparts. This Agreement may be executed in any number of counterparts, each of which when so executed and delivered shall be deemed an original, and all of which together shall constitute one and the same agreement. Execution of a facsimile or scanned copy will have the same force and effect as execution of an original, and a facsimile or scanned signature will be deemed an original and valid signature.`,
  )

  const numberedSections = sections.map((s, i) => `${i + 1}. ${s}`).join("\n\n")

  return `${v.companyName}

MUTUAL NONDISCLOSURE AGREEMENT

This Mutual Nondisclosure Agreement (this "Agreement") is made as of ${formatDate(v.date)}, by and between ${v.companyName}, a Delaware corporation (the "Company"), and ${v.counterpartyName} ("Counterparty"). Each party has disclosed and/or may further disclose its Confidential Information (as defined below) to the other in connection with the Relationship (as defined below) pursuant to the terms and conditions of this Agreement. As used herein, the term "Discloser" shall refer to the Company whenever the context refers to the Company's Confidential Information being disclosed to Counterparty, which is referred to as "Recipient" in that context. Conversely, the term "Discloser" shall refer to Counterparty whenever the context refers to Counterparty's Confidential Information being disclosed to the Company, which is referred to as "Recipient" in that context.

RECITALS

The parties wish to explore a possible business opportunity of mutual interest (the "Relationship") in connection with which Discloser has disclosed and/or may further disclose its Confidential Information (as defined below) to Recipient. This Agreement is intended to allow the parties to continue to discuss and evaluate the Relationship while protecting Discloser's Confidential Information (including Confidential Information previously disclosed to Recipient) against unauthorized use or disclosure.

AGREEMENT

In consideration of the premises and mutual covenants herein, the parties hereby agree as follows:

${numberedSections}

[Signature Page Follows]

The parties have executed this Mutual Nondisclosure Agreement as of the date first above written.

THE COMPANY:

${v.companyName}

By:_________________________
(Signature)

Name:_________________________
Title:_________________________

Address:

_________________________

__________ ______

United States


COUNTERPARTY:

${v.counterpartyName}

By:_________________________
(Signature)

Name:_________________________
Title:_________________________

Address:

_________________________

_________________________

Email:_________________________`
}

function pilotProgramAgreement(v: Record<string, string>): string {
  return `Pilot Program Agreement

This Pilot Program Agreement (the "Agreement") is made on ${formatDate(v.date)} ("Effective Date"), by and between ${v.companyName} ("Company") and ${v.customerName} ("Customer") for the purpose of Customer's use of Company's beta service offering.

1. License Grant. Subject to the terms and conditions of this Agreement, Company grants Customer a nonexclusive, nontransferable license to use the Company software ("Service") as set forth on Exhibit A.

2. Proprietary Rights: Confidentiality; Restrictions. Customer acknowledges that the Service contains confidential information and trade secrets of Company. Customer agrees that it will at all times hold in strict confidence and not disclose Confidential Information (as defined below) to any third party except as approved in writing by Company and will use the Confidential Information for no purpose other than evaluating the Service. Customer shall only permit access to Confidential Information to those of its employees having a need-to-know and who have signed confidentiality agreements or are otherwise bound by confidentiality obligations at least as restrictive as those contained herein. Customer will immediately report any violation of this provision to Company and shall employ all reasonable means to mitigate any damages or losses that Company may incur as a result of any such violation. "Confidential Information" means all non-public materials and information provided or made available by Company to Customer, including products and services, the results of any performance or functional evaluation or test of the Service, information regarding technology, know-how, processes, software programs, research, development, and information Company provides. After Customer's evaluation of the Service is complete, or upon request of Company, Customer shall promptly return to Company the Service and all copies thereof in the form provided by Company or upon request by Company destroy the Service and all copies thereof and certify in writing that it has been destroyed.

Customer agrees that nothing contained in this Agreement shall be construed as granting any ownership rights to any Confidential Information disclosed pursuant to this Agreement, or to any invention or any patent, copyright, trademark, or other intellectual property right derived from the Confidential Information. Customer shall not make, have made, use or sell for any purpose any product or other item using, incorporating or derived from any Confidential Information or the Service. Customer will not modify, reverse engineer, decompile, create other works from, or disassemble any software programs contained in the Confidential Information or the Service.

3. Acknowledgement of Beta Service. This Service is a beta release offering and is not at the level of performance of a commercially available product offering. The Service may not operate correctly and may be substantially modified prior to first commercial release, or at Company's option may not be released commercially in the future.

4. Warranty. THE SERVICE AND DOCUMENTATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, AND COMPANY DISCLAIMS ALL WARRANTIES, EXPRESS, IMPLIED, OR STATUTORY, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT OF THIRD PARTY RIGHTS, MERCHANTABILITY, OR FITNESS FOR A PARTICULAR PURPOSE. NO ORAL OR WRITTEN ADVICE OR CONSULTATION GIVEN BY COMPANY, ITS AGENTS OR EMPLOYEES WILL IN ANY WAY GIVE RISE TO A WARRANTY. THE ENTIRE RISK ARISING OUT OF THE USE OR PERFORMANCE OF THE SERVICE REMAINS WITH CUSTOMER.

5. Limitation of Liability. COMPANY SHALL NOT BE LIABLE FOR LOSS OF USE, LOST PROFIT, COST OF COVER, LOSS OF DATA, BUSINESS INTERRUPTION, OR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, PUNITIVE, SPECIAL, OR EXEMPLARY DAMAGES ARISING OUT OF OR RELATED TO THE SERVICE OR THIS AGREEMENT, HOWEVER CAUSED AND REGARDLESS OF THE FORM OF ACTION, WHETHER IN CONTRACT, TORT (INCLUDING NEGLIGENCE) STRICT LIABILITY, OR OTHERWISE, EVEN IF SUCH PARTIES HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. IN NO EVENT WILL COMPANY'S AGGREGATE CUMULATIVE LIABILITY FOR ANY CLAIMS ARISING OUT OF OR RELATED TO THIS AGREEMENT EXCEED THE AMOUNT CUSTOMER ACTUALLY PAID COMPANY UNDER THIS AGREEMENT (IF ANY).

6. Feedback. Customer will provide reasonable feedback to Company concerning the features and functionality of the Service. If Customer provides feedback to Company, all such feedback will be the sole and exclusive property of Company. Customer hereby irrevocably transfers and assigns to Company and agrees to irrevocably assign and transfer to Company all of Customer's right, title, and interest in and to all feedback including all intellectual property rights therein (collectively, "Feedback"). Customer will not earn or acquire any rights or licenses in the Service or in any Feedback on account of this Agreement or Customer's performance under this Agreement, even if Company incorporates any feedback into the Service.

7. Termination. This Agreement will terminate as provided in Exhibit A, or sooner if either party provides written notice of termination to the other party. All parties' obligations survive termination.

8. General. Customer may not assign or transfer any rights or obligations under this Agreement without the prior written consent of Company. This Agreement constitutes the entire Agreement between the parties relating to this subject matter and supersedes all prior or simultaneous representations, discussions, negotiations, and Agreements, whether written or oral. If any provision of this Agreement is held invalid or unenforceable by a court of competent jurisdiction, such provision will be construed so as to be enforceable to the maximum extent permissible by law, and the remaining provisions of the Agreement will remain in full force and effect. The waiver of any breach or default will not constitute a waiver of any other right hereunder or of any subsequent breach or default. All notices required or permitted under this Agreement must be in writing and in each instance will be deemed given upon receipt. This Agreement shall be governed by and construed in accordance with the laws of California. In the event of a dispute, the prevailing party shall be entitled to attorneys' fees and costs. Customer hereby agrees that breach of this Agreement will cause Company irreparable damage for which recovery of damages would be inadequate, and that Company shall therefore be entitled to obtain timely injunctive relief under this Agreement, as well as such further relief as may be granted by a court of competent jurisdiction.

This Agreement may be signed in one or more counterparts, in writing or via PDF or Docusign. This Agreement shall be effective as of the date first written above.


THE COMPANY:

${v.companyName}

By:_________________________
(Signature)

Name:_________________________
Title:_________________________


CUSTOMER:

${v.customerName}

_________________________
(Signature)

${v.customerSignerName}, ${v.customerSignerTitle}
Email: ${v.customerEmail}


Exhibit A

Services

Background

${v.pilotBackground}

Pilot Program

Service:

${v.serviceDescription}

Parameters:

${v.pilotParameters}

Duties:

${v.pilotDuties}

Term:

${v.pilotTerm}

Program Costs and Fees

${v.pilotFee}`
}

/** Company/product name, effective date, and the beta-service framing are all fixed by the source
 *  template — the only two genuine judgment calls are gated by explicit user choices rather than
 *  guessed: (1) the source document contradicts itself on paid vs. free (the Subscription/Free
 *  Trial language assumes paid, but "LICENSE AND ACCESS" flatly states no fees are charged), so
 *  `isPaidService` picks one consistent framing; (2) "OUR TECHNOLOGY"/"USE AND OUTPUT LIMITATIONS"
 *  assume the product has LLM features, so `usesAI` gates them out entirely when it doesn't. */
function userAgreement(v: Record<string, string>): string {
  const isPaid = v.isPaidService === "Paid subscription"
  const usesAI = v.usesAI === "Yes"

  const freeTrialsSection = isPaid
    ? `Free Trials. Company reserves the right to provide free trials to the Company Service ("Free Trials"). Unless otherwise stated, the Free Trial will be limited to a period of thirty (30) days. Following the expiration of the Free Trial period, the paid subscription will commence, unless You provide written notice of Your intent to terminate such subscription.

`
    : ""

  const paymentMethodClause = isPaid ? " and have a valid payment method associated with it" : ""

  const licenseFeeSentence = isPaid
    ? "Company charges fees for the Company Service as set forth in the applicable order form or subscription plan."
    : "Company is not charging You any fees to use the Company Service."

  const aiSections = usesAI
    ? `OUR TECHNOLOGY

${v.companyName} utilizes multiple Large Language Models (LLMs). An LLM is an advanced artificial intelligence system designed to process and generate human-like text based on the information it has been trained on. Different LLMs power Company's Document Check, Co-Pilot and Automated Transactions. These tools provide users with documents, insights, suggestions, and contextual information during group chats and other interactions.

While the LLM is highly sophisticated, it is not perfect and may:

Generate inaccurate, outdated, or incomplete information.

"Hallucinate" by producing plausible-sounding but incorrect or nonsensical outputs.

Provide information or insights that may not apply to your specific context.

Users should independently verify any information or advice provided by the LLM and should not solely rely on its outputs for critical decisions.

Company does not take responsibility for any consequences resulting from the use of information generated by the LLM. This includes, but is not limited to, financial, legal, or other professional decisions based on insights or recommendations provided by the LLM. Users acknowledge and accept this limitation when engaging with Company's AI functionalities.

The LLM is constantly being updated and improved to enhance its accuracy and performance. However, due to the evolving nature of AI and the limitations of machine learning, errors and inconsistencies may still occur.

USE AND OUTPUT LIMITATIONS

By using Company, you agree to:

Treat outputs from the LLM as informational only, not as guaranteed facts.

Use your own judgment and discretion when interpreting or acting upon the LLM's responses.

If you encounter incorrect or problematic information, we encourage you to report it to help us improve our services.

`
    : ""

  return `USER AGREEMENT

By using Company through its website, or any applications that are the property of ${v.companyName} ("Company"), you agree to follow and be bound by this user agreement (the "User Agreement") and agree to comply with all applicable laws and regulations. In this User Agreement, the words "you" and "your" refer to each customer, website visitor, or user, "we", "us" and "our" refer to Company and "Services" refers to all services provided by us including our website, any applications or application plug-ins. Please read the User Agreement carefully prior to using any Company Services.

It is your responsibility to review this User Agreement periodically. If at any time you find this User Agreement unacceptable or if you do not agree to this User Agreement, please do not use this website or any applications. We may revise this User Agreement at any time without notice to you. If you have any questions about this User Agreement, please contact us at ${v.companyEmail}.

SERVICE

Subscription to the Company Service. Subject to the terms and conditions of this Agreement, Company hereby grants You a non-sublicensable, non-transferable, non-exclusive subscription to access and use the Company Service solely for Your internal business purposes, during the subscription period set forth in the applicable order form.

Support. Subject to the terms of this Agreement, Company shall use commercially reasonable efforts to (a) provide the Company Service in accordance with its historic levels of availability; and (b) provide 9am – 5pm (PST) email support, excluding federal holidays.

${freeTrialsSection}Subscriber's Use of the Company Service

Access and Security Guidelines. You will be provided access to and use of the Company Service through confidential account credentials. You will be responsible for all uses of its account, except to the extent caused by Company's negligence. You will promptly notify Company of any unauthorized use or access to its account. User seats may not be shared amongst other users.

Restrictions. You will not, and will not permit any other party to: (a) reverse engineer, disassemble or decompile any component of the Company Platform; (b) interfere in any manner with the operation of the Company Service, or the Company Platform or the hardware and network used to operate the Company Service; (c) sublicense any of Subscriber's rights under this Agreement, or otherwise use the Company Service for the benefit of a third party or to operate a service bureau; (d) modify, copy or make derivative works based on any part of the Company Platform; or (e) otherwise use the Company Service in any manner that exceeds the scope of use permitted by Company.

PRIVACY

Please also review our Privacy Policy, which is incorporated herein by reference, which also governs your use of Company website and Services, and to understand our practices.

Company Platform and Technology. You acknowledge that Company retains all right, title and interest in and to the Services and all software and all Company proprietary information and technology used by Company or provided to You in connection with the Company Service (the "Company Technology"), and that the Company Technology is protected by intellectual property rights owned by or licensed to Company. Other than as expressly set forth in this Agreement, no license or other rights in the Company Technology are granted to You. You hereby grant Company a royalty-free, worldwide, transferable, sublicensable, irrevocable, perpetual license to use or incorporate into the Company Service any suggestions, enhancement requests, recommendations or other feedback provided by You, including Users, relating to the Company Service. Company shall not identify You as the source of any such feedback.

User Data. You retain all right, title and interest in and to Your data ("Data"). Your Data includes any materials that You may give to Company, including uploaded files or pasted text in the Company chat. You hereby grant to Company a non-exclusive, worldwide, royalty-free and fully paid-up license to access and use Your Data to provide the Company Services to You. You represent and warrant that you have all necessary rights to grant Company the foregoing licenses.

Data Security. Company currently utilizes Amazon Web Services, a reputable hosting services provider, to store all Your Data; provided, that, Company may utilize other hosting service providers of similar repute, such as GCP or Microsoft Azure. In the event Company becomes aware of any loss or unauthorized access, disclosure or use of any Your Data ("Security Breach"), Company will (i) promptly notify You in writing of such Security Breach, and (ii) take reasonable steps to identify the cause of such Security Breach, minimize the harm associated therewith and prevent reoccurrence thereof. Any notification of any Security Breach will describe, to the extent known, details of the Security Breach, including steps taken to mitigate the potential risks.

Performance Data. Company retains all right, title and interest in and to the performance Data, and may use performance Data for any lawful purpose.

OWNERSHIP

This website and applications are owned and operated by Company. Company owns all right, title and interest in and to, or has the right to use, the materials provided on this website and applications, including but not limited to data, information, documents, logos, graphics, sounds, and images. None of such material may be copied, reproduced, republished, downloaded, uploaded, posted, displayed, transmitted or distributed in any way and nothing on this website or on any applications shall be construed to confer any license under any of Company's intellectual property rights, whether by estoppel, implication or otherwise. Any rights not expressly granted herein are reserved by Company.

LICENSE AND ACCESS

${licenseFeeSentence} Subject to your compliance with this User Agreement, Company grants you a non-exclusive and non-transferable license (the "License") to use the website and any Services purchased herein. This license does not include any resale or commercial use of any Company service, or its contents. No Company service, nor any part of Company service, may be reproduced, duplicated, copied, sold, resold, decompiled, reverse engineered, or otherwise exploited for any commercial purpose without the express written consent of Company. You may not disclose any Company copyrights, patents, trademarks, logos, or other proprietary information, without Company's express written consent. You may not misuse Company's services. You may only use Company's services as permitted by law. You shall not scrape any information from the website including customer data and shall not harvest personal information about other users from Company. The licenses granted by Company shall terminate if you do not comply with this User Agreement.

${aiSections}THIRD PARTY CONTENT

This website and applications may contain links to websites controlled by parties other than Company (hereinafter referred to as "Third Party Content"). Company is not responsible for and does not endorse or accept any responsibility for the availability, contents, products, services or use of any Third Party Content, any website accessed from a Third Party Content or any changes or updates to such sites. Company makes no guarantees about the content or quality of the products or services provided by such sites. Company is not responsible for webcasting or any other form of transmission received from any Third Party Content. Company is providing these links to you only as a convenience, and the inclusion of any link does not imply endorsement by Company of the Third Party Content.

CREATING AN ACCOUNT

You may need to create your own Company account to use certain Company services. In case you provide any information in connection with use of Company website or Service, you grant Company a worldwide, royalty-free, nonexclusive, and fully sublicensable license to use, distribute, reproduce, modify, publish, and translate this personal information solely for the purpose of enabling your use of the applicable service.

You may further be required to log into your account${paymentMethodClause}. You are responsible for maintaining the confidentiality of your account and password, which you agree not to disclose to any third party. You may not use a third party's account, username, or password at any time. You may be held liable for any losses incurred by Company, our affiliates, officers, directors, employees, consultants, agents, and representatives due to someone else's use of your account or password. You agree to accept responsibility for all activities which occur under your account or password. You agree to notify Company immediately upon becoming aware of any breach of security or unauthorized use of your account.

TERMINATION

(a) Company reserves the right to terminate or suspend your account immediately, without prior notice, with or without cause, and without limitation. Upon termination, the right to use the Company software and Services will be revoked.

(b) Termination of Services with Company shall not affect the enforceability of provisions of the User Agreement, including but not limited to, protections regarding use of Company's intellectual property, indemnity, and Privacy Agreement.

DISCLAIMER OF WARRANTY

Company Services and all information, content, materials, products (including software), and other services included on or otherwise made available to you through Company Services are provided on an "as is" and "as available" basis, unless otherwise specified in writing. Company makes no representations or warranties of any kind, express or implied, as to the operation of Company Services, or the information, content, materials, products (including software) or other services included on or otherwise made available to you through Company Services, unless otherwise specified in writing. You expressly agree that your use of Company Services is assumed at your sole risk and that Company cannot be held liable for reliance on its software.

To the full extent permissible by law, Company disclaims all warranties, express or implied, including but not limited to, implied warranties of merchantability and fitness for a particular purpose. Company does not warrant that Company services, information, content, materials, products (including software), or other services included on or otherwise made available to you through the Company Services or electronic communications sent from Company are free of viruses or other harmful components. To the full extent permissible by law, Company will not be liable for any damages of any kind arising from the use of any Company service, or from any information, content, materials, products (including software) or other services included on or otherwise made available to you through any Company Service, including but not limited to direct, indirect, incidental, punitive, and consequential damages, unless otherwise specified in writing.

LIMITATION OF LIABILITY

EXCEPT AS PROHIBITED BY LAW, YOU WILL HOLD ${v.companyName} AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS HARMLESS FOR ANY INDIRECT, PUNITIVE, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGE, HOWEVER IT ARISES (INCLUDING ATTORNEYS' FEES AND ALL RELATED COSTS AND EXPENSES OF LITIGATION AND ARBITRATION, OR AT TRIAL OR ON APPEAL, IF ANY, WHETHER OR NOT LITIGATION OR ARBITRATION IS INSTITUTED), WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE, OR OTHER TORTIOUS ACTION, OR ARISING OUT OF OR IN CONNECTION WITH THIS AGREEMENT, INCLUDING WITHOUT LIMITATION ANY CLAIM FOR PERSONAL INJURY OR PROPERTY DAMAGE, ARISING FROM THIS AGREEMENT AND ANY VIOLATION BY YOU OF ANY FEDERAL, STATE, OR LOCAL LAWS, STATUTES, RULES, OR REGULATIONS, EVEN IF ${v.companyName} HAS BEEN PREVIOUSLY ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. EXCEPT AS PROHIBITED BY LAW, IF THERE IS LIABILITY FOUND ON THE PART OF ${v.companyName}, IT WILL BE LIMITED TO THE AMOUNT PAID FOR THE SERVICES, AND UNDER NO CIRCUMSTANCES WILL THERE BE CONSEQUENTIAL OR PUNITIVE DAMAGES. SOME STATES DO NOT ALLOW THE EXCLUSION OR LIMITATION OF PUNITIVE, INCIDENTAL OR CONSEQUENTIAL DAMAGES, SO THE PRIOR LIMITATION OR EXCLUSION MAY NOT APPLY TO YOU.

CHANGES TO TERMS OF SERVICE AND PRIVACY POLICY

Company reserves the right, at its sole discretion, to modify or replace this User Agreement and the Privacy Policy at any time. If a revision results in a material change to the User Agreement or Privacy Policy, Company may, but is not bound to, provide thirty (30) days of notice prior to changes going into effect. What constitutes a material change will be determined at Company's sole discretion.

By continuing to access or use Company Services after revisions become effective, you agree to be bound by the revised terms.

INDEMNITY

You agree to defend, indemnify, and hold harmless Company, its affiliates, and respective officers, directors, employees, and agents from and against any and all claims, damages, obligations, losses, liabilities, costs and expenses, and attorney's fees arising from: (a) Your violation of this User Agreement; (b) Your violation of the privacy policy; (c) Your use of Company's advertised services; (d) Your violation of any third party right, including but not limited to copyright, property, or privacy rights; and (e) Any claim that is made against you by a third party as a result of using Company services.

INTELLECTUAL PROPERTY: COPYRIGHT, TRADEMARKS, PATENTS

Unless otherwise stated, Company owns all intellectual property rights for this website and all of the content published on it. Company's intellectual property includes, but is not limited to, any and all trademarks, copyrights, logos, images, illustrations, databases, graphics, sounds, and videos. You may not copy, distribute, broadcast, display, sell, license, or otherwise use Company intellectual property, either in whole or in part, without written consent from Company.

INAPPROPRIATE CONTENT

When accessing the website and/or any Services, you agree not to upload, download, display, perform, transmit, or otherwise distribute any content that: (a) is libelous, defamatory, obscene, pornographic, abusive or threatening; (b) advocates or encourages conduct that could constitute a criminal offense, give rise to civil liability or otherwise violate any applicable local, state, national or foreign law or regulation; or (c) advertises or otherwise solicits funds or is a solicitation for goods or services. Company reserves the right to terminate or delete such material from its servers. Company will cooperate fully with any law enforcement officials or agencies in the investigation of any violation of this User Agreement of any applicable laws.

SEVERABILITY

If any provision of Company's User Agreement or Privacy Policy are held to be invalid or unenforceable, such provision shall be severed and the remaining provisions shall remain enforceable.

ARBITRATION AGREEMENT

Any dispute or claim relating in any way to your use of any Company Services, or to any products or services sold or distributed by Company, will be resolved by binding arbitration, rather than in court, except that either party may assert claims in small claims court if the claims qualify. The Federal Arbitration Act and federal arbitration law apply to this agreement.

There is no judge or jury in arbitration, and court review of an arbitration award is limited. However, an arbitrator can award on an individual basis the same damages and relief as a court (including injunctive and declaratory relief or statutory damages), and must follow this User Agreement as a court would.

The arbitration, once initiated, will be conducted by the American Arbitration Association (AAA) under its rules, including the AAA's Supplementary Procedures for Consumer-Related Disputes. The AAA's rules are available at www.adr.org or by calling 1-800-778-7879. Payment of all filing, administration, and arbitrator fees will be governed by the AAA's rules. The parties may choose to have the arbitration conducted by telephone, based on written submissions, or in person in San Francisco County or at another mutually agreed location.

Both you and Company agree that any dispute resolution proceedings will be conducted only on an individual basis and not in a class, consolidated, or representative action. If for any reason a claim proceeds in court rather than in arbitration we waive any right to a jury trial. We also both agree that you or we may bring suit in court to enjoin infringement or other misuse of intellectual property rights.

GOVERNING LAW AND JURISDICTION

The User Agreement and Privacy Policy shall be governed and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions. Federal Court in San Francisco, California shall have exclusive jurisdiction with respect to any issue arising from or under the use of the website or Services.

NO USE BY MINORS

You agree that by using the website, and/or any Services, you are at least 18 years of age and you are legally eligible to enter into a contract.

RIGHT TO REFUSE

You acknowledge that Company reserves the right to refuse service to anyone and to cancel user access at any time.

ACKNOWLEDGEMENT

BY USING ${v.companyName} SERVICES OR ACCESSING THE ${v.companyName} WEBSITE, YOU ACKNOWLEDGE THAT YOU HAVE READ THIS USER AGREEMENT AND AGREE TO BE BOUND BY THEM.

CONTACT US

If you have any questions or concerns regarding this User Agreement or the Privacy Policy, please feel free to contact us at ${v.companyEmail}.`
}

const RENDERERS: Partial<Record<string, (v: Record<string, string>) => string>> = {
  "safe-cap": safeCap,
  "safe-mfn": safeMfn,
  "safe-discount": safeDiscount,
  "pro-rata-side-letter": proRataSideLetter,
  "founder-loan": founderLoan,
  "services-agreement": servicesAgreement,
  "promised-options-letter": promisedOptionsLetter,
  "advisor-agreement": advisorAgreement,
  "consulting-agreement": consultingAgreement,
  "offer-letter": offerLetter,
  nda: ndaAgreement,
  "pilot-agreement": pilotProgramAgreement,
  "user-agreement": userAgreement,
}

export function renderTransactionDocument(docId: string, values: Record<string, string>): string | null {
  return RENDERERS[docId]?.(values) ?? null
}
