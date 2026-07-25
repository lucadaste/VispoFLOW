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
  // Tracked as state (not a ref) so the "save" effect below only sees these flip to
  // true on a fresh render — a ref flipped inside the load effect would already read
  // as true by the time the save effect runs in that *same* commit, letting it fire
  // with the still-empty initial profile and wipe out whatever was actually saved.
  const [localLoaded, setLocalLoaded] = useState(false)
  const [serverLoaded, setServerLoaded] = useState(false)
  const startedRef = useRef(false)
  const syncedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    const saved = loadPersisted<UserProfile>(STORAGE_KEYS.profile)
    if (saved) setProfile({ ...emptyProfile, ...saved })
    setLocalLoaded(true)
  }, [])

  // Once signed in, the account's cloud copy (if any) takes over from the local one
  useEffect(() => {
    if (!isSignedIn || syncedRef.current) return
    syncedRef.current = true
    loadFromServer<UserProfile>(STORAGE_KEYS.profile).then((saved) => {
      if (saved) setProfile({ ...emptyProfile, ...saved })
      setServerLoaded(true)
    })
  }, [isSignedIn])

  useEffect(() => {
    if (!localLoaded) return
    savePersisted<UserProfile>(STORAGE_KEYS.profile, profile)
    // Wait for the account's cloud copy to load before writing back — otherwise signing
    // in on a device with no local profile would push an empty one and clobber real data.
    if (isSignedIn && serverLoaded) saveToServer(STORAGE_KEYS.profile, profile)
  }, [profile, isSignedIn, localLoaded, serverLoaded])

  return { profile, setProfile }
}
