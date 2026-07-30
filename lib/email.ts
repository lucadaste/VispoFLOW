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

/** A plain, one-off share of a document copy as an email attachment — distinct from
 *  sendSignatureRequestEmail, which links to a hosted signing page for a tracked request. */
export async function sendDocumentEmail({
  to,
  recipientName,
  docTitle,
  senderCompanyName,
  message,
  attachment,
}: {
  to: string
  recipientName?: string
  docTitle: string
  senderCompanyName?: string
  message?: string
  attachment: { filename: string; content: string; contentType: string }
}) {
  const greeting = recipientName ? `Hi ${recipientName},` : "Hi,"
  const from = senderCompanyName ? senderCompanyName : "Someone"
  const noteText = message ? `\n\n${message}` : ""
  const noteHtml = message ? `<p>${escapeHtml(message)}</p>` : ""

  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `${from} sent you "${docTitle}"`,
    text: `${greeting}\n\n${from} has sent you "${docTitle}". It's attached to this email.${noteText}`,
    html: `<p>${greeting}</p><p>${from} has sent you <strong>${docTitle}</strong>. It's attached to this email.</p>${noteHtml}`,
    attachments: [{ filename: attachment.filename, content: attachment.content, contentType: attachment.contentType }],
  })
}
