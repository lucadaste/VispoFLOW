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

const RENDERERS: Partial<Record<string, (a: FlowAnswers) => string>> = {
  coi,
}

export function renderDocumentContent(docId: string, answers: FlowAnswers): string | null {
  return RENDERERS[docId]?.(answers) ?? null
}
