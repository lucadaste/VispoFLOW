import type { FlowAnswers } from "@/lib/flow"

/** The atomic "who still needs to sign this document" unit. A slot is "filled" once a
 *  DocSignature with a matching `slotId` exists for the document (see components/document-library.tsx). */
export type SignerSlot = {
  id: string
  label: string
  kind: "officer" | "named" | "generic"
  /** The counterparty's name, already known from how this document was created (either printed on
   *  the page, for "named", or just collected as this document's own field, for an "officer"-kind
   *  external slot like a SAFE's Investor). When set, "Send to sign" locks the recipient's name to
   *  it instead of asking the sender to type one — the name that ends up on the signed document is
   *  always the one collected during intake, never a value the sender free-typed at send time.
   *  Left unset only when the identity genuinely isn't known yet (e.g. Option Pool's Optionee,
   *  resolved later by the Carta grant). */
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
          matchName: values.investorName,
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
          matchName: values.counterpartyName,
          headerPattern: /^COUNTERPARTY:$/i,
          external: true,
        })
      }
      return slots
    }

    case "ip-license": {
      // Both blocks are full By:/Name:/Title:/Notice Address:/Notice Email: execution blocks —
      // same shape as the company's own "THE COMPANY:" block elsewhere — so both are "officer"-kind
      // against their own headers rather than counterpartySlot()'s "named" routing. The source PDF's
      // headers are just the bracketed party names with no label ("[LICENSOR]"/"[LICENSEE]"); per the
      // no-header-in-source rule, real "LICENSOR:"/"LICENSEE:" labels were inserted at render time so
      // headerPattern has something reliable to match.
      const slots: SignerSlot[] = [{ id: "officer", label: "Company officer", kind: "officer", headerPattern: /^LICENSOR:$/i }]
      if (values?.licenseeName) {
        slots.push({
          id: "licensee",
          label: `Licensee: ${values.licenseeName}`,
          kind: "officer",
          matchName: values.licenseeName,
          headerPattern: /^LICENSEE:$/i,
          external: true,
        })
      }
      return slots
    }

    case "privacy-policy":
      // A unilateral, posted privacy notice — no signature page in the source template, same as
      // the User Agreement. Returning no slots hides the Sign/Send-to-sign controls.
      return []

    case "agent-marketing-agreement": {
      // Neither party's block in this template has a Title line (just By:/Name:/Date:), and
      // Agent's block prints no name in advance — so this is "officer"-kind against its own
      // "AGENT:" header, same idea as the NDA's COUNTERPARTY block.
      const slots: SignerSlot[] = [OFFICER_SLOT]
      if (values?.agentName) {
        slots.push({
          id: "agent",
          label: `Agent: ${values.agentName}`,
          kind: "officer",
          matchName: values.agentName,
          headerPattern: /^AGENT:$/i,
          external: true,
        })
      }
      return slots
    }

    case "saas-reseller-agreement": {
      // The Reseller's block is a full By:/Name:/Title:/Date: execution block, same shape as the
      // company's own — "officer"-kind against its own "RESELLER:" header.
      const slots: SignerSlot[] = [OFFICER_SLOT]
      if (values?.resellerName) {
        slots.push({
          id: "reseller",
          label: `Reseller: ${values.resellerName}`,
          kind: "officer",
          matchName: values.resellerName,
          headerPattern: /^RESELLER:$/i,
          external: true,
        })
      }
      return slots
    }

    case "distribution-agreement": {
      // The Distributor's block is a full By:/Name:/Title: execution block — "officer"-kind
      // against its own "DISTRIBUTOR:" header.
      const slots: SignerSlot[] = [OFFICER_SLOT]
      if (values?.distributorName) {
        slots.push({
          id: "distributor",
          label: `Distributor: ${values.distributorName}`,
          kind: "officer",
          matchName: values.distributorName,
          headerPattern: /^DISTRIBUTOR:$/i,
          external: true,
        })
      }
      return slots
    }

    case "founder-separation-agreement": {
      // This template calls its own execution block "COMPANY:" rather than "THE COMPANY:", and
      // the Founder's block is a bare blank line under a "FOUNDER:" header with no printed name —
      // normalized at render time to the standard blank-line -> (Signature) -> name shape, so this
      // is counterpartySlot()'s usual "named" routing.
      const slots: SignerSlot[] = [{ id: "officer", label: "Company officer", kind: "officer", headerPattern: /^COMPANY:$/i }]
      if (values?.departingFounder) {
        slots.push(counterpartySlot("founder", `Founder: ${values.departingFounder}`, values.departingFounder))
      }
      return slots
    }

    case "founders-reorganization-agreement": {
      // Same "COMPANY:" header quirk as the Separation Agreement, plus two counterparties instead
      // of one — both Founder 1 and Founder 2 sign under their own bare blank line.
      const slots: SignerSlot[] = [{ id: "officer", label: "Company officer", kind: "officer", headerPattern: /^COMPANY:$/i }]
      if (values?.founder1Name) {
        slots.push(counterpartySlot("founder1", `Founder 1: ${values.founder1Name}`, values.founder1Name))
      }
      if (values?.founder2Name) {
        slots.push(counterpartySlot("founder2", `Founder 2: ${values.founder2Name}`, values.founder2Name))
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
    case "board-consent-dissolution":
      // A board written consent — every director signs their own line; there's no
      // "THE COMPANY:" execution block at all, so there's no officer slot.
      return answers.directors.map(
        (name): SignerSlot => ({ id: `director-${name}`, label: `Director: ${name}`, kind: "named", matchName: name }),
      )

    case "majority-stockholders-consent-dissolution": {
      // Unlike the option-pool/indemnification stockholder consents, this doc's signers aren't
      // drawn from the company's own cap-table roster (answers.allocations only reflects the
      // formation-time cap table, not a later round or share transfers) — they're collected fresh
      // as this document's own fields, so per the file-level rule this must go through
      // counterpartySlot() rather than a bare "named" slot literal.
      const slots: SignerSlot[] = []
      if (values?.stockholder1Name) slots.push(counterpartySlot("stockholder1", `Stockholder: ${values.stockholder1Name}`, values.stockholder1Name))
      if (values?.stockholder2Name) slots.push(counterpartySlot("stockholder2", `Stockholder: ${values.stockholder2Name}`, values.stockholder2Name))
      return slots
    }

    case "certificate-of-dissolution": {
      // Only the CEO signs — the directors/officers listed in the document body (collected as this
      // doc's own free-text fields, see certificateOfDissolution's doc comment in
      // lib/transaction-templates.ts) aren't co-signers, so there's no counterparty slot for them.
      // The CEO is drawn from the company's own roster (like Bylaws' Incorporator/Secretary), not
      // this document's own `values`, so this is a plain self-signable "named" slot rather than
      // counterpartySlot()'s external routing.
      const ceo = answers.officers.find((o) => o.title === "CEO")?.name
      return ceo ? [{ id: "ceo", label: "CEO", kind: "named", matchName: ceo }] : []
    }

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
