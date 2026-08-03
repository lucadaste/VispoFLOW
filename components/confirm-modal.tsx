"use client"

/** Shared "are you sure?" dialog: Cancel plus a single confirming action. */
export function ConfirmModal({
  title, description, confirmLabel = "Confirm", danger = false, onConfirm, onCancel,
}: {
  title: string
  description: string
  confirmLabel?: string
  /** Use for irreversible/destructive actions (deleting, abandoning progress) to visually signal the stakes. */
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-xl">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-border bg-background px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={
              danger
                ? "rounded-lg border border-destructive/50 bg-destructive/10 px-3.5 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20"
                : "rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
