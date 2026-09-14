export const STORAGE_KEYS = {
  view: "vispo-view",
  incorporation: "vispo-incorporation-state",
  compliance: "vispo-compliance-state",
  transactions: "vispo-transactions-state",
  homeChat: "vispo-home-chat-state",
  library: "vispo-library-state",
  profile: "vispo-profile-state",
  /** "founder" | "firm" — which of the two account kinds this user chose (or was inferred into)
   *  the first time they landed in the app signed in. See components/account-kind-gate.tsx. */
  accountKind: "vispo-account-kind",
} as const
