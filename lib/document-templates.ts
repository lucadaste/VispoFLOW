import type { FlowAnswers } from "@/lib/flow"

function today(): string {
  return new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}

function currentYear(): number {
  return new Date().getFullYear()
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

function bylaws(a: FlowAnswers): string {
  const secretary = a.officers.find((o) => o.title === "Secretary")?.name ?? "[Not specified]"

  return `BYLAWS

***

I.

CORPORATE OFFICES

1. Offices

In addition to the corporation's registered office set forth in the certificate of incorporation, the Board of Directors may at any time establish other offices at any place or places where the corporation is qualified to do business.

II.

MEETINGS OF STOCKHOLDERS

II.1. Place of Meetings

Meetings of stockholders shall be held at any place, within or outside the state of Delaware, designated by the Board of Directors. The Board of Directors may, in its sole discretion, determine that a meeting of stockholders shall not be held at any place, but may instead be held solely by means of remote communication as authorized by Section 211(a)(2) of the Delaware General Corporation Law. In the absence of any such designation or determination, stockholders' meetings shall be held at the principal place of business of the corporation.

II.2. Annual Meeting

Unless directors are elected by written consent in lieu of an annual meeting as permitted by Section 211(b) of the Delaware General Corporation Law, an annual meeting of stockholders shall be held for the election of directors at such date and time as may be designated by resolution of the Board from time to time. Stockholders may, unless the certificate of incorporation otherwise provides, act by written consent to elect directors; provided, however, that, if such consent is less than unanimous, such action by written consent may be in lieu of holding an annual meeting only if all of the directorships to which directors could be elected at an annual meeting held at the effective time of such action are vacant and are filled by such action. Any other proper business may be transacted at the annual meeting.

II.3. Special Meeting

A special meeting of the stockholders may be called at any time by the Board of Directors, the chairperson of the board, the chief executive officer, the president or shall be called by the president upon the written request of one or more stockholders holding shares in the aggregate entitled to cast not less than 10% of the votes at that meeting.

If a special meeting is called by any person or persons other than the Board of Directors, the chairperson of the board, the chief executive officer or the president, the request shall be in writing, specifying the time of such meeting and the general nature of the business proposed to be transacted, and shall be delivered personally or sent by registered mail or by electronic mail, or other facsimile or electronic transmission to the chairperson of the board, the chief executive officer, the president or the secretary of the corporation. No business may be transacted at such special meeting otherwise than specified in such notice. The officer receiving the request shall cause notice to be promptly given to the stockholders entitled to vote, in accordance with the provisions of Sections 2.04 and 2.05 of this Article II, that a meeting will be held at the time requested by the person or persons calling the meeting, not less than 35 nor more than 60 days after the receipt of the request. If the notice is not given within 20 days after the receipt of the request, the person or persons requesting the meeting may give the notice. Nothing contained in this paragraph of this Section 2.03 shall be construed as limiting, fixing, or affecting the time when a meeting of stockholders called by action of the Board of Directors may be held.

II.4. Notice of Stockholders' Meetings

Unless otherwise provided by law, all notices of meetings with stockholders shall be in writing and shall be sent or otherwise given in accordance with Section 2.05 of these bylaws not less than 10 nor more than 60 days before the date of the meeting to each stockholder entitled to vote at such meeting, as of the record date for determining the stockholders entitled to notice of the meeting. The notice shall specify the place (if any), date and hour of the meeting, and in the case of a special meeting, the purpose or purposes for which the meeting is called.

II.5. Manner of Giving Notice; Affidavit of Notice

Written notice of any meeting of stockholders, if mailed, is given when deposited in the United States mail, postage prepaid, directed to the stockholder at his address as it appears on the records of the corporation. Without limiting the manner by which notice otherwise may be given effectively to stockholders, any notice to stockholders may be given by electronic mail or other electronic transmission, in the manner provided in Section 232 of the Delaware General Corporation Law. An affidavit of the secretary or an assistant secretary or of the transfer agent of the corporation that the notice has been given shall, in the absence of fraud, be prima facie evidence of the facts stated therein.

II.6. Quorum

The holders of a majority of the shares of stock issued and outstanding and entitled to vote thereat, present in person or represented by proxy, shall constitute a quorum at all meetings of the stockholders for the transaction of business except as otherwise provided by statute or by the certificate of incorporation. If, however, such quorum is not present or represented at any meeting of the stockholders, then either (a) the chairperson of the meeting or (b) holders of a majority of the shares of stock entitled to vote who are present, in person or by proxy, shall have power to adjourn the meeting to another place (if any), date or time.

II.7. Adjourned Meeting; Notice

When a meeting is adjourned to another place (if any), date or time, unless these bylaws otherwise require, notice need not be given of the adjourned meeting if the time and place (if any), thereof and the means of remote communications (if any) by which stockholders and proxyholders may be deemed to be present and vote at such adjourned meeting, are announced at the meeting at which the adjournment is taken. At the adjourned meeting the corporation may transact any business that might have been transacted at the original meeting. If the adjournment is for more than 30 days, or if after the adjournment a new record date is fixed for the adjourned meeting, notice of the place (if any), date and time of the adjourned meeting and the means of remote communications (if any) by which stockholders and proxy holders may be deemed to be present in person and vote at such adjourned meeting shall be given to each stockholder of record entitled to vote at the meeting.

II.8. Organization; Conduct of Business

Such person as the Board of Directors may have designated or, in the absence of such a person, the chief executive officer, or in his or her absence, the president or, in his or her absence, such person as may be chosen by the holders of a majority of the shares entitled to vote who are present, in person or by proxy, shall call to order any meeting of the stockholders and act as chairperson of the meeting. In the absence of the secretary of the corporation, the secretary of the meeting shall be such person as the chairperson of the meeting appoints.

The chairperson of any meeting of stockholders shall determine the order of business and the procedure at the meeting, including the manner of voting and the conduct of business. The date and time of opening and closing of the polls for each matter upon which the stockholders will vote at the meeting shall be announced at the meeting.

II.9. Voting

The stockholders entitled to vote at any meeting of stockholders shall be determined in accordance with the provisions of Section 2.12 of these bylaws, subject to the provisions of Sections 217 and 218 of the Delaware General Corporation Law (relating to voting rights of fiduciaries, pledgors and joint owners of stock and to voting trusts and other voting agreements).

Except as may be otherwise provided in the certificate of incorporation, each stockholder shall be entitled to one vote for each share of capital stock held by such stockholder. All elections shall be determined by a plurality of the votes cast, and except as otherwise required by law, all other matters shall be determined by a majority of the votes cast affirmatively or negatively. At any time that, pursuant to the then-effective certificate of incorporation, any shares of stock have more or less than one (1) vote per share on any matter, every reference in these bylaws to a majority or other proportion of the shares shall refer to a majority or other proportion of the votes of the shares.

II.10. Waiver of Notice

Whenever notice is required to be given under any provision of the Delaware General Corporation Law or of the certificate of incorporation or these bylaws, a written waiver thereof, signed by the person entitled to notice, or waiver by electronic mail or other electronic transmission by such person, whether before or after the time stated therein, shall be deemed equivalent to notice. Attendance of a person at a meeting shall constitute a waiver of notice of such meeting, except when the person attends a meeting for the express purpose of objecting, at the beginning of the meeting, to the transaction of any business because the meeting is not lawfully called or convened. Neither the business to be transacted at, nor the purpose of, any regular or special meeting of the stockholders need be specified in any written waiver of notice, or any waiver of notice by electronic transmission, unless so required by the certificate of incorporation or these bylaws.

II.11. Stockholder Action by Written Consent Without a Meeting

Unless otherwise provided in the certificate of incorporation, any action required to be taken at any annual or special meeting of stockholders of the corporation, or any action that may be taken at any annual or special meeting of such stockholders, may be taken without a meeting, without prior notice, and without a vote if a consent in writing, setting forth the action so taken, is (a) signed by the holders of outstanding stock having not less than the minimum number of votes that would be necessary to authorize or take such action at a meeting at which all shares entitled to vote thereon were present and voted, and (b) delivered to the corporation in accordance with Section 228 of the Delaware General Corporation Law.

No written consent shall be effective to take the corporate action referred to therein unless, within 60 days of the first date a written consent is delivered to the corporation, a written consent or consents signed by a sufficient number of holders to take action are delivered to the corporation in the manner prescribed in this Section. A facsimile, electronic mail or other electronic transmission consenting to an action to be taken and transmitted by a stockholder or proxyholder, or by a person or persons authorized to act for a stockholder or proxyholder, shall be deemed to be written and signed for purposes of this Section to the extent permitted by law. Any such consent shall be delivered in accordance with Section 228 of the Delaware General Corporation Law.

Any copy, facsimile or other reliable reproduction of a consent in writing may be substituted or used in lieu of the original writing for any and all purposes for which the original writing could be used, provided that such copy, facsimile or other reproduction shall be a complete reproduction of the entire original writing.

Prompt notice of the taking of the corporate action without a meeting by less than unanimous written consent shall be given to those stockholders who have not consented in writing (including by electronic mail or other electronic transmission as permitted by law). If the action which is consented to is such as would have required the filing of a certificate under any section of the Delaware General Corporation Law if such action had been voted on by stockholders at a meeting thereof, then the certificate filed under such section shall state, in lieu of any statement required by such section concerning any vote of stockholders, that written consent has been given as provided in Section 228 of the Delaware General Corporation Law.

II.12. Record Date for Stockholder Notice; Voting; Giving Consents

(a) In order that the corporation may determine the stockholders entitled to notice of any meeting of stockholders or any adjournment thereof, or to express consent to corporate action in writing without a meeting, or entitled to receive payment of any dividend or other distribution or allotment of any rights, or entitled to exercise any rights in respect of any change, conversion or exchange of stock or for the purpose of any other lawful action, the Board of Directors may fix a record date, which record date shall not precede the date upon which the resolution fixing the record date is adopted by the Board of Directors, and which record date: (1) in the case of determination of stockholders entitled to notice of any meeting of stockholders or any adjournment thereof, shall, unless otherwise required by law, not be more than 60 nor less than 10 days before the date of such meeting and, unless the Board of Directors determines, at the time it fixes such record date, that a later date on or before the date of the meeting shall be the date for determining the stockholders entitled to vote at such meeting, the record date for determining the stockholders entitled to notice of such meeting shall also be the record date for determining the stockholders entitled to vote at such meeting; (2) in the case of determination of stockholders entitled to express consent to corporate action in writing without a meeting, shall not be more than 10 days from the date upon which the resolution fixing the record date is adopted by the Board of Directors; and (3) in the case of any other action, shall not be more than 60 days prior to such other action.

(b) If the Board of Directors does not so fix a record date: (1) the record date for determining stockholders entitled to notice of and to vote at a meeting of stockholders shall be at the close of business on the day next preceding the day on which notice is given, or, if notice is waived, at the close of business on the day next preceding the day on which the meeting is held; (2) the record date for determining stockholders entitled to express consent to corporate action in writing without a meeting, when no prior action of the Board of Directors is required by law, shall be the first date on which a signed written consent setting forth the action taken or proposed to be taken is delivered to the corporation in accordance with applicable law, or, if prior action by the Board of Directors is required by law, shall be at the close of business on the day on which the Board of Directors adopts the resolution taking such prior action; and (3) the record date for determining stockholders for any other purpose shall be at the close of business on the day on which the Board of Directors adopts the resolution relating thereto.

(c) A determination of stockholders of record entitled to notice of or to vote at a meeting of stockholders shall apply to any adjournment of the meeting; provided, however, that the Board of Directors may fix a new record date for the determination of stockholders entitled to vote at the adjourned meeting, and in such case shall also fix as the record date for the stockholders entitled to notice of such adjourned meeting the same or an earlier date as that fixed for the determination of stockholders entitled to vote in accordance with the foregoing provisions of this Section 2.12 at the adjourned meeting.

II.13. Proxies

Each stockholder entitled to vote at a meeting of stockholders or to express consent or dissent to corporate action in writing without a meeting may authorize another person or persons to act for such stockholder by an instrument in writing or by an electronic transmission permitted by law filed with the secretary of the corporation, but no such proxy shall be voted or acted upon after three years from its date, unless the proxy provides for a longer period. A proxy shall be deemed signed if the stockholder's name is placed on the proxy (whether by manual signature, typewriting, facsimile, electronic transmission or otherwise) by the stockholder or the stockholder's attorney-in-fact. The revocability of a proxy that states on its face that it is irrevocable shall be governed by the provisions of Section 212(e) of the Delaware General Corporation Law.

III.

DIRECTORS

III.1. Powers

Subject to the provisions of the Delaware General Corporation Law and any limitations in the certificate of incorporation or these bylaws relating to action required to be approved by the stockholders, the business and affairs of the corporation shall be managed and all corporate powers shall be exercised by or under the direction of the Board of Directors. At any time that, pursuant to the then-effective certificate of incorporation, any director or directors have more or less than one (1) vote per director on any matter, every reference in these bylaws to a majority or other proportion of the directors shall refer to a majority or other proportion of the votes of the directors.

III.2. Number of Directors

The number of directors constituting the Board shall be fixed from time to time by the incorporator or by a resolution of the directors, or the stockholders, in accordance with DGCL Section 141(b). This number may be changed by a resolution of the Board of Directors or of the stockholders, subject to Section 3.04 of these bylaws. No reduction of the authorized number of directors shall have the effect of removing any director before such director's term of office expires.

III.3. Election, Qualification and Term of Office of Directors

Except as provided in Section 3.04 of these bylaws, and unless otherwise provided in the certificate of incorporation, directors shall be elected at each annual meeting of stockholders to hold office until the next annual meeting. Directors need not be stockholders unless so required by the certificate of incorporation or these bylaws, wherein other qualifications for directors may be prescribed. Each director, including a director elected to fill a vacancy, shall hold office until his or her successor is elected and qualified or until his or her earlier resignation or removal.

Unless otherwise specified in the certificate of incorporation, elections of directors need not be by written ballot.

III.4. Resignation and Vacancies

Any director may resign at any time upon written notice to the attention of the Secretary of the corporation. Notwithstanding the provisions of Section 223(a)(1) and 223(a)(2) of the Delaware General Corporation Law, any vacancy or newly created directorship may be filled by a majority of the directors then in office (including any directors that have tendered a resignation effective at a future date), though less than a quorum, or by a sole remaining director, and the directors so chosen shall hold office until the next annual election and until their successors are duly elected and shall qualify, unless sooner displaced; provided, however, that where such vacancy or newly created directorship occurs among the directors elected by the holders of a class or series of stock, the holders of shares of such class or series may override the Board of Directors' action to fill such vacancy or newly created directorship by (i) voting for their own designee to fill such vacancy or newly created directorship at a meeting of the corporation's stockholders or (ii) written consent, if the consenting stockholders hold a sufficient number of shares to elect their designee at a meeting of the stockholders.

If at any time, by reason of death or resignation or other cause, the corporation should have no directors in office, then any officer or any stockholder or an executor, administrator, trustee or guardian of a stockholder, or other fiduciary entrusted with like responsibility for the person or estate of a stockholder, may call a special meeting of stockholders in accordance with the provisions of the certificate of incorporation or these bylaws, or may apply to the Court of Chancery for a decree summarily ordering an election as provided in Section 211 of the Delaware General Corporation Law.

If, at the time of filling any vacancy or any newly created directorship, the directors then in office constitute less than a majority of the whole board (as constituted immediately prior to any such increase), then the Court of Chancery may, upon application of any stockholder or stockholders holding at least 10% of the total number of the shares at the time outstanding having the right to vote for such directors, summarily order an election to be held to fill any such vacancies or newly created directorships, or to replace the directors chosen by the directors then in office as aforesaid, which election shall be governed by the provisions of Section 211 of the Delaware General Corporation Law as far as applicable.

III.5. Place of Meetings; Meetings by Telephone

The Board of Directors of the corporation may hold meetings, both regular and special, either within or outside the state of Delaware.

Unless otherwise restricted by the certificate of incorporation or these bylaws, members of the Board of Directors, or any committee designated by the Board of Directors, may participate in a meeting of the Board of Directors, or any committee, by means of conference telephone or other communications equipment by means of which all persons participating in the meeting can hear each other, and such participation in a meeting shall constitute presence in person at the meeting.

III.6. Regular Meetings

Regular meetings of the Board of Directors may be held without notice at such time and at such place as shall from time to time be determined by the board.

III.7. Special Meetings; Notice

Special meetings of the Board of Directors for any purpose or purposes may be called at any time by the chairperson of the board, the chief executive officer, the president, the secretary or any two directors.

Notice of the time and place of special meetings shall be delivered personally or by telephone to each director or sent by first-class mail, facsimile, electronic mail or other electronic transmission, charges prepaid, addressed to each director at that director's address as it is shown on the records of the corporation. If the notice is mailed, it shall be deposited in the United States mail at least 4 days before the time of the holding of the meeting. If the notice is delivered personally or by facsimile, electronic mail or other electronic transmission, or telephone, it shall be delivered at least 24 hours before the time of the holding of the meeting. Any oral notice given personally or by telephone may be communicated either to the director or to a person at the office of the director who the person giving the notice has reason to believe will promptly communicate it to the director. The notice need not specify the purpose of the meeting. The notice need not specify the place of the meeting, if the meeting is to be held at the principal executive office of the corporation. Unless otherwise indicated in the notice thereof, any and all business may be transacted at a special meeting.

III.8. Quorum

At all meetings of the Board of Directors, a majority of the total number of duly elected directors then in office (but in no case less than 1/3 of the total number of authorized directors) shall constitute a quorum for the transaction of business and the act of a majority of the directors present at any meeting at which there is a quorum shall be the act of the Board of Directors, except as may be otherwise specifically provided by statute or by the certificate of incorporation. If a quorum is not present at any meeting of the Board of Directors, then the directors present thereat may adjourn the meeting from time to time, without notice other than announcement at the meeting, until a quorum is present.

III.9. Waiver of Notice

Whenever notice is required to be given under any provision of the Delaware General Corporation Law or of the certificate of incorporation or these bylaws, a written waiver thereof, signed by the person entitled to notice, or waiver by electronic mail or other electronic transmission by such person, whether before or after the time stated therein, shall be deemed equivalent to notice. Attendance of a person at a meeting shall constitute a waiver of notice of such meeting, except when the person attends a meeting for the express purpose of objecting, at the beginning of the meeting, to the transaction of any business because the meeting is not lawfully called or convened. Neither the business to be transacted at, nor the purpose of, any regular or special meeting of the directors, or members of a committee of directors, need be specified in any written waiver of notice unless so required by the certificate of incorporation or these bylaws.

III.10. Board Action by Written Consent Without a Meeting

Unless otherwise restricted by the certificate of incorporation or these bylaws, any action required or permitted to be taken at any meeting of the Board of Directors, or of any committee thereof, may be taken without a meeting if all members of the board or committee, as the case may be, consent thereto in writing or by electronic transmission. After an action is taken, the consent or consents relating thereto shall be filed with the minutes of the proceedings of the Board of Directors, or the committee thereof, in the same paper or electronic form as the minutes are maintained.

Any copy, facsimile or other reliable reproduction of a consent in writing may be substituted or used in lieu of the original writing for any and all purposes for which the original writing could be used, provided that such copy, facsimile or other reproduction shall be a complete reproduction of the entire original writing.

III.11. Fees and Compensation of Directors

Unless otherwise restricted by the certificate of incorporation or these bylaws, the Board of Directors shall have the authority to fix the compensation of directors. No such compensation shall preclude any director from serving the corporation in any other capacity and receiving compensation therefor.

III.12. Approval of Loans to Officers

The corporation may lend money to, or guarantee any obligation of, or otherwise assist any officer or other employee of the corporation or of its subsidiary, including any officer or employee who is a director of the corporation or its subsidiary, whenever, in the judgment of the directors, such loan, guaranty or assistance may reasonably be expected to benefit the corporation. The loan, guaranty or other assistance may be with or without interest and may be unsecured, or secured in such manner as the Board of Directors shall approve, including, without limitation, a pledge of shares of stock of the corporation. Nothing in this section shall be deemed to deny, limit or restrict the powers of guaranty or warranty of the corporation at common law or under any statute.

III.13. Removal of Directors

Unless otherwise restricted by statute, by the certificate of incorporation or by these bylaws, any director or the entire Board of Directors may be removed, with or without cause, by, and only by, the affirmative vote of the holders of the shares of the class or series of stock entitled to elect such director or directors, given either at a special meeting of such stockholders duly called for that purpose or pursuant to a written consent of stockholders, and any vacancy thereby created may be filled by the holders of that class or series of stock represented at the meeting or pursuant to written consent; provided, however, that if the stockholders of the corporation are entitled to cumulative voting, if less than the entire Board of Directors is to be removed, no director may be removed without cause if the votes cast against his removal would be sufficient to elect him if then cumulatively voted at an election of the entire Board of Directors.

No reduction of the authorized number of directors shall have the effect of removing any director prior to the expiration of such director's term of office.

III.14. Chairperson of the Board of Directors

The corporation may also have, at the discretion of the Board of Directors, a chairperson of the Board of Directors who shall not be considered an officer of the corporation.

IV.

COMMITTEES

IV.1. Committees of Directors

The Board of Directors may designate one or more committees, each committee to consist of one or more of the directors of the corporation. The Board may designate 1 or more directors as alternate members of any committee, who may replace any absent or disqualified member at any meeting of the committee. In the absence or disqualification of a member of a committee, the member or members present at any meeting and not disqualified from voting, whether or not such member or members constitute a quorum, may unanimously appoint another member of the Board of Directors to act at the meeting in the place of any such absent or disqualified member. Any such committee, to the extent provided in the resolution of the Board of Directors, or in these bylaws, shall have and may exercise all the powers and authority of the Board of Directors in the management of the business and affairs of the corporation, and may authorize the seal of the corporation to be affixed to all papers which may require it; but no such committee shall have the power or authority in reference to the following matters: (i) approving or adopting, or recommending to the stockholders, any action or matter expressly required by the General Corporate Law of Delaware to be submitted to stockholders for approval or (ii) adopting, amending or repealing any Bylaw of the corporation.

IV.2. Committee Minutes

Each committee shall keep regular minutes of its meetings and report the same to the Board of Directors when required.

IV.3. Meetings and Action of Committees

Meetings and actions of committees shall be governed by, and held and taken in accordance with, the provisions of Section 3.05 (place of meetings and meetings by telephone), Section 3.06 (regular meetings), Section 3.07 (special meetings and notice), Section 3.08 (quorum), Section 3.09 (waiver of notice), and Section 3.10 (action without a meeting) of these bylaws, with such changes in the context of such provisions as are necessary to substitute the committee and its members for the Board of Directors and its members; provided, however, that the time of regular meetings of committees may be determined either by resolution of the Board of Directors or by resolution of the committee, that special meetings of committees may also be called by resolution of the Board of Directors and that notice of special meetings of committees shall also be given to all alternate members, who shall have the right to attend all meetings of the committee. The Board of Directors may adopt rules for the government of any committee not inconsistent with the provisions of these bylaws.

Article V.

OFFICERS

1. Officers

The officers of the corporation shall be a president and a secretary. The corporation may also have, at the discretion of the Board of Directors, a chief executive officer, a chief financial officer, a treasurer, one or more vice presidents, one or more assistant secretaries, one or more assistant treasurers, and any such other officers as may be appointed in accordance with the provisions of Section 5.03 of these bylaws. Any number of offices may be held by the same person.

2. Appointment of Officers

The officers of the corporation, except such officers as may be appointed in accordance with the provisions of Sections 5.03 or 5.05 of these bylaws, shall be appointed by the Board of Directors, subject to the rights (if any) of an officer under any contract of employment.

3. Subordinate Officers

The Board of Directors may appoint, or empower the chief executive officer or the president to appoint, such other officers and agents as the business of the corporation may require, each of whom shall hold office for such period, have such authority, and perform such duties as are provided in these bylaws or as the Board of Directors may from time to time determine.

4. Removal and Resignation of Officers

Subject to the rights (if any) of an officer under any contract of employment, any officer may be removed, either with or without cause, by an affirmative vote of the majority of the Board of Directors at any regular or special meeting of the board or, except in the case of an officer chosen by the Board of Directors, by any officer upon whom the power of removal is conferred by the Board of Directors.

Any officer may resign at any time by giving written notice to the corporation (including written notice by electronic mail, or other facsimile or electronic transmission). Any resignation shall take effect at the date of the receipt of that notice or at any later time specified in that notice; and, unless otherwise specified in that notice, the acceptance of the resignation shall not be necessary to make it effective. Any resignation is without prejudice to the rights (if any) of the corporation under any contract to which the officer is a party.

5. Vacancies in Offices

Any vacancy occurring in any office of the corporation shall be filled by the Board of Directors.

6. Chief Executive Officer

Subject to such supervisory powers (if any) as may be given by the Board of Directors to the chairperson of the board (if any), the chief executive officer of the corporation (if such an officer is appointed) shall, subject to the control of the Board of Directors, have general supervision, direction, and control of the business and the officers of the corporation and shall have the general powers and duties of management usually vested in the office of chief executive officer of a corporation and shall have such other powers and duties as may be prescribed by the Board of Directors or these bylaws.

The person serving as chief executive officer shall also be the acting president of the corporation whenever no other person is then serving in such capacity.

7. President

Subject to such supervisory powers (if any) as may be given by the Board of Directors to the chairperson of the board (if any) or the chief executive officer, the president shall have general supervision, direction, and control of the business and other officers of the corporation. He or she shall have the general powers and duties of management usually vested in the office of president of a corporation and such other powers and duties as may be prescribed by the Board of Directors or these bylaws.

The person serving as president shall also be the acting chief executive officer, secretary or treasurer of the corporation, as applicable, whenever no other person is then serving in such capacity.

8. Vice Presidents

In the absence or disability of the chief executive officer and president, the vice presidents (if any) in order of their rank as fixed by the Board of Directors or, if not ranked, a vice president designated by the Board of Directors, shall perform all the duties of the president and when so acting shall have all the powers of, and be subject to all the restrictions upon, the president. The vice presidents shall have such other powers and perform such other duties as from time to time may be prescribed for them respectively by the Board of Directors, these bylaws, the president or the chairperson of the board.

9. Secretary

The secretary shall keep or cause to be kept, at the principal executive office of the corporation or such other place as the Board of Directors may direct, a book of minutes of all meetings and actions of directors, committees of directors, and stockholders. The minutes shall show the time and place of each meeting, the names of those present at directors' meetings or committee meetings, the number of shares present or represented at stockholders' meetings, and the proceedings thereof.

The secretary shall keep, or cause to be kept, at the principal executive office of the corporation or at the office of the corporation's transfer agent or registrar, as determined by resolution of the Board of Directors, a share register, or a duplicate share register, showing the names of all stockholders and their addresses, the number and classes of shares held by each, the number and date of certificates (if any) evidencing such shares, and the number and date of cancellation of every certificate (if any) surrendered for cancellation.

The secretary shall give, or cause to be given, notice of all meetings of the stockholders and of the Board of Directors required to be given by law or by these bylaws. He or she shall have such other powers and perform such other duties as may be prescribed by the Board of Directors or by these bylaws.

10. Chief Financial Officer

The chief financial officer (if such an officer is appointed) shall keep and maintain, or cause to be kept and maintained, adequate and correct books and records of accounts of the properties and business transactions of the corporation, including accounts of its assets, liabilities, receipts, disbursements, gains, losses, capital, retained earnings and shares. The books of account shall at all reasonable times be open to inspection by any member of the Board of Directors.

The chief financial officer shall render to the chief executive officer, the president, or the Board of Directors, upon request, an account of all his or her transactions as chief financial officer and of the financial condition of the corporation. He or she shall have the general powers and duties usually vested in the office of chief financial officer of a corporation and shall have such other powers and perform such other duties as may be prescribed by the Board of Directors or these bylaws.

The person serving as the chief financial officer shall also be the acting treasurer of the corporation whenever no other person is then serving in such capacity. Subject to such supervisory powers (if any) as may be given by the Board of Directors to another officer of the corporation, the chief financial officer shall supervise and direct the responsibilities of the treasurer whenever someone other than the chief financial officer is serving as treasurer of the corporation.

11. Treasurer

The treasurer (if such an officer is appointed) shall keep and maintain, or cause to be kept and maintained, adequate and correct books and records with respect to all bank accounts, deposit accounts, cash management accounts and other investment accounts of the corporation. The books of account shall at all reasonable times be open to inspection by any member of the Board of Directors.

The treasurer shall deposit, or cause to be deposited, all moneys and other valuables in the name and to the credit of the corporation with such depositories as may be designated by the Board of Directors. He or she shall disburse the funds of the corporation as may be ordered by the Board of Directors and shall render to the chief financial officer, the chief executive officer, the president or the Board of Directors, upon request, an account of all his or her transactions as treasurer. He or she shall have the general powers and duties usually vested in the office of treasurer of a corporation and shall have such other powers and perform such other duties as may be prescribed by the Board of Directors or these bylaws.

The person serving as the treasurer shall also be the acting chief financial officer of the corporation whenever no other person is then serving in such capacity.

12. Representation of Shares of Other Corporations

The chairperson of the board, the chief executive officer, the president, any vice president, the chief financial officer, the secretary or assistant secretary of this corporation, or any other person authorized by the Board of Directors or the chief executive officer or the president or a vice president, is authorized to vote, represent, and exercise on behalf of this corporation all rights incident to any and all shares of any other corporation or corporations standing in the name of this corporation. The authority granted herein may be exercised either by such person directly or by any other person authorized to do so by proxy or power of attorney duly executed by the person having such authority.

13. Authority and Duties of Officers

In addition to the foregoing authority and duties, all officers of the corporation shall respectively have such authority and perform such duties in the management of the business of the corporation as may be designated from time to time by the Board of Directors or the stockholders.

VI.

INDEMNIFICATION OF DIRECTORS, OFFICERS, EMPLOYEES, AND OTHER AGENTS

1. Indemnification of Directors and Officers

The corporation shall, to the maximum extent and in the manner permitted by the Delaware General Corporation Law, indemnify each of its directors and officers against expenses (including attorneys' fees), judgments, fines, settlements and other amounts actually and reasonably incurred in connection with any proceeding, arising by reason of the fact that such person is or was an agent of the corporation. For purposes of this Section 6.01, a "director" or "officer" of the corporation includes any person (a) who is or was a director or officer of the corporation, (b) who is or was serving at the request of the corporation as a director or officer of another corporation, partnership, joint venture, trust or other enterprise, or (c) who was a director or officer of a corporation which was a predecessor corporation of the corporation or of another enterprise at the request of such predecessor corporation.

2. Indemnification of Others

The corporation shall have the power, to the maximum extent and in the manner permitted by the Delaware General Corporation Law, to indemnify each of its employees and agents (other than directors and officers) against expenses (including attorneys' fees), judgments, fines, settlements and other amounts actually and reasonably incurred in connection with any proceeding, arising by reason of the fact that such person is or was an agent of the corporation. For purposes of this Section 6.02, an "employee" or "agent" of the corporation (other than a director or officer) includes any person (a) who is or was an employee or agent of the corporation, (b) who is or was serving at the request of the corporation as an employee or agent of another corporation, partnership, joint venture, trust or other enterprise, or (c) who was an employee or agent of a corporation which was a predecessor corporation of the corporation or of another enterprise at the request of such predecessor corporation.

3. Payment of Expenses in Advance

Expenses incurred in defending any action or proceeding for which indemnification is required pursuant to Section 6.01 or for which indemnification is permitted pursuant to Section 6.02 following authorization thereof by the Board of Directors shall be paid by the corporation in advance of the final disposition of such action or proceeding upon receipt of an undertaking by or on behalf of the indemnified party to repay such amount if it shall ultimately be determined by final judicial decision from which there is no further right to appeal that the indemnified party is not entitled to be indemnified as authorized in this Article VI.

4. Indemnity Not Exclusive

The indemnification provided by this Article VI shall not be deemed exclusive of any other rights to which those seeking indemnification may be entitled under any Bylaw, agreement, vote of stockholders or disinterested directors or otherwise, both as to action in an official capacity and as to action in another capacity while holding such office, to the extent that such additional rights to indemnification are authorized in the certificate of incorporation.

5. Insurance

The corporation may purchase and maintain insurance on behalf of any person who is or was a director, officer, employee or agent of the corporation, or is or was serving at the request of the corporation as a director, officer, employee or agent of another corporation, partnership, joint venture, trust or other enterprise against any liability asserted against him or her and incurred by him or her in any such capacity, or arising out of his or her status as such, whether or not the corporation would have the power to indemnify him or her against such liability under the provisions of the Delaware General Corporation Law.

6. Conflicts

No indemnification or advance shall be made under this Article VI, except where such indemnification or advance is mandated by law or the order, judgment or decree of any court of competent jurisdiction, in any circumstance where it appears:

(a) That it would be inconsistent with a provision of the certificate of incorporation, these bylaws, a resolution of the stockholders or an agreement in effect at the time of the accrual of the alleged cause of the action asserted in the proceeding in which the expenses were incurred or other amounts were paid, which prohibits or otherwise limits indemnification; or

(b) That it would be inconsistent with any condition expressly imposed by a court in approving a settlement.

VII.

RECORDS AND REPORTS

1. Maintenance and Inspection of Records

The corporation shall, either at its principal executive offices or at such place or places as designated by the Board of Directors, keep a record of its stockholders listing their names and addresses and the number and class of shares held by each stockholder, a copy of these bylaws as amended to date, accounting books, and other records.

A complete list of stockholders entitled to vote at any meeting of stockholders, arranged in alphabetical order for each class of stock and showing the address of each such stockholder and the number of shares registered in each such stockholder's name, shall be open to the examination of any such stockholder for a period of at least 10 days prior to the meeting in the manner provided by law. The stock list shall also be open to the examination of any stockholder during the whole time of the meeting as provided by law. This list shall presumptively determine the identity of the stockholders entitled to vote at the meeting and the number of shares held by each of them.

If and so long as there are fewer than one hundred (100) holders of record of the corporation's shares, any state law requirement of sending of an annual report to the stockholders of the corporation is hereby expressly waived, to the extent permitted.

2. Inspection by Directors

Any director shall have the right to examine the corporation's stock ledger, a list of its stockholders, and its other books and records for a purpose reasonably related to his or her position as a director. The Court of Chancery is hereby vested with the exclusive jurisdiction to determine whether a director is entitled to the inspection sought. The Court may summarily order the corporation to permit the director to inspect any and all books and records, the stock ledger, and the stock list and to make copies or extracts therefrom. The Court may, in its discretion, prescribe any limitations or conditions with reference to the inspection, or award such other and further relief as the Court may deem just and proper.

VIII.

GENERAL MATTERS

1. Checks

From time to time, the Board of Directors shall determine by resolution which person or persons may sign or endorse all checks, drafts, other orders for payment of money, notes or other evidences of indebtedness that are issued in the name of or payable to the corporation, and only the persons so authorized shall sign or endorse those instruments.

2. Execution of Corporate Contracts and Instruments

The Board of Directors, except as otherwise provided in these bylaws, may authorize any officer or officers, or agent or agents, to enter into any contract or execute any instrument in the name of and on behalf of the corporation; such authority may be general or confined to specific instances. Unless so authorized or ratified by the Board of Directors or within the agency power of an officer, no officer, agent or employee shall have any power or authority to bind the corporation by any contract or engagement or to pledge its credit or to render it liable for any purpose or for any amount.

3. Stock Certificates and Notices; Uncertificated Stock; Partly Paid Shares

The shares of the corporation may be certificated or uncertificated, as provided under Delaware law, and shall be entered in the books of the corporation and recorded as they are issued. Any duly appointed officer of the corporation is authorized to sign share certificates. Any or all of the signatures on any certificate may be a facsimile or electronic signature. In case any officer, transfer agent or registrar who has signed or whose facsimile or electronic signature has been placed upon a certificate has ceased to be such officer, transfer agent or registrar before such certificate is issued, it may be issued by the corporation with the same effect as if he or she were such officer, transfer agent or registrar at the date of issue.

Within a reasonable time after the issuance or transfer of uncertificated stock and upon the request of a stockholder, the corporation shall send to the record owner thereof a written notice that shall set forth the name of the corporation, that the corporation is organized under the laws of Delaware, the name of the stockholder, the number and class (and the designation of the series, if any) of the shares, and any restrictions on the transfer or registration of such shares of stock imposed by the corporation's certificate of incorporation, these bylaws, any agreement among stockholders or any agreement between stockholders and the corporation.

The corporation may issue the whole or any part of its shares as partly paid and subject to call for the remainder of the consideration to be paid therefor. Upon the face or back of each stock certificate (if any) issued to represent any such partly paid shares, or upon the books and records of the corporation in the case of uncertificated partly paid shares, the total amount of the consideration to be paid therefor and the amount paid thereon shall be stated. Upon the declaration of any dividend on fully paid shares, the corporation shall declare a dividend upon partly paid shares of the same class, but only upon the basis of the percentage of the consideration actually paid thereon.

4. Special Designation on Certificates and Notices of Issuance

If the corporation is authorized to issue more than one class of stock or more than one series of any class, then the powers, the designations, the preferences, and the relative, participating, optional or other special rights of each class of stock or series thereof and the qualifications, limitations or restrictions of such preferences and/or rights shall be set forth in full or summarized on the face or back of the certificate that the corporation shall issue to represent such class or series of stock or the notice of issuance to the record owner of uncertificated stock; provided, however, that, except as otherwise provided in Section 202 of the Delaware General Corporation Law, in lieu of the foregoing requirements there may be set forth on the face or back of the certificate that the corporation shall issue to represent such class or series of stock or the notice of issuance to the record owner of uncertificated stock, or the purchase agreement for such stock a statement that the corporation will furnish without charge to each stockholder who so requests the powers, the designations, the preferences, and the relative, participating, optional or other special rights of each class of stock or series thereof and the qualifications, limitations or restrictions of such preferences and/or rights.

5. Lost Certificates

Except as provided in this Section 8.05, no new certificates for shares shall be issued to replace a previously issued certificate unless the latter is surrendered to the corporation and cancelled at the same time. The corporation may issue a new certificate of stock or notice of uncertificated stock in the place of any certificate previously issued by it, alleged to have been lost, stolen or destroyed, and the corporation may require the owner of the lost, stolen or destroyed certificate, or the owner's legal representative, to give the corporation a bond sufficient to indemnify it against any claim that may be made against it on account of the alleged loss, theft or destruction of any such certificate or the issuance of such new certificate or uncertificated shares.

6. Construction; Definitions

Unless the context requires otherwise, the general provisions, rules of construction, and definitions in the Delaware General Corporation Law shall govern the construction of these bylaws. Without limiting the generality of this provision, the singular number includes the plural, the plural number includes the singular, and the term "person" includes both a corporation and a natural person.

7. Dividends

The directors of the corporation, subject to any restrictions contained in (a) the Delaware General Corporation Law or (b) the certificate of incorporation, may declare and pay dividends upon the shares of its capital stock. Dividends may be paid in cash, in property, or in shares of the corporation's capital stock.

The directors of the corporation may set apart out of any of the funds of the corporation available for dividends a reserve or reserves for any proper purpose and may abolish any such reserve. Such purposes shall include but not be limited to equalizing dividends, repairing or maintaining any property of the corporation, and meeting contingencies.

8. Fiscal Year

The fiscal year of the corporation shall be fixed by resolution of the Board of Directors and may be changed by the Board of Directors.

9. Transfer Of Stock

Upon receipt by the corporation or the transfer agent of the corporation of proper transfer instructions from the record holder of uncertificated shares or upon surrender to the corporation or the transfer agent of the corporation of a certificate for shares duly endorsed or accompanied by proper evidence of succession, assignation or authority to transfer, it shall be the duty of the corporation to issue a new certificate or, in the case of uncertificated securities and upon request, a notice of issuance of shares, to the person entitled thereto, cancel the old certificate (if any) and record the transaction in its books.

10. Stock Transfer Agreements

The corporation shall have power to enter into and perform any agreement with any number of stockholders of any one or more classes of stock of the corporation to restrict the transfer of shares of stock of the corporation of any one or more classes owned by such stockholders in any manner not prohibited by the Delaware General Corporation Law.

11. Stockholders of Record

The corporation shall be entitled to recognize the exclusive right of a person recorded on its books as the owner of shares to receive dividends and to vote as such owner, shall be entitled to hold liable for calls and assessments the person recorded on its books as the owner of shares, and shall not be bound to recognize any equitable or other claim to or interest in such share or shares on the part of another person, whether or not it shall have express or other notice thereof, except as otherwise provided by the laws of Delaware.

12. Facsimile or Electronic Signature

In addition to the provisions for use of facsimile or electronic signatures elsewhere specifically authorized in these bylaws, facsimile or electronic signatures of any stockholder, director or officer of the corporation may be used whenever and as authorized by the Board of Directors or a committee thereof.

IX.

AMENDMENTS

The Bylaws of the corporation may be adopted, amended or repealed by the stockholders entitled to vote; provided, however, that the corporation may, in its certificate of incorporation, confer the power to adopt, amend or repeal Bylaws upon the directors. The fact that such power has been so conferred upon the directors shall not divest the stockholders of the power, nor limit their power to adopt, amend or repeal Bylaws.


CERTIFICATE OF ADOPTION OF BYLAWS BY INCORPORATOR

The undersigned person appointed in the certificate of incorporation to act as the Incorporator of ${a.companyName}, a Delaware corporation, hereby adopts the foregoing Bylaws as the Bylaws of the corporation.

Executed on ${today()}


_________________________
${a.incorporatorName}, Incorporator


SECRETARY'S CERTIFICATE

The undersigned hereby certifies that the undersigned is the duly elected, qualified, and acting Secretary of ${a.companyName}, a Delaware corporation, and that the foregoing Bylaws were adopted as the Bylaws of the corporation on ${today()}, by the person appointed in the certificate of incorporation to act as the Incorporator of the corporation.

Executed on ${today()}


_________________________
${secretary}, Secretary`
}

function optionPool(a: FlowAnswers): string {
  const year = currentYear()

  return `${year} STOCK PLAN

1. Purposes of the Plan. The purposes of this ${year} Stock Plan are to attract and retain the best available personnel for positions of substantial responsibility, to provide additional incentive to Employees and Consultants, and to promote the success of the Company's business. Options granted under the Plan may be Incentive Stock Options or Nonstatutory Stock Options, as determined by the Administrator at the time of grant of an Option and subject to the applicable provisions of Section 422 of the Code and the regulations promulgated thereunder. Restricted Stock may also be granted under the Plan.

2. Definitions. As used herein, the following definitions shall apply:

(a) "Administrator" means the Board or a Committee.

(b) "Affiliate" means (i) an entity other than a Subsidiary which, together with the Company, is under common control of a third person or entity and (ii) an entity other than a Subsidiary in which the Company and /or one or more Subsidiaries own a controlling interest.

(c) "Applicable Laws" means all applicable laws, rules, regulations and requirements, including, but not limited to, all applicable U.S. federal or state laws, any Stock Exchange rules or regulations, and the applicable laws, rules or regulations of any other country or jurisdiction where Options or Restricted Stock are granted under the Plan or Participants reside or provide services, as such laws, rules, and regulations shall be in effect from time to time.

(d) "Award" means any award of an Option or Restricted Stock under the Plan.

(e) "Board" means the Board of Directors of the Company.

(f) "California Participant" means a Participant whose Award is issued in reliance on Section 25102(o) of the California Corporations Code.

(g) "Cashless Exercise" means a program approved by the Administrator in which payment of the Option exercise price or tax withholding obligations or other required deductions may be satisfied, in whole or in part, with Shares subject to the Option, including by delivery of an irrevocable direction to a securities broker (on a form prescribed by the Company) to sell Shares and to deliver all or part of the sale proceeds to the Company in payment of such amount.

(h) "Cause" for termination of a Participant's Continuous Service Status will exist (unless another definition is provided in an applicable Option Agreement, Restricted Stock Purchase Agreement, employment agreement or other applicable written agreement) if the Participant's Continuous Service Status is terminated for any of the following reasons: (i) any material breach by Participant of any material written agreement between Participant and the Company and Participant's failure to cure such breach within 30 days after receiving written notice thereof; (ii) any failure by Participant to comply with the Company's material written policies or rules as they may be in effect from time to time; (iii) neglect or persistent unsatisfactory performance of Participant's duties and Participant's failure to cure such condition within 30 days after receiving written notice thereof; (iv) Participant's repeated failure to follow reasonable and lawful instructions from the Board or Chief Executive Officer and Participant's failure to cure such condition within 30 days after receiving written notice thereof; (v) Participant's conviction of, or plea of guilty or nolo contendere to, any crime that results in, or is reasonably expected to result in, material harm to the business or reputation of the Company; (vi) Participant's commission of or participation in an act of fraud against the Company; (vii) Participant's intentional material damage to the Company's business, property or reputation; or (viii) Participant's unauthorized use or disclosure of any proprietary information or trade secrets of the Company or any other party to whom the Participant owes an obligation of nondisclosure as a result of his or her relationship with the Company. For purposes of clarity, a termination without "Cause" does not include any termination that occurs as a result of Participant's death or disability. The determination as to whether a Participant's Continuous Service Status has been terminated for Cause shall be made in good faith by the Company and shall be final and binding on the Participant. The foregoing definition does not in any way limit the Company's ability to terminate a Participant's employment or consulting relationship at any time, and the term "Company" will be interpreted to include any Subsidiary, Parent, Affiliate, or any successor thereto, if appropriate.

(i) "Change of Control" means (i) a sale of all or substantially all of the Company's assets other than to an Excluded Entity (as defined below), (ii) a merger, consolidation or other capital reorganization or business combination transaction of the Company with or into another corporation, limited liability company or other entity other than an Excluded Entity, or (iii) the consummation of a transaction, or series of related transactions, in which any "person" (as such term is used in Sections 13(d) and 14(d) of the Exchange Act) becomes the "beneficial owner" (as defined in Rule 13d-3 of the Exchange Act), directly or indirectly, of all of the Company's then outstanding voting securities.

Notwithstanding the foregoing, a transaction shall not constitute a Change of Control if its purpose is to (A) change the jurisdiction of the Company's incorporation, (B) create a holding company that will be owned in substantially the same proportions by the persons who hold the Company's securities immediately before such transaction, or (C) obtain funding for the Company in a financing that is approved by the Company's Board. An "Excluded Entity" means a corporation or other entity of which the holders of voting capital stock of the Company outstanding immediately prior to such transaction are the direct or indirect holders of voting securities representing at least a majority of the votes entitled to be cast by all of such corporation's or other entity's voting securities outstanding immediately after such transaction.

(j) "Code" means the Internal Revenue Code of 1986, as amended.

(k) "Committee" means one or more committees or subcommittees of the Board consisting of two (2) or more Directors (or such lesser or greater number of Directors as shall constitute the minimum number permitted by Applicable Laws to establish a committee or sub-committee of the Board) appointed by the Board to administer the Plan in accordance with Section 4 below.

(l) "Common Stock" means the Company's common stock.

(m) "Company" means ${a.companyName}, a Delaware corporation.

(n) "Consultant" means (i) any person or entity, including an advisor but not an Employee, that renders, or has rendered, services to the Company, or any Parent, Subsidiary or Affiliate and is compensated for such services, including, without limitation, any person or entity that renders, or has rendered, such services to the Company, or any Parent, Subsidiary or Affiliate as an employee of a third-party staffing agency, professional employer organization (PEO), employer of record (EOR), consulting firm or similar entity or arrangement, and (ii) any Director whether compensated for such services or not.

(o) "Continuous Service Status" means the absence of any interruption or termination of service as an Employee or Consultant. Continuous Service Status as an Employee or Consultant shall not be considered interrupted or terminated in the case of: (i) Company approved sick leave; (ii) military leave; (iii) any other bona fide leave of absence approved by the Company, provided that, if an Employee is holding an Incentive Stock Option and such leave exceeds 3 months then, for purposes of Incentive Stock Option status only, such Employee's service as an Employee shall be deemed terminated on the 1st day following such 3-month period and the Incentive Stock Option shall thereafter automatically become a Nonstatutory Stock Option in accordance with Applicable Laws, unless reemployment upon the expiration of such leave is guaranteed by contract or statute, or unless provided otherwise pursuant to a written Company policy. Also, Continuous Service Status as an Employee or Consultant shall not be considered interrupted or terminated in the case of a transfer between locations of the Company or between the Company, its Parents, Subsidiaries or Affiliates, or their respective successors, or a change in status from an Employee to a Consultant or from a Consultant to an Employee.

(p) "Director" means a member of the Board.

(q) "Disability" means "disability" within the meaning of Section 22(e)(3) of the Code.

(r) "Employee" means any person employed by the Company, or any Parent, Subsidiary or Affiliate, with the status of employment determined pursuant to such factors as are deemed appropriate by the Company in its sole discretion, subject to any requirements of Applicable Laws, including the Code. The payment by the Company of a director's fee shall not be sufficient to constitute "employment" of such director by the Company or any Parent, Subsidiary or Affiliate.

(s) "Exchange Act" means the Securities Exchange Act of 1934, as amended.

(t) "Fair Market Value" means, as of any date, the per share fair market value of the Common Stock, as determined by the Administrator in good faith on such basis as it deems appropriate and applied consistently with respect to Participants. Whenever possible, the determination of Fair Market Value shall be based upon the per share closing price for the Shares as reported in The Wall Street Journal for the applicable date.

(u) "Family Members" means any child, stepchild, grandchild, parent, stepparent, grandparent, spouse, former spouse, sibling, niece, nephew, mother-in-law, father-in-law, son-in-law, daughter-in-law, brother-in-law, or sister-in-law (including adoptive relationships) of the Participant, any person sharing the Participant's household (other than a tenant or employee), a trust in which these persons (or the Participant) have more than 50% of the beneficial interest, a foundation in which these persons (or the Participant) control the management of assets, and any other entity in which these persons (or the Participant) own more than 50% of the voting interests.

(v) "Incentive Stock Option" means an Option intended to, and which does, in fact, qualify as an incentive stock option within the meaning of Section 422 of the Code.

(w) "Listed Security" means any security of the Company that is listed or approved for listing on a national securities exchange or designated or approved for designation as a national market system security on an interdealer quotation system by the Financial Industry Regulatory Authority (or any successor thereto).

(x) "Nonstatutory Stock Option" means an Option that is not intended to, or does not, in fact, qualify as an Incentive Stock Option.

(y) "Option" means a stock option granted pursuant to the Plan.

(z) "Option Agreement" means a written document, the form(s) of which shall be approved from time to time by the Administrator, reflecting the terms of an Option granted under the Plan and includes any documents attached to or incorporated into such Option Agreement, including, but not limited to, a notice of stock option grant and a form of exercise notice.

(aa) "Option Exchange Program" means a program approved by the Administrator whereby outstanding Options (i) are exchanged for Options with a lower exercise price, Restricted Stock, cash or other property or (ii) are amended to decrease the exercise price as a result of a decline in the Fair Market Value.

(bb) "Optioned Stock" means Shares that are subject to an Option or that were issued pursuant to the exercise of an Option.

(cc) "Optionee" means an Employee or Consultant who receives an Option.

(dd) "Parent" means any corporation (other than the Company) in an unbroken chain of corporations ending with the Company if, at the time of grant of the Award, each of the corporations other than the Company owns stock possessing 50% or more of the total combined voting power of all classes of stock in one of the other corporations in such chain. A corporation that attains the status of a Parent on a date after the adoption of the Plan shall be considered a Parent commencing as of such date.

(ee) "Participant" means any holder of one or more Awards or Shares issued pursuant to an Award.

(ff) "Plan" means this ${year} Stock Plan.

(gg) "Restricted Stock" means Shares acquired pursuant to a right to purchase or receive Common Stock granted pursuant to Section 8 below.

(hh) "Restricted Stock Purchase Agreement" means a written document, the form(s) of which shall be approved from time to time by the Administrator, reflecting the terms of Restricted Stock granted under the Plan and includes any documents attached to such agreement.

(ii) "Rule 16b-3" means Rule 16b-3 promulgated under the Exchange Act, as amended from time to time, or any successor provision.

(jj) "Share" means a share of Common Stock, as adjusted in accordance with Section 10 below.

(kk) "Stock Exchange" means any stock exchange or consolidated stock price reporting system on which prices for the Common Stock are quoted at any given time.

(ll) "Subsidiary" means any corporation (other than the Company) in an unbroken chain of corporations beginning with the Company if, at the time of grant of the Award, each of the corporations other than the last corporation in the unbroken chain owns stock possessing 50% or more of the total combined voting power of all classes of stock in one of the other corporations in such chain. A corporation that attains the status of a Subsidiary on a date after the adoption of the Plan shall be considered a Subsidiary commencing as of such date.

(mm) "Ten Percent Holder" means a person who owns stock representing more than 10% of the voting power of all classes of stock of the Company or any Parent or Subsidiary measured as of an Award's date of grant.

3. Stock Subject to the Plan. Subject to the provisions of Section 10 below, the maximum aggregate number of Shares that may be issued under the Plan is ${a.poolShares} Shares, all of which Shares may be issued under the Plan pursuant to Incentive Stock Options. The Shares issued under the Plan may be authorized, but unissued, or reacquired Shares. If an Award should expire or become unexercisable for any reason without having been exercised in full, or is surrendered pursuant to an Option Exchange Program, the unissued Shares that were subject thereto shall, unless the Plan shall have been terminated, continue to be available under the Plan for issuance pursuant to future Awards. In addition, any Shares which are retained by the Company upon exercise of an Award in order to satisfy the exercise or purchase price for such Award or any withholding taxes due with respect to such Award shall be treated as not issued and shall continue to be available under the Plan for issuance pursuant to future Awards. Shares issued under the Plan and later forfeited to the Company due to the failure to vest or repurchased by the Company at the original purchase price paid to the Company for the Shares (including, without limitation, upon forfeiture to or repurchase by the Company in connection with the termination of a Participant's Continuous Service Status) shall again be available for future grant under the Plan. Notwithstanding the foregoing, subject to the provisions of Section 10 below, in no event shall the maximum aggregate number of Shares that may be issued under the Plan pursuant to Incentive Stock Options exceed the number set forth in the first sentence of this Section 3 plus, to the extent allowable under Section 422 of the Code and the Treasury Regulations promulgated thereunder, any Shares that again become available for issuance pursuant to the remaining provisions of this Section 3.

4. Administration of the Plan.

(a) General. The Plan shall be administered by the Board, a Committee appointed by the Board, or any combination thereof, as determined by the Board. The Plan may be administered by different administrative bodies with respect to different classes of Participants and, if permitted by Applicable Laws, the Board may authorize one or more officers of the Company to make Awards under the Plan to Employees and Consultants (who are not subject to Section 16 of the Exchange Act) within parameters specified by the Board.

(b) Committee Composition. If a Committee has been appointed pursuant to this Section 4, such Committee shall continue to serve in its designated capacity until otherwise directed by the Board. From time to time the Board may increase the size of any Committee and appoint additional members thereof, remove members (with or without cause) and appoint new members in substitution therefor, fill vacancies (however caused) and dissolve a Committee and thereafter directly administer the Plan, all to the extent permitted by Applicable Laws and, in the case of a Committee administering the Plan in accordance with the requirements of Rule 16b3 or Section 162(m) of the Code, to the extent permitted or required by such provisions.

(c) Powers of the Administrator. Subject to the provisions of the Plan and, in the case of a Committee, the specific duties delegated by the Board to such Committee, the Administrator shall have the authority, in its sole discretion:

(i) to determine the Fair Market Value in accordance with Section 2(t) above, provided that such determination shall be applied consistently with respect to Participants under the Plan;

(ii) to select the Employees and Consultants to whom Awards may from time to time be granted;

(iii) to determine the number of Shares to be covered by each Award;

(iv) to approve the form(s) of agreement(s) and other related documents used under the Plan;

(v) to determine the terms and conditions, not inconsistent with the terms of the Plan, of any Award granted hereunder, which terms and conditions include but are not limited to the exercise or purchase price, the time or times when Awards may vest and/or be exercised (which may be based on performance criteria), the circumstances (if any) when vesting will be accelerated or forfeiture restrictions will be waived, and any restriction or limitation regarding any Award, Optioned Stock, or Restricted Stock;

(vi) to amend any outstanding Award or agreement related to any Optioned Stock or Restricted Stock, including any amendment adjusting vesting (e.g., in connection with a change in the terms or conditions under which such person is providing services to the Company), provided that no amendment shall be made that would materially and adversely affect the rights of any Participant without his or her consent;

(vii) to determine whether and under what circumstances an Option may be settled in cash under Section 7(c)(iii) below instead of Common Stock;

(viii) subject to Applicable Laws, to implement an Option Exchange Program and establish the terms and conditions of such Option Exchange Program without consent of the holders of capital stock of the Company, provided that no amendment or adjustment to an Option that would materially and adversely affect the rights of any Participant shall be made without his or her consent;

(ix) to approve addenda pursuant to Section 18 below or to grant Awards to, or to modify the terms of, any outstanding Option Agreement or Restricted Stock Purchase Agreement or any agreement related to any Optioned Stock or Restricted Stock held by Participants who are foreign nationals or employed outside of the United States with such terms and conditions as the Administrator deems necessary or appropriate to accommodate differences in local law, tax policy or custom which deviate from the terms and conditions set forth in this Plan to the extent necessary or appropriate to accommodate such differences; and

(x) to construe and interpret the terms of the Plan, any Option Agreement or Restricted Stock Purchase Agreement, and any agreement related to any Optioned Stock or Restricted Stock, which constructions, interpretations and decisions shall be final and binding on all Participants.

(d) Indemnification. To the maximum extent permitted by Applicable Laws, each member of the Committee (including officers of the Company, if applicable), or of the Board, as applicable, shall be indemnified and held harmless by the Company against and from (i) any loss, cost, liability, or expense that may be imposed upon or reasonably incurred by him or her in connection with or resulting from any claim, action, suit, or proceeding to which he or she may be a party or in which he or she may be involved by reason of any action taken or failure to act under the Plan or pursuant to the terms and conditions of any Award except for actions taken in bad faith or failures to act in good faith, and (ii) any and all amounts paid by him or her in settlement thereof, with the Company's approval, or paid by him or her in satisfaction of any judgment in any such claim, action, suit, or proceeding against him or her, provided that such member shall give the Company an opportunity, at its own expense, to handle and defend any such claim, action, suit or proceeding before he or she undertakes to handle and defend it on his or her own behalf. The foregoing right of indemnification shall not be exclusive of any other rights of indemnification to which such persons may be entitled under the Company's Certificate of Incorporation or Bylaws, by contract, as a matter of law, or otherwise, or under any other power that the Company may have to indemnify or hold harmless each such person.

5. Eligibility.

(a) Recipients of Grants. Nonstatutory Stock Options and Restricted Stock may be granted to Employees and Consultants. Incentive Stock Options may be granted only to Employees, provided that Employees of Affiliates shall not be eligible to receive Incentive Stock Options.

(b) Type of Option. Each Option shall be designated in the Option Agreement as either an Incentive Stock Option or a Nonstatutory Stock Option.

(c) ISO $100,000 Limitation. Notwithstanding any designation under Section 5(b) above, to the extent that the aggregate Fair Market Value of Shares with respect to which options designated as incentive stock options are exercisable for the first time by any Optionee during any calendar year (under all plans of the Company or any Parent or Subsidiary) exceeds $100,000, such excess options shall be treated as nonstatutory stock options. For purposes of this Section 5(c), incentive stock options shall be taken into account in the order in which they were granted, and the Fair Market Value of the Shares subject to an incentive stock option shall be determined as of the date of the grant of such option.

(d) No Employment Rights. Neither the Plan nor any Award shall confer upon any Employee or Consultant any right with respect to continuation of an employment or consulting relationship with the Company (any Parent, Subsidiary or Affiliate), nor shall it interfere in any way with such Employee's or Consultant's right or the Company's (Parent's, Subsidiary's or Affiliate's) right to terminate his or her employment or consulting relationship at any time, with or without cause.

6. Term of Plan. The Plan shall become effective upon its adoption by the Board and shall continue in effect for a term of 10 years unless sooner terminated under Section 14 below.

7. Options.

(a) Term of Option. The term of each Option shall be the term stated in the Option Agreement; provided that the term shall be no more than 10 years from the date of grant thereof or such shorter term as may be provided in the Option Agreement and provided further that, in the case of an Incentive Stock Option granted to a person who at the time of such grant is a Ten Percent Holder, the term of the Option shall be 5 years from the date of grant thereof or such shorter term as may be provided in the Option Agreement.

(b) Option Exercise Price and Consideration.

(i) Exercise Price. The per Share exercise price for the Shares to be issued pursuant to the exercise of an Option shall be such price as is determined by the Administrator and set forth in the Option Agreement, but shall be subject to the following:

(1) In the case of an Incentive Stock Option

a. granted to an Employee who at the time of grant is a Ten Percent Holder, the per Share exercise price shall be no less than 110% of the Fair Market Value on the date of grant;

b. granted to any other Employee, the per Share exercise price shall be no less than 100% of the Fair Market Value on the date of grant;

(2) Except as provided in subsection (3) below, in the case of a Nonstatutory Stock Option the per Share exercise price shall be such price as is determined by the Administrator, provided that, if the per Share exercise price is less than 100% of the Fair Market Value on the date of grant, it shall otherwise comply with all Applicable Laws, including Section 409A of the Code; and

(3) Notwithstanding the foregoing, Options may be granted with a per Share exercise price other than as required above pursuant to a merger or other corporate transaction.

(ii) Permissible Consideration. The consideration to be paid for the Shares to be issued upon exercise of an Option, including the method of payment, shall be determined by the Administrator (and, in the case of an Incentive Stock Option and to the extent required by Applicable Laws, shall be determined at the time of grant) and may consist entirely of (1) cash; (2) check; (3) to the extent permitted under, and in accordance with, Applicable Laws, delivery of a promissory note with such recourse, interest, security and redemption provisions as the Administrator determines to be appropriate (subject to the provisions of Section 152 of the Delaware General Corporation Law); (4) cancellation of indebtedness; (5) other previously owned Shares that have a Fair Market Value on the date of surrender equal to the aggregate exercise price of the Shares as to which the Option is exercised; (6) a Cashless Exercise; (7) such other consideration and method of payment permitted under Applicable Laws; or (8) any combination of the foregoing methods of payment. In making its determination as to the type of consideration to accept, the Administrator shall consider if acceptance of such consideration may be reasonably expected to benefit the Company and the Administrator may, in its sole discretion, refuse to accept a particular form of consideration at the time of any Option exercise.

(c) Exercise of Option.

(i) General.

(1) Exercisability. Any Option granted hereunder shall be exercisable at such times and under such conditions as determined by the Administrator, consistent with the terms of the Plan and reflected in the Option Agreement, including vesting requirements and/or performance criteria with respect to the Company, and Parent, Subsidiary or Affiliate, and/or the Optionee.

(2) Leave of Absence. The Administrator shall have the discretion to determine at any time whether and to what extent the vesting of Options shall be tolled during any leave of absence; provided, however, that in the absence of such determination, vesting of Options shall continue during any paid leave and shall be tolled during any unpaid leave (unless otherwise required by Applicable Laws). Notwithstanding the foregoing, in the event of military leave, vesting shall toll during any unpaid portion of such leave, provided that, upon an Optionee's returning from military leave (under conditions that would entitle him or her to protection upon such return under the Uniformed Services Employment and Reemployment Rights Act of 1994, as amended), he or she shall be given vesting credit with respect to Options to the same extent as would have applied had the Optionee continued to provide services to the Company (or any Parent, Subsidiary or Affiliate, if applicable) throughout the leave on the same terms as he or she was providing services immediately prior to such leave.

(3) Minimum Exercise Requirements. An Option may not be exercised for a fraction of a Share. The Administrator may require that an Option be exercised as to a minimum number of Shares, provided that such requirement shall not prevent an Optionee from exercising the full number of Shares as to which the Option is then exercisable.

(4) Procedures for and Results of Exercise. An Option shall be deemed exercised when written notice of such exercise has been received by the Company in accordance with the terms of the Option Agreement by the person entitled to exercise the Option and the Company has received full payment for the Shares with respect to which the Option is exercised and has paid, or made arrangements to satisfy, any applicable taxes, withholding, required deductions or other required payments in accordance with Section 9 below. The exercise of an Option shall result in a decrease in the number of Shares that thereafter may be available, both for purposes of the Plan and for sale under the Option, by the number of Shares as to which the Option is exercised.

(5) Rights as Holder of Capital Stock. Until the issuance of the Shares (as evidenced by the appropriate entry on the books of the Company or of a duly authorized transfer agent of the Company), no right to vote or receive dividends or any other rights as a holder of capital stock shall exist with respect to the Optioned Stock, notwithstanding the exercise of the Option. No adjustment will be made for a dividend or other right for which the record date is prior to the date the stock is issued, except as provided in Section 10 below.

(ii) Termination of Continuous Service Status. The Administrator shall establish and set forth in the applicable Option Agreement the terms and conditions upon which an Option shall remain exercisable, if at all, following termination of an Optionee's Continuous Service Status, which provisions may be waived or modified by the Administrator at any time. To the extent that an Option Agreement does not specify the terms and conditions upon which an Option shall terminate upon termination of an Optionee's Continuous Service Status, the following provisions shall apply:

(1) General Provisions. If the Optionee (or other person entitled to exercise the Option) does not exercise the Option to the extent so entitled within the time specified below, the Option shall terminate and the Optioned Stock underlying the unexercised portion of the Option shall revert to the Plan. In no event may any Option be exercised after the expiration of the Option term as set forth in the Option Agreement (and subject to this Section 7).

(2) Termination other than Upon Disability or Death or for Cause. In the event of termination of an Optionee's Continuous Service Status other than under the circumstances set forth in the subsections (3) through (5) below, such Optionee may exercise any outstanding Option at any time within 3 month(s) following such termination to the extent the Optionee is vested in the Optioned Stock.

(3) Disability of Optionee. In the event of termination of an Optionee's Continuous Service Status as a result of his or her Disability, such Optionee may exercise any outstanding Option at any time within 12 month(s) following such termination to the extent the Optionee is vested in the Optioned Stock.

(4) Death of Optionee. In the event of the death of an Optionee during the period of Continuous Service Status since the date of grant of any outstanding Option, or within 3 month(s) following termination of the Optionee's Continuous Service Status, the Option may be exercised by any beneficiaries designated in accordance with Section 16 below, or if there are no such beneficiaries, by the Optionee's estate, or by a person who acquired the right to exercise the Option by bequest or inheritance, at any time within 12 month(s) following the date the Optionee's Continuous Service Status terminated, but only to the extent the Optionee is vested in the Optioned Stock.

(5) Termination for Cause. In the event of termination of an Optionee's Continuous Service Status for Cause, any outstanding Option (including any vested portion thereof) held by such Optionee shall immediately terminate in its entirety upon first notification to the Optionee of termination of the Optionee's Continuous Service Status for Cause. If an Optionee's Continuous Service Status is suspended pending an investigation of whether the Optionee's Continuous Service Status will be terminated for Cause, all the Optionee's rights under any Option, including the right to exercise the Option, shall be suspended during the investigation period. Nothing in this Section 7(c)(ii)(5) shall in any way limit the Company's right to purchase unvested Shares issued upon exercise of an Option as set forth in the applicable Option Agreement.

(iii) Buyout Provisions. The Administrator may at any time offer to buy out for a payment in cash or Shares an Option previously granted under the Plan based on such terms and conditions as the Administrator shall establish and communicate to the Optionee at the time that such offer is made.

8. Restricted Stock.

(a) Rights to Purchase. When a right to purchase or receive Restricted Stock is granted under the Plan, the Company shall advise the recipient in writing of the terms, conditions and restrictions related to the offer, including the number of Shares that such person shall be entitled to purchase, the price to be paid, if any (which shall be as determined by the Administrator, subject to Applicable Laws, including any applicable securities laws), and the time within which such person must accept such offer. The permissible consideration for Restricted Stock shall be determined by the Administrator and shall be the same as is set forth in Section 7(b)(ii) above with respect to exercise of Options. The offer to purchase Shares shall be accepted by execution of a Restricted Stock Purchase Agreement in the form determined by the Administrator.

(b) Repurchase Option.

(i) General. Unless the Administrator determines otherwise, the Restricted Stock Purchase Agreement shall grant the Company a repurchase option exercisable upon the voluntary or involuntary termination of the Participant's Continuous Service Status for any reason (including death or Disability) at a purchase price for Shares equal to the original purchase price paid by the purchaser to the Company for such Shares and may be paid by cancellation of any indebtedness of the purchaser to the Company. The repurchase option shall lapse at such rate as the Administrator may determine.

(ii) Leave of Absence. The Administrator shall have the discretion to determine at any time whether and to what extent the lapsing of Company repurchase rights shall be tolled during any leave of absence; provided, however, that in the absence of such determination, such lapsing shall continue during any paid leave and shall be tolled during any unpaid leave (unless otherwise required by Applicable Laws). Notwithstanding the foregoing, in the event of military leave, the lapsing of Company repurchase rights shall toll during any unpaid portion of such leave, provided that, upon a Participant's returning from military leave (under conditions that would entitle him or her to protection upon such return under the Uniformed Services Employment and Reemployment Rights Act of 1994, as amended), he or she shall be given vesting credit with respect to Shares purchased pursuant to the Restricted Stock Purchase Agreement to the same extent as would have applied had the Participant continued to provide services to the Company (or any Parent, Subsidiary or Affiliate, if applicable) throughout the leave on the same terms as he or she was providing services immediately prior to such leave.

(c) Other Provisions. The Restricted Stock Purchase Agreement shall contain such other terms, provisions and conditions not inconsistent with the Plan as may be determined by the Administrator in its sole discretion. In addition, the provisions of Restricted Stock Purchase Agreements need not be the same with respect to each Participant.

(d) Rights as a Holder of Capital Stock. Once the Restricted Stock is purchased, the Participant shall have the rights equivalent to those of a holder of capital stock, and shall be a record holder when his or her purchase and the issuance of the Shares is entered upon the records of the duly authorized transfer agent of the Company. No adjustment will be made for a dividend or other right for which the record date is prior to the date the Restricted Stock is purchased, except as provided in Section 10 below.

9. Taxes.

(a) As a condition of the grant, vesting and exercise of an Award, the Participant (or in the case of the Participant's death or a permitted transferee, the person holding or exercising the Award) shall make such arrangements as the Administrator may require for the satisfaction of any applicable U.S. federal, state, local or foreign tax, withholding, and any other required deductions or payments that may arise in connection with such Award. The Company shall not be required to issue any Shares under the Plan until such obligations are satisfied.

(b) The Administrator may, to the extent permitted under Applicable Laws, permit a Participant (or in the case of the Participant's death or a permitted transferee, the person holding or exercising the Award) to satisfy all or part of his or her tax, withholding, or any other required deductions or payments by Cashless Exercise or by surrendering Shares (either directly or by stock attestation) that he or she previously acquired; provided that, unless specifically permitted by the Company, any such Cashless Exercise must be an approved broker-assisted Cashless Exercise or the Shares withheld in the Cashless Exercise must be limited to avoid financial accounting charges under applicable accounting guidance and any such surrendered Shares must have been previously held for any minimum duration required to avoid financial accounting charges under applicable accounting guidance. Any payment of taxes by surrendering Shares to the Company may be subject to restrictions, including, but not limited to, any restrictions required by rules of the Securities and Exchange Commission.

10. Adjustments Upon Changes in Capitalization, Merger or Certain Other Transactions.

(a) Changes in Capitalization. Subject to any action required under Applicable Laws by the holders of capital stock of the Company, (i) the numbers and class of Shares or other stock or securities: (x) available for future Awards under Section 3 above and (y) covered by each outstanding Award, (ii) the exercise price per Share of each such outstanding Option, and (iii) any repurchase price per Share applicable to Shares issued pursuant to any Award, shall be automatically proportionately adjusted in the event of a stock split, reverse stock split, stock dividend, combination, consolidation, reclassification of the Shares or subdivision of the Shares. In the event of any increase or decrease in the number of issued Shares effected without receipt of consideration by the Company, a declaration of an extraordinary dividend with respect to the Shares payable in a form other than Shares in an amount that has a material effect on the Fair Market Value, a recapitalization (including a recapitalization through a large nonrecurring cash dividend), a rights offering, a reorganization, merger, a spin-off, split-up, change in corporate structure or a similar occurrence, the Administrator shall make appropriate adjustments, in its discretion, in one or more of (i) the numbers and class of Shares or other stock or securities: (x) available for future Awards under Section 3 above and (y) covered by each outstanding Award, (ii) the exercise price per Share of each outstanding Option and (iii) any repurchase price per Share applicable to Shares issued pursuant to any Award, and any such adjustment by the Administrator shall be made in the Administrator's sole and absolute discretion and shall be final, binding and conclusive. Except as expressly provided herein, no issuance by the Company of shares of stock of any class, or securities convertible into shares of stock of any class, shall affect, and no adjustment by reason thereof shall be made with respect to, the number or price of Shares subject to an Award. If, by reason of a transaction described in this Section 10(a) or an adjustment pursuant to this Section 10(a), a Participant's Award agreement or agreement related to any Optioned Stock or Restricted Stock covers additional or different shares of stock or securities, then such additional or different shares, and the Award agreement or agreement related to the Optioned Stock or Restricted Stock in respect thereof, shall be subject to all of the terms, conditions and restrictions which were applicable to the Award, Optioned Stock and Restricted Stock prior to such adjustment.

(b) Dissolution or Liquidation. In the event of the dissolution or liquidation of the Company, each Award will terminate immediately prior to the consummation of such action, unless otherwise determined by the Administrator.

(c) Corporate Transactions. In the event of (i) a transfer of all or substantially all of the Company's assets, (ii) a merger, consolidation or other capital reorganization or business combination transaction of the Company with or into another corporation, entity or person, or (iii) the consummation of a transaction, or series of related transactions, in which any "person" (as such term is used in Sections 13(d) and 14(d) of the Exchange Act) becomes the "beneficial owner" (as defined in Rule 13d-3 of the Exchange Act), directly or indirectly, of more than 50% of the Company's then outstanding capital stock (a "Corporate Transaction"), each outstanding Award (vested or unvested) will be treated as the Administrator determines, which determination may be made without the consent of any Participant and need not treat all outstanding Awards (or portion thereof) in an identical manner. Such determination, without the consent of any Participant, may provide (without limitation) for one or more of the following in the event of a Corporate Transaction: (A) the continuation of such outstanding Awards by the Company (if the Company is the surviving corporation); (B) the assumption of such outstanding Awards by the surviving corporation or its parent; (C) the substitution by the surviving corporation or its parent of new options or equity awards for such Awards; (D) the cancellation of such Awards in exchange for a payment to the Participants equal to the excess of (1) the Fair Market Value of the Shares subject to such Awards as of the closing date of such Corporate Transaction over (2) the exercise price or purchase price paid or to be paid for the Shares subject to the Awards; or (E) the cancellation of any outstanding Options or an outstanding right to purchase Restricted Stock, in either case, for no consideration. Notwithstanding anything under this Plan, any Award agreement or otherwise, any escrow, holdback, earn-out or similar provisions agreed to pursuant to, or in connection with, a Corporate Transaction shall, unless otherwise determined by the Board, apply to any payment or other right a Participant may be entitled to under this Plan, if any, to the same extent and in the same manner as such provisions apply generally to the holders of the Company's Common Stock with respect to the Corporate Transaction, but only to the extent permitted by Applicable Law, including (without limitation), Section 409A of the Code.

11. Non-Transferability of Awards.

(a) General. Except as set forth in this Section 11, Awards (or any rights of such Awards) may not be sold, pledged, encumbered, assigned, hypothecated, or disposed of or otherwise transferred in any manner other than by will or by the laws of descent or distribution. The designation of a beneficiary by a Participant will not constitute a transfer. An Option may be exercised, during the lifetime of the holder of the Option, only by such holder or a transferee permitted by this Section 11.

(b) Limited Transferability Rights. Notwithstanding anything else in this Section 11, the Administrator may in its sole discretion provide that any Nonstatutory Stock Options may be transferred by instrument to an inter vivos or testamentary trust in which the Options are to be passed to beneficiaries upon the death of the trustor (settlor) or by gift to Family Members. Further, beginning with (i) the period when the Company begins to rely on the exemption described in Rule 12h-1(f)(1) promulgated under the Exchange Act, as determined by the Board in its sole discretion, and (ii) ending on the earlier of (A) the date when the Company ceases to rely on such exemption, as determined by the Board in its sole discretion, or (B) the date when the Company becomes subject to the reporting requirements of Section 13 or 15(d) of the Exchange Act, an Option, or prior to exercise, the Shares subject to the Option, may not be pledged, hypothecated or otherwise transferred or disposed of, in any manner, including by entering into any short position, any "put equivalent position" or any "call equivalent position" (as defined in Rule 16a-1(h) and Rule 16a-1(b) of the Exchange Act, respectively), other than to (i) persons who are Family Members through gifts or domestic relations orders, or (ii) to an executor or guardian of the Participant upon the death or disability of the Participant. Notwithstanding the foregoing sentence, the Board, in its sole discretion, may permit transfers of Nonstatutory Stock Options to the Company or in connection with a Change of Control or other acquisition transactions involving the Company to the extent permitted by Rule 12h-1(f).

12. Non-Transferability of Stock Underlying Awards.

(a) General. Notwithstanding anything to the contrary, no Participant or other stockholder shall Transfer (as such term is defined below) any Shares (or any rights of or interests in such Shares) acquired pursuant to any Award (including, without limitation, Shares acquired upon exercise of an Option) to any person or entity unless such Transfer is approved by the Company prior to such Transfer, which approval may be granted or withheld in the Company's sole and absolute discretion. "Transfer" shall mean, with respect to any security, the direct or indirect assignment, sale, transfer, tender, pledge, hypothecation, or the grant, creation or suffrage of a lien or encumbrance in or upon, or the gift, placement in trust, or the Constructive Sale (as such term is defined below) or other disposition of such security (including transfer by testamentary or intestate succession, merger or otherwise by operation of law) or any right, title or interest therein (including, but not limited to, any right or power to vote to which the holder thereof may be entitled, whether such right or power is granted by proxy or otherwise), or the record or beneficial ownership thereof, the offer to make such a sale, transfer, Constructive Sale or other disposition, and each agreement, arrangement or understanding, whether or not in writing, to effect any of the foregoing. "Constructive Sale" shall mean, with respect to any security, a short sale with respect to such security, entering into or acquiring an offsetting derivative contract with respect to such security, entering into or acquiring a futures or forward contract to deliver such security, or entering into any other hedging or other derivative transaction that has the effect of materially changing the economic benefits and risks of ownership. Any purported Transfer effected in violation of this Section 12 shall be null and void and shall have no force or effect and the Company shall not be required (i) to transfer on its books any Shares that have been sold or otherwise transferred in violation of any of the provisions of the Plan or (ii) to treat as owner of such Shares or to accord the right to vote or pay dividends to any purchaser or other transferee to whom such Shares shall have been so transferred.

(b) Approval Process. Any Participant or stockholder seeking the approval of the Company to Transfer some or all of its Shares shall give written notice thereof to the Secretary of the Company that shall include: (1) the name of the stockholder; (2) the proposed transferee; (3) the number of shares of the Transfer of which approval is thereby requested; and (4) the purchase price, if any, of the shares proposed for Transfer. The Company may require the Participant to supplement its notice with such additional information as the Company may request or as may otherwise be required by the applicable Option Agreement, Restricted Stock Purchase Agreement or other applicable written agreement. In addition such request for Transfer shall be subject to such right of first refusal, transfer provisions and any other terms and conditions as may be set forth in the applicable Option Agreement, Restricted Stock Purchase Agreement or other applicable written agreement.

13. Time of Granting Awards. The date of grant of an Award shall, for all purposes, be the date on which the Administrator makes the determination granting such Award, or such other date as is determined by the Administrator.

14. Amendment and Termination of the Plan. The Board may at any time amend or terminate the Plan, but no amendment or termination shall be made that would materially and adversely affect the rights of any Participant under any outstanding Award, without his or her consent. In addition, to the extent necessary and desirable to comply with Applicable Laws, the Company shall obtain the approval of holders of capital stock with respect to any Plan amendment in such a manner and to such a degree as required.

15. Conditions Upon Issuance of Shares. Notwithstanding any other provision of the Plan or any agreement entered into by the Company pursuant to the Plan, the Company shall not be obligated, and shall have no liability for failure, to issue or deliver any Shares under the Plan unless such issuance or delivery would comply with Applicable Laws, with such compliance determined by the Company in consultation with its legal counsel. As a condition to the exercise of any Option or purchase of any Restricted Stock, the Company may require the person exercising the Option or purchasing the Restricted Stock to represent and warrant at the time of any such exercise or purchase that the Shares are being purchased only for investment and without any present intention to sell or distribute such Shares if, in the opinion of counsel for the Company, such a representation is advisable or required by Applicable Laws. Shares issued upon exercise of Options or purchase of Restricted Stock prior to the date, if ever, on which the Common Stock becomes a Listed Security shall be subject to a right of first refusal in favor of the Company pursuant to which the Participant will be required to offer Shares to the Company before selling or transferring them to any third party on such terms and subject to such conditions as is reflected in the applicable Option Agreement or Restricted Stock Purchase Agreement.

16. Beneficiaries. If permitted by the Company, a Participant may designate one or more beneficiaries with respect to an Award by timely filing the prescribed form with the Company. A beneficiary designation may be changed by filing the prescribed form with the Company at any time before the Participant's death. Except as otherwise provided in an Award agreement, if no beneficiary was designated or if no designated beneficiary survives the Participant, then after a Participant's death any vested Award(s) shall be transferred or distributed to the Participant's estate or to any person who has the right to acquire the Award by bequest or inheritance.

17. Approval of Holders of Capital Stock. If required by Applicable Laws, continuance of the Plan shall be subject to approval by the holders of capital stock of the Company within 12 months before or after the date the Plan is adopted or, to the extent required by Applicable Laws, any date the Plan is amended. Such approval shall be obtained in the manner and to the degree required under Applicable Laws.

18. Addenda. The Administrator may approve such addenda to the Plan as it may consider necessary or appropriate for the purpose of granting Awards to Employees or Consultants, which Awards may contain such terms and conditions as the Administrator deems necessary or appropriate to accommodate differences in local law, tax policy or custom, which may deviate from the terms and conditions set forth in this Plan. The terms of any such addenda shall supersede the terms of the Plan to the extent necessary to accommodate such differences but shall not otherwise affect the terms of the Plan as in effect for any other purpose.

19. Information to Holders of Options. In the event the Company is relying on the exemption provided by Rule 12h-1(f) under the Exchange Act, the Company shall provide the information described in Rule 701(e)(3), (4) and (5) of the Securities Act of 1933, as amended, to all holders of Options in accordance with the requirements thereunder until such time as the Company becomes subject to the reporting requirements of Section 13 or 15(d) of the Exchange Act. The Company may request that holders of Options agree to keep the information to be provided pursuant to this Section confidential. If the holder does not agree to keep the information to be provided pursuant to this Section confidential, then the Company will not be required to provide the information unless otherwise required pursuant to Rule 12h-1(f)(1) of the Exchange Act.


Country-Specific Addendum

This Addendum includes additional country-specific notices, disclaimers, and/or terms and conditions that apply to individuals who are working or residing in the countries listed below and that may be material to Optionee's participation in the Plan. Such notices, disclaimers, and/or terms and conditions may also apply, as from the date of grant, if the Optionee moves to or otherwise is or becomes subject to the Applicable Laws or Company policies of the country listed. However, because foreign exchange regulations and other local laws are subject to frequent change, Optionee is advised to seek advice from his or her own personal legal and tax advisor prior to accepting or exercising an Option or holding or selling Shares acquired under the Plan. The Company is not providing any tax, legal or financial advice, nor is the Company making any recommendations regarding Optionee's acceptance of the Option or participation in the Plan. Unless otherwise noted below, capitalized terms shall have the same meaning assigned to them under the Plan, the Notice of Stock Option Grant and the Stock Option Agreement. This Addendum forms part of the Stock Option Agreement and should be read in conjunction with the Stock Option Agreement and the Plan.

Securities Law Notice: Unless otherwise noted, neither the Company nor the Shares are registered with any local stock exchange or under the control of any local securities regulator outside the United States. The Stock Option Agreement (of which this Addendum is a part), the Notice of Stock Option Grant, the Plan, and any other communications or materials that you may receive regarding participation in the Plan do not constitute advertising or an offering of securities outside the United States, and the issuance of securities described in any Plan-related documents is not intended for public offering or circulation in your jurisdiction.


ADDENDUM A

${year} Stock Plan

(California Participants)

Prior to the date, if ever, on which the Common Stock becomes a Listed Security and/or the Company is subject to the reporting requirements of the Exchange Act, the terms set forth herein shall apply to Awards issued to California Participants. All capitalized terms used herein but not otherwise defined shall have the respective meanings set forth in the Plan.

1. The following rules shall apply to any Option in the event of termination of the Participant's Continuous Service Status:

(a) If such termination was for reasons other than death, "Permanent Disability" (as defined below), or Cause, the Participant shall have at least 30 days after the date of such termination to exercise his or her Option to the extent the Participant is entitled to exercise on his or her termination date, provided that in no event shall the Option be exercisable after the expiration of the term as set forth in the Option Agreement.

(b) If such termination was due to death or Permanent Disability, the Participant shall have at least 6 months after the date of such termination to exercise his or her Option to the extent the Participant is entitled to exercise on his or her termination date, provided that in no event shall the Option be exercisable after the expiration of the term as set forth in the Option Agreement.

"Permanent Disability" for purposes of this Addendum shall mean the inability of the Participant, in the opinion of a qualified physician acceptable to the Company, to perform the major duties of the Participant's position with the Company or any Parent or Subsidiary because of the sickness or injury of the Participant.

2. Notwithstanding anything to the contrary in Section 10(a) of the Plan, the Administrator shall in any event make such adjustments as may be required by Section 25102(o) of the California Corporations Code.

3. Notwithstanding anything stated herein to the contrary, no Option shall be exercisable on or after the 10th anniversary of the date of grant and any Award agreement shall terminate on or before the 10th anniversary of the date of grant.

4. The Company shall furnish summary financial information (audited or unaudited) of the Company's financial condition and results of operations, consistent with the requirements of Applicable Laws, at least annually to each California Participant during the period such Participant has one or more Awards outstanding, and in the case of an individual who acquired Shares pursuant to the Plan, during the period such Participant owns such Shares; provided, however, the Company shall not be required to provide such information if (i) the issuance is limited to key persons whose duties in connection with the Company assure their access to equivalent information or (ii) the Plan or any agreement complies with all conditions of Rule 701 of the Securities Act of 1933, as amended; provided that for purposes of determining such compliance, any registered domestic partner shall be considered a "family member" as that term is defined in Rule 701.


${year} STOCK PLAN

NOTICE OF STOCK OPTION GRANT

[Optionee Name]
[Optionee Address Line 1]
[Optionee Address Line 2]

You have been granted an option to purchase Common Stock of ${a.companyName}, a Delaware corporation (the "Company"), as follows:

Date of Grant: __________

Exercise Price Per Share: USD$__________

Total Number of Shares: __________

Total Exercise Price: USD$__________

Type of Option: __________ Shares Incentive Stock Option
__________ Shares Nonstatutory Stock Option

Expiration Date: __________

Vesting Commencement Date: __________

Vesting/Exercise Schedule: So long as your Continuous Service Status does not terminate (and provided that no vesting shall occur following the Termination Date (as defined in Section 5 of the Stock Option Agreement) unless otherwise determined by the Company in its sole discretion), the Shares underlying this Option shall vest and become exercisable in accordance with the following schedule: __________ of the Total Number of Shares shall vest and become exercisable on the __–month anniversary of the Vesting Commencement Date and __________ of the Total Number of Shares shall vest and become exercisable on the __________ day of each month thereafter [(and if there is no corresponding day, the last day of the month)].

Termination Period: You may exercise this Option for 3 month(s) after the Termination Date except as set out in Section 5 of the Stock Option Agreement (but in no event later than the Expiration Date). You are responsible for keeping track of these exercise periods following the Termination Date. The Company will not provide further notice of such periods.

Transferability: You may not transfer this Option except as set forth in Section 6 of the Stock Option Agreement (subject to compliance with Applicable Laws). You must obtain Company approval prior to any transfer of the Shares received upon exercise of this Option.

[Signature Page Follows]

By your signature and the signature of the Company's representative or by otherwise accepting or exercising this Option, you and the Company agree that this Option is granted under and governed by the terms and conditions of this Notice and the ${a.companyName} ${year} Stock Plan and Stock Option Agreement (which includes the Country-Specific Addendum, as applicable), both of which are attached to and made a part of this Notice.

In addition, you agree and acknowledge that your rights to any Shares underlying this Option will vest only as you provide services to the Company over time, that the grant of this Option is not as consideration for services you rendered to the Company prior to your date of hire, and that nothing in this Notice or the attached documents confers upon you any right to continue your employment or consulting relationship with the Company for any period of time, nor does it interfere in any way with your right or the Company's right to terminate that relationship at any time, for any reason, with or without cause, subject to Applicable Laws. Also, to the extent applicable, the Exercise Price Per Share has been set in good faith compliance with the applicable guidance issued by the IRS under Section 409A of the Code. However, there is no guarantee that the IRS will agree with the valuation, and by signing below, you agree and acknowledge that the Company, its Board, officers, employees, agents and stockholders shall not be held liable for any applicable costs, taxes, or penalties associated with this Option if, in fact, the IRS or any other person (including, without limitation, a successor corporation or an acquirer in a Change of Control) were to determine that this Option constitutes deferred compensation under Section 409A of the Code. You should consult with your own tax advisor concerning the tax consequences of such a determination by the IRS. For purposes of this paragraph, the term "Company" will be interpreted to include any Parent, Subsidiary or Affiliate.

THE COMPANY:

${a.companyName}

By:_________________________
(Signature)

Name:_________________________
Title:_________________________

OPTIONEE:

_________________________
(PRINT NAME)

_________________________
(Signature)

Address:
_________________________
_________________________


${year} STOCK PLAN

STOCK OPTION AGREEMENT

1. Grant of Option. ${a.companyName}, a Delaware corporation (the "Company"), hereby grants to the person ("Optionee") named in the Notice of Stock Option Grant (the "Notice"), an option (the "Option") to purchase the total number of shares of Common Stock (the "Shares") set forth in the Notice, at the exercise price per Share set forth in the Notice (the "Exercise Price") subject to the terms, definitions and provisions of the ${a.companyName} ${year} Stock Plan (the "Plan") adopted by the Company, which is incorporated in this Stock Option Agreement (this "Agreement") by reference. Unless otherwise defined in this Agreement, the terms used in this Agreement or the Notice shall have the meanings defined in the Plan.

2. Designation of Option. This Option is intended to be an Incentive Stock Option as defined in Section 422 of the Code only to the extent so designated in the Notice, and to the extent it is not so designated or to the extent this Option does not qualify as an Incentive Stock Option, it is intended to be a Nonstatutory Stock Option.

Notwithstanding the above, if designated as an Incentive Stock Option, in the event that the Shares subject to this Option (and all other incentive stock options granted to Optionee by the Company or any Parent or Subsidiary, including under other plans) that first become exercisable in any calendar year have an aggregate fair market value (determined for each Share as of the date of grant of the option covering such Share) in excess of USD 100,000, the Shares in excess of USD 100,000 shall be treated as subject to a nonstatutory stock option, in accordance with Section 5(c) of the Plan.

3. Exercise of Option. This Option shall be exercisable during its term in accordance with the Vesting/Exercise Schedule set out in the Notice, with the provisions of Section 7(c) of the Plan, and as follows:

(a) Right to Exercise.

(i) This Option may not be exercised for a fraction of a share.

(ii) In the event of Optionee's death, Disability or other termination of Continuous Service Status, the exercisability of this Option is governed by Section 5 below, subject to the limitations contained in this Section 3.

(iii) In no event may this Option be exercised after the Expiration Date set forth in the Notice.

(b) Method of Exercise.

(i) This Option shall be exercisable by execution and delivery of the Exercise Agreement attached hereto as Exhibit A or of any other form of written notice approved for such purpose by the Company which shall state Optionee's election to exercise this Option, the number of Shares in respect of which this Option is being exercised, and such other representations and agreements as to the holder's investment intent with respect to such Shares as may be required by the Company pursuant to the provisions of the Plan. Such written notice shall be signed by Optionee and shall be delivered to the Company by such means as are determined by the Company in its discretion to constitute adequate delivery. The written notice shall be accompanied by payment of the aggregate Exercise Price for the purchased Shares.

(ii) As a condition to the grant, vesting and exercise of this Option and as further set forth in Section 9 of the Plan, Optionee hereby agrees to make adequate provision for the satisfaction of (and will indemnify the Company and any Subsidiary or Affiliate for) any applicable taxes or tax withholdings, social contributions, required deductions, or other payments, if any ("Tax-Related Items"), which arise upon the grant, vesting or exercise of this Option, ownership or disposition of Shares, receipt of dividends, if any, or otherwise in connection with this Option or the Shares, whether by withholding, direct payment to the Company, or otherwise as determined by the Company in its sole discretion. Regardless of any action the Company or any Subsidiary or Affiliate takes with respect to any or all applicable Tax-Related Items, Optionee acknowledges and agrees that the ultimate liability for all Tax-Related Items is and remains Optionee's responsibility and may exceed any amount actually withheld by the Company or any Subsidiary or Affiliate. Optionee further acknowledges and agrees that Optionee is solely responsible for filing all relevant documentation that may be required in relation to this Option or any Tax-Related Items (other than filings or documentation that is the specific obligation of the Company or any Subsidiary or Affiliate pursuant to Applicable Laws), such as but not limited to personal income tax returns or reporting statements in relation to the grant, vesting or exercise of this Option, the holding of Shares or any bank or brokerage account, the subsequent sale of Shares, and the receipt of any dividends. Optionee further acknowledges that the Company makes no representations or undertakings regarding the treatment of any Tax-Related Items and does not commit to and is under no obligation to structure the terms or any aspect of the Option to reduce or eliminate Optionee's liability for Tax-Related Items or achieve any particular tax result. Optionee also understands that Applicable Laws may require varying Share or option valuation methods for purposes of calculating Tax-Related Items, and the Company assumes no responsibility or liability in relation to any such valuation or for any calculation or reporting of income or Tax-Related Items that may be required of Optionee under Applicable Laws. Further, if Optionee has become subject to Tax-Related Items in more than one jurisdiction, Optionee acknowledges that the Company or any Subsidiary or Affiliate may be required to withhold or account for Tax-Related Items in more than one jurisdiction.

(iii) The Company is not obligated, and will have no liability for failure, to issue or deliver any Shares upon exercise of this Option unless such issuance or delivery would comply with the Applicable Laws, with such compliance determined by the Company in consultation with its legal counsel. Furthermore, Optionee understands that the Applicable Laws of the country in which Optionee is residing or working at the time of grant, vesting, and/or exercise of this Option (including any rules or regulations governing securities, foreign exchange, tax, labor or other matters) may restrict or prevent exercise of this Option. This Option may not be exercised until such time as the Plan has been approved by the holders of capital stock of the Company, or if the issuance of such Shares upon such exercise or the method of payment of consideration for such Shares would constitute a violation of any Applicable Laws, including any applicable U.S. federal or state securities laws or any other law or regulation, including any rule under Part 221 of Title 12 of the Code of Federal Regulations as promulgated by the Federal Reserve Board. As a condition to the exercise of this Option, the Company may require Optionee to make any representation and warranty to the Company as may be required by the Applicable Laws. Assuming such compliance, for income tax purposes the Shares shall be considered transferred to Optionee on the date on which this Option is exercised with respect to such Shares, subject to Applicable Laws.

(iv) Subject to compliance with Applicable Laws, this Option shall be deemed to be exercised upon receipt by the Company of the appropriate written notice of exercise accompanied by the Exercise Price and the satisfaction of any applicable obligations described in Section 3(b)(ii) above.

4. Method of Payment. Unless otherwise specified by the Company in its sole discretion to comply with Applicable Laws or facilitate the administration of the Plan, payment of the Exercise Price shall be by cash or check or, following the initial public offering of the Company's Common Stock, by Cashless Exercise pursuant to which the Optionee delivers an irrevocable direction to a securities broker (on a form prescribed by the Company and according to a procedure established by the Company).

Optionee understands and agrees that, if required by the Company or Applicable Laws, any cross-border cash remittance made to exercise this Option or transfer proceeds received upon the sale of Shares must be made through a locally authorized financial institution or registered foreign exchange agency and may require Optionee to provide to such entity certain information regarding the transaction. Moreover, Optionee understands and agrees that the future value of the underlying Shares is unknown and cannot be predicted with certainty and may decrease in value, even below the Exercise Price. Optionee understands that neither the Company nor any Subsidiary or Affiliate is responsible for any foreign exchange fluctuation between local currency and the United States Dollar or the selection by the Company or any Subsidiary or Affiliate in its sole discretion of an applicable foreign currency exchange rate that may affect the value of the Option (or the calculation of income or Tax-Related Items thereunder).

5. Termination of Relationship. Following the date of termination of Optionee's Continuous Service Status for any reason (the "Termination Date"), Optionee may exercise this Option only as set forth in the Notice and this Section 5. If Optionee does not exercise this Option within the Termination Period set forth in the Notice or the termination periods set forth below, this Option shall terminate in its entirety. In no event may any Option be exercised after the Expiration Date of this Option as set forth in the Notice. For the avoidance of doubt and for purposes of this Option only, termination of Continuous Service Status and the Termination Date will be deemed to occur as of the date Optionee is no longer actively providing services as an Employee or Consultant (except, in certain circumstances, to the extent Optionee is on a Company-approved leave of absence and subject to any Company policy or Applicable Laws regarding such leaves) and will not be extended by any notice period or "garden leave" that may be required contractually or under Applicable Laws, unless otherwise determined by the Company in its sole discretion.

(a) General Termination. In the event of termination of Optionee's Continuous Service Status other than as a result of Optionee's Disability or death or Optionee's termination for Cause, Optionee may, to the extent Optionee is vested in the Optioned Stock, exercise this Option during the Termination Period set forth in the Notice.

(b) Termination upon Disability of Optionee. In the event of termination of Optionee's Continuous Service Status as a result of Optionee's Disability, Optionee may, but only within 12 month(s) following the Termination Date, exercise this Option to the extent Optionee is vested in the Optioned Stock.

(c) Death of Optionee. In the event of termination of Optionee's Continuous Service Status as a result of Optionee's death, or in the event of Optionee's death within 3 month(s) following Optionee's Termination Date, this Option may be exercised at any time within 12 month(s) following the Termination Date, or if later, 12 month(s) following the date of death by any beneficiaries designated in accordance with Section 16 of the Plan or, if there are no such beneficiaries, by the Optionee's estate, or by a person who acquired the right to exercise the Option by bequest or inheritance, but only to the extent Optionee is vested in the Optioned Stock.

(d) Termination for Cause. In the event of termination of Optionee's Continuous Service Status for Cause, this Option (including any vested portion thereof) shall immediately terminate in its entirety upon first notification to Optionee of such termination for Cause. If Optionee's Continuous Service Status is suspended pending an investigation of whether Optionee's Continuous Service Status will be terminated for Cause, all Optionee's rights under this Option, including the right to exercise this Option, shall be suspended during the investigation period.

6. Non-Transferability of Option. This Option may not be transferred in any manner otherwise than by will or by the laws of descent or distribution and may be exercised during the lifetime of Optionee only by him or her. The terms of this Option shall be binding upon the executors, administrators, heirs, successors and assigns of Optionee.

7. Lock-Up Agreement. If so requested by the Company or the underwriters in connection with the initial public offering of the Company's securities registered under the Securities Act of 1933, as amended, Optionee shall not sell, make any short sale of, loan, grant any option for the purchase of, or otherwise dispose of any securities of the Company however or whenever acquired (except for those being registered) without the prior written consent of the Company or such underwriters, as the case may be, for 180 days from the effective date of the registration statement, and Optionee shall execute an agreement reflecting the foregoing as may be requested by the underwriters at the time of such offering.

8. Effect of Agreement. Optionee acknowledges receipt of a copy of the Plan and represents that he or she is familiar with the terms and provisions thereof (and has had an opportunity to consult counsel regarding the Option terms), and hereby accepts this Option and agrees to be bound by its contractual terms as set forth herein and in the Plan. Optionee hereby agrees to accept as binding, conclusive and final all decisions and interpretations of the Administrator regarding any questions relating to this Option. In the event of a conflict between the terms and provisions of the Plan and the terms and provisions of the Notice and this Agreement, the Plan terms and provisions shall prevail.

9. Imposition of Other Requirements. The Company reserves the right to impose other requirements on Optionee's participation in the Plan, on this Option and the Shares subject to this Option and on any other Award or Shares acquired under the Plan, or take any other action, to the extent the Company determines it is necessary or advisable in order to comply with Applicable Laws or facilitate the administration of the Plan. Optionee agrees to sign any additional agreements or undertakings that may be necessary to accomplish the foregoing. Furthermore, Optionee acknowledges that the Applicable Laws of the country in which Optionee is residing or working at the time of grant, holding, vesting, and exercise of the Option or the ownership or sale of Shares received pursuant to the Option (including any rules or regulations governing securities, foreign exchange, tax, labor, or other matters) may subject Optionee to additional procedural or regulatory requirements that Optionee is and will be solely responsible for and must fulfill. If applicable, such requirements may be outlined in but are not limited to the Country-Specific Addendum (the "Addendum") attached hereto, which forms part of this Agreement. Notwithstanding any provision herein, Optionee's participation in the Plan shall be subject to any applicable special terms and conditions or disclosures as set forth in the Addendum. The Optionee also understands and agrees that if the Optionee works, resides, moves to, or otherwise is or becomes subject to Applicable Laws or Company policies of another jurisdiction at any time, certain country-specific notices, disclaimers and/or terms and conditions may apply to him as from the date of grant, unless otherwise determined by the Company in its sole discretion.

10. Electronic Delivery and Translation. The Company may, in its sole discretion, decide to deliver any documents related to Optionee's current or future participation in the Plan, this Option, the Shares subject to this Option, any other Company Securities or any other Company-related documents, by electronic means. By accepting this Option, whether electronically or otherwise, Optionee hereby (i) consents to receive such documents by electronic means, (ii) consents to the use of electronic signatures, and (iii) if applicable, agrees to participate in the Plan and/or receive any such documents through an on-line or electronic system established and maintained by the Company or a third party designated by the Company, including but not limited to the use of electronic signatures or click-through electronic acceptance of terms and conditions. To the extent Optionee has been provided with a copy of this Agreement, the Plan, or any other documents relating to this Option in a language other than English, the English language documents will prevail in case of any ambiguities or divergences as a result of translation.

11. No Acquired Rights or Employment Rights. In accepting the Option, Optionee acknowledges that the Plan is established voluntarily by the Company, is discretionary in nature, and may be modified, amended, suspended or terminated by the Company at any time. The grant of the Option is voluntary and occasional and does not create any contractual or other right to receive future grants of Options, other Awards or benefits in lieu of Options, even if Options have been granted repeatedly in the past, and all decisions with respect to future grants of Options or other Awards, if any, will be at the sole discretion of the Company. In addition, Optionee's participation in the Plan is voluntary, and the Option and the Shares subject to the Option are extraordinary items that do not constitute regular compensation for services rendered to the Company or any Subsidiary or Affiliate and are outside the scope of Optionee's employment contract, if any. The Option and the Shares subject to the Option are not intended to replace any pension rights or compensation and are not part of normal or expected salary or compensation for any purpose, including but not limited to calculating severance payments, if any, upon termination.

Nothing contained in this Agreement is intended to constitute or create a contract of employment, nor shall it constitute or create the right to remain associated with or in the employ of the Company or any Subsidiary or Affiliate for any particular period of time. This Agreement shall not interfere in any way with the right of the Company or any Subsidiary or Affiliate to terminate Optionee's employment or service at any time, subject to Applicable Laws.

12. Data Privacy. Optionee hereby explicitly and unambiguously consents to the collection, use and transfer, whether in electronic or other form, of Optionee's Personal Data (as described below) by and among, as applicable, the Company and any Subsidiary or Affiliate or third parties as may be selected by the Company for the exclusive purpose of implementing, administering, and managing Optionee's participation in the Plan. Optionee understands that refusal or withdrawal of consent will affect Optionee's ability to participate in the Plan; without providing consent, Optionee will not be able to participate in the Plan or realize benefits (if any) from the Option.

Optionee understands that the Company and any Subsidiary or Affiliate or designated third parties may hold personal information about Optionee, including, but not limited to, Optionee's name, home address and telephone number, date of birth, social insurance number or other identification number, salary, nationality, job title, any shares of stock or directorships held in the Company or any Subsidiary or Affiliate, details of all Options or any other entitlement to Shares awarded, canceled, exercised, vested, unvested or outstanding in Optionee's favor ("Personal Data"). Optionee understands that Personal Data may be transferred to any Subsidiary or Affiliate or third parties assisting in the implementation, administration and management of the Plan, that these recipients may be located in the United States, Optionee's country, or elsewhere, and that the recipient's country may have different data privacy laws and protections than Optionee's country. In particular, the Company may transfer Personal Data to the broker or stock plan administrator assisting with the Plan, to its legal counsel and tax/accounting advisor, and to the Subsidiary or Affiliate that is your employer and its payroll provider.

13. Miscellaneous.

(a) Governing Law. The validity, interpretation, construction and performance of this Agreement, and all acts and transactions pursuant hereto and the rights and obligations of the parties hereto shall be governed, construed and interpreted in accordance with the laws of the state of Delaware, without giving effect to principles of conflicts of law.

(b) Entire Agreement. This Agreement, together with the Notice to which this Agreement is attached and the Plan, sets forth the entire agreement and understanding of the parties relating to the subject matter herein and therein and supersedes all prior or contemporaneous discussions, understandings and agreements, whether oral or written, between the parties related to the subject matter hereof.

(c) Amendments and Waivers. Except as contemplated under the Plan, no modification of or amendment to this Agreement, nor any waiver of any rights under this Agreement, shall be effective unless in writing signed by the parties to this Agreement. No delay or failure to require performance of any provision of this Agreement shall constitute a waiver of that provision as to that or any other instance.

(d) Successors and Assigns. Except as otherwise provided in this Agreement, this Agreement, and the rights and obligations of the parties hereunder, will be binding upon and inure to the benefit of their respective successors, assigns, heirs, executors, administrators and legal representatives. The Company may assign any of its rights and obligations under this Agreement. No other party to this Agreement may assign, whether voluntarily or by operation of law, any of its rights and obligations under this Agreement, except with the prior written consent of the Company.

(e) Notices. Any notice, demand or request required or permitted to be given under this Agreement shall be in writing and shall be deemed sufficient when delivered personally or by overnight courier or sent by email, or 48 hours after being deposited in the U.S. mail as certified or registered mail with postage prepaid, addressed to the party to be notified at such party's address as set forth on the signature page, as subsequently modified by written notice, or if no address is specified on the signature page, at the most recent address set forth in the Company's books and records.

(f) Severability. If one or more provisions of this Agreement are held to be unenforceable under Applicable Laws, the parties agree to renegotiate such provision in good faith. In the event that the parties cannot reach a mutually agreeable and enforceable replacement for such provision, then (i) such provision shall be excluded from this Agreement, (ii) the balance of the Agreement shall be interpreted as if such provision were so excluded and (iii) the balance of the Agreement shall be enforceable in accordance with its terms.

(g) Construction. This Agreement is the result of negotiations between and has been reviewed by each of the parties hereto and their respective counsel, if any; accordingly, this Agreement shall be deemed to be the product of all of the parties hereto, and no ambiguity shall be construed in favor of or against any one of the parties hereto.

(h) Counterparts. This Agreement may be executed in any number of counterparts, each of which when so executed and delivered shall be deemed an original, and all of which together shall constitute one and the same agreement. Execution of a facsimile or scanned copy will have the same force and effect as execution of an original, and a facsimile or scanned signature will be deemed an original and valid signature.


EXHIBIT A

${year} STOCK PLAN

EXERCISE AGREEMENT

This Exercise Agreement (this "Agreement") is made as of _______________, by and between ${a.companyName}, a Delaware corporation (the "Company"), and ____________________ ("Purchaser"). To the extent any capitalized terms used in this Agreement are not defined, they shall have the meaning ascribed to them in the Company's ${year} Stock Plan (the "Plan") and the Option Agreement (as defined below).

1. Exercise of Option. Subject to the terms and conditions hereof, Purchaser hereby elects to exercise his or her option to purchase _____________ shares of the Common Stock (the "Shares") of the Company under and pursuant to the Plan, the Notice of Stock Option Grant and the Stock Option Agreement granted __________ (the "Option Agreement"). The purchase price for the Shares shall be USD$__________ per Share for a total purchase price of USD$___________. The term "Shares" refers to the purchased Shares and all securities received in connection with the Shares pursuant to stock dividends or splits, all securities received in replacement of the Shares in a recapitalization, merger, reorganization, exchange or the like, and all new, substituted or additional securities or other property to which Purchaser is entitled by reason of Purchaser's ownership of the Shares.

2. Time and Place of Exercise. The purchase and sale of the Shares under this Agreement shall occur at the principal office of the Company simultaneously with the execution and delivery of this Agreement, the payment of the aggregate exercise price by any method listed in Section 4 of the Option Agreement, and the satisfaction of any applicable tax, withholding, required deductions or other payments, all in accordance with the provisions of Section 3(b) of the Option Agreement. The Company shall issue the Shares to Purchaser by entering such Shares in Purchaser's name as of such date in the books and records of the Company or, if applicable, a duly authorized transfer agent of the Company, against payment of the exercise price therefor by Purchaser. The Company will deliver to Purchaser a stock certificate or, upon request in the case of uncertificated securities, a notice of issuance, for the Shares as soon as practicable following such date.

3. Limitations on Transfer. Purchaser acknowledges and agrees that the Shares purchased under this Agreement are subject to (i) the transfer restrictions set forth in Section 12 of the Plan, (ii) the terms and conditions that apply to the Company's Common Stock, as set forth in the Company's Bylaws, as may be in effect at the time of any proposed transfer (the "Bylaw Provisions"), and (iii) any other limitation or restriction on transfer created by Applicable Laws. Purchaser shall not assign, encumber or dispose of any interest in the Shares except to the extent permitted by, and in compliance with, Section 12 of the Plan, the Bylaw Provisions, Applicable Laws, and the provisions below.

(a) Transfer Restrictions; Right of First Refusal. Before any Shares held by Purchaser or any transferee of Purchaser (either being sometimes referred to herein as the "Holder") may be sold or otherwise transferred (including transfer by gift or operation of law), the Company shall first, to the extent the Company's approval is required by the Plan or any applicable Bylaw Provisions, have the right to approve such sale or transfer, in full or in part, and shall then have the right to purchase all or any part of the Shares proposed to be sold or transferred, in each case, in its sole and absolute discretion (the "Right of First Refusal"). If the Holder would like to sell or transfer any Shares, the Holder must provide the Company or its assignee(s) with a Notice (as defined below) requesting approval to sell or transfer the Shares and offering the Company or its assignee(s) a Right of First Refusal on the same terms and conditions set forth in this Section 3(a). The Company may either (1) exercise its Right of First Refusal in full or in part and purchase such Shares pursuant to this Section 3(a), (2) decline to exercise its Right of First Refusal in full or in part and permit the transfer of such Shares to the Proposed Transferee (as defined below) in full or in part or (3) decline to exercise its Right of First Refusal in full or in part and, to the extent the Company's approval is required by the Plan or any applicable Bylaw Provisions, decline the request to sell or transfer the Shares in full or in part.

(i) Notice of Proposed Transfer. The Holder of the Shares shall deliver to the Company a written notice (the "Notice") stating: (A) the Holder's intention to sell or otherwise transfer such Shares; (B) the name of each proposed purchaser or other transferee ("Proposed Transferee"); (C) the number of Shares to be sold or transferred to each Proposed Transferee; (D) the terms and conditions of each proposed sale or transfer, including (without limitation) the purchase price for such Shares (the "Purchase Price"); and (E) the Holder's offer to the Company or its assignee(s) to purchase the Shares at the Purchase Price and upon the same terms (or terms that are no less favorable to the Company).

(ii) Exercise of Right of First Refusal. At any time within 30 days after receipt of the Notice, the Company and/or its assignee(s) shall deliver a written notice to the Holder indicating whether the Company and/or its assignee(s) elect to permit or reject the proposed sale or transfer, in full or in part, and/or elect to accept or decline the offer to purchase any or all of the Shares proposed to be sold or transferred to any one or more of the Proposed Transferees, at the Purchase Price, provided that if the Purchase Price consists of no legal consideration (as, for example, in the case of a transfer by gift), the purchase price will be the fair market value of the Shares as determined in good faith by the Company. If the Purchase Price includes consideration other than cash, the cash equivalent value of the non-cash consideration shall be determined by the Company in good faith.

(iii) Payment. Payment of the Purchase Price shall be made, at the election of the Company or its assignee(s), in cash (by check), by cancellation of all or a portion of any outstanding indebtedness, or by any combination thereof within 60 days after receipt of the Notice or in the manner and at the times set forth in the Notice.

(iv) Holder's Right to Transfer. If any of the Shares proposed in the Notice to be sold or transferred to a given Proposed Transferee are both (A) not purchased by the Company and/or its assignee(s) as provided in this Section 3(a) and (B) approved by the Company to be sold or transferred, then the Holder may sell or otherwise transfer any such Shares to the applicable Proposed Transferee at the Purchase Price or at a higher price, provided that such sale or other transfer is consummated within 120 days after the date of the Notice; provided that any such sale or other transfer is also effected in accordance with the Bylaw Provisions, the transfer restrictions set forth in the Plan and any Applicable Laws and the Proposed Transferee agrees in writing that the Plan, the Bylaw Provisions and the provisions of the Option Agreement and this Agreement, including this Section 3 and the waiver of statutory information rights in Section 8 shall continue to apply to the Shares in the hands of such Proposed Transferee. The Company, in consultation with its legal counsel, may require the Holder to provide an opinion of counsel evidencing compliance with Applicable Laws. If the Shares described in the Notice are not transferred to the Proposed Transferee within such period, or if the Holder proposes to change the price or other terms to make them more favorable to the Proposed Transferee, a new Notice shall be given to the Company, and the Company and/or its assignees shall again have the right to approve such transfer and be offered the Right of First Refusal.

(v) Exception for Certain Family Transfers. Anything to the contrary contained in this Section 3(a) notwithstanding, the transfer of any or all of the Shares during Holder's lifetime or on Holder's death by will or intestacy to Holder's Immediate Family or a trust for the benefit of Holder or Holder's Immediate Family shall be exempt from the provisions of this Section 3(a). "Immediate Family" as used herein shall mean lineal descendant or antecedent, spouse (or spouse's antecedents), father, mother, brother or sister (or their descendants), stepchild (or their antecedents or descendants), aunt or uncle (or their antecedents or descendants), brother-in-law or sister-in-law (or their antecedents or descendants) and shall include adoptive relationships, or any person sharing Holder's household (other than a tenant or an employee). In such case, the transferee or other recipient shall receive and hold the Shares so transferred subject to the provisions of the Plan, the Bylaw Provisions and the provisions of the Option Agreement and this Agreement, including this Section 3 and Section 8, and there shall be no further transfer of such Shares except in accordance with the terms of this Section 3, the Plan, and the Bylaw Provisions.

(b) Company's Right to Purchase upon Involuntary Transfer. In the event of any transfer by operation of law or other involuntary transfer (including death or divorce, but excluding a transfer to Immediate Family as set forth in Section 3(a)(v) above) of all or a portion of the Shares by the record holder thereof, the Company shall have an option to purchase any or all of the Shares transferred at the Fair Market Value of the Shares on the date of transfer (as determined by the Company in its sole discretion). Upon such a transfer, the Holder shall promptly notify the Secretary of the Company of such transfer. The right to purchase such Shares shall be provided to the Company for a period of 30 days following receipt by the Company of written notice from the Holder.

(c) Assignment. The right of the Company to purchase any part of the Shares may be assigned in whole or in part to any holder or holders of capital stock of the Company or other persons or organizations.

(d) Restrictions Binding on Transferees. All transferees of Shares or any interest therein will receive and hold such Shares or interest subject to the Plan, the Bylaw Provisions, the provisions of the Option Agreement and this Agreement, including, without limitation, Sections 3 and 8 of this Agreement, Section 7 of the Option Agreement and Section 12 of the Plan. Any sale or transfer of the Shares shall be void unless the provisions of this Agreement are satisfied.

(e) Termination of Rights. The transfer restrictions set forth in Section 3(a) above and Section 12 of the Plan, the Right of First Refusal granted the Company by Section 3(a) above and the right to repurchase the Shares in the event of an involuntary transfer granted the Company by Section 3(b) above shall terminate upon the first sale of Common Stock of the Company to the general public pursuant to a registration statement filed with and declared effective by the Securities and Exchange Commission under the Securities Act of 1933, as amended (the "Securities Act") (other than a registration statement relating solely to the issuance of Common Stock pursuant to a business combination or an employee incentive or benefit plan) or any transfer or conversion of Shares made pursuant to a statutory merger or statutory consolidation of the Company with or into another corporation or corporations if the common stock of the surviving corporation or any direct or indirect parent corporation thereof is registered under the Exchange Act. Upon termination of such transfer restrictions, the Company will remove any stop-transfer notices referred to in Section 6(b) below and related to the restrictions in this Section 3 and a new stock certificate or, in the case of uncertificated securities, notice of issuance, for the Shares not repurchased shall be issued, on request, without the legend referred to in Section 6(a)(ii) below and delivered to Holder.

(f) Lock-Up Agreement. The lock-up provisions set forth in Section 7 of the Option Agreement shall apply to the Shares issued upon exercise of the Option hereunder and Purchaser reaffirms Purchaser's obligations set forth therein.

4. Investment and Taxation Representations. In connection with the purchase of the Shares, Purchaser represents to the Company the following:

(a) Purchaser is aware of the Company's business affairs and financial condition and has acquired sufficient information about the Company to reach an informed and knowledgeable decision to acquire the Shares. Purchaser is purchasing the Shares for investment for Purchaser's own account only and not with a view to, or for resale in connection with, any "distribution" thereof within the meaning of the Securities Act or under any applicable provision of state law. Purchaser does not have any present intention to transfer the Shares to any other person or entity.

(b) Purchaser understands that the Shares have not been registered under the Securities Act by reason of a specific exemption therefrom, which exemption depends upon, among other things, the bona fide nature of Purchaser's investment intent as expressed herein.

(c) Purchaser further acknowledges and understands that the securities must be held indefinitely unless they are subsequently registered under the Securities Act or an exemption from such registration is available. Purchaser further acknowledges and understands that the Company is under no obligation to register the securities.

(d) Purchaser is familiar with the provisions of Rule 144, promulgated under the Securities Act, which, in substance, permits limited public resale of "restricted securities" acquired, directly or indirectly, from the issuer of the securities (or from an affiliate of such issuer), in a non-public offering subject to the satisfaction of certain conditions. Purchaser understands that the Company provides no assurances as to whether he or she will be able to resell any or all of the Shares pursuant to Rule 144, which rule requires, among other things, that the Company be subject to the reporting requirements of the Exchange Act, that resales of securities take place only after the holder of the Shares has held the Shares for certain specified time periods, and under certain circumstances, that resales of securities be limited in volume and take place only pursuant to brokered transactions. Notwithstanding this Section 4(d), Purchaser acknowledges and agrees to the restrictions set forth in Section 4(e) below.

(e) Purchaser further understands that in the event all of the applicable requirements of Rule 144 are not satisfied, registration under the Securities Act, compliance with Regulation A, or some other registration exemption will be required; and that, notwithstanding the fact that Rule 144 is not exclusive, the Staff of the Securities and Exchange Commission has expressed its opinion that persons proposing to sell private placement securities other than in a registered offering and otherwise than pursuant to Rule 144 will have a substantial burden of proof in establishing that an exemption from registration is available for such offers or sales, and that such persons and their respective brokers who participate in such transactions do so at their own risk.

(f) Purchaser represents that Purchaser is not subject to any of the "Bad Actor" disqualifications described in Rule 506(d)(1)(i) to (viii) under the Securities Act. Purchaser also agrees to notify the Company if Purchaser becomes subject to such disqualifications after the date hereof.

(g) Purchaser understands that Purchaser may suffer adverse tax consequences as a result of Purchaser's purchase or disposition of the Shares. Purchaser represents that Purchaser has consulted any tax consultants Purchaser deems advisable in connection with the purchase or disposition of the Shares and that Purchaser is not relying on the Company for any tax advice.

5. Voting Provisions. As a condition precedent to entering into this Agreement, at the request of the Company, Purchaser shall become a party to any voting agreement to which the Company is a party at the time of Purchaser's execution and delivery of this Agreement, as such voting agreement may be thereafter amended from time to time (the "Voting Agreement"), by executing an adoption agreement or counterpart signature page agreeing to be bound by and subject to the terms of the Voting Agreement and to vote the Shares in the capacity of a "Common Holder" and a "Stockholder," as such terms may be defined in the Voting Agreement.

6. Restrictive Legends and Stop-Transfer Orders.

(a) Legends. Any stock certificate or, in the case of uncertificated securities, any notice of issuance, for the Shares shall bear the following legends (as well as any legends required by the Company or applicable state and federal corporate and securities laws):

(i) "THE SECURITIES REFERENCED HEREIN HAVE NOT BEEN REGISTERED UNDER THE SECURITIES ACT OF 1933, AND HAVE BEEN ACQUIRED FOR INVESTMENT AND NOT WITH A VIEW TO, OR IN CONNECTION WITH, THE SALE OR DISTRIBUTION THEREOF. NO SUCH SALE OR DISTRIBUTION MAY BE EFFECTED WITHOUT AN EFFECTIVE REGISTRATION STATEMENT RELATED THERETO OR AN OPINION OF COUNSEL IN A FORM SATISFACTORY TO THE COMPANY THAT SUCH REGISTRATION IS NOT REQUIRED UNDER THE SECURITIES ACT OF 1933."

(ii) "THE SECURITIES REFERENCED HEREIN MAY BE TRANSFERRED ONLY IN ACCORDANCE WITH THE TERMS OF AN AGREEMENT BETWEEN THE COMPANY AND THE STOCKHOLDER, A COPY OF WHICH IS ON FILE WITH AND MAY BE OBTAINED FROM THE SECRETARY OF THE COMPANY AT NO CHARGE."

(iii) "THE TRANSFER OF THE SECURITIES REFERENCED HEREIN IS SUBJECT TO CERTAIN TRANSFER RESTRICTIONS SET FORTH IN THE COMPANY'S STOCK PLAN, COPIES OF WHICH MAY BE OBTAINED UPON WRITTEN REQUEST TO THE COMPANY AT ITS PRINCIPAL PLACE OF BUSINESS. THE COMPANY SHALL NOT REGISTER OR OTHERWISE RECOGNIZE OR GIVE EFFECT TO ANY PURPORTED TRANSFER OF SECURITIES THAT DOES NOT COMPLY WITH SUCH TRANSFER RESTRICTIONS."

(iv) Any legend required by the Voting Agreement, as applicable.

(b) Stop-Transfer Notices. Purchaser agrees that, in order to ensure compliance with the restrictions referred to herein, the Company may issue appropriate "stop transfer" instructions to its transfer agent, if any, and that, if the Company transfers its own securities, it may make appropriate notations to the same effect in its own records.

(c) Refusal to Transfer. The Company shall not be required (i) to transfer on its books any Shares that have been sold or otherwise transferred in violation of any of the provisions of this Agreement or (ii) to treat as owner of such Shares or to accord the right to vote or pay dividends to any purchaser or other transferee to whom such Shares shall have been so transferred.

(d) Required Notices. Purchaser acknowledges that the Shares are issued and shall be held subject to all the provisions of this Agreement, the Certificate of Incorporation and the Bylaws of the Company and any amendments thereto, copies of which are on file at the principal office of the Company. A statement of all of the rights, preferences, privileges and restrictions granted to or imposed upon the respective classes and/or series of shares of stock of the Company and upon the holders thereof may be obtained by any stockholder upon request and without charge, at the principal office of the Company, and the Company will furnish any stockholder, upon request and without charge, a copy of such statement. Purchaser acknowledges that the provisions of this Section 6 shall constitute the notices required by Sections 151(f) and 202(a) of the Delaware General Corporation Law and the Purchaser hereby expressly waives the requirement of Section 151(f) of the Delaware General Corporation Law that it receive the written notice provided for in Sections 151(f) and 202(a) of the Delaware General Corporation Law within a reasonable time after the issuance of the Shares.

7. No Employment Rights. Nothing in this Agreement shall affect in any manner whatsoever the right or power of the Company, or a parent, subsidiary or affiliate of the Company, to terminate Purchaser's employment or consulting relationship, for any reason, with or without cause.

8. Waiver of Statutory Information Rights. Purchaser acknowledges and understands that, but for the waiver made herein, Purchaser would be entitled, upon written demand under oath stating the purpose thereof, to inspect for any proper purpose, and to make copies and extracts from, the Company's stock ledger, a list of its stockholders, and its other books and records, and the books and records of subsidiaries of the Company, if any, under the circumstances and in the manner provided in Section 220 of the Delaware General Corporation Law (any and all such rights, and any and all such other rights of Purchaser as may be provided for in Section 220, the "Inspection Rights"). In light of the foregoing, until the first sale of Common Stock of the Company to the general public pursuant to a registration statement filed with and declared effective by the Securities and Exchange Commission under the Securities Act of 1933, as amended, Purchaser hereby unconditionally and irrevocably waives the Inspection Rights, whether such Inspection Rights would be exercised or pursued directly or indirectly pursuant to Section 220 or otherwise, and covenants and agrees never to directly or indirectly commence, voluntarily aid in any way, prosecute, assign, transfer, or cause to be commenced any claim, action, cause of action, or other proceeding to pursue or exercise the Inspection Rights. The foregoing waiver applies to the Inspection Rights of Purchaser in Purchaser's capacity as a stockholder and shall not affect any rights of a director, in his or her capacity as such, under Section 220. The foregoing waiver shall not apply to any contractual inspection rights of Purchaser under any written agreement with the Company.

9. Miscellaneous.

(a) Governing Law. The validity, interpretation, construction and performance of this Agreement, and all acts and transactions pursuant hereto and the rights and obligations of the parties hereto shall be governed, construed and interpreted in accordance with the laws of the state of Delaware, without giving effect to principles of conflicts of law.

(b) Entire Agreement. This Agreement, together with the Option Agreement and the Plan, sets forth the entire agreement and understanding of the parties relating to the subject matter herein and supersedes all prior or contemporaneous discussions, understandings and agreements, whether oral or written, between them related to the subject matter thereof.

(c) Amendments and Waivers. Except as contemplated under the Plan, no modification of or amendment to this Agreement, nor any waiver of any rights under this Agreement, shall be effective unless in writing signed by the parties to this Agreement. No delay or failure to require performance of any provision of this Agreement shall constitute a waiver of that provision as to that or any other instance.

(d) Successors and Assigns. Except as otherwise provided in this Agreement, this Agreement, and the rights and obligations of the parties hereunder, will be binding upon and inure to the benefit of their respective successors, assigns, heirs, executors, administrators and legal representatives. The Company may assign any of its rights and obligations under this Agreement. No other party to this Agreement may assign, whether voluntarily or by operation of law, any of its rights and obligations under this Agreement, except with the prior written consent of the Company.

(e) Notices. Any notice, demand or request required or permitted to be given under this Agreement shall be in writing and shall be deemed sufficient when delivered personally or by overnight courier or sent by email, or 48 hours after being deposited in the U.S. mail as certified or registered mail with postage prepaid, addressed to the party to be notified at such party's address as set forth on the signature page, as subsequently modified by written notice, or if no address is specified on the signature page, at the most recent address set forth in the Company's books and records.

(f) Severability. If one or more provisions of this Agreement are held to be unenforceable under Applicable Laws, the parties agree to renegotiate such provision in good faith. In the event that the parties cannot reach a mutually agreeable and enforceable replacement for such provision, then (i) such provision shall be excluded from this Agreement, (ii) the balance of the Agreement shall be interpreted as if such provision were so excluded and (iii) the balance of the Agreement shall be enforceable in accordance with its terms.

(g) Construction. This Agreement is the result of negotiations between and has been reviewed by each of the parties hereto and their respective counsel, if any; accordingly, this Agreement shall be deemed to be the product of all of the parties hereto, and no ambiguity shall be construed in favor of or against any one of the parties hereto.

(h) Counterparts. This Agreement may be executed in any number of counterparts, each of which when so executed and delivered shall be deemed an original, and all of which together shall constitute one and the same agreement. Execution of a facsimile or scanned copy will have the same force and effect as execution of an original, and a facsimile or scanned signature will be deemed an original and valid signature.

(i) Electronic Delivery. The Company may, in its sole discretion, decide to deliver any documents related to this Agreement or any notices required by applicable law or the Company's Certificate of Incorporation or Bylaws by email or any other electronic means. Purchaser hereby consents to (i) conduct business electronically, (ii) receive such documents and notices by such electronic delivery and (iii) sign documents electronically and agrees to participate through an on-line or electronic system established and maintained by the Company or a third party designated by the Company.

(j) California Corporate Securities Law. THE SALE OF THE SECURITIES WHICH ARE THE SUBJECT OF THIS AGREEMENT HAS NOT BEEN QUALIFIED WITH THE COMMISSIONER OF FINANCIAL PROTECTION AND INNOVATION OF THE STATE OF CALIFORNIA AND THE ISSUANCE OF THE SECURITIES OR THE PAYMENT OR RECEIPT OF ANY PART OF THE CONSIDERATION THEREFOR PRIOR TO THE QUALIFICATION IS UNLAWFUL, UNLESS THE SALE OF SECURITIES IS EXEMPT FROM QUALIFICATION BY SECTION 25100, 25102 OR 25105 OF THE CALIFORNIA CORPORATIONS CODE. THE RIGHTS OF ALL PARTIES TO THIS AGREEMENT ARE EXPRESSLY CONDITIONED UPON THE QUALIFICATION BEING OBTAINED, UNLESS THE SALE IS SO EXEMPT.

[SIGNATURE PAGE FOLLOWS]

The parties have executed this Exercise Agreement as of the date first set forth above.

THE COMPANY:

${a.companyName}

By:_________________________
(Signature)

Name:_________________________
Title:_________________________

Address:
_________________________
_________________________

PURCHASER:

_________________________
(PRINT NAME)

_________________________
(Signature)

Address:
_________________________
_________________________

Email:_________________________


I, ____________________, spouse of ____________________ ("Purchaser"), have read and hereby approve the foregoing Agreement. In consideration of the Company's granting my spouse the right to purchase the Shares as set forth in the Agreement, I hereby agree to be bound irrevocably by the Agreement and further agree that any community property or other such interest that I may have in the Shares shall hereby be similarly bound by the Agreement. I hereby appoint my spouse as my attorney-in-fact with respect to any amendment or exercise or waiver of any rights under the Agreement.

_________________________
Spouse of Purchaser (if applicable)`
}

function boardConsentOptionPool(a: FlowAnswers): string {
  const year = currentYear()
  const directorSignatures =
    a.directors.length > 0
      ? a.directors
          .map((d) => `_________________________\n${d}, Director`)
          .join("\n\n")
      : "_________________________\n[No directors specified], Director"

  return `ACTION BY WRITTEN CONSENT
OF THE BOARD OF DIRECTORS OF

${a.companyName}

In accordance with Section 141(f) of the Delaware General Corporation Law and the Bylaws of ${a.companyName}, a Delaware corporation (the "Company"), the undersigned, constituting all of the members of the Company's Board of Directors (the "Board"), hereby take the following actions and adopt the following resolutions by written consent without a meeting:

1. Adoption of ${year} Stock Plan

RESOLVED: That the ${year} Stock Plan (the "Plan"), in substantially the form attached hereto as Exhibit A, is hereby adopted and ${a.poolShares} shares of the Company's Common Stock are reserved for issuance pursuant to the Plan.

RESOLVED FURTHER: That the Plan shall continue for 10 years from the effective date of these resolutions unless terminated earlier pursuant to its terms.

RESOLVED FURTHER: That the officers of the Company, in consultation with legal counsel, are authorized and directed to take any and all additional actions and file any other documents necessary to carry out the intent and purposes of the foregoing resolutions, including seeking stockholder approval of the Plan and qualifying or exempting the issuance of securities under the Plan from the registration requirements of the California Corporate Securities Law of 1968, as amended.

2. Omnibus Resolution

RESOLVED: That each of the officers is authorized and empowered to take all such actions (including, without limitation, soliciting appropriate consents or waivers from stockholders) and to execute and deliver all such documents as may be necessary or advisable to carry out the intent and accomplish the purposes of the foregoing resolutions and to effect any transactions contemplated thereby and the performance of any such actions and the execution and delivery of any such documents shall be conclusive evidence of the approval of the Board thereof and all matters relating thereto.

***

In accordance with the Company's Bylaws, this action may be executed in writing, or consented to by electronic transmission, in any number of counterparts, each of which when so executed shall be deemed to be an original and all of which taken together shall constitute one and the same action.

The consent of the undersigned shall be effective immediately upon the election of the undersigned as directors of the corporation; provided, however, that if such event has already occurred before the time of execution of this consent by the undersigned, then this consent shall be effective immediately. This consent shall be deemed revoked if it has not become effective within 60 days of the Actual Date of Signature below, which Actual Date of Signature is the date on which provision for the effectiveness of this consent has been made.

Actual Date of Signature: ${today()}


${directorSignatures}


EXHIBIT A

FORM OF STOCK PLAN

(See the Equity Incentive Plan document.)`
}

const IP_VALUE_PLACEHOLDER = "[Value of assigned IP — to be determined by the Board]"
const CERT_NUMBER_PLACEHOLDER = "[N/A — shares are uncertificated]"

function boardConsentFounderStock(a: FlowAnswers): string {
  const directorSignatures =
    a.directors.length > 0
      ? a.directors
          .map((d) => `_________________________\n${d}, Director`)
          .join("\n\n")
      : "_________________________\n[No directors specified], Director"

  const founders = a.allocations.filter((alloc) => !alloc.isPool)
  const issuanceTable =
    founders.length > 0
      ? founders
          .map(
            (f) => `Name of Stockholder: ${f.name}
Shares and Price: ${f.shares.toLocaleString()} shares of Common Stock, at the fair value determined by the Board
Amount and Form of Consideration: ${IP_VALUE_PLACEHOLDER} in intellectual property, per the Assignment of IP and Other Assets
Vesting Schedule: See note (a) below
Vesting Commencement Date: ${a.vestingStartDate || "Incorporation date"}`,
          )
          .join("\n\n")
      : "[No founder allocations specified]"

  return `ACTION BY WRITTEN CONSENT
OF THE BOARD OF DIRECTORS OF

${a.companyName}

In accordance with Section 141(f) of the Delaware General Corporation Law and the Bylaws of ${a.companyName}, a Delaware corporation (the "Company"), the undersigned, constituting all of the members of the Company's Board of Directors (the "Board"), hereby take the following actions and adopt the following resolutions by written consent without a meeting:

1. Sale and Issuance of Stock

RESOLVED: That the officers are authorized to sell and issue on behalf of the Company the shares of stock as set forth in Exhibit A (the "Shares") to the purchasers listed therein (the "Purchasers") in the amounts and subject to the vesting provisions specified opposite the Purchaser's name, at the price per share as set forth in Exhibit A, which the Board determines to be the fair value of such Shares as of the date hereof, and in exchange for the consideration set forth in Exhibit A, which the Board determines to have a value equal to the fair value of the Shares.

RESOLVED FURTHER: That each stock sale authorized in the above resolution shall be made pursuant to a stock purchase agreement in substantially the form(s) attached hereto as Exhibit B.

RESOLVED FURTHER: That, upon the Company's receipt of a fully executed stock purchase agreement and the consideration provided for therein, the Company is authorized and directed to issue the Shares.

RESOLVED FURTHER: That it is desirable and in the best interest of the Company that its securities be qualified or registered for sale in various states; that the President or any Vice President and the Secretary or any Assistant Secretary (and their designees or agents) hereby are authorized to determine the states in which appropriate action shall be taken to qualify or register for sale all or such part of the securities of the Company as said persons may deem advisable; that said persons are hereby authorized to perform on behalf of the Company any and all such acts as they deem necessary or advisable in order to comply with the applicable laws of any such states, and in connection therewith to execute and file all requisite papers and documents, including, but not limited to, applications, reports, surety bonds, irrevocable consents and appointments of attorneys for service of process; and the execution by such persons of any such paper or document or the doing by them of any act in connection with the foregoing matters shall conclusively establish their authority from the Company and the approval and ratification by the Company of the papers and documents so executed and the action so taken.

RESOLVED FURTHER: That the stock sales authorized in the above resolution shall be conducted in such a manner as to qualify for the exemption from applicable state requirements regarding registration of the sale of securities.

2. Uncertificated Stock

RESOLVED: That the shares of the Company shall be uncertificated, provided that the Company may issue certificated shares for some or all of any or all classes or series of its stock if deemed advisable and in the best interests of the Company by the officers, in consultation with legal counsel.

RESOLVED FURTHER: That the officers are authorized and directed to send a written notice to record owners of shares of uncertificated stock in accordance with the Delaware General Corporation Law (upon the request of such record owner) substantially in the form provided herewith to the Board with such changes deemed necessary or advisable by the officers, in consultation with legal counsel.

3. Omnibus Resolution

RESOLVED: That each of the officers is authorized and empowered to take all such actions (including, without limitation, soliciting appropriate consents or waivers from stockholders) and to execute and deliver all such documents as may be necessary or advisable to carry out the intent and accomplish the purposes of the foregoing resolutions and to effect any transactions contemplated thereby and the performance of any such actions and the execution and delivery of any such documents shall be conclusive evidence of the approval of the Board thereof and all matters relating thereto.

***

In accordance with the Company's Bylaws, this action may be executed in writing, or consented to by electronic transmission, in any number of counterparts, each of which when so executed shall be deemed to be an original and all of which taken together shall constitute one and the same action.

The consent of the undersigned shall be effective immediately upon the election of the undersigned as directors of the corporation; provided, however, that if such event has already occurred before the time of execution of this consent by the undersigned, then this consent shall be effective immediately. This consent shall be deemed revoked if it has not become effective within 60 days of the Actual Date of Signature below, which Actual Date of Signature is the date on which provision for the effectiveness of this consent has been made.

Actual Date of Signature: ${today()}


${directorSignatures}


EXHIBIT A

INITIAL STOCK ISSUANCE TABLE

${issuanceTable}

(a) 100.00% of the Common Shares are subject to vesting (the "Vesting Shares"). 1/4th of the Vesting Shares shall vest on the 12-month anniversary of the Vesting Commencement Date and 1/48th of the Vesting Shares shall vest monthly thereafter. In the event of a Change of Control, 100.00% of the Vesting Shares shall vest on a single trigger basis.


EXHIBIT B

FORM OF RESTRICTED STOCK PURCHASE AGREEMENT

(See the Founder Restricted Stock Purchase Agreements document.)`
}

function buildFounderRSPA(a: FlowAnswers, founderName: string, shares: number): string {
  const sharesStr = shares.toLocaleString()
  const vestingCommencementDate = a.vestingStartDate || "Incorporation date"

  return `RESTRICTED STOCK PURCHASE AGREEMENT

This Restricted Stock Purchase Agreement (this "Agreement") is made as of ${today()} by and between ${a.companyName}, a Delaware corporation (the "Company"), and ${founderName} ("Purchaser").

1. Sale of Stock. Subject to the terms and conditions of this Agreement, simultaneously with the execution and delivery of this Agreement by the parties or on such other date as the Company and Purchaser shall agree (the "Purchase Date"), the Company will issue and sell to Purchaser, and Purchaser agrees to purchase from the Company, ${sharesStr} shares of the Company's Common Stock (the "Shares") in exchange for the consideration as provided on Schedule A (the "Aggregate Purchase Price"). On the Purchase Date, Purchaser will deliver the Aggregate Purchase Price to the Company and the Company will enter the Shares in Purchaser's name as of such date in the books and records of the Company or, if applicable, a duly authorized transfer agent of the Company. The Company will deliver to Purchaser, upon request, a notice of issuance with respect to the Shares as soon as practicable following such date. As used elsewhere herein, the term "Shares" refers to all of the Shares purchased hereunder and all securities received in connection with the Shares pursuant to stock dividends or splits, all securities received in replacement of the Shares in a recapitalization, merger, reorganization, exchange or the like, and all new, substituted or additional securities or other property to which Purchaser is entitled by reason of Purchaser's ownership of the Shares.

2. Consideration. As consideration for the mutual promises and covenants set forth in this Agreement, Purchaser will deliver the Aggregate Purchase Price by an assignment of certain assets as set forth in the Assignment of IP and Other Assets in the form attached to this Agreement as Exhibit D.

3. Limitations on Transfer. Purchaser acknowledges and agrees that the Shares purchased under this Agreement are subject to (i) the terms and conditions that apply to the Company's Common Stock, as set forth in the Company's Bylaws, as may be in effect at the time of any proposed transfer (the "Bylaw Provisions"), and (ii) any other limitation or restriction on transfer created by applicable laws. In addition to the foregoing limitations on transfer, Purchaser shall not assign, encumber or dispose of any interest in the Shares while the Shares are subject to the Company's Repurchase Option (as defined below). After any Shares have been released from such Repurchase Option, Purchaser shall not assign, encumber or dispose of any interest in the Shares except to the extent permitted by, and in compliance with the Bylaw Provisions, applicable laws, and the provisions below.

(a) Repurchase Option; Vesting.

(i) In the event of the voluntary or involuntary termination of Purchaser's Continuous Service Status (as defined below) for any reason (including, without limitation, resignation, death or Disability (as defined below)), with or without cause, the Company shall upon the date of such termination (the "Termination Date") have an irrevocable, exclusive option (the "Repurchase Option") for a period of 9 months from such date to repurchase all or any portion of the Unvested Shares (as defined below) held by Purchaser as of the Termination Date at the original purchase price per Share (adjusted for any stock splits, stock dividends and the like) specified in Section 1. As used in this Agreement, "Unvested Shares" means Shares, if any, that have not yet been released from the Repurchase Option.

(ii) Unless the Company notifies Purchaser within 9 months from the Termination Date that it does not intend to exercise its Repurchase Option with respect to some or all of the Unvested Shares, the Repurchase Option shall be deemed automatically exercised by the Company as of the end of such 9-month period following such Termination Date, provided that the Company may notify Purchaser that it is exercising its Repurchase Option as of a date prior to the end of such 9-month period. Unless Purchaser is otherwise notified by the Company pursuant to the preceding sentence that the Company does not intend to exercise its Repurchase Option as to some or all of the Unvested Shares to which it applies at the time of termination, execution of this Agreement by Purchaser constitutes written notice to Purchaser of the Company's intention to exercise its Repurchase Option with respect to all Unvested Shares to which such Repurchase Option applies. The Company, at its choice, may satisfy its payment obligation to Purchaser with respect to exercise of the Repurchase Option by either (A) delivering a check, wire transfer or other method of electronic payment to Purchaser in the amount of the purchase price for the Unvested Shares being repurchased, or (B) vesting in the event Purchaser is indebted to the Company, canceling an amount of such indebtedness equal to the purchase price for the Unvested Shares being repurchased, or (C) by a combination of (A) and (B) so that the combined payment and cancellation of indebtedness equals such purchase price. In the event of any deemed automatic exercise of the Repurchase Option pursuant to this Section 3(a)(ii) in which Purchaser is indebted to the Company, such indebtedness equal to the purchase price of the Unvested Shares being repurchased shall be deemed automatically canceled as of the end of the 9-month period following the Termination Date unless the Company otherwise satisfies its payment obligations. As a result of any repurchase of Unvested Shares pursuant to this Section 3(a), the Company shall become the legal and beneficial owner of the Unvested Shares being repurchased and shall have all rights and interest therein or related thereto, and the Company shall have the right to transfer to its own name the number of Unvested Shares being repurchased by the Company, without further action by Purchaser.

(iii) 100.00% of the Shares shall initially be subject to the Repurchase Option (the "Vesting Shares"). 1/4th of the Vesting Shares shall be released from the Repurchase Option on the 12-month anniversary of ${vestingCommencementDate}, and an additional 1/48th of the Vesting Shares shall be released from the Repurchase Option on the 1st day of each month thereafter, until all Vesting Shares are released from the Repurchase Option; provided, however, that such scheduled releases from the Repurchase Option shall immediately cease as of the Termination Date. Fractional shares shall be rounded down to the nearest whole share.

(iv) Notwithstanding the foregoing, if a Change of Control occurs the vesting of the Unvested Shares shall accelerate such that the Repurchase Option in Section 3(a) shall lapse as to 100.00% of the Unvested Shares, effective as of immediately prior to consummation of a Change of Control. As used in this Agreement, "Change of Control" means a sale of all or substantially all of the Company's assets other than to an Excluded Entity (as defined below), a merger, consolidation or other capital reorganization or business combination transaction of the Company with or into another corporation, limited liability company or other entity other than an Excluded Entity, or the consummation of a transaction, or series of related transactions, in which any "person" (as such term is used in Sections 13(d) and 14(d) of the Exchange Act) becomes the "beneficial owner" (as defined in Rule 13d-3 of the Exchange Act), directly or indirectly, of all of the Company's then outstanding voting securities. Notwithstanding the foregoing, a transaction shall not constitute a Change of Control if its purpose is to change the jurisdiction of the Company's incorporation, create a holding company that will be owned in substantially the same proportions by the persons who hold the Company's securities immediately before such transaction, or obtain funding for the Company in a financing that is approved by the Company's Board of Directors. An "Excluded Entity" means a corporation, limited liability company or other entity of which the holders of voting capital stock of the Company outstanding immediately prior to such transaction are the direct or indirect holders of voting securities representing at least a majority of the votes entitled to be cast by all of such corporation's, limited liability company's or other entity's voting securities outstanding immediately after such transaction.

(b) Transfer Restrictions; Right of First Refusal. Before any Shares held by Purchaser or any transferee of Purchaser (either being sometimes referred to herein as the "Holder") may be sold or otherwise transferred (including transfer by gift or operation of law), the Company shall first, to the extent the Company's approval is required by any applicable Bylaw Provisions, have the right to approve such sale or transfer, in full or in part, and shall then have the right to purchase all or any part of the Shares proposed to be sold or transferred, in each case, in its sole and absolute discretion (the "Right of First Refusal"). If the Holder would like to sell or transfer any Shares, the Holder must provide the Company or its assignee(s) with a Notice (as defined below) requesting approval to sell or transfer the Shares and offering the Company or its assignee(s) a Right of First Refusal on the same terms and conditions set forth in this Section 3(b). The Company may either (1) exercise its Right of First Refusal in full or in part and purchase such Shares pursuant to this Section 3(b), (2) decline to exercise its Right of First Refusal in full or in part and permit the transfer of such Shares to the Proposed Transferee (as defined below) in full or in part or (3) decline to exercise its Right of First Refusal in full or in part and, to the extent the Company's approval is required by any applicable Bylaw Provisions, decline the request to sell or transfer the Shares in full or in part.

(i) Notice of Proposed Transfer. The Holder of the Shares shall deliver to the Company a written notice (the "Notice") stating: (A) the Holder's intention to sell or otherwise transfer such Shares; (B) the name of each proposed purchaser or other transferee ("Proposed Transferee"); (C) the number of Shares to be sold or transferred to each Proposed Transferee; (D) the terms and conditions of each proposed sale or transfer, including (without limitation) the purchase price for such Shares (the "Transfer Purchase Price"); and (E) the Holder's offer to the Company or its assignee(s) to purchase the Shares at the Transfer Purchase Price and upon the same terms (or terms that are no less favorable to the Company).

(ii) Exercise of Right of First Refusal. At any time within 30 days after receipt of the Notice, the Company and/or its assignee(s) shall deliver a written notice to the Holder indicating whether the Company and/or its assignee(s) elect to permit or reject the proposed sale or transfer, in full or in part, and/or elect to accept or decline the offer to purchase any or all of the Shares proposed to be sold or transferred to any one or more of the Proposed Transferees, at the Transfer Purchase Price, provided that if the Transfer Purchase Price consists of no legal consideration (as, for example, in the case of a transfer by gift), the purchase price will be the fair market value of the Shares as determined in good faith by the Company. If the Transfer Purchase Price includes consideration other than cash, the cash equivalent value of the non-cash consideration shall be determined by the Company in good faith.

(iii) Payment. Payment of the Transfer Purchase Price shall be made, at the election of the Company or its assignee(s), in cash (by check or other funds transfer), by cancellation of all or a portion of any outstanding indebtedness, or by any combination thereof within 60 days after receipt of the Notice or in the manner and at the times set forth in the Notice.

(iv) Holder's Right to Transfer. If any of the Shares proposed in the Notice to be sold or transferred to a given Proposed Transferee are both (A) not purchased by the Company and/or its assignee(s) as provided in this Section 3(b) and (B) approved by the Company to be sold or transferred, then the Holder may sell or otherwise transfer any such Shares to the applicable Proposed Transferee at the Transfer Purchase Price or at a higher price, provided that such sale or other transfer is consummated within 120 days after the date of the Notice; provided that any such sale or other transfer is also effected in accordance with the Bylaw Provisions and any applicable laws and the Proposed Transferee agrees in writing that the Bylaw Provisions and the provisions of this Agreement, including this Section 3 shall continue to apply to the Shares in the hands of such Proposed Transferee. The Company, in consultation with its legal counsel, may require the Holder to provide an opinion of counsel evidencing compliance with applicable laws. If the Shares described in the Notice are not transferred to the Proposed Transferee within such period, or if the Holder proposes to change the price or other terms to make them more favorable to the Proposed Transferee, a new Notice shall be given to the Company, and the Company and/or its assignees shall again have the right to approve such transfer and be offered the Right of First Refusal.

(v) Exception for Certain Family Transfers. Anything to the contrary contained in this Section 3(b) notwithstanding, the transfer of any or all of the Shares during Holder's lifetime or on Holder's death by will or intestacy to Holder's Immediate Family or a trust for the benefit of Holder or Holder's Immediate Family shall be exempt from the provisions of this Section 3(b). "Immediate Family" as used herein shall mean lineal descendant or antecedent, spouse (or spouse's antecedents), father, mother, brother or sister (or their descendants), stepchild (or their antecedents or descendants), aunt or uncle (or their antecedents or descendants), brother-in-law or sister-in-law (or their antecedents or descendants) and shall include adoptive relationships, or any person sharing Holder's household (other than a tenant or an employee). In such case, the transferee or other recipient shall receive and hold the Shares so transferred subject to the Bylaw Provisions and the provisions of this Agreement, including this Section 3, and there shall be no further transfer of such Shares except in accordance with the terms of this Section 3 and the Bylaw Provisions.

(c) Company's Right to Purchase upon Involuntary Transfer. In the event of any transfer by operation of law or other involuntary transfer (including divorce or intestate transfer upon death, but excluding transfer upon death by will (to any transferee) or a transfer to Immediate Family as set forth in Section 3(b)(v) above) of all or a portion of the Shares by the record holder thereof, the Company shall have an option to purchase any or all of the Shares transferred at the fair market value of the Shares on the date of transfer (as determined by the Company in its sole discretion). Upon such a transfer, the Holder shall promptly notify the Secretary of the Company of such transfer. The right to purchase such Shares shall be provided to the Company for a period of 30 days following receipt by the Company of written notice from the Holder.

(d) Assignment. The right of the Company to purchase any part of the Shares may be assigned in whole or in part to any holder or holders of capital stock of the Company or other persons or organizations.

(e) Restrictions Binding on Transferees. All transferees of Shares or any interest therein will receive and hold such Shares or interest subject to the Bylaw Provisions and the provisions of this Agreement, including, without limitation, Section 3, including, insofar as applicable, the Repurchase Option. In the event of any purchase by the Company hereunder where the Shares or interest are held by a transferee, the transferee shall be obligated, if requested by the Company, to transfer the Shares or interest to Purchaser for consideration equal to the amount to be paid by the Company hereunder. In the event the Repurchase Option is deemed exercised by the Company pursuant to Section 3(a)(ii) hereof, the Company may deem any transferee to have transferred the Shares or interest to Purchaser prior to their purchase by the Company, and payment of the purchase price by the Company to such transferee shall be deemed to satisfy Purchaser's obligation to pay such transferee for such Shares or interest, and also to satisfy the Company's obligation to pay Purchaser for such Shares or interest. Any sale or transfer of the Shares shall be void unless the provisions of this Agreement are satisfied.

(f) Termination of Rights. The transfer restrictions set forth in Section 3(b) above, the Right of First Refusal granted the Company by Section 3(b) above and the right to repurchase the Shares in the event of an involuntary transfer granted the Company by Section 3(c) above shall terminate upon the first sale of Common Stock of the Company to the general public pursuant to a registration statement filed with and declared effective by the Securities and Exchange Commission under the Securities Act of 1933, as amended (the "Securities Act") (other than a registration statement relating solely to the issuance of Common Stock pursuant to a business combination or an employee incentive or benefit plan) or any transfer or conversion of Shares made pursuant to a statutory merger or statutory consolidation of the Company with or into another corporation or corporations if the common stock of the surviving corporation or any direct or indirect parent corporation thereof is registered under the Securities Exchange Act of 1934, as amended (the "Exchange Act").

(g) Lock-Up Agreement. If so requested by the Company or the underwriters in connection with the initial public offering of the Company's securities registered under the Securities Act of 1933, as amended, Purchaser shall not sell, make any short sale of, loan, grant any option for the purchase of, or otherwise dispose of any securities of the Company however or whenever acquired (except for those being registered) without the prior written consent of the Company or such underwriters, as the case may be, for 180 days from the effective date of the registration statement, and Purchaser shall execute an agreement reflecting the foregoing as may be requested by the underwriters at the time of such offering.

4. Escrow of Unvested Shares. For purposes of facilitating the enforcement of the provisions of Section 3 above, Purchaser agrees to deliver a Stock Power in the form attached to this Agreement as Exhibit A executed by Purchaser and by Purchaser's spouse (if required for transfer), in blank, and such stock certificate(s), if any, to the Secretary of the Company, or the Secretary's designee, to hold such Shares (and stock certificate(s), if any) and Stock Power in escrow and to take all such actions and to effectuate all such transfers and/or releases as are required in accordance with the terms of this Agreement. Purchaser hereby acknowledges that the Secretary of the Company, or the Secretary's designee, is so appointed as the escrow holder with the foregoing authorities as a material inducement to make this Agreement and that said appointment is coupled with an interest and is accordingly irrevocable. Purchaser agrees that said escrow holder shall not be liable to any party hereof (or to any other party). The escrow holder may rely upon any letter, notice or other document executed by any signature purported to be genuine and may resign at any time. Purchaser agrees that if the Secretary of the Company, or the Secretary's designee, resigns as escrow holder for any or no reason, the Board of Directors of the Company shall have the power to appoint a successor to serve as escrow holder pursuant to the terms of this Agreement.

5. Investment and Taxation Representations. In connection with the purchase of the Shares, Purchaser represents to the Company the following:

(a) Purchaser is aware of the Company's business affairs and financial condition and has acquired sufficient information about the Company to reach an informed and knowledgeable decision to acquire the Shares. Purchaser is purchasing the Shares for investment for Purchaser's own account only and not with a view to, or for resale in connection with, any "distribution" thereof within the meaning of the Securities Act or under any applicable provision of state law. Purchaser does not have any present intention to transfer the Shares to any other person or entity.

(b) Purchaser understands that the Shares have not been registered under the Securities Act by reason of a specific exemption therefrom, which exemption depends upon, among other things, the bona fide nature of Purchaser's investment intent as expressed herein.

(c) Purchaser further acknowledges and understands that the securities must be held indefinitely unless they are subsequently registered under the Securities Act or an exemption from such registration is available. Purchaser further acknowledges and understands that the Company is under no obligation to register the securities.

(d) Purchaser is familiar with the provisions of Rule 144, promulgated under the Securities Act, which, in substance, permits limited public resale of "restricted securities" acquired, directly or indirectly, from the issuer of the securities (or from an affiliate of such issuer), in a non-public offering subject to the satisfaction of certain conditions. Purchaser understands that the Company provides no assurances as to whether he or she will be able to resell any or all of the Shares pursuant to Rule 144, which rule requires, among other things, that the Company be subject to the reporting requirements of the Exchange Act, that resales of securities take place only after the holder of the Shares has held the Shares for certain specified time periods, and under certain circumstances, that resales of securities be limited in volume and take place only pursuant to brokered transactions. Notwithstanding this Section 5(d), Purchaser acknowledges and agrees to the restrictions set forth in Section 5(e) below.

(e) Purchaser further understands that in the event all of the applicable requirements of Rule 144 are not satisfied, registration under the Securities Act, compliance with Regulation A, or some other registration exemption will be required; and that, notwithstanding the fact that Rule 144 is not exclusive, the Staff of the Securities and Exchange Commission has expressed its opinion that persons proposing to sell private placement securities other than in a registered offering and otherwise than pursuant to Rule 144 will have a substantial burden of proof in establishing that an exemption from registration is available for such offers or sales, and that such persons and their respective brokers who participate in such transactions do so at their own risk.

(f) Purchaser represents that Purchaser is not subject to any of the "Bad Actor" disqualifications described in Rule 506(d)(1)(i) to (viii) under the Securities Act. Purchaser also agrees to notify the Company if Purchaser becomes subject to such disqualifications after the date hereof.

(g) Purchaser understands that Purchaser may suffer adverse tax consequences as a result of Purchaser's purchase or disposition of the Shares. Purchaser represents that Purchaser has consulted any tax consultants Purchaser deems advisable in connection with the purchase or disposition of the Shares and that Purchaser is not relying on the Company for any tax advice.

6. Restrictive Legends and Stop-Transfer Orders.

(a) Legends. Any stock certificate or, in the case of uncertificated securities, any notice of issuance, for the Shares, shall bear the following legends (as well as any legends required by the Company or applicable state and federal corporate and securities laws):

(i) "THE SECURITIES REFERENCED HEREIN HAVE NOT BEEN REGISTERED UNDER THE SECURITIES ACT OF 1933, AND HAVE BEEN ACQUIRED FOR INVESTMENT AND NOT WITH A VIEW TO, OR IN CONNECTION WITH, THE SALE OR DISTRIBUTION THEREOF. NO SUCH SALE OR DISTRIBUTION MAY BE EFFECTED WITHOUT AN EFFECTIVE REGISTRATION STATEMENT RELATED THERETO OR AN OPINION OF COUNSEL IN A FORM SATISFACTORY TO THE COMPANY THAT SUCH REGISTRATION IS NOT REQUIRED UNDER THE SECURITIES ACT OF 1933."

(ii) "THE SECURITIES REFERENCED HEREIN MAY BE TRANSFERRED ONLY IN ACCORDANCE WITH THE TERMS OF AN AGREEMENT BETWEEN THE COMPANY AND THE STOCKHOLDER, A COPY OF WHICH IS ON FILE WITH AND MAY BE OBTAINED FROM THE SECRETARY OF THE COMPANY AT NO CHARGE."

(b) Stop-Transfer Notices. Purchaser agrees that, in order to ensure compliance with the restrictions referred to herein, the Company may issue appropriate "stop transfer" instructions to its transfer agent, if any, and that, if the Company transfers its own securities, it may make appropriate notations to the same effect in its own records.

(c) Refusal to Transfer. The Company shall not be required (i) to transfer on its books any Shares that have been sold or otherwise transferred in violation of any of the provisions of this Agreement or (ii) to treat as owner of such Shares or to accord the right to vote or pay dividends to any purchaser or other transferee to whom such Shares shall have been so transferred.

(d) Legend and Notice Removal. When all of the following events have occurred, the Shares then held by Purchaser will no longer be subject to the legend specified in Section 6(a)(ii) and the Company will remove any stop-transfer notices associated with the transfer restrictions imposed by this Agreement:

(iii) the termination of the Right of First Refusal;

(iv) the expiration or exercise in full of the Repurchase Option; and

(v) the expiration or termination of the lock-up provisions of Section 3(g) (and of any agreement entered pursuant to Section 3(g)).

After such time and upon Purchaser's request, a new stock certificate or, in the case of uncertificated securities, notice of issuance, for the remaining Shares, shall be issued without the legend specified in Section 6(a)(ii) and delivered to Purchaser.

(e) Required Notices. Purchaser acknowledges that the Shares are issued and shall be held subject to all the provisions of this Agreement, the Certificate of Incorporation and the Bylaws of the Company and any amendments thereto, copies of which are on file at the principal office of the Company. A statement of all of the rights, preferences, privileges and restrictions granted to or imposed upon the respective classes and/or series of shares of stock of the Company and upon the holders thereof may be obtained by any stockholder upon request and without charge, at the principal office of the Company, and the Company will furnish any stockholder, upon request and without charge, a copy of such statement. Purchaser acknowledges that the provisions of this Section 6 shall constitute the notices required by Sections 151(f) and 202(a) of the Delaware General Corporation Law and Purchaser hereby expressly waives the requirement of Section 151(f) of the Delaware General Corporation Law that it receive the written notice provided for in Sections 151(f) and 202(a) of the Delaware General Corporation Law within a reasonable time after the issuance of the Shares.

7. No Employment Rights. Nothing in this Agreement shall affect in any manner whatsoever the right or power of the Company, or a parent, subsidiary or affiliate of the Company, to terminate Purchaser's employment or consulting relationship, for any reason, with or without cause.

8. Section 83(b) Election. Purchaser understands that Section 83(a) of the Internal Revenue Code of 1986, as amended (the "Code"), taxes as ordinary income the difference between the amount paid for the Shares and the fair market value of the Shares as of the date any restrictions on the Shares lapse. In this context, "restriction" means the right of the Company to buy back the Shares pursuant to the Repurchase Option set forth in Section 3(a) of this Agreement. Purchaser understands that Purchaser may elect to be taxed at the time the Shares are purchased, rather than when and as the Repurchase Option expires, by filing an election under Section 83(b) (an "83(b) Election") of the Code with the Internal Revenue Service within 30 days from the date of purchase. Even if the fair market value of the Shares at the time of the execution of this Agreement equals the amount paid for the Shares, the election must be made to avoid income under Section 83(a) in the future. Purchaser understands that failure to file such an election in a timely manner may result in adverse tax consequences for Purchaser. Purchaser further understands that an additional copy of such election form should be filed with Purchaser's federal income tax return for the calendar year in which the date of this Agreement falls. Purchaser acknowledges that the foregoing is only a summary of the effect of United States federal income taxation with respect to purchase of the Shares hereunder, does not purport to be complete, and is not intended or written to be used, and cannot be used, for the purposes of avoiding taxpayer penalties. Purchaser further acknowledges that the Company has directed Purchaser to seek independent advice regarding the applicable provisions of the Code, the income tax laws of any municipality, state or foreign country in which Purchaser may reside, and the tax consequences of Purchaser's death, and Purchaser has consulted, and has been fully advised by, Purchaser's own tax advisor regarding such tax laws and tax consequences or has knowingly chosen not to consult such a tax advisor. Purchaser further acknowledges that neither the Company nor any subsidiary or representative of the Company has made any warranty or representation to Purchaser with respect to the tax consequences of Purchaser's purchase of the Shares or of the making or failure to make an 83(b) Election.

Even if the fair market value of the Shares at the time of the execution of this Agreement equals the amount paid for the Shares, the election must be made to avoid income under Section 83(a) in the future. Purchaser understands that failure to file such an election in a timely manner may result in adverse tax consequences for Purchaser. Purchaser further understands that an additional copy of such election form should be filed with Purchaser's federal income tax return for the calendar year in which the date of this Agreement falls. Purchaser acknowledges that the foregoing is only a summary of the effect of United States federal income taxation with respect to purchase of the Shares hereunder, does not purport to be complete, and is not intended or written to be used, and cannot be used, for the purposes of avoiding taxpayer penalties. Purchaser further acknowledges that the Company has directed Purchaser to seek independent advice regarding the applicable provisions of the Code, the income tax laws of any municipality, state or foreign country in which Purchaser may reside, and the tax consequences of Purchaser's death, and Purchaser has consulted, and has been fully advised by, Purchaser's own tax advisor regarding such tax laws and tax consequences or has knowingly chosen not to consult such a tax advisor. Purchaser further acknowledges that neither the Company nor any subsidiary or representative of the Company has made any warranty or representation to Purchaser with respect to the tax consequences of Purchaser's purchase of the Shares or of the making or failure to make an 83(b) Election.

PURCHASER (AND NOT THE COMPANY, ITS AGENTS OR ANY OTHER PERSON) SHALL BE SOLELY RESPONSIBLE FOR APPROPRIATELY FILING SUCH FORM WITH THE IRS, EVEN IF PURCHASER REQUESTS THE COMPANY, ITS AGENTS OR ANY OTHER PERSON MAKE THIS FILING ON PURCHASER'S BEHALF.

Purchaser agrees that Purchaser will execute and deliver to the Company with this executed Agreement a copy of the Acknowledgment and Statement of Decision Regarding Section 83(b) Election (the "Acknowledgment"), attached hereto as Exhibit B and, if Purchaser decides to make an 83(b) Election, a copy of the 83(b) Election, attached hereto as Exhibit C.

9. Certain Defined Terms.

(a) "Affiliate" means an entity other than a Subsidiary which, together with the Company, is under common control of a third person or entity.

(b) "Consultant" means any person, including an advisor but not an Employee, who is engaged by the Company, or any Parent, Subsidiary or Affiliate, to render services (other than capital-raising services) and is compensated for such services, and any Director whether compensated for such services or not.

(c) "Continuous Service Status" means the absence of any interruption or termination of service as an Employee or Consultant. Continuous Service Status as an Employee or Consultant shall not be considered interrupted or terminated in the case of: Company approved sick leave; military leave; any other bona fide leave of absence approved by the Company, provided that such leave is for a period of not more than ninety (90) days, unless reemployment upon the expiration of such leave is guaranteed by contract or statute, or unless provided otherwise pursuant to a written Company policy. Also, Continuous Service Status as an Employee or Consultant shall not be considered interrupted or terminated in the case of a transfer between locations of the Company or between the Company, its Parents, Subsidiaries or Affiliates, or their respective successors, or a change in status from an Employee to a Consultant or from a Consultant to an Employee.

(d) "Director" means a member of the Board of Directors of the Company.

(e) "Disability" means "disability" within the meaning of Section 22(e)(3) of the Code.

(f) "Employee" means any person employed by the Company, or any Parent, Subsidiary or Affiliate, with the status of employment determined pursuant to such factors as are deemed appropriate by the Board of Directors of the Company in its sole discretion, subject to any requirements of applicable laws, including the Code. The payment by the Company of a director's fee shall not be sufficient to constitute "employment" of such director by the Company or any Parent, Subsidiary or Affiliate.

(g) "Parent" means any corporation (other than the Company) in an unbroken chain of corporations ending with the Company if each of the corporations other than the Company owns stock possessing 50% or more of the total combined voting power of all classes of stock in one of the other corporations in such chain.

(h) "Subsidiary" means any corporation (other than the Company) in an unbroken chain of corporations beginning with the Company if each of the corporations other than the last corporation in the unbroken chain owns stock possessing 50% or more of the total combined voting power of all classes of stock in one of the other corporations in such chain.

10. Miscellaneous.

(a) Governing Law. The validity, interpretation, construction and performance of this Agreement, and all acts and transactions pursuant hereto and the rights and obligations of the parties hereto shall be governed, construed and interpreted in accordance with the laws of the state of Delaware, without giving effect to principles of conflicts of law. For purposes of litigating any dispute that may arise directly or indirectly from this Agreement, the parties hereby submit and consent to the exclusive jurisdiction of the state of Delaware and agree that any such litigation shall be conducted only in the courts of Delaware or the federal courts of the United States located in Delaware and no other courts.

(b) Entire Agreement. This Agreement sets forth the entire agreement and understanding of the parties relating to the subject matter herein and supersedes all prior or contemporaneous discussions, understandings and agreements, whether oral or written, between them relating to the subject matter hereof.

(c) Amendments and Waivers. No modification of or amendment to this Agreement, nor any waiver of any rights under this Agreement, shall be effective unless in writing signed by the parties to this Agreement. No delay or failure to require performance of any provision of this Agreement shall constitute a waiver of that provision as to that or any other instance.

(d) Successors and Assigns. Except as otherwise provided in this Agreement, this Agreement, and the rights and obligations of the parties hereunder, will be binding upon and inure to the benefit of their respective successors, assigns, heirs, executors, administrators and legal representatives. The Company may assign any of its rights and obligations under this Agreement. No other party to this Agreement may assign, whether voluntarily or by operation of law, any of its rights and obligations under this Agreement, except with the prior written consent of the Company.

(e) Notices. Any notice, demand or request required or permitted to be given under this Agreement shall be in writing and shall be deemed sufficient when delivered personally or by overnight courier or sent by email, or 48 hours after being deposited in the U.S. mail as certified or registered mail with postage prepaid, addressed to the party to be notified at such party's address as set forth on the signature page, as subsequently modified by written notice, or if no address is specified on the signature page, at the most recent address set forth in the Company's books and records.

(f) Severability. If one or more provisions of this Agreement are held to be unenforceable under applicable law, the parties agree to renegotiate such provision in good faith. In the event that the parties cannot reach a mutually agreeable and enforceable replacement for such provision, then (i) such provision shall be excluded from this Agreement, (ii) the balance of the Agreement shall be interpreted as if such provision were so excluded and (iii) the balance of the Agreement shall be enforceable in accordance with its terms.

(g) Construction. This Agreement is the result of negotiations between and has been reviewed by each of the parties hereto and their respective counsel, if any; accordingly, this Agreement shall be deemed to be the product of all of the parties hereto, and no ambiguity shall be construed in favor of or against any one of the parties hereto.

(h) Counterparts. This Agreement may be executed in any number of counterparts, each of which when so executed and delivered shall be deemed an original, and all of which together shall constitute one and the same agreement. Execution of a facsimile or scanned copy will have the same force and effect as execution of an original, and a facsimile or scanned signature will be deemed an original and valid signature.

(i) Electronic Delivery. The Company may, in its sole discretion, decide to deliver any documents related to this Agreement or any notices required by applicable law or the Company's Certificate of Incorporation or Bylaws by email or any other electronic means. Purchaser hereby consents to (i) conduct business electronically, (ii) receive such documents and notices by such electronic delivery and (iii) sign documents electronically and agrees to participate through an on-line or electronic system established and maintained by the Company or a third party designated by the Company.

(j) California Corporate Securities Law. THE SALE OF THE SECURITIES WHICH ARE THE SUBJECT OF THIS AGREEMENT HAS NOT BEEN QUALIFIED WITH THE COMMISSIONER OF FINANCIAL PROTECTION AND INNOVATION OF THE STATE OF CALIFORNIA AND THE ISSUANCE OF THE SECURITIES OR THE PAYMENT OR RECEIPT OF ANY PART OF THE CONSIDERATION THEREFOR PRIOR TO THE QUALIFICATION IS UNLAWFUL, UNLESS THE SALE OF SECURITIES IS EXEMPT FROM QUALIFICATION BY SECTION 25100, 25102 OR 25105 OF THE CALIFORNIA CORPORATIONS CODE. THE RIGHTS OF ALL PARTIES TO THIS AGREEMENT ARE EXPRESSLY CONDITIONED UPON THE QUALIFICATION BEING OBTAINED, UNLESS THE SALE IS SO EXEMPT.

[Signature Page Follows]

The parties have executed this Restricted Stock Purchase Agreement as of the date first set forth below.

Date: ${today()}


THE COMPANY:

${a.companyName}

By:_________________________
(Signature)

Name:_________________________
Title:_________________________


PURCHASER:

_________________________
(Signature)

${founderName}

Address:
_________________________
_________________________


I, _________________________, spouse of ${founderName} ("Purchaser"), have read and hereby approve the foregoing Common Stock Purchase Agreement (the "Agreement"). In consideration of the Company's granting my spouse the right to purchase the Shares as set forth in the Agreement, I hereby agree to be bound irrevocably by the Agreement and further agree that any community property or other such interest that I may have in the Shares shall hereby be similarly bound by the Agreement. I hereby appoint my spouse as my attorney-in-fact with respect to any amendment or exercise or waiver of any rights under the Agreement.

_________________________
(Print Name of Spouse, if applicable)

_________________________
(Signature)


Schedule A

Consideration

${IP_VALUE_PLACEHOLDER} in intellectual property


EXHIBIT A
STOCK POWER

Instructions: Please do not fill in any blanks other than the signature line. The purpose of this Stock Power is to enable the Company to exercise its repurchase option set forth in the Agreement without requiring additional signatures on the part of Holder.

FOR VALUE RECEIVED, the undersigned ("Holder"), hereby sells, assigns and transfers unto _________________________ ("Transferee") _________________________ shares of the Common Stock of ${a.companyName}, a Delaware corporation (the "Company"), standing in Holder's name on the Company's books as Certificate No. UCS-____ whether held in certificated or uncertificated form, and does hereby irrevocably constitute and appoint _________________________ to transfer said stock on the books of the Company with full power of substitution in the premises.

Dated: _________________________

HOLDER:

_________________________

_________________________
(Signature)

Address:

Email:

This Stock Power may only be used as authorized by the Common Stock Purchase Agreement between the Holder and the Company, dated _________________________ and the exhibits thereto.


IF YOU WISH TO MAKE A SECTION 83(B) ELECTION, THE FILING OF SUCH ELECTION IS YOUR RESPONSIBILITY.

THE FORM FOR MAKING THIS SECTION 83(B) ELECTION IS ATTACHED TO THIS AGREEMENT.

YOU MUST FILE THIS FORM WITHIN 30 DAYS OF PURCHASING THE SHARES.

YOU (AND NOT THE COMPANY, ANY OF ITS AGENTS OR ANY OTHER PERSON) SHALL BE SOLELY RESPONSIBLE FOR FILING SUCH FORM WITH THE IRS, EVEN IF YOU REQUEST THE COMPANY, ITS AGENTS OR ANY OTHER PERSON TO MAKE THIS FILING ON YOUR BEHALF AND EVEN IF THE COMPANY, ANY OF ITS AGENTS OR ANY OTHER PERSON HAS PREVIOUSLY MADE THIS FILING ON YOUR BEHALF.

The election should be filed by mailing a signed election form by certified mail, return receipt requested to the IRS Service Center where you file your tax returns. See www.irs.gov.


EXHIBIT B
ACKNOWLEDGMENT AND STATEMENT OF DECISION
REGARDING SECTION 83(b) ELECTION

The undersigned has entered into a stock purchase agreement with ${a.companyName}, a Delaware corporation (the "Company"), pursuant to which the undersigned is purchasing ${sharesStr} shares of Common Stock of the Company (the "Shares"). In connection with the purchase of the Shares, the undersigned hereby represents as follows:

1. The undersigned has carefully reviewed the stock purchase agreement pursuant to which the undersigned is purchasing the Shares.

2. The undersigned has either (a) consulted, and has been fully advised by, the undersigned's own tax advisor regarding the federal, state and local tax consequences of purchasing the Shares, and particularly regarding the advisability of making elections pursuant to Section 83(b) of the Internal Revenue Code of 1986, as amended (the "Code") and pursuant to the corresponding provisions, if any, of applicable state law; or (b) knowingly chosen not to consult such a tax advisor.

3. The undersigned hereby states that the undersigned has either decided (a) to make an election pursuant to Section 83(b) of the Code, and is submitting to the Company, together with the undersigned's executed stock purchase agreement, an executed form entitled "Election Under Section 83(b) of the Internal Revenue Code of 1986"; or (b) not to make an election pursuant to Section 83(b) of the Code.

4. Neither the Company nor any subsidiary or representative of the Company has made any warranty or representation to the undersigned with respect to the tax consequences of the undersigned's purchase of the Shares or of the making or failure to make an election pursuant to Section 83(b) of the Code or the corresponding provisions, if any, of applicable state law.

[Signature Page Follows]

IN WITNESS WHEREOF, the undersigned have executed this agreement effective as of the date and year first below written

Dated: ${today()}


_________________________
(Signature)

${founderName}


_________________________
(Signature of Spouse, if applicable)


EXHIBIT C
ELECTION UNDER SECTION 83(B)
OF THE INTERNAL REVENUE CODE OF 1986

See Form 15620


EXHIBIT D
FORM OF ASSIGNMENT OF IP AND OTHER ASSETS
(See Attached)


ASSIGNMENT OF IP AND OTHER ASSETS

This Assignment of IP and Other Assets (this "Agreement") is made and entered into effective as of the date first written below (this "Effective Date") by and between ${a.companyName}, a Delaware corporation (the "Company"), and ${founderName} (the "Assignor").

WHEREAS, prior to the Effective Date, the Assignor has developed certain technology and intellectual property on behalf of the Company and has developed or acquired other tangible personal property, as further described below, which relate to the Company's business as now conducted and as presently proposed to be conducted (the "Business");

WHEREAS, the Assignor desires such technology and intellectual property and other tangible personal property to be assigned to and owned by the Company, in connection with the sale of the shares of the Company's capital stock issued by the Company to the Assignor on or about the date hereof;

NOW THEREFORE, in consideration of the foregoing and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the parties to this Agreement hereby agree as follows:

1. Certain Definitions. As used herein, the following capitalized terms will have the meanings set forth below:

(a) "Technology" means all inventions, technology, ideas, concepts, processes, business plans, documentation, financial projections, models and any other items, authored, conceived, invented, developed or designed by the Assignor relating to the technology or Business of the Company that is not otherwise owned by the Company.

(b) "Derivative" means: (i) any derivative work of the Technology (as defined in Section 101 of the U.S. Copyright Act); (ii) all improvements, modifications, alterations, adaptations, enhancements and new versions of the Technology (the "Technology Derivatives"); and (iii) all technology, inventions, products or other items that, directly or indirectly, incorporate, or are derived from, any part of the Technology or any Technology Derivative.

(c) "Intellectual Property Rights" means, collectively, all worldwide patents, patent applications, patent rights, copyrights, copyright registrations, moral rights, trade names, trademarks, service marks, domain names and registrations and/or applications for all of the foregoing, trade secrets, know-how, mask work rights, rights in trade dress and packaging, goodwill and all other intellectual property rights and proprietary rights relating in any way to the Technology, any Derivative or any Embodiment, whether arising under the laws of the United States of America or the laws of any other state, country or jurisdiction.

(d) "Embodiment" means all documentation, drafts, papers, designs, schematics, diagrams, models, prototypes, source and object code (in any form or format and for all hardware platforms), computer-stored data, diskettes, manuscripts and other items describing all or any part of the Technology, any Derivative, any Intellectual Property Rights or any information related thereto or in which all of any part of the Technology, any Derivative, any Intellectual Property Right or such information is set forth, embodied, recorded or stored.

(e) "Business Assets" means all business and marketing plans, worldwide marketing rights, software, customer and supplier lists, price lists, mailing lists, customer and supplier records and other confidential or proprietary information relating to the Technology, as well as all computers, office equipment and other tangible personal property owned (i.e., not leased) by Assignor immediately prior to the execution and delivery of this Agreement and used in or related to the Business.

(f) "Assigned Assets" refers to the Technology, all Derivatives, all Intellectual Property Rights, all Embodiments and Business Assets, collectively.

2. Assignment.

(a) The Assignor hereby sells, transfers, assigns and conveys, to the Company, and its successors and assigns, the Assignor's entire right, title and interest in and to the Assigned Assets and all rights of action, power and benefit belonging to or accruing from the Assigned Assets including the right to undertake proceedings to recover past and future damages and claim all other relief in respect of any acts of infringement thereof whether such acts shall have been committed before or after the date of this assignment, the same to be held and enjoyed by said Company, for its own use and benefit and the use and benefit of its successors, legal representatives and assigns, as fully and entirely as the same would have been held and enjoyed by the Assignor, had this assignment not been made.

(b) The Assignor hereby appoints the Company the attorney-in-fact of the Assignor, with full power of substitution on behalf of the Assignor to demand and receive any of the Assigned Assets and to give receipts and releases for the same, to institute and prosecute in the name of the Assignor, but for the benefit of the Company, any legal or equitable proceedings the Company deems proper in order to enforce any rights in the Assigned Assets and to defend or compromise any legal or equitable proceedings relating to the Assigned Assets as the Company shall deem advisable. The Assignor hereby declares that the appointment made and powers granted hereby are coupled with an interest and shall be irrevocable by the Assignor.

(c) The Assignor hereby agrees that the Assignor and the Assignor's successors and assigns will do, execute, acknowledge and deliver, or will cause to be done, executed, acknowledged and delivered such further acts, documents, or instruments confirming the conveyance of any of the Assigned Assets to the Company as the Company shall reasonably deem necessary, provided that the Company shall provide all necessary documentation to the Assignor.

3. Assignor Representations and Warranties. The Assignor represents and warrants to the Company that to the best of Assignor's knowledge the Assignor is the owner, inventor and/or author of, and can grant exclusive right, title and interest in and to, each of the Assigned Assets transferred by the Assignor hereunder and that none of the Assigned Assets are subject to any dispute, claim, prior license or other agreement, assignment, lien or rights of any third party, or any other rights that might interfere with the Company's use, or exercise of ownership of, any of the Assigned Assets. The Assignor further represents and warrants to the Company that to the best of Assignor's knowledge the Assigned Assets are free of any claim of any prior employer or third party client of the Assignor or any school, university or other institution the Assignor attended, and that the Assignor is not aware of any claims by any third party to any rights of any kind in or to any of the Assigned Assets. The Assignor agrees to immediately notify the Company upon becoming aware of any such claims.

4. Reimbursement of Expenses. The Company shall as promptly as practicable, reimburse the Assignor for the Assignor's actual out-of-pocket costs reasonably incurred with respect to Assignor's acquisition and maintenance of the Assigned Assets.

5. Miscellaneous.

(a) Governing Law. The validity, interpretation, construction and performance of this Agreement, and all acts and transactions pursuant hereto and the rights and obligations of the parties hereto shall be governed, construed and interpreted in accordance with the laws of the state of Delaware, without giving effect to principles of conflicts of law.

(b) Entire Agreement. This Agreement sets forth the entire agreement and understanding of the parties relating to the subject matter herein and supersedes all prior or contemporaneous discussions, understandings and agreements, whether oral or written, between them relating to the subject matter hereof.

(c) Amendments and Waivers. No modification of or amendment to this Agreement, nor any waiver of any rights under this Agreement, shall be effective unless in writing signed by the parties to this Agreement. No delay or failure to require performance of any provision of this Agreement shall constitute a waiver of that provision as to that or any other instance.

(d) Successors and Assigns. Except as otherwise provided in this Agreement, this Agreement, and the rights and obligations of the parties hereunder, will be binding upon and inure to the benefit of their respective successors, assigns, heirs, executors, administrators and legal representatives. The Company may assign any of its rights and obligations under this Agreement. No other party to this Agreement may assign, whether voluntarily or by operation of law, any of its rights and obligations under this Agreement, except with the prior written consent of the Company.

(e) Notices. Any notice, demand or request required or permitted to be given under this Agreement shall be in writing and shall be deemed sufficient when delivered personally or by overnight courier or sent by email, or 48 hours after being deposited in the U.S. mail as certified or registered mail with postage prepaid, addressed to the party to be notified at such party's address as set forth on the signature page, as subsequently modified by written notice, or if no address is specified on the signature page, at the most recent address set forth in the Company's books and records.

(f) Severability. If one or more provisions of this Agreement are held to be unenforceable under applicable law, the parties agree to renegotiate such provision in good faith. In the event that the parties cannot reach a mutually agreeable and enforceable replacement for such provision, then (i) such provision shall be excluded from this Agreement, (ii) the balance of the Agreement shall be interpreted as if such provision were so excluded and (iii) the balance of the Agreement shall be enforceable in accordance with its terms.

(g) Construction. This Agreement is the result of negotiations between and has been reviewed by each of the parties hereto and their respective counsel, if any; accordingly, this Agreement shall be deemed to be the product of all of the parties hereto, and no ambiguity shall be construed in favor of or against any one of the parties hereto.

(h) Counterparts. This Agreement may be executed in any number of counterparts, each of which when so executed and delivered shall be deemed an original, and all of which together shall constitute one and the same agreement. Execution of a facsimile or scanned copy will have the same force and effect as execution of an original, and a facsimile or scanned signature will be deemed an original and valid signature.

[Signature Page Follows]

IN WITNESS WHEREOF, the undersigned have executed this Assignment of IP and Other Assets Agreement effective as of the date and year first below written.

Dated: ${today()}


_________________________
(Signature)

${founderName}, Assignor


RECEIPT

${a.companyName}, a Delaware corporation (the "Company"), hereby acknowledges receipt of:

 X  The assignment of certain intellectual property and/or other assets having an aggregate value equal to ${IP_VALUE_PLACEHOLDER} given by ${founderName} as consideration for ${sharesStr} shares of Common Stock of the Company recorded on the books of the Company as No. ${CERT_NUMBER_PLACEHOLDER}.

Dated: ${today()}


_________________________
(Signature)

By: _________________________, on behalf of the Company


RECEIPT AND CONSENT

The undersigned hereby acknowledges receipt of ${sharesStr} shares of Common Stock of ${a.companyName}, a Delaware corporation (the "Company").

The undersigned further acknowledges that the Secretary of the Company, or his or her designee, is acting as escrow holder pursuant to the Common Stock Purchase Agreement that Purchaser has previously entered into with the Company. As escrow holder, the Secretary of the Company, or his or her designee, holds the aforementioned certificate issued in the undersigned's name.

Dated: ${today()}


_________________________
(Signature)

${founderName}


_________________________
(Signature of Spouse, if applicable)`
}

function founderRSPA(a: FlowAnswers): string {
  const founders = a.allocations.filter((alloc) => !alloc.isPool)

  if (founders.length === 0) {
    return buildFounderRSPA(a, "[No founder allocations specified]", 0)
  }

  return founders
    .map((f) => buildFounderRSPA(a, f.name, f.shares))
    .join("\n\n\n════════════════════════════════════════\n\n\n")
}

function stockholdersConsentOptionPool(a: FlowAnswers): string {
  const year = currentYear()
  const founders = a.allocations.filter((alloc) => !alloc.isPool)
  const stockholderSignatures =
    founders.length > 0
      ? founders
          .map((f) => `_________________________\n${f.name}, Stockholder`)
          .join("\n\n")
      : "_________________________\n[No stockholders specified], Stockholder"

  return `ACTION BY WRITTEN CONSENT
OF THE MAJORITY STOCKHOLDERS

Pursuant to Section 228 of the Delaware General Corporation Law and the Bylaws of ${a.companyName}, a Delaware corporation (the "Company"), the undersigned majority stockholders of the Company hereby take the following actions and adopt the following resolutions by written consent. This written consent will be filed in the minute book of the Company:

1. Adoption of ${year} Stock Plan

RESOLVED: That the ${year} Stock Plan (the "Plan"), in substantially the form attached hereto as Exhibit B, is hereby adopted and ${a.poolShares} shares of the Company's Common Stock are hereby reserved for issuance thereunder.

[Signature Page Follows]

In accordance with the Company's Bylaws, this Action by Written Consent may be executed in writing, or consented to by electronic transmission, in any number of counterparts, each of which, when so executed, shall be deemed an original and all of which taken together shall constitute one and the same action.

The consent of the undersigned shall be effective immediately upon the grant, sale or issuance of Company common stock to the undersigned; provided, however, that if such event has already occurred before the time of execution of this consent by the undersigned, then this consent shall be effective immediately. This consent shall be deemed revoked if it has not become effective within 60 days of the Actual Date of Signature below, which Actual Date of Signature is the date on which provision for the effectiveness of this consent has been made.

Actual Date of Signature: ${today()}


${stockholderSignatures}


EXHIBIT B

FORM OF STOCK PLAN

(See the Equity Incentive Plan document.)`
}

function stockholderConsentIndemnification(a: FlowAnswers): string {
  const founders = a.allocations.filter((alloc) => !alloc.isPool)
  const stockholderSignatures =
    founders.length > 0
      ? founders
          .map((f) => `_________________________\n${f.name}, Stockholder`)
          .join("\n\n")
      : "_________________________\n[No stockholders specified], Stockholder"

  return `ACTION BY WRITTEN CONSENT
OF THE MAJORITY STOCKHOLDERS

Pursuant to Section 228 of the Delaware General Corporation Law and the Bylaws of ${a.companyName}, a Delaware corporation (the "Company"), the undersigned majority stockholders of the Company hereby take the following actions and adopt the following resolutions by written consent. This written consent will be filed in the minute book of the Company:

1. Indemnification Agreements

RESOLVED: It is in the best interests of this Company and its stockholders that the Company enter into indemnification agreements with its present and future officers and directors.

RESOLVED FURTHER: That the Company is authorized to enter into Indemnification Agreements with its present and future officers and directors in substantially the form attached hereto as Exhibit A (the "Indemnification Agreement"), together with any changes to such Indemnification Agreements determined by an officer of the Company to be desirable; and that determination shall be conclusively evidenced by such officer's execution and delivery of a definitive Indemnification Agreement.

[Signature Page Follows]

In accordance with the Company's Bylaws, this Action by Written Consent may be executed in writing, or consented to by electronic transmission, in any number of counterparts, each of which, when so executed, shall be deemed an original and all of which taken together shall constitute one and the same action.

The consent of the undersigned shall be effective immediately upon the grant, sale or issuance of Company common stock to the undersigned; provided, however, that if such event has already occurred before the time of execution of this consent by the undersigned, then this consent shall be effective immediately. This consent shall be deemed revoked if it has not become effective within 60 days of the Actual Date of Signature below, which Actual Date of Signature is the date on which provision for the effectiveness of this consent has been made.

Actual Date of Signature: ${today()}


${stockholderSignatures}


Exhibit A

Indemnification Agreement

(See the Indemnification Agreement document.)`
}

const RENDERERS: Partial<Record<string, (a: FlowAnswers) => string>> = {
  coi,
  "action-incorporator": actionIncorporator,
  "org-resolutions": orgResolutions,
  "board-consent-option-pool": boardConsentOptionPool,
  "board-consent-founder-stock": boardConsentFounderStock,
  "founder-rspa": founderRSPA,
  "stockholders-consent-option-pool": stockholdersConsentOptionPool,
  "stockholder-consent-indemnification": stockholderConsentIndemnification,
  bylaws,
  "option-pool": optionPool,
}

export function renderDocumentContent(docId: string, answers: FlowAnswers): string | null {
  return RENDERERS[docId]?.(answers) ?? null
}
