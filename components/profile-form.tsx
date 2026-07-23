"use client"

import { useState } from "react"
import type { UserProfile } from "@/lib/profile"
import { SignaturePad } from "@/components/signature-pad"

const fieldClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/20"
const labelClass = "mb-1 block text-xs font-medium text-muted-foreground"

/** The company-info + signature form, reused by the Settings modal and the "Manage account" tab. */
export function ProfileForm({
  profile,
  onSave,
  onCancel,
  saveLabel = "Save profile",
}: {
  profile: UserProfile
  onSave: (profile: UserProfile) => void
  onCancel?: () => void
  saveLabel?: string
}) {
  const [form, setForm] = useState<UserProfile>(profile)

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Company legal name</label>
        <input
          value={form.companyName}
          onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
          placeholder="e.g. Acme Technologies, Inc."
          className={fieldClass}
        />
      </div>

      <div>
        <label className={labelClass}>Company address</label>
        <textarea
          value={form.companyAddress}
          onChange={(e) => setForm((f) => ({ ...f, companyAddress: e.target.value }))}
          rows={2}
          placeholder="Street, City, State, ZIP"
          className={`${fieldClass} resize-none`}
        />
      </div>

      <div>
        <label className={labelClass}>Your personal / mailing address</label>
        <textarea
          value={form.personalAddress}
          onChange={(e) => setForm((f) => ({ ...f, personalAddress: e.target.value }))}
          rows={2}
          placeholder="Street, City, State, ZIP"
          className={`${fieldClass} resize-none`}
        />
      </div>

      <div>
        <label className={labelClass}>Your full legal name</label>
        <input
          value={form.signerName}
          onChange={(e) => setForm((f) => ({ ...f, signerName: e.target.value }))}
          placeholder="e.g. Jane Founder"
          className={fieldClass}
        />
      </div>

      <div>
        <label className={labelClass}>Your signature</label>
        {form.signatureDataUrl ? (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-white px-3 py-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.signatureDataUrl} alt="Your signature" className="h-12 flex-1 object-contain object-left" />
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, signatureDataUrl: null, signatureMethod: null }))}
              className="shrink-0 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Redo
            </button>
          </div>
        ) : (
          <SignaturePad
            defaultName={form.signerName}
            onCapture={(dataUrl, method, name) =>
              setForm((f) => ({ ...f, signatureDataUrl: dataUrl, signatureMethod: method, signerName: name }))
            }
          />
        )}
      </div>

      <label className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3.5 py-3">
        <span>
          <span className="block text-sm font-medium text-foreground">Autofill my info into documents</span>
          <span className="block text-xs text-muted-foreground">
            Applies wherever a document asks for these fields — you can still edit any value.
          </span>
        </span>
        <input
          type="checkbox"
          checked={form.autofillEnabled}
          onChange={(e) => setForm((f) => ({ ...f, autofillEnabled: e.target.checked }))}
          className="h-4 w-4 shrink-0 accent-primary"
        />
      </label>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            onClick={onCancel}
            className="rounded-lg border border-border bg-background px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Cancel
          </button>
        )}
        <button
          onClick={() => onSave(form)}
          className="rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          {saveLabel}
        </button>
      </div>
    </div>
  )
}
