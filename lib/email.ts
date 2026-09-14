import { Resend } from "resend"

/** Sender address. Until a domain is verified in Resend, the default sandbox sender only delivers
 *  to the Resend account's own email — set `RESEND_FROM_ADDRESS` (e.g. "VispoFLOW
 *  <notifications@yourdomain.com>") once the GoDaddy domain is verified and every flow here starts
 *  delivering to outside recipients. */
const FROM_ADDRESS = process.env.RESEND_FROM_ADDRESS || "VispoFLOW <onboarding@resend.dev>"

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

/** Invites a third party (not the document owner) to submit one sensitive value directly —
 *  e.g. a co-founder's own SSN/ITIN for a filing the account holder started. The value is never
 *  included in this email; it's only ever entered on the linked page. See app/provide-info/[token]. */
export async function sendInfoRequestEmail({
  to,
  recipientName,
  fieldLabel,
  docTitle,
  senderCompanyName,
  infoUrl,
}: {
  to: string
  recipientName?: string
  fieldLabel: string
  docTitle: string
  senderCompanyName?: string
  infoUrl: string
}) {
  const greeting = recipientName ? `Hi ${recipientName},` : "Hi,"
  const from = senderCompanyName ? senderCompanyName : "Someone"
  const sentAt = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  })

  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `${from} needs your ${fieldLabel} for "${docTitle}"`,
    text: `${greeting}\n\n${from} is completing "${docTitle}" and needs your ${fieldLabel}. For your privacy, please enter it directly here — it's never shared with ${from} or stored in their chat:\n\n${infoUrl}\n\nThis link is unique to you — please don't forward it.\n\nSent ${sentAt}`,
    html: `<p>${greeting}</p><p>${from} is completing <strong>${docTitle}</strong> and needs your ${escapeHtml(fieldLabel)}. For your privacy, please enter it directly here — it's never shared with ${escapeHtml(from)} or stored in their chat.</p><p><a href="${infoUrl}">Enter your ${escapeHtml(fieldLabel)}</a></p><p style="color:#666;font-size:13px">This link is unique to you — please don't forward it.</p><p style="color:#999;font-size:12px">Sent ${sentAt}</p>`,
  })
}

/** A collaborator viewing a filing hit "Request" on a masked field (e.g. the SSN) — this just
 *  nudges the owner by email; it doesn't move any value automatically. The owner shares it
 *  through whatever channel they choose (e.g. reading it out, or the existing info-request link
 *  for a third party's own number). */
export async function sendSensitiveRequestNudgeEmail({
  to,
  ownerName,
  requesterName,
  docTitle,
  fieldLabels,
  appUrl,
}: {
  to: string
  ownerName?: string
  requesterName: string
  docTitle: string
  fieldLabels: string[]
  appUrl: string
}) {
  const greeting = ownerName ? `Hi ${ownerName},` : "Hi,"
  const fields = fieldLabels.join(", ")
  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `${requesterName} asked about a hidden field on "${docTitle}"`,
    text: `${greeting}\n\n${requesterName} is viewing "${docTitle}" and asked whether you could share: ${fields}. They can't see this value — VispoFLOW never shows it to anyone but you.\n\nOpen your document: ${appUrl}`,
    html: `<p>${greeting}</p><p>${escapeHtml(requesterName)} is viewing <strong>${escapeHtml(docTitle)}</strong> and asked whether you could share: ${escapeHtml(fields)}. They can't see this value — VispoFLOW never shows it to anyone but you.</p><p><a href="${appUrl}">Open your document</a></p>`,
  })
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

/** Invites someone to collaborate on a single filing, or to join a firm/account workspace. The
 *  accept link carries a one-time token (see lib/invitations.ts); it's also shown as a copy-able
 *  link in the app, so an invite still works before a sending domain is verified. */
export async function sendInvitationEmail({
  to,
  inviterName,
  target,
  subjectTitle,
  role,
  acceptUrl,
  expiresAt,
}: {
  to: string
  inviterName: string
  target: "document" | "account"
  subjectTitle: string
  role: string
  acceptUrl: string
  expiresAt: Date
}) {
  const what =
    target === "document"
      ? `collaborate on "${subjectTitle}"`
      : `join the ${subjectTitle} workspace`
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1)
  const expires = expiresAt.toLocaleDateString("en-US", { dateStyle: "long" })
  const sentAt = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })

  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `${inviterName} invited you to ${target === "document" ? `"${subjectTitle}"` : subjectTitle}`,
    text: `${inviterName} has invited you to ${what} on VispoFLOW as ${roleLabel}.\n\nAccept the invite: ${acceptUrl}\n\nThis link is unique to you — please don't forward it. It expires on ${expires}.\n\nSent ${sentAt}`,
    html: `<p>${escapeHtml(inviterName)} has invited you to ${escapeHtml(what)} on VispoFLOW as <strong>${escapeHtml(roleLabel)}</strong>.</p><p><a href="${acceptUrl}">Accept the invite</a></p><p style="color:#666;font-size:13px">This link is unique to you — please don't forward it. It expires on ${expires}.</p><p style="color:#999;font-size:12px">Sent ${sentAt}</p>`,
  })
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
