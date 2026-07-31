import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { infoRequests } from "@/lib/db-schema"
import { ProvideInfoClient } from "./provide-info-client"

export default async function ProvideInfoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const [row] = await db.select().from(infoRequests).where(eq(infoRequests.token, token)).limit(1)

  if (!row) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">This link is invalid or has expired.</p>
      </div>
    )
  }

  if (row.status === "sent") {
    await db.update(infoRequests).set({ status: "viewed" }).where(eq(infoRequests.token, token))
  }

  return (
    <ProvideInfoClient
      token={token}
      docTitle={row.docTitle}
      fieldLabel={row.fieldLabel}
      recipientName={row.recipientName}
      alreadySubmitted={row.status === "fulfilled"}
    />
  )
}
