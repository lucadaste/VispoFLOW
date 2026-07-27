import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { signatureRequests } from "@/lib/db-schema"
import { SignRequestClient } from "./sign-request-client"

export default async function SignPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const [row] = await db.select().from(signatureRequests).where(eq(signatureRequests.token, token)).limit(1)

  if (!row) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">This signing link is invalid or has expired.</p>
      </div>
    )
  }

  return (
    <SignRequestClient
      token={token}
      docTitle={row.docTitle}
      docContent={row.docContent}
      recipientName={row.recipientName}
      slotLabel={row.slotLabel}
      lockedName={row.lockedName}
      alreadySigned={row.status === "signed"}
      signerName={row.signerName}
      signedAt={row.signedAt ? row.signedAt.toISOString() : null}
    />
  )
}
