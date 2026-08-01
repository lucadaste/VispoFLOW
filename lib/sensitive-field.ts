/** The in-document placeholder a `sensitive` compliance field (e.g. an SSN/ITIN) is replaced with
 *  once it leaves the session that collected it — see lib/flow.ts's `ComplianceField.sensitive`
 *  and components/document-library.tsx's `redactSensitiveDocValues`, the single source of truth
 *  for when this gets substituted in. Kept in its own module (rather than only exported from
 *  document-library.tsx, a "use client" component) so lib/ein-document.ts can recognize it too,
 *  without a circular import back into the component that already imports from ein-document.ts. */
export const SENSITIVE_FIELD_PLACEHOLDER = "(not saved — reopen this filing to re-enter)"
