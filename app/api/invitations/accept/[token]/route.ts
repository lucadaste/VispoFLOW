import { auth, currentUser } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { acceptInvitation, getInvitationDetails } from "@/lib/invitations"
import { errorResponse } from "@/lib/api-errors"

/** GET — invite details for the accept screen. Public: works signed out (the screen then routes
 *  the visitor through sign-in before they can accept). */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params
    const details = await getInvitationDetails(token)
    const { userId } = await auth()
    const user = userId ? await currentUser() : null
    const signedInEmail =
      user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses[0]?.emailAddress ?? null

    return NextResponse.json({
      ...details,
      signedIn: !!userId,
      signedInEmail,
      emailMismatch: !!signedInEmail && signedInEmail.toLowerCase() !== details.email,
    })
  } catch (err) {
    return errorResponse(err)
  }
}

/** POST — accept as the signed-in user. */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Sign in to accept this invite" }, { status: 401 })

    const user = await currentUser()
    const email =
      user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses[0]?.emailAddress ?? ""

    const { token } = await params
    const result = await acceptInvitation(token, {
      userId,
      email,
      firstName: user?.firstName,
      lastName: user?.lastName,
      imageUrl: user?.imageUrl,
    })

    return NextResponse.json(result)
  } catch (err) {
    return errorResponse(err)
  }
}
