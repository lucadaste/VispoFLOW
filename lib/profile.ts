import type { FlowAnswers } from "@/lib/flow"

/** Titles a signer can hold — used to pick which signature line/block in a document is theirs. */
export const COMPANY_ROLES = [
  "Incorporator",
  "Director",
  "President",
  "CEO",
  "Secretary",
  "Treasurer / CFO",
  "Manager",
  "Member",
  "Stockholder",
  "Sole Proprietor",
] as const

export type UserProfile = {
  companyName: string
  /** the corporation's principal address */
  companyAddress: string
  /** the signer's own mailing address (used as the incorporator's address) */
  personalAddress: string
  /** full legal name, used both for the signature block text and as the incorporator's name */
  signerName: string
  /** titles held at the company, used to route the signature onto the matching line in each document */
  roles: string[]
  signatureMethod: "typed" | "drawn" | null
  /** PNG data URL — typed signatures are rasterized too, so every consumer only ever deals with one image format */
  signatureDataUrl: string | null
  autofillEnabled: boolean
}

export const emptyProfile: UserProfile = {
  companyName: "",
  companyAddress: "",
  personalAddress: "",
  signerName: "",
  roles: [],
  signatureMethod: null,
  signatureDataUrl: null,
  autofillEnabled: true,
}

export function isProfileEmpty(profile: UserProfile): boolean {
  return (
    !profile.companyName &&
    !profile.companyAddress &&
    !profile.personalAddress &&
    !profile.signerName &&
    !profile.signatureDataUrl
  )
}

/** Maps a saved profile role to the officer title it fills in — only roles this app actually asks about. */
const ROLE_TO_OFFICER_TITLE: Partial<Record<string, string>> = {
  CEO: "CEO",
  "Treasurer / CFO": "CFO",
  Secretary: "Secretary",
}

/**
 * Fills empty FlowAnswers fields from the saved profile. Never overwrites something
 * the user already typed, so toggling autofill off reverts cleanly to `answers` as-is.
 */
export function mergeProfileIntoAnswers(answers: FlowAnswers, profile: UserProfile): FlowAnswers {
  // Only prefill officer titles the signer told us (via their profile roles) they actually
  // hold — never guess a title from unrelated data like director order.
  const profileOfficers = profile.roles
    .map((role) => ROLE_TO_OFFICER_TITLE[role])
    .filter((title): title is string => !!title)
    .map((title) => ({ title, name: profile.signerName }))

  return {
    ...answers,
    companyName: answers.companyName || profile.companyName,
    incorporatorName: answers.incorporatorName || profile.signerName,
    incorporatorAddress: answers.incorporatorAddress || profile.personalAddress,
    corpAddress: answers.corpAddress || profile.companyAddress,
    officers: answers.officers.length ? answers.officers : profileOfficers,
  }
}
