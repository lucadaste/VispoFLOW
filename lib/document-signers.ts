import type { FlowAnswers } from "@/lib/flow"

/** The atomic "who still needs to sign this document" unit. A slot is "filled" once a
 *  DocSignature with a matching `slotId` exists for the document (see components/document-library.tsx). */
export type SignerSlot = {
  id: string
  label: string
  kind: "officer" | "named" | "generic"
  /** for "named": the exact printed name to match against, and to lock the recipient's name to */
  matchName?: string
  /** for "generic": the block header to locate (e.g. /^OPTIONEE:$/i) */
  headerPattern?: RegExp
  /** True for a counterparty whose identity comes from a Transaction Center document's own
   *  collected field values (e.g. a Founder Loan's Lender, a Service Provider) rather than the
   *  company's own roster in FlowAnswers (directors, founders, incorporator). The account holder
   *  self-signing a document only ever represents the company, so a slot like this — a genuinely
   *  separate outside party — must go through "Send to sign" and can never be self-signed;
   *  otherwise one person could sign as both the company and its counterparty on the same doc. */
  external?: boolean
}

const OFFICER_SLOT: SignerSlot = { id: "officer", label: "Company officer", kind: "officer" }

function founders(answers: FlowAnswers) {
  return answers.allocations.filter((alloc) => !alloc.isPool)
}

/** Returns the signer slots a given document instance requires, derived from its catalog id, the
 *  current (formation-flow) answers, and — for Transaction Center docs, whose counterparties come
 *  from that document's own collected field values rather than the global answers — those values.
 *  Everything not listed below gets the default single officer/self slot — the vast majority of
 *  documents only ever need the one signature they already support. */
export function getSignerSlots(docId: string, answers: FlowAnswers, values?: Record<string, string>): SignerSlot[] {
  switch (docId) {
    case "coi":
    case "action-incorporator":
      // Just a blank line followed directly by "${incorporatorName}, Incorporator" — no
      // "THE COMPANY:" execution block, so this needs a named slot rather than the officer default.
      return [{ id: "incorporator", label: "Incorporator", kind: "named", matchName: answers.incorporatorName }]

    case "founder-loan": {
      const slots: SignerSlot[] = [
        // This template calls its own execution block "BORROWER:" rather than "THE COMPANY:".
        { id: "officer", label: "Company officer", kind: "officer", headerPattern: /^BORROWER:$/i },
      ]
      if (values?.founderName) {
        slots.push({ id: "lender", label: `Lender: ${values.founderName}`, kind: "named", matchName: values.founderName, external: true })
      }
      return slots
    }

    case "services-agreement": {
      const slots: SignerSlot[] = [OFFICER_SLOT]
      if (values?.serviceProviderName) {
        slots.push({ id: "provider", label: `Service Provider: ${values.serviceProviderName}`, kind: "named", matchName: values.serviceProviderName, external: true })
      }
      return slots
    }

    case "promised-options-letter": {
      const slots: SignerSlot[] = [OFFICER_SLOT]
      if (values?.recipientName) {
        slots.push({ id: "recipient", label: `Recipient: ${values.recipientName}`, kind: "named", matchName: values.recipientName, external: true })
      }
      return slots
    }

    case "option-pool":
      return [OFFICER_SLOT, { id: "optionee", label: "Optionee", kind: "generic", headerPattern: /^OPTIONEE:$/i, external: true }]

    case "founder-rspa":
      return [
        OFFICER_SLOT,
        ...founders(answers).map(
          (f): SignerSlot => ({ id: `purchaser-${f.name}`, label: `Purchaser: ${f.name}`, kind: "named", matchName: f.name }),
        ),
      ]

    case "indemnification-agreement":
      return [
        OFFICER_SLOT,
        ...founders(answers).map(
          (f): SignerSlot => ({ id: `indemnitee-${f.name}`, label: `Indemnitee: ${f.name}`, kind: "named", matchName: f.name }),
        ),
      ]

    case "board-consent-option-pool":
    case "board-consent-founder-stock":
    case "org-resolutions":
      // A board written consent — every director signs their own line; there's no
      // "THE COMPANY:" execution block at all, so there's no officer slot.
      return answers.directors.map(
        (name): SignerSlot => ({ id: `director-${name}`, label: `Director: ${name}`, kind: "named", matchName: name }),
      )

    case "stockholders-consent-option-pool":
    case "stockholder-consent-indemnification":
      return founders(answers).map(
        (f): SignerSlot => ({ id: `stockholder-${f.name}`, label: `Stockholder: ${f.name}`, kind: "named", matchName: f.name }),
      )

    case "bylaws": {
      // Two fixed, distinct named signers — the Incorporator's adoption certificate and the
      // Secretary's certificate — neither is a "THE COMPANY:" block, so no officer slot here.
      const secretary = answers.officers.find((o) => o.title === "Secretary")?.name
      const slots: SignerSlot[] = [
        { id: "incorporator", label: "Incorporator", kind: "named", matchName: answers.incorporatorName },
      ]
      if (secretary) slots.push({ id: "secretary", label: "Secretary", kind: "named", matchName: secretary })
      return slots
    }

    default:
      return [OFFICER_SLOT]
  }
}
