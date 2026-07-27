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

  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `${from} sent you "${docTitle}" to sign`,
    text: `${greeting}\n\n${from} has sent you "${docTitle}" to review and sign electronically${asRole}.\n\nOpen and sign: ${signUrl}\n\nThis link is unique to you — please don't forward it.`,
    html: `<p>${greeting}</p><p>${from} has sent you <strong>${docTitle}</strong> to review and sign electronically${asRole}.</p><p><a href="${signUrl}">Open and sign the document</a></p><p style="color:#666;font-size:13px">This link is unique to you — please don't forward it.</p>`,
  })
}
