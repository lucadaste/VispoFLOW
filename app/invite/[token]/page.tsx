import { InviteClient } from "./invite-client"

export const metadata = { title: "Invitation — VispoFLOW" }

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <InviteClient token={token} />
    </div>
  )
}
