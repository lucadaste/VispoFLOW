import { Resend } from "resend"

/** No verified sending domain yet — Resend's sandbox sender only delivers to the Resend
 *  account's own verified email until one is added. Switch this to an address on a verified
 *  domain once available. */
const FROM_ADDRESS = "VispoFLOW <onboarding@resend.dev>"

export async function sendSignatureRequestEmail({
  to,
  recipientName,
  docTitle,
  slotLabel,
  senderCompanyName,
  signUrl,
}: {
  to: string
  recipientName?: string
  docTitle: string
  slotLabel: string
  senderCompanyName?: string
  signUrl: string
}) {
  const greeting = recipientName ? `Hi ${recipientName},` : "Hi,"
  const from = senderCompanyName ? `${senderCompanyName}` : "Someone"
  const asRole = ` as ${slotLabel}`
  // Gmail groups same-subject emails to the same recipient into one thread and collapses a
  // message behind a "show trimmed content" toggle if its visible text looks identical to an
  // earlier one in that thread — which a plain resend otherwise would. The sent-at line keeps
  // each email's visible text unique so the sign link stays expanded and visible immediately.
  const sentAt = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  })

  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `${from} sent you "${docTitle}" to sign`,
    text: `${greeting}\n\n${from} has sent you "${docTitle}" to review and sign electronically${asRole}.\n\nOpen and sign: ${signUrl}\n\nThis link is unique to you — please don't forward it.\n\nSent ${sentAt}`,
    html: `<p>${greeting}</p><p>${from} has sent you <strong>${docTitle}</strong> to review and sign electronically${asRole}.</p><p><a href="${signUrl}">Open and sign the document</a></p><p style="color:#666;font-size:13px">This link is unique to you — please don't forward it.</p><p style="color:#999;font-size:12px">Sent ${sentAt}</p>`,
  })
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

/** A plain, one-off share of one or more document copies as email attachments — distinct from
 *  sendSignatureRequestEmail, which links to a hosted signing page for a tracked request. Also
 *  what backs bulk "share" from the multiselect toolbar, so it always takes a list even when
 *  there's only one document, rather than having a separate single-doc code path to keep in sync. */
export async function sendDocumentEmail({
  to,
  recipientName,
  docTitles,
  senderCompanyName,
  message,
  attachments,
}: {
  to: string
  recipientName?: string
  docTitles: string[]
  senderCompanyName?: string
  message?: string
  attachments: { filename: string; content: string; contentType: string }[]
}) {
  const greeting = recipientName ? `Hi ${recipientName},` : "Hi,"
  const from = senderCompanyName ? senderCompanyName : "Someone"
  const noteText = message ? `\n\n${message}` : ""
  const noteHtml = message ? `<p>${escapeHtml(message)}</p>` : ""
  const plural = docTitles.length > 1

  const docDescription = plural ? `${docTitles.length} documents` : `"${docTitles[0]}"`
  const docDescriptionHtml = plural
    ? `<strong>${docTitles.length} documents</strong>: ${docTitles.map(escapeHtml).join(", ")}`
    : `<strong>${escapeHtml(docTitles[0])}</strong>`
  const subject = plural ? `${from} sent you ${docTitles.length} documents` : `${from} sent you ${docDescription}`
  const attachedText = plural ? "They're" : "It's"

  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject,
    text: `${greeting}\n\n${from} has sent you ${docDescription}. ${attachedText} attached to this email.${noteText}`,
    html: `<p>${greeting}</p><p>${from} has sent you ${docDescriptionHtml}. ${attachedText} attached to this email.</p>${noteHtml}`,
    attachments: attachments.map((a) => ({ filename: a.filename, content: a.content, contentType: a.contentType })),
  })
}
