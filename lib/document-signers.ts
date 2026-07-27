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
}

const OFFICER_SLOT: SignerSlot = { id: "officer", label: "Company officer", kind: "officer" }

function founders(answers: FlowAnswers) {
  return answers.allocations.filter((alloc) => !alloc.isPool)
}

/** Returns the signer slots a given document instance requires, derived from its catalog id and
 *  the current answers. Everything not listed below gets the default single officer/self slot —
 *  the vast majority of documents only ever need the one signature they already support. */
export function getSignerSlots(docId: string, answers: FlowAnswers): SignerSlot[] {
  switch (docId) {
    case "option-pool":
      return [OFFICER_SLOT, { id: "optionee", label: "Optionee", kind: "generic", headerPattern: /^OPTIONEE:$/i }]

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
