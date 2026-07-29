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

function agentMarketingAgreement(v: Record<string, string>): string {
  return `AGENT MARKETING AGREEMENT

This agreement ("Agreement") is entered into as of ${formatDate(v.date)} (the "Effective Date"), by and between ${v.companyName} ("Company") and ${v.agentName} ("Agent" or "you").

WHEREAS, Company is a provider of ${v.companyServiceDescription} ("Company Service");

WHEREAS, Company desires to engage Agent and Agent desires to provide services to promote Company's business and/or the Company Service, all on the terms and conditions of this Agreement;

NOW, THEREFORE, in consideration of the above and other good and valuable consideration, the receipt and sufficiency of which is hereby acknowledged, Company and Agent hereby agree as follows:

1. SERVICES TO BE PERFORMED: Agent will participate in a marketing campaign to promote the various features and benefits of the Company Service (the "Campaign"), participate in activities and manage and deliver all communications and other deliverables as described in Exhibit A (hereinafter, "Services"). Agent shall provide all deliverables in form and content reflective of Company's values, image and brand as determined by Company in Company's sole discretion and in accordance with any and all guidelines or instructions provided by Company to Agent. All deliverables shall be subject to Company's written approval, in Company's sole discretion (which approvals can be made via e-mail), prior to Agent's posting or distribution (as applicable) of such deliverables.

Company has the right, in Company's sole discretion, to request revisions to or removal of any social media post ("Post") or other deliverable created for or concerning Company from social media channels and Agent shall immediately remove such items. Revisions to any Post or other deliverable must be approved in writing by Company (which approvals can be made via e-mail). Without limiting the foregoing, if such immediate compliance is not possible, Agent will notify Company of the issue and cooperate with Company to promptly resolve the issue.

Each party may propose changes or additions to the Services or deliverables set forth in this Agreement (such as the number of Posts to be created). Any such changes as well as any related impact to the cost may be agreed to by the parties in writing in a change order (email is sufficient for documenting such agreement). Any services that are not specifically set forth herein or agreed to by the parties in a change order shall be considered out of scope services and subject to the execution of a separate written agreement between the parties.

2. COMPENSATION: In consideration of the Services rendered hereunder and as full compensation therefor, Company agrees to pay Agent the amounts specified in Exhibit B attached hereto at the times specified therein (the "Compensation"). Agent shall be solely responsible for any travel or other costs or expenses incurred in connection with the performance of the Services, and in no event shall Company reimburse Agent for any such costs or expenses unless Company and Agent agree in writing (which can be via e-mail) prior to Agent incurring such expense for certain travel or other costs to be reimbursed, such as media tour travel. Agent shall provide sufficient documentation with each invoice for Company to validate such reimbursable expenses. Payments shall be made in U.S. dollars and are subject to receipt of a valid, undisputed invoice. Company shall pay each undisputed invoice within thirty (30) days of receipt.

3. TERM; TERMINATION: This Agreement commences as of the Effective Date and, unless extended or terminated in accordance with the provisions herein, terminates twelve (12) months thereafter (the "Initial Term"). The Agreement may be extended by the parties upon mutual written agreement prior to the termination of the Initial Term or then-current Extension Period for the period agreed to by the parties (each, an "Extension Period"). The Initial Term and all Extension Periods are collectively referred to as the "Term".

Each party shall be permitted to terminate this Agreement for (uncured, following 10 days' written notice) material breach by the other of any agreement, representation or warranty hereunder. In the event of such termination, Agent shall promptly close out all activities hereunder and deliver to Company all deliverables and all records or other property and Company Materials, including, without limitation, products, samples or materials belonging to or containing confidential information of Company.

4. USAGE RIGHTS; PUBLICITY RIGHTS; COMPANY MATERIALS: Agent irrevocably authorizes and grants Company the perpetual, worldwide, sub-licensable (through multiple levels of sublicensees), irrevocable, fully-paid, royalty-free, right and license to share and/or repost, publish, copy, reproduce, distribute, market, sell, display and otherwise use any and all Posts and other content produced by or on behalf of the Agent for the Company, including, without limitation, all Publicity Rights contained therein or related thereto (the "Agent Content").

Company may provide its name(s), trademark(s), logo(s), indicia, materials, photographs, video, products and other content (collectively, the "Company Materials") as reasonably requested by Agent for use by the Agent in the Agent Content or otherwise in connection with the Services. Company is, and shall remain, the sole and exclusive owner of all right, title and interest in and to such Company Materials and all derivative works thereof. Agent shall only use such Company Materials with Company's prior written approval and shall promptly return such Company Materials to Company and cease use of such Company Materials upon termination or expiration of this Agreement or upon Company's earlier request. No right is granted to the Agent to modify or make derivative works of Company Materials. To the extent the Agent obtains any rights, including any intellectual property rights or other proprietary rights in or to the Company Materials or any derivative works thereof, the Agent shall assign, transfer and convey and hereby does assign, transfer and convey all such rights, including any and all intellectual property rights and other proprietary rights, to Company.

Except for the rights and licenses expressly set forth in this Agreement, each party and its licensors shall retain the exclusive right, title and interest in and to its and their respective intellectual property rights and other proprietary rights, whether preexisting or otherwise, and any and all derivative works of the foregoing. Nothing in this Agreement shall be construed as conferring any rights by implication, estoppel, or otherwise, under any intellectual property right or other proprietary right, other than the rights expressly granted in this Agreement. Nothing herein shall constitute any obligation on Company, its agents, assignees, licensees and others working for it or on its behalf to make any use of any of the rights set forth herein.

5. INDEPENDENT CONTRACTOR: Each of the parties agrees that its status hereunder is that of an independent contractor and nothing herein will be construed as creating any relationship of employer/employee, partnership, agency, joint venture, or otherwise between the parties. Any persons engaged by a party in performing its obligations hereunder shall not be deemed to be employees of the other party. Agent will not give any warranties or make any representations or guarantees to others except as may be authorized in writing by Company.

6. REPRESENTATIONS AND WARRANTIES/INDEMNIFICATIONS: Agent represents and warrants that:

(a) all Services shall be provided (i) in accordance with applicable professional standards and practices and (ii) in a competent, timely and professional manner;

(b) Agent has secured (or will secure prior to use) all necessary agreements with any and all third party authorizing Company to use the Agent Content as set forth in Section 4;

(c) Agent shall comply with any and all particular restrictions or information Company desires to be included in the Agent Content;

(d) Agent will perform the Services in compliance with all applicable federal, state and local laws, regulations and ordinances, including the regulations of the Federal Trade Commission ("Applicable Laws");

(e) Agent shall disclose its affiliation with Company in accordance with the Federal Trade Commission Guides Concerning the Use of Endorsements and Testimonial in Advertising) (including, without limitation, identifying each Post as a marketing message by utilizing the hashtags #sponsored, #ad or other acceptable disclosure under Federal Trade Commission guidelines), as required by law;

(f) Agent's performance of the Services does not and will not conflict with or result in any breach or default under any other agreement or obligation to which it is subject;

(g) Except for Company Materials and any other content directed by Company to be included in Agent Posts hereunder (the "Company-Directed Content"), any and all communications, representations, requests, Agent Content, deliverables and other materials provided to Company under this Agreement originate from Agent; and

(h) Agent is the sole owner and creator of its Agent Content and, excluding the Company Materials and Company-Directed Content has all right, title and interest, including intellectual property rights and other proprietary rights, in such Agent Content; and, excluding the Company Materials and Company-Directed Content, the Services and deliverables shall not infringe, misappropriate or otherwise violate any intellectual property rights or other proprietary rights (including any rights of publicity or privacy) of any person or entity or contain any scandalous, libelous or unlawful matter.

Each party hereby represents and warrants that it has the power and authority to enter into this Agreement and perform all obligations required of it hereunder.

Each party agrees to defend, indemnify and hold harmless the other, its affiliates, and those working for them or on their behalf from and against any and all third-party claims, losses, costs, damages, and expenses (including, without limitation, reasonable attorneys' fees and settlement costs) ("Losses") arising out of or resulting from any breach or alleged breach by the indemnifying party of any of its agreements, representations or warranties hereunder.

7. NOTICES: All notices required or permitted under this Agreement shall be given or made at the respective address of the parties as set forth above, unless notification of a change of address is given in writing. All notices shall be sent by postage prepaid, certified mail, return receipt requested, via overnight delivery service, or via e-mail, and shall be deemed given at the time they are sent unless otherwise specified herein.

8. WAIVER OF BREACH: Waiver by either party hereto of a breach of any provision of this Agreement by other party shall not operate or be constructed as a waiver of any subsequent breach by such party.

9. CONFIDENTIALITY: Each party agrees not to disclose to any third party any non-public, confidential or proprietary information and materials disclosed to it by the other party, including, without limitation, any information concerning any of the disclosing party's marketing plans and any of the terms of this Agreement ("Confidential Information"), unless required by law or legal process. In such case, the receiving party must give the disclosing party prompt notice of any order and provide reasonable assistance to the disclosing party in its efforts to quash the order, obtain a protective order or otherwise protect the confidentiality of such Confidential Information. "Confidential Information" shall not include information: (i) that was publicly available, or that subsequently becomes publicly available, except by the wrongful disclosure hereunder by the receiving party and except for personal data; (ii) that was in the receiving party's possession prior to receipt of the same hereunder; (iii) that was received from a person who was not under any obligation of confidentiality with respect to such information; (iv) that can be proven to have been independently developed by the receiving party without any use of or reference to the disclosing party's Confidential Information, as established by written documentation produced contemporaneously with the development of the information; or (vi) that is approved by the disclosing party in writing for release by the receiving party. Either party shall be permitted to disclose to its Representatives only to the minimal extent necessary, provided such Representatives are legally bound by a written agreement to protect such Confidential Information in accordance with this subsection. "Representatives" shall mean, collectively: directors, officers, employees, shareholders, agents, attorneys, accountants, suppliers, contractors, sub-contractors, service providers and advisors. Either party may also disclose the other party's Confidential Information to: (a) potential purchasers of the whole or part of that party or its affiliates and/or its business, including potential purchasers of any properties owned by that party or its affiliates to the extent required to evaluate the proposed purchase; and (b) business partners of that party or its affiliates, including investors and partners in joint ventures who need to know the information, provided the foregoing are legally bound by a written agreement to protect such Confidential Information in accordance with this subsection, only to the minimal extent necessary. Each party remains responsible for any act or omission by its Representatives or other permitted recipient hereunder.

10. NON-DISPARAGEMENT: Neither party shall not make any statement, orally or in writing, nor take any action, that disparages the other party or its affiliates or any of their products or services, or that harms or reasonably should be expected to harm the reputation or goodwill of any of the foregoing.

12. LIABILITY: EXCEPT FOR BREACHES OF SECTION 9 (CONFIDENTIALITY), OR A PARTY'S GROSS NEGLIGENCE OR WILFUL MISCONDUCT, IN NO EVENT SHALL EITHER PARTY BE LIABLE TO THE OTHER PARTY FOR ANY SPECIAL, INDIRECT, INCIDENTAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES (INCLUDING, WITHOUT LIMITATION, LOST PROFITS, LOST SAVINGS, OR LOSS OF GOODWILL) ARISING OUT OF OR IN CONNECTION WITH A BREACH OR ALLEGED BREACH OF THIS AGREEMENT, EVEN IF SUCH OTHER PARTY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.

13. REMEDIES CUMULATIVE: The rights and remedies of the parties are cumulative and not alternative.

14. NO THIRD PARTY BENEFICIARIES: This Agreement is not intended to confer upon any other person or entity any rights or remedies hereunder, except for the indemnified parties as expressly set forth herein.

15. ASSIGNMENT: Agent shall not assign or otherwise transfer any of its rights, or delegate, subcontract or otherwise transfer any of its obligations or performance, under this Agreement. Any purported assignment, delegation, or transfer in violation of this Section 15 is void and of no effect. Company may freely assign or otherwise transfer any or all of its rights, or delegate or otherwise transfer any or all of its obligations or performance, under this Agreement. Subject to the foregoing, this Agreement is binding upon and inures to the benefit of the parties hereto and their respective successors and permitted assigns.

16. PUBLICITY: Agent shall not use Company's or its licensors' name, logo, proprietary indicia, trade name, trademarks, or service marks or refer to Company in any media release, listing on a website, presentation, public announcement, or public disclosure relating to this Agreement, its subject matter or any part thereof without the written consent of Company, which consent may be granted or withheld in Company's sole discretion. Company shall not be deemed to have granted Agent a license to, or any rights in, any of the foregoing by entering into this Agreement.

17. APPLICABLE LAW/JURISDICTION: The Agreement and all matters and/or issues collateral thereto shall be governed by the laws of the State of California, without regard to its conflict laws of principles. Any controversies or disputes arising out of or relating to this Agreement shall be resolved exclusively in either the state or federal courts located in California, and each party hereby consents to the personal jurisdiction of such courts over it.

18. ENTIRE AGREEMENT; MODIFICATION: This Agreement sets forth the entire understanding of the parties, and supersedes and merges any and all prior agreements and discussions between the parties relating to the subject matter contained herein. No modification, amendment or waiver of any of the provisions of this Agreement shall be effective unless contained in writing specifically referring to this Agreement and signed by each of the parties hereto.

[Signatures on Next Page]

ACCEPTED AND AGREED TO:

THE COMPANY:

${v.companyName}

By:_________________________
(Signature)

Name:_________________________
Date:_________________________


AGENT:

${v.agentName}

By:_________________________
(Signature)

Name:_________________________
Date:_________________________


Exhibit A

SERVICES DESCRIPTION

Agent shall provide the following Services and deliverables to Company during the Term in connection with the Campaign:

${v.servicesDescription}


EXHIBIT B

COMPENSATION

Pursuant to Section 2 (Compensation) of the Agreement, the following compensation terms apply:

${v.compensationTerms}`
}

function distributionAgreement(v: Record<string, string>): string {
  return `Distribution Agreement

This Distribution Agreement (the "Agreement") is entered into and made effective as of ${formatDate(v.date)} (the "Effective Date") by and between ${v.companyName} ("Company"), and ${v.distributorName}, a corporation organized under the laws of the State of Delaware (hereinafter the "Distributor").

Company and the Distributor agree as follows:

1. Appointment and Acceptance:

1. Company appoints the Distributor, on a non-exclusive basis and on the terms and conditions of this Agreement, as a distributor authorized to purchase and re-sell the Company Products (as defined in Section 3) for use in the Territory (as defined below) and the Field (as defined below).

2. Company, its affiliates, and each of their respective distributors and agents retain the right to contact potential customers regarding the sale of and make sales to such potential customers of Company Products in the Territory without the involvement of the Distributor.

3. Distributor will not resell any Company Product to any distributor, customer, or agent if Distributor reasonably believes that such Company Product will be used outside the Field. All sales of Company Products to Distributor will be made under the provisions of this Agreement.

2. Territory and Field:

2.1 The "Territory" is ${v.territory}. Proposed sales outside the Territory are treated as "Territory Exceptions" and may be done with Company written approval.

2.2 The "Field" is ${v.fieldDefinition}. Proposed sales outside the Field are treated as "Field Exceptions" and may be done with Company written approval.

2.3 Territory Exceptions and Field Exceptions will be documented and updated in Schedule 2.

3. Company Products:

"Company Products" means those products set forth on Schedule 1 and any other product that Company, in its sole discretion, makes available to Distributor to purchase, repackage and/or add value, and re-sell hereunder. If Company intends to amend or otherwise alter Schedule 1, including to add or remove products from or to changed the description or specifications of Company Products, it shall discuss and negotiate with Distributor prior to at least six (6) months and may do so upon agreement by Distributor by reason of its obligation to supply its cusomters with Company Products on a constant and stable basis, and will provide Distributor with an updated Schedule 1 at least semi-annually;

4. Interaction and Protection:

4.1 Company hereby grants Distributor a non-exclusive right on the terms and conditions of this Agreement to use Company's brand and marks to promote and re-sell Company Products in the Territory for use in the Field during the term of this Agreement.

2. All sales of Company Products to Distributor will be made pursuant to the terms and conditions attached hereto as Exhibit A (the "Terms and Conditions"), and the provisions of this Agreement. Unless otherwise mutually agreed in writing by the parties, any document that either party may use from time to time for their mutual convenience such as purchase orders or sales acknowledgment forms will be deemed to be for administrative convenience only and the terms and conditions of this Agreement (including the Terms and Conditions) will supersede and take precedence over any terms and conditions which may be contained in any such forms.

3. The price Company charges to Distributor for Company Products is set forth in Exhibit A. For the avoidance of doubt, in case of price change of Company Products, Company shall notify Distributor of the proposed price change that details the reason of the change at least six (6) months prior to the change. The prices before the change shall be applicable to all purchase orders placed by Distributor prior to the actual date of the change.

4. No commission, discount or payment of any kind will be due hereunder from Company to Distributor in connection with any and all sales opportunities identified by Distributor or otherwise. Recipient's inducement for entering into this Agreement consists of the limited non-exclusive rights granted by Company to Distributor hereunder.

5. Distributor acknowledges that the Company Products are subject to U.S. export control laws and restrictions, and accordingly in certain instances Company may not be authorized to sell its Company Product in response to a particular opportunity or may only be authorized to do so after first security clearance or an export license.

5. Duration of the Agreement:

The Agreement will be in effect as of the Effective Date and will continue to be in full force until ${formatDate(v.terminationDate)}, at which point this Agreement will automatically renew for successive one (1) year terms unless either Party provides written notice of non-renewal at least six (6) months prior to the then current termination date.

6. Termination:

6.1 Either Party may terminate this Agreement upon written notice to the breaching Party if the breaching Party fails to cure a material breach of a provision of this Agreement within thirty (30) days after the receipt of written notice alleging such breach.

6.2 Either Party may terminate this Agreement immediately if the other Party (a) becomes insolvent, files for bankruptcy, or a petition is filed against such other Party under the provisions of the applicable laws of insolvency or bankruptcy, (b) intentionally or in a willful, wanton or reckless manner made any material, false representation, report or claim relative hereto; (c) violated such Party's copyrights or trademarks; (d) engaged in any deceptive trade practices under the laws of any jurisdiction; or (e) asserted or threatened to assert any claim against such Party for matters unrelated to the Agreement.

6.3 Company will have the right to terminate this Agreement immediately if Distributor (or any direct or indirect parent company of Distributor) undergoes a change of control, sale of substantially all of its assets, or other similar transaction.

6.4 It is agreed that in the event of expiration or termination of this Agreement for any reason whatsoever, (a) upon such termination, all claims for compensation for loss of agency, loss of goodwill or any similar loss are agreed to be waived and (b) following such expiration or termination, the Distributor will have the right to sell its existing stock of Company Products, subject to the limitations set forth in Article 1 and Sections 4.3, 4.5, 7.3, 7.10, and 7.11; provided, however, that the Distributor has no right to return Company Products to Company or request Company to re-purchase such unsold Company Products.

7. Duties of the Distributor; Joint Compliance with Laws:

In addition to the covenants, duties, representations, and other obligations assumed by the Distributor elsewhere in this Agreement:

7.1 Distributor agrees that it will actively at all times use its best efforts to promote and market Company Products in the Territory.

7.2 The Distributor will comply with all reasonable and lawful instructions, given by Company from time to time, concerning the promotion and the arrangement for the sale of the Company Products. Without limiting the foregoing and if requested by Company, Distributor will cooperate with Company in the administration of any incentive, promotion or allowance programs offered by Company.

7.3 Distributor will promptly notify Company if it becomes aware of any claims of failure or defect in any Company Product delivered by Company, or the commencement of any action based on any such claim.

7.4 Distributor will provide such assistance as Company may reasonably request in Company's administration of product recall or warranty replacements programs. Distributor shall in good faith cooperate with Company with respect to recall of any of Company Products, provided that Company shall provide Distributor with all information reasonably requested by Distributor with respect to such recall. Distributor shall inform Company about requests, claims or complaints from the customers or users whom Distributor contacts. Company shall be responsible for and reimburse Distributor for all the reasonable external costs and expenses incurred by Distributor in carrying out activities requested by Company in conducting such recall.

7.5 Distributor will promptly notify Company if it becomes aware of any infringement known or suspected concerning any intellectual property or proprietary rights belonging to Company or any of its affiliates.

7.6 Distributor will not promote, market, sell, offer for sale, sell or export any products or services of Company or any of its affiliates other than as permitted herein.

7.7 Distributor will provide regular updates and reports to Company concerning its activities in support of Company and the sale of Company Products in the Territory and targeted opportunities being pursued by it.

7.8 Distributor covenants that it will not promote the products or technical capabilities of any third party in competition with or in lieu of the Company Product.

7.9 Distributor will not do any of the following:

7.9.1 Hold itself out as being authorized to bind Company or any of its affiliates in any way or incur any liability on Company's or any of its affiliates' behalf.

7.9.2 Pledge Company's credit.

7.9.3 Receive payment on behalf of Company.

7.9.4 Export or re-export, or facilitate the export or re-export, of any goods or technology available from Company unless such export or re-export complies fully with all regulations of the United States relating to such export or re-export. The goods and technology from Company are subject to the restrictions on export or re-export imposed by regulations issued by the U.S. Bureau of Industry and Security and the U.S. Department of Treasury. Any diversion of Company's goods or technology contrary to the laws of the United States is prohibited.

7.10 Distributor will comply with all applicable laws in the performance its duties. Without limiting the generality the foregoing, the Distributor represents and covenants that it will not exert or propose to exert improper influence, including through bribery of any person, to solicit or obtain orders. In addition, the Distributor represents and covenants that it will not pay, offer or promise to pay, or authorize the payment directly or indirectly, of any monies or anything of value to any government official or employee or any political party or candidate for political office for the purpose of influencing any act or decision of such official or of the government to obtain or retain orders for Company Products, or to direct business related to the Company Products to any person or entity. In the event that Company has reason to believe that a breach of any of the covenants set forth in this Section 7.10 (collectively, the "Compliance Covenants") has occurred or may occur, Company may withhold sales of Company Products to Distributor until such time as it has received confirmation to its satisfaction that no such breach has occurred or will occur. Company will not be liable to the Distributor for any claim, losses or damages whatsoever related to its decision to withhold sales under this provision. In the event that Company has reason to believe that a breach of any of the Compliance Covenants has occurred or may occur, Company will have the right to audit the Distributor's business records in order to satisfy itself that no such breach has occurred. The Distributor will fully cooperate in any such audit, whether conducted by or on behalf of Company. In the event of a breach of any of the Compliance Covenants, this Agreement will be void ab initio without the requirement of any written notice of cancellation. Any claims by the Distributor with regard to any transaction for which a breach of any of the Compliance Covenants has occurred, including claims for sales or services previously rendered will be automatically terminated and cancelled. The Distributor will further indemnify and hold harmless Company against any and all claims, losses or damages (direct, indirect, consequential, punitive, foreseeable or unforeseeable) arising from or related any breach of any of the Compliance Covenants.

8. Duties of Company. In addition to the covenants, duties, representations, and other obligations assumed by Company elsewhere in this Agreement:

8.1 Company will send a reasonable quantity of brochures, documents, datasheets and samples to the Distributor to support its efforts at no cost to the Distributor.

8.2 Company guarantees that any of Company Products shall be from any defect in materials and workmanship for a period of twelve (12) months after delivery to a customer by Distributor ("Warranty Period"). In case any defect is found during the Warranty Period, Company shall repair or supply Distributor with alternative Company Product free of charge, and compensate for any losses incurred by Distributor.

8.3 For the avoidance of doubt, Company will not have any direct customer support, warranty, service, or other similar obligations to any third party that purchases Company Products from Distributor.

8.4 Company will provide to Distributor, on an annual basis, training, at a location of Company's choice, covering the specifications (including the specified conditions of use) of the Company Products, the handling of the Company Products, and the connecterization of the Company Products. Each such training will be for one (1) day and will be provided at the cost of Company; provided, however, that Distributor will bear all travel and accommodation expenses for its attendees.

8.5 In case any third party suffers from any damage including but not limited to injury, death or personal property due to a defect of any of Company Products in the Territory, Company shall defend and hold Distributor, its officers, directors and/or workers including temporary workers harmless from any claim alleged by the third party and it shall indemnify Distributor of any and all losses, obligations, liabilities, costs and expenses (including attorney's fee), damages arising out of or related to such defect.

8.6 Each of Company and Distributor will comply with all applicable laws in the performance its duties. Without limiting the generality the foregoing, each of Company and Distributor represents and covenants that it will not exert or propose to exert improper influence, including through bribery of any person, to solicit or obtain orders. In addition, each of Company and Distributor represents and covenants that it will not pay, offer or promise to pay, or authorize the payment directly or indirectly, of any monies or anything of value to any government official or employee or any political party or candidate for political office for the purpose of influencing any act or decision of such official or of the government to obtain or retain orders for Company Products, or to direct business related to the Company Products to any person or entity. In the event that either Company or Distributor has reason to believe that a breach of any of the covenants set forth in this Section 8.6 (collectively, the "Compliance Covenants") has occurred or may occur, that party may withhold sales of Company Products until such time as it has received confirmation to its satisfaction that no such breach has occurred or will occur. Neither party will be liable to the other for any claim, losses or damages whatsoever related to its decision to withhold sales under this provision. In the event that Company has reason to believe that a breach of any of the Compliance Covenants has occurred or may occur, Company will have the right to audit Company's business records in order to satisfy itself that no such breach has occurred. Distributor will fully cooperate in any such audit, whether conducted by or on behalf of Company. In the event of a breach of any of the Compliance Covenants, this Agreement will be void ab initio without the requirement of any written notice of cancellation. The breaching party will further indemnify and hold harmless the non-breaching party and its officers, directors, agents and employees against any and all claims, losses or damages (direct, indirect, consequential, punitive, foreseeable or unforeseeable) arising from or related any breach of any of the Compliance Covenants.

9. Ordering Procedures; Forecast.

9.1 Each purchase order issued by Distributor hereunder will specify the relevant Company Product, quantity ordered, Company Product description, price, delivery address, requested delivery date, and relevant shipping instructions.

9.2 Company's acknowledgment or commencement of performance of any order will be deemed to be an acceptance of such order under this Agreement.

9.3 The terms and conditions of sale associated with all Company Products will be as set forth in this Agreement. Any terms or conditions of purchase or sale set forth or referenced in any purchase order, order acknowledgment, invoice, or other written documentation exchanged between the Parties in the course of the administration of this Agreement will be null and void and will have no legal force or effect. The written documentation so exchanged will merely serve the administrative function of specifying quantities of Products ordered, delivery dates, delivery destination, and line item prices consistent in all cases with the terms set forth in this Agreement. In the event of conflict between the terms of this Agreement and any term or condition on the face of a purchase order, the term or condition set forth in this Agreement will prevail.

9.4 Prior to October 1 of each calendar year, Distributor will provide to Company a good faith, non-binding forecast of Distributor's anticipated demand for Company Products for the upcoming calendar year (the "Forecast"). Distributor will provide Company with any supporting documentation related to the Forecast reasonably requested by Company for the purpose of validating the Forecast as a good faith estimate. If Company determines, in good faith, that the Forecast overestimates Distributor's anticipated demand for the upcoming calendar year, the Parties agree to discuss, in good faith, an appropriate adjustment to the Forecast.

9.5 At Company's request not more frequently than two (2) times per calendar quarter, the Parties shall meet telephonically to discuss Distributor's business prospects, current Forecast, Company Product updates, Company Product roadmap, and other matters as mutually agreed by the Parties.

10. Payment

10.1 The selling prices, discounts, payment terms and return privileges offered by the Distributor to its customers will be determined by the Distributor in its sole and exclusive discretion.

11. Trademarks and Intellectual Property Rights

11.1 Distributor acknowledges that the trademarks, tradenames, and logos associated with the Company Products are extremely valuable to Company and provide a competitive advantage in those fields where the Company Products compete. Company hereby provides to Distributor a limited license to use those trademarks and logos associated with the Company Products including such other marks as Company may develop that become associated with Company Products introduced into the marketplace after the effective date of this Agreement (collectively, the "Licensed Trademarks"). The Licensed Trademarks may only be used by Distributor in connection with the promotion, marketing and re-sale of the Company Products as permitted herein. Before using a Licensed Trademark in any promotional material or administrative form, a design copy of such material or form must be presented to and approved by Company before its first use, which approval will not unreasonably be withheld. The Licensed Trademarks will not be used by Distributor for any purpose other than as permitted herein and any goodwill or value attributable to Distributor's use of a Licensed Trademark will belong solely to Company. This license will remain valid and effective for the term of this Agreement. Upon the expiration or earlier termination of this Agreement, Distributor will immediately cease to use any Licensed Trademark.

11.2 Distributor will have no rights to use the Licensed Trademarks (including the corporate name of Company), except as provided herein. Distributor shall not, for any reason:

A. Use any trademark which is identical or confusingly similar to any Company trademarks;

B. Alter, deface or remove any trademarks, patent numbers, notices, information or legends on the Company Products;

C. Use the Licensed Trademarks in connection with any products other than the Company Products, particularly, excluding the use of the Licensed Trademarks as the trademark for products in which Company Products are a component; or

D. Use any trademark in connection with the Company Products, other than those specified by Company.

11.3 Whatever use Distributor makes of the Licensed Trademarks as provided herein, will be for the exclusive benefit of Company. Distributor agrees that it will not register, or cause to be registered, in the Territory or elsewhere anywhere, any trademark or trade name utilized by Company or any of its affiliates in connection with its products, or any other trade name, trademark, word, or symbol that is identical or similar to any trademark or trade name owned or utilized by Company or any of its affiliates.

11.4 Intellectual Property Rights. If a third party alleges against Distributor that any of Company Products infringes any patent, utility model, design, trademark, copyright, or other intellectual property right in the Territory, then Company shall defend and hold Distributor harmless from any claim or suit of the infringement and indemnify Distributor any costs and expenses incurred by Distributor in connection with the infringement.

12. No Equity Relationship:

This Agreement does not and is not intended to create any partnership, joint venture, agency or similar relationship between the parties. Neither party will hold itself out as representative of the other nor having the authority to legally bind the other for any purpose whatsoever.

13. Confidentiality:

No commercial or technical information provided by Company, the terms and conditions of this Agreement, or any information in any sales reports prepared by the Distributor for Company may be used by the Distributor, the Distributor's employees or its contractors for any purpose other than to pursue commercial and business opportunities in accordance with this Agreement. Without limiting the foregoing, Company and the Distributor agree that Distributor will use confidential information solely as permitted and, in any event, will not publish or otherwise disclose such confidential information to any third party. Upon the termination or earlier expiration of this Agreement, the Distributor will return to Company all proprietary or confidential information owned or provided by Company, including commercial and technical information provided by Company and any information in any sales reports prepared by the Distributor for Company, or certify in writing that all such information has been destroyed and is not retrievable. The Distributor will protect Company's proprietary and confidential information from disclosure and misuse using the same standard of care as the Distributor would use to protect its own confidential information, but, in any case, not less than a commercially reasonable standard of care. The obligations under this paragraph will survive the expiration or termination of this Agreement for any cause whatsoever.

14. Assignment:

The Distributor may not assign, transfer or subcontract any rights or obligations of, or services to be rendered by it under this Agreement without the prior written consent of Company.

15. Dispute Resolution; Governing Law:

15.1 Governing Law. This Agreement will be governed by, interpreted and construed, and performance hereunder will be determined in accordance with the law of the State of California, without regard to its conflicts of law principles.

15.1 Negotiation and Mediation. Notice of any dispute or claim arising hereunder will be provided in accordance with the notice provisions below. Company and Distributor will make good faith efforts to amicably resolve any dispute arising hereunder via direct negotiation between authorized representatives of each party. In the event that such representatives are unable to resolve the dispute, or in the event that sixty (60) days have passed since the initial written notice of the dispute and the matter continues to be unresolved, either party may request confidential mediation of the dispute through a mediator experienced in commercial mediation selected by each party (or his or her designee).

Notwithstanding the foregoing, either party may immediately pursue litigation seeking equitable relief of any form, including but not limited to addressing any breach of confidentiality hereunder.

15.2 Characterization of Negotiations; Continued Performance. All negotiations between the parties with respect to any dispute, claim or controversy arising out of or relating to this Agreement, or the validity, enforcement, or breach thereof and all communications made to the mediators will be confidential and will be treated as compromise and settlement negotiations for purposes of the United States Federal Rules of Evidence and any applicable state rules of evidence, provided that either party may specifically waive in writing these rights of privilege and confidentiality with respect to any communications it has made. Notwithstanding the existence of a dispute being considered under the applicable dispute resolution provisions, each party will continue the performance of its respective obligations under this Agreement until otherwise provided in connection with the resolution of such dispute.

16. Notices:

Any legal notice or demand required to be given under this Agreement will be deemed to have been sufficiently given when received by registered mail (return receipt requested) to the receiving party at the respective address as set forth above. Either party may give written notice of a change of address, in which event any such notice or request will thereafter be given to it as provided herein.

17. Entire Agreement:

This Agreement represents the entire agreement and understanding between Company and the Distributor with respect to its subject matter. This Agreement supersedes all prior and contemporaneous agreements, documents, certifications, understandings, commitments, negotiations, and undertakings between Company and the Distributor.

18. Modifications:

Except as expressly contemplated by this Agreement, this Agreement may not be altered, modified, amended, or otherwise changed unless such change is documented in writing, signed by an authorized representative of Company and the Distributor, and evidences and intention on the part of both parties to change this Agreement.

19. Counterparts:

This Agreement may be executed simultaneously in two or more counterparts, each of which will be deemed an original, but all of which together constitutes one and the same instrument. Delivery of signatures to this Agreement by facsimile transmission or in PDF document format exchanged via electronic mail will be legally binding and effective for all purposes, including evidentiary purposes.

20. Interpretation:

The paragraph headings contained in this Agreement are for reference purposes only and will not affect in any way the meaning or interpretation of this Agreement or any of its provisions. When a reference is made in this Agreement to a Section, Schedule, or Exhibit such reference will be to a Section, Schedule, or Exhibit to this Agreement unless otherwise indicated. Whenever the words "include," "includes," or "including" are used in this Agreement, they will be deemed to be followed by the words "without limitation." Whenever the word "or" is used in this Agreement, it will not be deemed exclusive. The words "hereof," "herein," and "hereunder" and words of similar import when used in this Agreement will refer to this Agreement as a whole and not to any particular provision of this Agreement. The definitions contained in this Agreement are applicable to the singular as well as to the plural forms of such terms and to the masculine as well as to the feminine and neuter genders of such terms. Whenever the context requires, any pronouns used herein will include the corresponding masculine, feminine, or neuter forms. The preparation of this Agreement has been and will be a joint effort of both parties; this Agreement will not be construed more severely against either party. If any provision of this Agreement is determined by a court to be invalid, the remainder of this Agreement will remain in full force and effect. This Agreement is intended solely for the benefit of the parties. Nothing herein is to be construed to create any duty or standard of care to any person or entity not a party to this Agreement.

20. Waiver:

No party will be deemed to have waived the exercise of any right that it holds under this Agreement or at law unless such waiver is expressly made in writing. Failure of party at any time, and for any length of time, to require performance by the other party of any obligation under this Agreement will in no event affect the right to require performance of that obligation or the right to claim remedies for breach under the Agreement or at law. A waiver by a party of any breach of any provision of this Agreement, unless otherwise expressly stated in writing, is not to be construed as a waiver of any continuing or succeeding breach of such provision, a waiver or modification of the provision itself, or a waiver or modification of any right under this Agreement or at law.

[Remainder of Page Intentionally Left Blank]

IN WITNESS WHEREOF, this Agreement has been executed for and on behalf of Company and the Distributor by their duly authorized representatives identified beneath their respective signatures below.

THE COMPANY:

${v.companyName}

By:_________________________
(Signature)

Name:_________________________
Title:_________________________


DISTRIBUTOR:

${v.distributorName}

By:_________________________
(Signature)

Name:_________________________
Title:_________________________


Exhibit A

Terms and Conditions; Price`
}

function saasResellerAgreement(v: Record<string, string>): string {
  return `RESELLER AGREEMENT

This RESELLER AGREEMENT (the "Agreement") is entered into as of ${formatDate(v.effectiveDate)} (the "Effective Date") by and between ${v.companyName}, a ${v.companyStateOfIncorporation} corporation with its principal place of business at ${v.companyAddress} ("Company"), and ${v.resellerName}, a ${v.resellerStateOfIncorporation} corporation with its principal place of business at ${v.resellerAddress} ("Reseller").

RECITALS

WHEREAS, Company develops and distributes a software-as-a-service platform for accessing applications in the cloud;

WHEREAS, Reseller is experienced and engaged in the business of distributing and reselling the kinds of services and products sold by Company to end users and providing them with complementary services or products, such as installation, integration, support and training services; and

WHEREAS, the parties desire to set forth the terms and conditions under which the Reseller will acquire from Company or reproduce from originals provided by Company and distribute to Customers, the Products (as defined below).

NOW, THEREFORE, in consideration of the mutual promises and covenants set forth herein and for other good and valuable consideration, the receipt and adequacy of which are hereby acknowledged, and intending to be legally bound, the parties hereby agree as follows:

1. Definitions.

"Company Price List" means the price list for Company products most recently published for use in the trade, an example of which is set forth in Exhibit A. The Company Price List shall be published in a manner determined in Company's sole discretion, including, without limitation, by publication on Company's then-current website.

"Confidential Information" shall mean (a) any information disclosed by Company to Reseller that is in written, graphic, machine readable or other tangible form and is marked "Confidential," "Proprietary" or in some other manner to indicate its confidential nature; (b) oral information disclosed by Company to Reseller pursuant to this Agreement that is designated as confidential at the time of disclosure, and reduced to a writing marked as confidential and delivered by Company to Reseller within a reasonable time; and (c) any information a reasonable person in the circumstances would understand to be confidential. Notwithstanding any failure to so identify it, all source code embodied in the Products, including without limitation the source code underlying object code and bitmaps embodied in the Products, shall be Confidential Information.

"Customer" means any third party that obtains a Product solely for its own internal business purposes and not for further distribution or resale.

"Delivery Date" shall mean the date on which Company delivers the Product electronically by sending an e-mail to Reseller setting out the service code or other necessary credentials for use of the Products licensed to Customers.

"Documentation" means published written documentation related to the use or maintenance of the Products provided by Company or a Supplier under this Agreement.

"Product" means the software-as-a-service specified in each Statement of Work, as issued from time to time and related products or services, including: (a) any Documentation that Company may provide for the software; (b) access to the latest updates for the software as they are commercially released by Company; and (c) separately-priced options, modules and updates that Company makes generally available from time to time pursuant to this Agreement and published on the then-current Company Price List.

"Reseller Customers" means a Customer where the Reseller has licensed any Products to such Customer.

"Statement of Work" means a statement of work in the form attached as Exhibit A, describing the Product, pricing, Territory and other terms and conditions pursuant to which Reseller will be permitted to operate under this Agreement.

"Supplier" means any provider of third party software or related products and services included with Products provided under this Agreement.

"Territory" means the geographic region, industry segment or defined set of Customers specified in Exhibit A.

"Updates" means any corrections, enhancements, bug fixes or other modifications for the Products provided to Reseller by Company pursuant to this Agreement.

2. Appointment of Reseller; Obligations of Reseller.

(a) Appointment. Subject to the terms and conditions of this Agreement, Company hereby appoints Reseller as an authorized Reseller to license the Products to Customers within the Territory during the Term of this Agreement, and Reseller accepts such appointment. This appointment is non-transferable and nonexclusive.

(b) Non-Exclusivity. Company reserves all rights not expressly granted in this Agreement, including without limitation the right to distribute, promote, solicit and accept orders for the Products or related services directly to any Customers within or outside the Territory and through any other remarketers, dealers, distributors, sales representatives or other channels, and for any purposes, including, but not limited to, the marketing and provision of upgraded licenses for the Products and/or other products or services to any Customer that has previously obtained a licensed Product from Reseller. Any such sale, distribution or license of Products or related services shall not constitute a violation of this Agreement.

(c) License to Customers. Any use of the Products by Customers will be subject to the terms and conditions of this Agreement and the then-current Terms and Conditions for the Products as it may be amended from time to time and made available to Customer and Reseller (the "TOC"). Reseller acknowledges and agrees that it is only authorized to license those Products on the then current Company Price List. Subject to the terms and conditions of this Agreement, Reseller will be free to establish its own pricing for Products; provided that Reseller may not offer pricing lower than the prices offered by Company on the then current Company Price List. Upon at least thirty (30) days' prior notice to Reseller, Company may add new Products to or delete existing Products from this Agreement and the Company Price List.

(d) Terms and Conditions.

(i) Each license of Products under this Agreement will be subject to, and will be governed by, this Agreement, including without limitation the import and export restrictions set forth in Section 14, and the TOC. Company may modify or replace the TOC at any time, in whole or in part, in its sole discretion. Reseller will solicit an express agreement from Customers that use of the Products is governed by the terms and conditions of the TOC. Reseller will not modify the TOC and will not make any warranty or representation in relation to the Products which broadens or contradicts any warranty, representation or term contained in the TOC. Company will not be bound by, and specifically objects to, any term, condition or other provision which is different from or in addition to the provisions of this Agreement or the TOC and which is submitted by Reseller in any order, receipt, acceptance, confirmation, correspondence or otherwise, unless Company specifically agrees to such provision in a writing signed by Company.

(ii) Reseller acknowledges that the Product may contain or be provided with products or services of Company's Suppliers as identified in associated documentation or other printed materials ("Third Party Product") which is obtained under a license from such Suppliers. All Suppliers retain all right, title and interest in and to such Third Party Product and all copies thereof, including all copyright and other intellectual property rights. Reseller's use and distribution of any Third Party Product shall be subject to and Reseller shall comply and cause all Customers to comply with the applicable restrictions and other terms and conditions set forth (A) in this Agreement and the Documentation applicable to the Products and (b) in such Third Party Product documentation or printed materials.

(e) Marketing.

(i) Reseller shall use its best efforts to actively market, promote, distribute, solicit and obtain orders for the Products in the Territory from both new and existing Customers of the Products. These efforts may include without limitation (A) the use of mailings, advertising, seminars, and other customary marketing techniques; (B) providing competent sales and support representatives trained in and knowledgeable about the Products and capable of answering Customer questions regarding the Products, demonstrating the Products, informing Customers about the Product features, and assisting Customers in determining which Products will best meet their needs; and (C) making Product sales and promotional materials available to Customers. Reseller represents that: (x) it possesses the experience, skills and resources required to carry out these promotion and solicitation activities; (y) it will maintain sufficient facilities and staff to effectively carry out its obligations under this Agreement; and (z) it will ensure that its appropriate staff participate in training sessions offered from time to time by Company in the use and sale of the Products.

(ii) Reseller shall perform adequate diligence on all Customers that Reseller will be sourcing. Diligence will be considered adequate to the extent that either Reseller has a pre-existing substantive relationship with the Customer, or the Customer is a publicly listed company on a national stock exchange, with information made available through periodic reporting obligations.

(iii) During the Term of this Agreement, Reseller shall provide Company with a good faith rolling six (6) month promotional plan specifying independent and/or joint promotional activities to be conducted. Each calendar quarter, Reseller shall update the plan to encompass the next six (6) month period, and Company and Reseller shall conduct a quarterly business review meeting, reviewing Reseller's actual promotional activity and progress to date.

(iv) Company shall provide sales, applications, and marketing support as set forth in Exhibit B. Reseller will use the brochures and other promotional materials describing the Products that Company may provide to Reseller and will comply with the Company guidelines for marketing and promoting the Products. Reseller may reproduce the promotional literature provided that Reseller includes the Company copyright and proprietary notices on all such reproductions.

(f) Feedback. Reseller shall provide Company with prompt written notification of any comments or complaints about the Products that are made by Customers, and of any problems with the Products or their use of which Reseller becomes aware. Such written notification shall be the property of Company, and shall be considered to be part of Company's Confidential Information.

(g) Independent Contractor. Reseller affirms that it or its management is experienced in marketing products such as the Products and that Reseller does not expect or rely upon, nor has it received, any guidance or assistance from Company with respect to its method of operation or the conduct of its business. Reseller will conduct business for its own account, in its own name, and will determine, in its own judgment, how to perform its obligations under this Agreement. Reseller is an independent contractor, not an employee, partner, agent, or representative of Company. Reseller is not authorized to, and will not attempt to, create or assume any obligation or liability, express or implied, in the name of or otherwise on behalf of Company. Without limiting the generality of the foregoing, Reseller will not enter into any contract, agreement or other commitment, make any warranty or guaranty, or incur any obligation or liability in the name or otherwise on behalf of Company. This Agreement will not be interpreted or construed as creating or evidencing any agency, franchise, association, joint venture or partnership among the parties.

(h) Invoicing. Reseller shall be solely responsible for invoicing and obtaining payment of its prices from Customers. Delays or failures in obtaining such payment shall not affect Reseller's obligation to make payments of amounts due to Company under this Agreement.

(i) Enforcement. If Reseller learns that any Customer has breached any provision of the applicable TOC or has infringed upon Company intellectual property rights, including, but not limited to, unauthorized use of the Products, Reseller shall immediately notify Company and shall take all reasonable steps that Company requests to assist Company in enforcing the TOC or any other rights that Company may have against the customer. If Reseller fails to take these steps in a timely and adequate manner, Company may take them in its own name or on behalf of the Reseller.

(j) Business Practices. Reseller shall: (i) conduct its business in a manner that reflects favorably on the Products and on Company' goodwill and reputation; (ii) avoid deceptive, misleading or unethical practices; (iii) make no false or misleading representations with respect to Company or the Products; (iv) not solicit orders from a Customer if Reseller has actual knowledge that such Customer engages in illegal or deceptive trade practices or any other practices prohibited under this Agreement or under applicable laws.

3. License.

(a) Grant. Subject to the terms and conditions of this Agreement, Company grants to Reseller a limited, non-exclusive, non-transferable license to use, license and offer to license the Products to Customers within the Territory.

(b) Restrictions. The license set forth above does not include any rights to and Reseller shall not (i) modify all or any portion of the Products, except for such limited modifications as Company may pre-approve in writing, (ii) sell, rent, lease, license, loan, provide, distribute or otherwise transfer all or any portion of the Products, except as set forth in Section 2, (iii) reverse engineer, reverse assemble or otherwise attempt to gain access to the source code of all or any portion of the Products, (iv) use the Products for third-party outsourcing, commercial time-sharing or service bureau use, (v) remove, alter, cover or obfuscate any copyright notices, trademark notices or other proprietary rights notices placed or embedded on or in the Products, or (vi) cause or permit any third party to do any of the foregoing. Reseller acknowledges that information necessary to achieve interoperability of the Products with other programs is available upon request.

(c) Updates. Company may provide Updates at its sole discretion. Updates to any component of the Products may only be used as permitted for such component in this Section 3.

4. Prices and Payment.

(a) Per-Seat Fees. Reseller will pay the fees set forth in the then-current Company Price List in accordance with the provisions of this Section 4 for Products licensed from Company by Reseller.

(b) Payment Terms. Company shall submit an invoice to Reseller upon delivery of Products to Reseller. The invoice shall state the amount to be paid by Reseller for all Products in such delivery, as well as any taxes, duties or excises paid by Company which shall be reimbursed by Reseller. Subject to approval of Reseller's credit by Company, the full invoiced amount for each delivery of Products from Company to Reseller shall be paid net thirty (30) days. All payments shall be in U.S. Dollars.

(c) Price List; Price Changes. Reseller shall pay Company for each license granted to a Customer pursuant to this Agreement the price for such Products as set forth in then-current Company Price List. All monetary amounts in this Agreement are in U.S. Dollars and do not include shipping charges, value-added taxes, sales taxes or other applicable taxes or duties, which will be paid by Reseller. Company shall have the right to revise the Company Price List at any time in Company's sole discretion, provided that Company shall not change the Company Price List within less than thirty (30) days of any preceding change. Price increases shall apply to all orders received and all copies of Products made by Reseller or third parties after the effective date of such price changes; provided, that Company shall honor any prices quoted in valid, unexpired, formal written price quotations provided by Company to Reseller in connection with specific transactions between Reseller and its Customers.

(d) Late Payments. All amounts which are not paid by Reseller as required by this Agreement shall be subject to a late charge equal to one and one-half percent (1.5%) per month (or, if less, the maximum allowed by applicable law). In the event that any payment due hereunder is overdue, Company reserves the right, at its discretion and without limiting any other right or remedy available to Company, to suspend performance until such delinquency is corrected, delay the delivery or processing of any orders or payments, or terminate this Agreement.

(e) Credit Limit. Company may, in its discretion, set a credit limit for Reseller which will be reviewed and adjusted by Company annually. Company will process orders up to the amount of Reseller's credit limit in accordance with the payment terms set out in this Agreement. When the total amount invoiced by Company to Reseller reaches the credit limit, whether or not such invoiced amounts are due, all future orders for Products must be pre-paid by Reseller until the total amount invoiced to Reseller has been reduced to less than the credit limit.

(f) Expenses; Taxes. Reseller will be solely responsible for the payment of all expenses incurred by Reseller in its performance of this Agreement, including, but not limited to, local promotion and advertising, travel, delivery and handling charges, bad debts, debt collection, lawsuits between Reseller and any third party, and all taxes and tariffs levied by a government authority in the Territory, including, but not limited to, excise taxes, sales taxes, withholding taxes, use taxes and value-added taxes associated with the use, importation or supply of the Products. If, for any reason, Company is required to pay any of the expenses, taxes, duties or excises noted above which are not included in the per-seat fees charged for the Product, Reseller will reimburse Company and such charges will be added to the invoiced amounts as separate itemized charges, provided, that Reseller shall not be required to make any such reimbursement if it provides a valid tax exemption certificate to Company prior to delivery.

5. Supply of Products.

(a) Orders. Reseller shall initiate orders under this Agreement by using the Company online ordering capability or such other form as Company may prescribe or accept from time to time, and by issuing a valid order which references this Agreement. Such orders shall state license quantities, product descriptions, requested Delivery Dates, and delivery instructions. No order shall be binding upon Company until accepted by Company in writing. Company reserves the right to reject orders in whole or in part if the volume of orders from Customers for Products exceeds Company's capacity to supply such Products. Partial delivery of an order shall not constitute acceptance of the entire order. In the event that Company is unable to fill an accepted order in accordance with the schedule set forth therein, Company shall use commercially reasonable efforts to fill such order on an allotment or scheduled release basis. This Agreement shall govern all orders placed by Reseller for licenses of the Products. No terms on orders, invoices or like documents produced by Reseller shall alter or add to the terms of this Agreement. The terms of this Agreement will apply to all orders and will not be superseded or supplemented by any terms contained in any Reseller order.

(b) Delivery. Unless otherwise agreed by the parties, Company will deliver the Product electronically by sending an e-mail to Reseller setting out the service code or other necessary credentials for use of the Products licensed to Customer pursuant to this Agreement. Reseller is responsible for delivering the credentials to the Customers. Company will not be liable or responsible to Reseller, or anyone claiming through Reseller, for any loss or damage arising out of a failure or delay in delivery, late delivery or partial delivery of any credentials. Risk of loss or damage will pass to Reseller at the Company place of shipment upon delivery and will constitute full and final delivery by Company.

6. Product Changes. Company shall have the right to make design modifications to Products at any time in its sole discretion. If any such modification to a Product represents a material change to the Product's form, fit, or function, Company shall provide written notice to Reseller and Reseller shall have the right to request adjustment to the quantity and/or Delivery Date for any open order for that Product, including to cancel such order, provided that if Company cannot in its reasonable discretion satisfy Reseller's request, Reseller's sole remedy shall be to cancel such order.

7. Records; Audit.

(a) Records. For two (2) years after each calendar quarter during the Term of this Agreement, Reseller will keep at Reseller's office(s) full and accurate books of account and copies of all documents and other materials for such quarter relating to this Agreement and Reseller's records, accounts and contracts relating to the distribution of the Products.

(b) Audit. During the Term of this Agreement and for two (2) years thereafter, Company shall have the right to inspect and audit Reseller's use, deployment, and exploitation of the Products, and the records maintained by Reseller in accordance with Section 7(a), to confirm Reseller's compliance with the terms and conditions of this Agreement, including Reseller's payment obligations hereunder.

8. Limited Warranty; Support.

(a) Limited Warranty. During the Term, Company warrants that the Product will perform substantially in accordance with the accompanying Documentation. Company's entire liability and the Customers' and Resellers' exclusive remedy for a breach of the preceding limited warranty shall be, at Company's option, (i) to provide a fix, patch, or work-around, or (iii) if in Company's judgment (i) is not commercially practicable refund the license fee actually paid by the Reseller for the Product.

(b) Administrative Support. Reseller shall be responsible for all customer support of all kinds in relation to its resale of the Products to Customers, including but not limited to setting up accounts, managing billing, and telephone and other customer support.

9. Ownership.

(a) Proprietary Rights. Company or its Suppliers own all right, title and interest (including without limitation all intellectual property rights), in and to the Products and any modifications or improvements thereto, whether or not made by Company. Reseller acknowledges that the licenses granted under this Agreement do not provide Reseller with title to or ownership of the Products, but only a right of limited use under the terms and conditions of this Agreement. Except as expressly set forth in Sections 2 and 3, Company reserves all rights and grants Reseller no licenses of any kind hereunder. Reseller hereby assigns to Company all information, including but not limited to feedback or suggestions, provided to Company with respect to the Products, and such information shall be deemed Confidential Information.

(b) Proprietary Notices. Reseller will ensure that all copies of the Products or promotional materials will incorporate copyright and other proprietary notices in the same manner that Company incorporates such notices in the Products or in any manner reasonably requested by Company. Reseller will not remove any copyright or other proprietary notices incorporated on or in the Products or promotional materials by Company.

(c) Use of Trademarks. During the Term of this Agreement, Reseller may advertise the Products under the trademarks, marks, and trade names that Company may provide from time to time (the "Company Trademarks"). Reseller understands that Company may have applied for applicable federal and state registration of certain of its trademarks and agrees, upon Company's request, to so indicate on the Products and in any advertisement, promotional materials or other documents that contain the Products' names. Nothing herein will grant to Reseller any right, title or interest in Company Trademarks. At no time during or after the Term of this Agreement will Reseller challenge or assist others to challenge Company Trademarks or the registration thereof or attempt to register any trademarks, marks or trade names confusingly similar to those of Company. Reseller will follow reasonable trademark usage guidelines communicated by Company, will provide examples of its usage of the Company Trademarks upon request by Company, and will promptly correct any deviations from such guidelines upon notification by Company of such deviations.

(d) Use of Trade Names. Reseller will present and promote the sale of the Products fairly. Reseller may represent itself as an authorized reseller of Company and use Company's product names in Reseller's advertising and promotional media provided (i) that Reseller conspicuously indicates in all such media that such names are trademarks of Company and (ii) that Reseller submits all such media to Company for prior approval and satisfies the requirements set forth in Section 9(c). Upon termination of this Agreement for any reason, Reseller will immediately cease all use of the Products' names and Company Trademarks and, at Reseller's election, destroy or deliver to Company all materials in Reseller's control or possession which bear such names and trademarks, including any sales literature. Reseller will not challenge any intellectual property rights claimed by Company in such trademarks.

(e) Use of Marketing Materials. Company may provide Reseller with marketing materials, such as marketing literature, Company logos, and/or artwork, as Company may determine in its sole discretion (the "Marketing Materials"). Company hereby grants Reseller permission to use, reproduce, translate, and distribute the Marketing Materials solely in connection with Reseller's distribution of Products hereunder. Upon termination of this Agreement for any reason, Reseller will immediately cease all use of the Marketing Materials and, at Reseller's election, destroy or deliver to Company all Marketing Materials in Reseller's control or possession.

10. Confidentiality.

(a) Confidential Information. During the Term of this Agreement and at all times thereafter, Reseller shall maintain Confidential Information in confidence and use the same degree of care, but in no event less than reasonable care, to avoid disclosure of Confidential Information as it uses with respect to its own confidential and proprietary information of similar type and importance. Reseller agrees to disclose Confidential Information only to its employees or other agents who have a bona fide need to know solely to perform its obligations or exercise its rights hereunder, who are each subject to written confidentiality obligations regarding the Confidential Information no less restrictive than those contained herein. Except for the distribution and resale of Products as expressly authorized herein, Reseller shall not sell, license, sublicense, publish, display, distribute, disclose or otherwise make available the Confidential Information to any third party nor use such information except as authorized by this Agreement. Reseller agrees to immediately notify Company of the unauthorized disclosure or use of the Products or Confidential Information and to assist Company in remedying such unauthorized use or disclosure. It is further understood and agreed that any breach of this Section 10 would cause irreparable harm to Company and its Suppliers, entitling Company or its Suppliers to injunctive relief in addition to all other remedies available at equity or law.

(b) Exceptions. Notwithstanding the above, Reseller shall be under no obligation not to disclose any information that it can prove: (i) was in the public domain at the time it was disclosed or has entered the public domain through no fault of Reseller; (ii) was known to Reseller, without restriction, at the time of disclosure, as demonstrated by files in existence at the time of disclosure; (iii) is disclosed with the prior written approval of Company; (iv) becomes known to Reseller, without restriction, from a source other than Company without breach of this Agreement by Reseller and otherwise not in violation of Company's rights; or (v) is disclosed pursuant to the order or requirement of a court, administrative agency, or other governmental body; provided, however, that Reseller shall provide prompt notice thereof to Company to enable Company to seek a protective order or otherwise prevent or restrict such disclosure.

11. Indemnification.

(a) By Reseller. Reseller shall indemnify, defend and hold Company harmless against any and all third party claims for losses, costs, liabilities, and damages finally awarded by a court of competent jurisdiction against Company in connection with such claims or agreed to in a settlement, including reasonable attorneys' fees, which are arise or result from (i) any gross negligence, willful misconduct or fraud of Reseller or any of its employees or other agents; (ii) material uncured breach by Reseller or any of its employees or other agents of this Agreement; (iii) violation of any applicable law, rule or regulation; provided that Company (w) notifies Reseller promptly in writing of any such action; provided that Company's failure to timely provide such notice shall not relieve Reseller of its indemnification obligations except to the extent Reseller can demonstrate actual prejudice as a result of such failure, (x) gives Reseller exclusive control and authority over the defense or settlement of such action, (y) does not enter into any settlement or compromise of any such action without the prior written consent of Reseller and (z) provides all reasonable assistance to Reseller at the request of Reseller.

(b) By Company. Company shall indemnify, defend and hold Reseller harmless against any and all third party claims alleging that the Products infringe any valid U.S. patent or copyright for losses, costs, liabilities, and damages finally awarded by a court of competent jurisdiction against Reseller in connection with such claims or agreed to in a settlement, including reasonable attorneys' fees; provided that Reseller (i) notifies Company promptly in writing of any such action; provided that Reseller's failure to timely provide such notice shall not relieve Company of its indemnification obligations except to the extent Company can demonstrate actual prejudice as a result of such failure, (ii) gives Company exclusive control and authority over the defense or settlement of such action, (iii) does not enter into any settlement or compromise of any such action without the prior written consent of Company and (iv) provides all reasonable assistance to Company at the request of Company. If any Product becomes, or in the opinion of Company may become, the subject of an infringement claim, Company may, at its option, (x) procure for Reseller or its Customer the right to continue using such Product, (y) modify or replace such Product with substantially equivalent noninfringing products, or (z) require the return or destruction of such Product and refund to Reseller a pro-rata portion of the license fee of such Product on a three-year straight line amortization of the license fee.

(c) Exceptions. Notwithstanding the foregoing, Company shall have no indemnification obligations with respect to any third party action alleging that (i) the use of any Products, or any part of them, in combination with products or technology not supplied by Company, or (ii) any service or other process utilizing any Products, infringes any third party intellectual property right.

(d) THIS SECTION 11 STATES THE ENTIRE LIABILITY FOR Company AND THE SOLE REMEDY FOR RESELLER FOR ANY CLAIM OF INFRINGEMENT OF ANY THIRD PARTY INTELLECTUAL PROPERTY RIGHTS BY THE PRODUCTS.

12. Warranty Disclaimer. EXCEPT AS EXPRESSLY PROVIDED HEREIN, THE PRODUCTS ARE PROVIDED "AS IS", AND Company AND ITS SUPPLIERS MAKE NO WARRANTY, EXPRESS, IMPLIED, STATUTORY OR OTHERWISE, WITH RESPECT TO PRODUCTS OR ANY PART THEREOF, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTY OF TITLE, MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NONINFRINGEMENT, OR THOSE ARISING FROM COURSE OF PERFORMANCE, DEALING, USAGE OR TRADE. WITHOUT LIMITING THE GENERALITY OF THE FOREGOING, NEITHER Company NOR ANY OF ITS SUPPLIERS WARRANT THAT THE PRODUCTS OR ANY PART THEREOF WILL MEET RESELLER'S REQUIREMENTS OR BE UNINTERRUPTED, OR ERROR-FREE, OR THAT ANY ERRORS IN THE PRODUCTS WILL BE CORRECTED.

13. Term and Termination.

(a) This Agreement shall commence as of the Effective Date and continue for a minimum 90 day commitment for service after first use. Thereafter, this Agreement shall be renewed automatically for one (1) year unless, at least thirty (30) days prior to the end of the term, either party gives written notice to the other that it does not intend to renew (the initial term and any renewal thereof together the "Term").

(b) Termination for Convenience. Company may terminate this Agreement immediately at any time for any reason or for no reason by providing Reseller with thirty (30) days' prior written notice.

(c) Termination for Cause. Except as set forth in the last sentence of this Section 13(b), either party may terminate this Agreement upon written notice if the other party defaults in the performance of any material provision of this Agreement and such default is not cured within thirty (30) days of written notice thereof. Notwithstanding the foregoing, if Reseller breaches the provisions of Sections 3(b) and/or 10, then Company shall be entitled to terminate this Agreement effective immediately upon delivery of written notice to Reseller.

(d) Termination for Insolvency and Related Events. This Agreement shall terminate, without notice, (i) upon the institution by or against either party of insolvency, receivership or bankruptcy proceedings or any other proceedings for the settlement of such party's debts, (ii) upon either party's making an assignment for the benefit of creditors, or (iii) upon either party's dissolution or ceasing to do business.

(e) Effect of Termination. If this Agreement is terminated, then all of Reseller's rights and licenses with respect to the Products shall terminate; provided that each Customer license granted in accordance with this Agreement shall survive in accordance with its terms, subject to termination for default in accordance with its terms. Upon termination, Reseller must destroy all copies of the Products and any and all promotional literature, price quotations, order forms, data, information and other items received by Reseller from Company in connection with this Agreement. In the event of termination by either party in accordance with any of the provisions of this Agreement, neither party shall be liable to the other, because of such termination, for compensation, reimbursement or damages on account of the loss of prospective profits or anticipated sales or on account of expenditures, inventory, investments, leases or commitments in connection with the business or goodwill of either party. Termination shall not, however, relieve either party of any obligations incurred prior to the termination, including, without limitation, the obligation of Reseller to pay Company for Products licensed to Customer pursuant to this Agreement.

(f) Survival. The provisions of Sections 1, 7(a), 2(g), 2(h), 3(b), 7 and 9 through 17 of this Agreement, and all payment obligations incurred during the Term of this Agreement, shall survive the expiration or termination of this Agreement for any reason. All other rights and obligations of the parties shall cease upon termination of this Agreement.

14. Import and Export Requirements. Reseller shall, at its own expense, pay all import and export licenses and permits, customs charges and duty fees, if any, and shall take all other actions, if any, required to accomplish the export and import of the Products licensed to Customer pursuant to this Agreement or reproduced by Reseller. The Products are specifically subject to U.S. Export Administration Regulations. Reseller agrees to strictly comply with all export, re-export and import restrictions and regulations of the Department of Commerce or other agency or authority of the United States or other applicable countries, and not to transfer, or authorize the transfer of, directly or indirectly, the Products or any direct product thereof to a prohibited country or otherwise in violation of any such restrictions or regulations. Reseller's failure to comply with this Section is a material breach of this Agreement.

15. Government Restricted Rights. As defined in FAR section 2.101, DFAR section 252.2277014(a)(1) and DFAR section 252.227-7014(a)(5) or otherwise, the Products provided in connection with this Agreement are "commercial items," "commercial computer software" and/or "commercial computer software documentation." Consistent with DFAR section 227.7202, FAR section 12.212 and other sections, any use, modification, reproduction, release, performance, display, disclosure or distribution thereof by or for the U.S. Government shall be governed solely by the terms of this Agreement and shall be prohibited except to the extent expressly permitted by the terms of this Agreement. Any technical data provided that is not covered by the above provisions shall be deemed "technical data-commercial items" pursuant to DFAR section 227.7015(a). Any use, modification, reproduction, release, performance, display or disclosure of such technical data shall be governed by the terms of DFAR section 227.7015(b).

16. Limitation of Liability. TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL Company OR ITS SUPPLIERS BE LIABLE FOR THE COST OF PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, LOSS OF PROFITS, OR FOR ANY SPECIAL, CONSEQUENTIAL, INCIDENTAL, PUNITIVE OR INDIRECT DAMAGES (OR DIRECT DAMAGES IN THE CASE OF THE SUPPLIERS) ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, TORT (INCLUDING WITHOUT LIMITATION NEGLIGENCE), STRICT LIABILITY OR OTHERWISE ARISING OUT OF OR UNDER THIS AGREEMENT OR ANY USE OR INABILITY TO USE THE PRODUCTS, OR FOR BREACH OF THIS AGREEMENT. Company'S TOTAL LIABILITY ARISING OUT OF OR UNDER THIS AGREEMENT, OR USE OR INABILITY TO USE THE PRODUCTS, OR FOR BREACH OF THIS AGREEMENT, WHETHER IN CONTRACT, TORT (INCLUDING WITHOUT LIMITATION NEGLIGENCE), STRICT LIABILITY OR OTHERWISE, SHALL NOT EXCEED THE AMOUNT RECEIVED BY Company FROM RESELLER HEREUNDER. THE LIMITATIONS SET FORTH IN THIS SECTION SHALL APPLY EVEN IF Company AND/OR ITS SUPPLIERS ARE ADVISED OF THE POSSIBILITY OF SUCH DAMAGE, AND NOTWITHSTANDING THE FAILURE OF ESSENTIAL PURPOSE OF ANY LIMITED REMEDY.

17. General.

(a) Governing Law and Jurisdiction. This Agreement is governed and interpreted in accordance with the laws of the State of California without reference to conflicts of laws principles and excluding the United Nations Convention on Contracts for the Sale of Goods. The parties consent to the exclusive jurisdiction of, and venue in, San Francisco County, California.

(b) Legal Compliance. Reseller shall at all times perform its obligations hereunder in compliance in all material respects with all applicable federal, state, and local laws and regulations of all applicable domestic jurisdictions, and in such a manner as not to cause Company to be in violation of any applicable laws or regulations including, without limitation, any applicable requirements of any federal, state, and local authority relating to the collection, dissemination, transfer, storage and use of data, specifically including, without limitation, the privacy and security of confidential, personal, sensitive or other protected data.

(c) Assignment. Reseller shall not transfer, assign or delegate this Agreement or any rights or obligations hereunder, whether voluntarily, by operation of law or otherwise, without the prior written consent of Company. Company may freely transfer, assign, or delegate this Agreement without restriction. Any transfer or assignment in violation of this Section 17(c) shall be null and void and of no effect. Subject to the foregoing, the terms and conditions of this Agreement shall be binding upon and inure to the benefit of the parties to it and their respective heirs, successors, assigns and legal representatives.

(d) Merger, Modification and Waiver. This Agreement constitutes the entire agreement between Company and Reseller with respect to the subject matter hereof, and merges all prior negotiations and drafts of the parties with regard thereto. No modification of or amendment to this Agreement, nor any waiver of any rights under this Agreement, by Company shall be effective unless in writing. If there is any conflict between the terms and conditions of this Agreement and the terms and conditions of any order or other document, the terms and conditions of this Agreement shall prevail. The waiver of one breach or default or any delay in exercising any rights shall not constitute a waiver of any subsequent breach or default.

(e) Severability. If any of the provisions of this Agreement is held by a court of competent jurisdiction to be invalid or unenforceable under any applicable statute or rule of law, it shall be replaced with the valid provision that most closely reflects the intent of the parties and the remaining provisions shall continue in full force and effect.

(f) Notices. All notices permitted or required under this Agreement shall be in writing and shall be delivered in person; by courier, overnight delivery, or confirmed fax; or mailed by first class, registered or certified mail, postage prepaid, to the address of the party specified above or such address as either party may specify in writing. Such notice shall be deemed to have been given upon receipt.

(g) Counterparts. This Agreement may be executed in counterparts, each of which shall be deemed an original and all of which together shall constitute one instrument.

(h) Advice of Legal Counsel. Each party acknowledges and represents that, in executing this Agreement, it has had the opportunity to seek advice as to its legal rights from legal counsel and that the person signing on its behalf has read and understood all of the terms and provisions of this Agreement. This Agreement shall not be construed against any party by reason of the drafting or preparation thereof.

[Signature Page Follows]

IN WITNESS WHEREOF, the parties have caused this Agreement to be executed by their duly authorized representatives.

THE COMPANY:

${v.companyName}

By:_________________________
(Signature)

Name:_________________________
Title:_________________________
Date:_________________________


RESELLER:

${v.resellerName}

By:_________________________
(Signature)

Name:_________________________
Title:_________________________
Date:_________________________


EXHIBIT A

STATEMENT OF WORK No. 1

Products and Pricing:

${v.productsAndPricing}

Territory:

${v.territory}

Additional Terms:

[The Reseller shall be entitled to a commission of ${v.commissionRate} on all net revenues collected by Company in the event of direct sales of any Products as described above to any Reseller Customers to the extent that such Customers have been previously identified in writing via report card submissions to be delivered by Reseller to Company no later than ${v.reportCardDeadline} after making a Customer introduction to Company.]


EXHIBIT B

SALES, APPLICATIONS, AND MARKETING SUPPORT AND TRAINING

Company shall provide training and support to Reseller and Customers as follows:

Sales Support

Company may, from time to time, offer sales support to Reseller which may include assistance with Product demonstrations, qualification of potential Customers, proofs of concept, sales positioning and technical assistance. Company reserves the right to determine the nature and scope of any sales support offered to Reseller.

Product Support

While Reseller will be responsible for providing technical support for the Products for its Customers in the Territory, Company will provide emergency backup technical support services ("Support") to Customers in the Territory who maintain a valid subscription to the Product. Support will be provided in accordance with the applicable TOC for the Products.

Marketing Support

Promotional Materials. Company will provide Reseller with electronic brochures and other promotional literature in the English language that Company deems appropriate for Reseller to promote, solicit and obtain orders for the Products inside the Territory. At Reseller's request, Company will provide Reseller with any updated promotional literature that it makes generally available to its resellers.

Promotional Product. Company will, at its discretion, provide Reseller with a reasonable number of licenses for the Products for the limited purposes of internal training, promotion and demonstration of the Products. Reseller will comply with and be bound by the terms of the applicable TOC for such Products and will not use such Product licenses other than for the limited purposes stated in this section. Reseller will not resell, lease, rent or license any Product licenses provided under this section. Reseller will maintain a detailed record of the number and location of all Product licenses, keys or credentials provided under this section and will provide Company with a copy of such record upon request.

Training

Company will make available to Reseller, from time to time, training in the sale, use and promotion of the Products. Reseller will submit the names, qualifications, skills and relevant experience of its proposed trainees to Company for prior approval. The training will be offered during regularly scheduled training sessions at a facility that Company may designate. Reseller will bear all travel, lodging and out-of-pocket expenses that its trainees may incur in attending these sessions. Company may charge Reseller for such training at the Company then-current standard rates.


EXHIBIT C

SERVICE LEVEL AGREEMENT

Service Commitment

Company will use commercially reasonable efforts to make the Company Service available with a Monthly Uptime Percentage, as described below, during any monthly billing cycle (the "Service Commitment"). In the event the Company Service does not meet the Service Commitment, you will be eligible to receive a Service Credit as described below.

Definitions

The following definitions apply to the SLA:

"Covered Service" means the Company Service.

"Error Rate" means the number of Valid Requests that result in a response with HTTP Status 500 and Code "Internal Error" divided by the total number of Valid Requests during that period. Repeated identical requests do not count towards the Error Rate unless they conform to the Back-off Requirements.

"Monthly Uptime Percentage" means 100%, minus the average of Error Rates measured over each period during a monthly billing cycle.

"Valid Requests" are requests that conform to the Documentation, and that would normally result in a non-error response.

"Service Credit" means the following for the Multi-Regional storage class of RStor Storage Service:

Monthly Uptime Percentage: Less than 99.98% but greater than or equal to 99.0% — Service Credit: 10%
Monthly Uptime Percentage: Less than 99.0% but greater than or equal to 95.0% — Service Credit: 25%
Monthly Uptime Percentage: Less than 95.0% — Service Credit: 100%

Termination

If Company fails to meet a Monthly Uptime Percentage of 98% during any two (2) months during any six (6) month period, Customer may terminate the Agreement thirty (30) days after written notice to Company of the second such failure.

Customer Must Request Service Credit

In order to receive any of the Service Credits described above, Customer must notify Support within thirty days from the time Customer becomes eligible to receive a Service Credit. Failure to comply with this requirement will forfeit Customer's right to receive a Service Credit.

Maximum Service Credit

The aggregate maximum number of Service Credits to be issued by Company to Customer in a single billing month will not exceed 50% of the amount due by Customer for the applicable the Service for the applicable month. Service Credits will be made in the form of a monetary credit applied to future use of the Storage Service and will be applied within 60 days after the Service Credit was requested.

SLA Exclusions

The SLA does not apply to any: (a) features or Services designated Alpha or Beta (unless otherwise set forth in the associated Documentation), (b) features or Services excluded from the SLA (in the associated Documentation) or (c) errors: (i) caused by factors outside of Company's reasonable control; (ii) that resulted from Customer's software or hardware or third party software or hardware, or both; (iii) that resulted from abuses or other behaviors that violate the Agreement.

Periodic pre-scheduled maintenance windows which will typically not impact uptime will not be included in the uptime calculation.`
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
  "agent-marketing-agreement": agentMarketingAgreement,
  "distribution-agreement": distributionAgreement,
  "saas-reseller-agreement": saasResellerAgreement,
}

export function renderTransactionDocument(docId: string, values: Record<string, string>): string | null {
  return RENDERERS[docId]?.(values) ?? null
}
