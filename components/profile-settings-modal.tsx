"use client"

import { X } from "lucide-react"
import type { UserProfile } from "@/lib/profile"
import { ProfileForm } from "@/components/profile-form"

export function ProfileSettingsModal({
  profile,
  onSave,
  onClose,
}: {
  profile: UserProfile
  onSave: (profile: UserProfile) => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col rounded-xl border border-border bg-card shadow-xl">
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">Your profile</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Save this once and reuse it across every document flow.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <ProfileForm
            profile={profile}
            onSave={(p) => { onSave(p); onClose() }}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  )
}
