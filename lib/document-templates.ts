import type { FlowAnswers } from "@/lib/flow"

function today(): string {
  return new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}

function coi(a: FlowAnswers): string {
  return `CERTIFICATE OF INCORPORATION

Article I
The name of the corporation is ${a.companyName}

Article II
The total number of shares of stock that the corporation shall have authority to issue is ten million (10,000,000) shares of Common Stock having a par value of $0.00001 per share.

Article III
The purpose of the corporation is to engage in any lawful act or activity for which corporations may be organized under the General Corporation Law of the State of Delaware.

Article IV
To the fullest extent permitted by the General Corporation Law of the State of Delaware as the same exists or may hereafter be amended, no director or officer of the corporation shall have any liability to the corporation or its stockholders for monetary damages for breach of fiduciary duty as a director or an officer. If the General Corporation Law of the State of Delaware is amended after the date of the filing of this Certificate of Incorporation to authorize corporate action further eliminating or limiting the personal liability of the directors or officers, then the liability of each director and officer of the corporation shall be eliminated or limited to the fullest extent permitted by the General Corporation Law of the State of Delaware, as so amended from time to time. No repeal or modification of this article by the stockholders shall adversely affect any right or protection of a director or an officer of the corporation existing by virtue of this article at the time of such repeal or modification.

Article V
The corporation shall indemnify to the fullest extent not prohibited by law any current or former director of the corporation who is made, or threatened to be made, a party to a threatened, pending or completed action, suit or proceeding, whether civil, criminal, administrative, investigative or other (including an action, suit or proceeding by or in the right of the corporation), by reason of the fact that such person is or was a director, officer, employee or agent of the corporation or a fiduciary within the meaning of the Employee Retirement Income Security Act of 1974 with respect to any employee benefit plan of the corporation, or serves or served at the request of the corporation as a director, officer, employee or agent, or as a fiduciary of an employee benefit plan, of another corporation, partnership, joint venture, trust or other enterprise. The corporation shall pay for or reimburse the reasonable expenses incurred by any such current or former director in any such proceeding in advance of the final disposition of the proceeding if the person sets forth in writing (i) the person's good faith belief that the person is entitled to indemnification under this article and (ii) the person's agreement to repay all advances if it is ultimately determined that the person is not entitled to indemnification under this article. No amendment to this article that limits the corporation's obligation to indemnify any person shall have any effect on such obligation for any act or omission that occurs prior to the later of the effective date of the amendment or the date notice of the amendment is given to the person. This article shall not be deemed exclusive of any other provisions for indemnification or advancement of expenses of directors, officers, employees, agents and fiduciaries that may be included in any statute, bylaw, agreement, general or specific action of the board of directors of the corporation, vote of stockholders or other document or arrangement.

Article VI
The corporation reserves the right to alter, amend or repeal any provision contained in this Certificate of Incorporation, in the manner now or hereafter prescribed by the laws of the State of Delaware. All rights conferred are granted subject to this reservation.

Article VII
The directors need not be elected by written ballot unless required by the bylaws of the corporation.

Article VIII
In furtherance and not in limitation of the powers conferred by the laws of the State of Delaware, the board of directors of the corporation is expressly authorized to adopt, amend or repeal the bylaws of the corporation.

Article IX
The address of the registered office of the corporation in the State of Delaware is ${a.registeredAgentAddress}, and the name of the registered agent at that address is ${a.registeredAgentName}

Article X
The corporation's incorporator is ${a.incorporatorName}, and the incorporator's mailing address is ${a.incorporatorAddress}.

IN WITNESS WHEREOF, the undersigned has signed this Certificate of Incorporation this ${today()}.


_________________________
${a.incorporatorName}, Incorporator`
}

function actionIncorporator(a: FlowAnswers): string {
  const directorsList = a.directors.length > 0 ? a.directors.join("\n") : "[No directors specified]"
  return `ACTION OF INCORPORATOR

The undersigned, being the sole Incorporator of ${a.companyName}, a corporation organized, or to be organized, under the laws of Delaware (the "Company"), hereby adopts the following resolutions pursuant to Section 108 of the Delaware General Corporation Law with respect to the initial organization of the corporation:

1. Adoption of Bylaws

RESOLVED: That the Bylaws attached to this Action of Incorporator as Exhibit A are hereby adopted as the Bylaws of the Company.

RESOLVED FURTHER: That the Secretary of the Company is hereby authorized and directed to execute a certificate of the adoption of the Bylaws and insert it in the Company's Minute Book and that the officers of the Company are ordered to maintain a copy of such Bylaws in the principal office of the Company for the transaction of its business open for inspection by the stockholders at all reasonable times during office hours.

2. Board of Directors

RESOLVED: That each of the following individuals are hereby elected as the directors of the Company, to serve as directors until such director's successor has been duly elected and qualified, or until such time as such director resigns or is removed:

${directorsList}

3. Resignation of Incorporator

RESOLVED: That the undersigned, having taken all actions necessary and appropriate in connection with the incorporation of the Company, hereby resigns as Incorporator.

This Action of Incorporator shall be filed in the Minute Book of the Company and shall be effective immediately following the certification by the Delaware Secretary of State of the filing of the Company's certificate of incorporation; provided, however, that if such event has already occurred before the time of execution of this Action of Incorporator by the undersigned, then this Action of Incorporator shall be effective immediately. This Action of Incorporator shall be deemed revoked if it has not become effective within 60 days of the Actual Date of Signature below, which Actual Date of Signature is the date on which provision for the effectiveness of this Action of Incorporator has been made.

Actual Date of Signature: ${today()}


_________________________
${a.incorporatorName}, Incorporator`
}

function orgResolutions(a: FlowAnswers): string {
  const ceo = a.officers.find((o) => o.title === "CEO")?.name ?? "[Not specified]"
  const secretary = a.officers.find((o) => o.title === "Secretary")?.name ?? "[Not specified]"
  const cfo = a.officers.find((o) => o.title === "CFO")?.name ?? "[Not specified]"
  const directorSignatures =
    a.directors.length > 0
      ? a.directors
          .map((d) => `_________________________\n${d}, Director`)
          .join("\n\n")
      : "_________________________\n[No directors specified], Director"

  return `ACTION BY UNANIMOUS WRITTEN CONSENT
OF THE BOARD OF DIRECTORS

In accordance with Section 141(f) of the Delaware General Corporation Law and the Bylaws of ${a.companyName}, a Delaware corporation (the "Company"), the undersigned, constituting all of the members of the Company's Board of Directors (the "Board"), hereby take the following actions and adopt the following resolutions by unanimous written consent without a meeting:

1. Incorporator

RESOLVED: That every action taken or authorized with respect to the Company by the Incorporator of the Company is ratified and the Incorporator is hereby discharged from any further liabilities or duties with respect to the Company and the Company further agrees to indemnify and hold harmless the Incorporator from any liability incurred in the past or the future with respect to organizing the Company.

2. Minute Book

RESOLVED: That the Company shall maintain as part of its corporate records a book, in electronic or physical form, entitled "Minute Book" which shall include, but not be limited to, (i) a record of its Certificate of Incorporation and amendments thereto, (ii) its Bylaws and amendments thereto, and (iii) minutes of all meetings of its directors and of its stockholders with the time and place of holding, whether regular or special (and if special how authorized), the notice thereof given, the number of shares present or represented at stockholders' meetings, and the proceedings of the meetings.

3. Election of Officers

RESOLVED: That the following persons are elected as officers of the Company to the offices set forth opposite their respective names, to serve at the pleasure of the Board:

Name                                Title(s)
${ceo}                              Chief Executive Officer
${secretary}                        Secretary
${cfo}                              Chief Financial Officer

4. Officers

RESOLVED: That each of the President and the Chief Executive Officer is authorized to sign and deliver any agreement in the name of the Company and to otherwise obligate the Company in any respect relating to matters of the business of the Company, and to delegate such authority in his or her discretion.

5. Employer Identification Number

RESOLVED: That the officers are authorized and directed to apply for an employer identification number on IRS Form SS-4, unless the Incorporator of the Company has previously made such application.

6. Fiscal Year

RESOLVED: That the fiscal year of the Company shall end on December 31 of each year.

7. Incorporation Expenses

RESOLVED: That the officers are authorized and directed to pay the expenses of incorporation and organization of the Company and the expenses incurred in the formation of the Company.

RESOLVED FURTHER: That the Company elects to deduct currently its organizational expenses, as that term is defined by Section 248 of the Internal Revenue Code of 1986, as amended (the "Code"), to the maximum extent provided in Section 248 of the Code and to amortize the balance of its organizational expenses over a period of one hundred eighty (180) months beginning with the month in which the Company begins business; and that the officers are authorized and directed to take such action as necessary to effectuate this election.

8. Withholding Taxes

RESOLVED: That the officers are authorized and directed to consult with the bookkeeper, auditors and attorneys of the Company in order to be fully informed as to, and to collect and pay promptly when due, all withholding taxes for which the Company may now be (or hereafter become) liable.

9. Qualification to Do Business

RESOLVED: That the officers of the Company are authorized to take any and all steps that they deem to be necessary to qualify the Company to do business as a foreign corporation in each state that the officers determine such qualification to be necessary or appropriate.

10. Banking Resolutions

RESOLVED: That the officers of the Company are hereby authorized to open one or more bank accounts at a bank institution in the United States for purposes of enabling the Company to receive deposits and make payments and for any other banking transactions in the ordinary course of business.

RESOLVED FURTHER: That the officers of the Company are hereby authorized and directed to take any and all additional actions and file any other documents necessary to carry out the intent and purposes of the foregoing resolutions.

11. Management of Fiscal Affairs

RESOLVED: That the officers of the Company are authorized and directed, in their discretion, to select and designate from time to time one or more banks or other financial institutions as a depository of funds of the Company, and that the proper officers are authorized to open and maintain, in the name of the Company, a checking, savings, safe deposit, payroll or other account or accounts with said depository.

RESOLVED FURTHER: That the standard form of corporate banking or financial resolutions of such banks or financial institutions necessary to accomplish the foregoing resolution and showing the persons authorized to draw on such account, are approved and adopted as the resolutions of this Board, and the officers are authorized to execute, certify, and deliver a copy thereof to such banks or financial institutions as the resolutions of this Company.

12. Ratification

RESOLVED: That all actions taken heretofore by the Incorporator, officers and directors with respect to all matters contemplated by the foregoing resolutions and the transactions contemplated thereby are hereby approved, adopted, ratified and confirmed.

13. Omnibus Resolution

RESOLVED: That each of the officers is authorized and empowered to take all such actions (including, without limitation, soliciting appropriate consents or waivers from stockholders) and to execute and deliver all such documents as may be necessary or advisable to carry out the intent and accomplish the purposes of the foregoing resolutions and to effect any transactions contemplated thereby and the performance of any such actions and the execution and delivery of any such documents shall be conclusive evidence of the approval of the Board thereof and all matters relating thereto.

In accordance with the Company's Bylaws, this action may be executed in writing, or consented to by electronic transmission, in any number of counterparts, each of which when so executed shall be deemed to be an original and all of which taken together shall constitute one and the same action.

The consent of the undersigned shall be effective immediately upon the election of the undersigned as directors of the corporation; provided, however, that if such event has already occurred before the time of execution of this consent by the undersigned, then this consent shall be effective immediately. This consent shall be deemed revoked if it has not become effective within 60 days of the Actual Date of Signature below, which Actual Date of Signature is the date on which provision for the effectiveness of this consent has been made.

Actual Date of Signature: ${today()}


${directorSignatures}`
}

const RENDERERS: Partial<Record<string, (a: FlowAnswers) => string>> = {
  coi,
  "action-incorporator": actionIncorporator,
  "org-resolutions": orgResolutions,
}

export function renderDocumentContent(docId: string, answers: FlowAnswers): string | null {
  return RENDERERS[docId]?.(answers) ?? null
}
