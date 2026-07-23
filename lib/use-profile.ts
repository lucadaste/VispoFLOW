"use client"

import { useEffect, useRef, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { loadPersisted, savePersisted, loadFromServer, saveToServer } from "@/lib/persist"
import { STORAGE_KEYS } from "@/lib/storage-keys"
import { emptyProfile, type UserProfile } from "@/lib/profile"

/** Reusable account profile (company info + saved signature), synced the same way as the rest of the app's state. */
export function useProfile() {
  const { isSignedIn } = useUser()
  const [profile, setProfile] = useState<UserProfile>(emptyProfile)
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    const saved = loadPersisted<UserProfile>(STORAGE_KEYS.profile)
    if (saved) setProfile(saved)
  }, [])

  // Once signed in, the account's cloud copy (if any) takes over from the local one
  const syncedRef = useRef(false)
  useEffect(() => {
    if (!isSignedIn || syncedRef.current) return
    syncedRef.current = true
    loadFromServer<UserProfile>(STORAGE_KEYS.profile).then((saved) => {
      if (saved) setProfile(saved)
    })
  }, [isSignedIn])

  useEffect(() => {
    if (!startedRef.current) return
    savePersisted<UserProfile>(STORAGE_KEYS.profile, profile)
    if (isSignedIn) saveToServer(STORAGE_KEYS.profile, profile)
  }, [profile, isSignedIn])

  return { profile, setProfile }
}
