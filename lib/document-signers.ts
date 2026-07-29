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

/** Builds the slot for a Transaction Center document's own counterparty — a party identified by
 *  that *document's* collected `values` (a loan's Lender, a Service Provider, an options
 *  Recipient), as opposed to someone drawn from the company's own roster in `answers` (directors,
 *  founders, incorporator). Always `external: true` by construction: this is a real outside party,
 *  never the account holder, so it must go through "Send to sign" rather than self-sign. Use this
 *  helper (not a hand-written slot literal) for every future transaction-doc counterparty, so
 *  `external` can never be forgotten — see the `SignerSlot.external` doc comment for why it matters. */
function counterpartySlot(id: string, label: string, matchName: string, headerPattern?: RegExp): SignerSlot {
  return { id, label, kind: "named", matchName, external: true, headerPattern }
}

/** Returns the signer slots a given document instance requires, derived from its catalog id, the
 *  current (formation-flow) answers, and — for Transaction Center docs, whose counterparties come
 *  from that document's own collected field values rather than the global answers — those values.
 *  Everything not listed below gets the default single officer/self slot — the vast majority of
 *  documents only ever need the one signature they already support.
 *
 *  IMPORTANT for future cases: any slot built from `values` (a Transaction Center document's own
 *  counterparty) rather than `answers` (the company's roster) MUST be built with `counterpartySlot()`
 *  (or otherwise set `external: true` explicitly) — see the `SignerSlot.external` doc comment.
 *  Getting this wrong lets the account holder self-sign as both the company and its counterparty
 *  on the same document, which is exactly the bug this field exists to prevent. */
export function getSignerSlots(docId: string, answers: FlowAnswers, values?: Record<string, string>): SignerSlot[] {
  switch (docId) {
    case "coi":
    case "action-incorporator":
      // Just a blank line followed directly by "${incorporatorName}, Incorporator" — no
      // "THE COMPANY:" execution block, so this needs a named slot rather than the officer default.
      return [{ id: "incorporator", label: "Incorporator", kind: "named", matchName: answers.incorporatorName }]

    case "safe-cap":
    case "safe-mfn":
    case "safe-discount":
    case "pro-rata-side-letter": {
      // The Investor's block, like the NDA's COUNTERPARTY block, is a full By:/Name:/Title:
      // execution block rather than a bare signature line under an already-printed name — so
      // this is "officer"-kind against its own "INVESTOR:" header, not counterpartySlot()'s
      // "named" routing.
      const slots: SignerSlot[] = [OFFICER_SLOT]
      if (values?.investorName) {
        slots.push({
          id: "investor",
          label: `Investor: ${values.investorName}`,
          kind: "officer",
          headerPattern: /^INVESTOR:$/i,
          external: true,
        })
      }
      return slots
    }

    case "founder-loan": {
      const slots: SignerSlot[] = [
        // This template calls its own execution block "BORROWER:" rather than "THE COMPANY:".
        { id: "officer", label: "Company officer", kind: "officer", headerPattern: /^BORROWER:$/i },
      ]
      if (values?.founderName) {
        slots.push(counterpartySlot("lender", `Lender: ${values.founderName}`, values.founderName))
      }
      return slots
    }

    case "services-agreement": {
      const slots: SignerSlot[] = [OFFICER_SLOT]
      if (values?.serviceProviderName) {
        slots.push(counterpartySlot("provider", `Service Provider: ${values.serviceProviderName}`, values.serviceProviderName))
      }
      return slots
    }

    case "promised-options-letter": {
      const slots: SignerSlot[] = [OFFICER_SLOT]
      if (values?.recipientName) {
        slots.push(counterpartySlot("recipient", `Recipient: ${values.recipientName}`, values.recipientName))
      }
      return slots
    }

    case "advisor-agreement": {
      const slots: SignerSlot[] = [OFFICER_SLOT]
      if (values?.advisorName) {
        slots.push(counterpartySlot("advisor", `Advisor: ${values.advisorName}`, values.advisorName))
      }
      return slots
    }

    case "consulting-agreement": {
      const slots: SignerSlot[] = [OFFICER_SLOT]
      if (values?.consultantName) {
        slots.push(counterpartySlot("consultant", `Consultant: ${values.consultantName}`, values.consultantName))
      }
      return slots
    }

    case "offer-letter": {
      const slots: SignerSlot[] = [OFFICER_SLOT]
      if (values?.employeeName) {
        slots.push(counterpartySlot("employee", `Employee: ${values.employeeName}`, values.employeeName))
      }
      return slots
    }

    case "nda": {
      const slots: SignerSlot[] = [OFFICER_SLOT]
      if (values?.counterpartyName) {
        // Unlike every other Transaction Center counterparty, the NDA's "COUNTERPARTY:" block is
        // a full By:/Name:/Title: execution block — the same shape as the company's own — rather
        // than a bare signature line under an already-printed name. counterpartySlot()'s "named"
        // routing (blank line, then the printed name) doesn't match that shape, so this is built as
        // an "officer"-kind slot pointed at its own header instead, same idea as Option Pool's
        // generic Optionee slot: an external party without a name lock, because the block structure
        // — not the identity — is what determines routing here.
        slots.push({
          id: "counterparty",
          label: `Counterparty: ${values.counterpartyName}`,
          kind: "officer",
          headerPattern: /^COUNTERPARTY:$/i,
          external: true,
        })
      }
      return slots
    }

    case "pilot-agreement": {
      // Unlike the SAFE Investor/NDA Counterparty blocks (officer-kind, left blank until signed),
      // the pilot's Customer signer name and title are collected up front as their own fields, so
      // this follows the more common counterpartySlot() "named" routing (Service Provider, Founder
      // Loan's Lender, etc.) — the printed name/title sit right under the blank signature line.
      const slots: SignerSlot[] = [OFFICER_SLOT]
      if (values?.customerSignerName) {
        slots.push(counterpartySlot("customer", `Customer: ${values.customerSignerName}`, values.customerSignerName))
      }
      return slots
    }

    case "option-pool":
      // Optionee's identity isn't known until the Carta grant, so this is "generic" rather than
      // "named" (no matchName to lock to) — external for the same reason as counterpartySlot()
      // above: a real outside party, never the account holder, so no self-sign.
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

    case "user-agreement":
      // The source template has no signature page at all — it's a clickwrap-style "by using the
      // Service you agree to these terms" agreement, not a bilaterally executed contract. Returning
      // no slots (rather than falling through to the default officer slot) is what hides the
      // Sign/Send-to-sign controls in the Document Library UI for this doc: both availableSlotsFor
      // and selfSignableSlotsFor derive straight from this list, and docStatusText only shows a
      // signature-related status when there's at least one slot to report on.
      return []

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
