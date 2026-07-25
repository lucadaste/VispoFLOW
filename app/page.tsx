import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { MarketingPage } from "@/components/marketing/marketing-page"

export const dynamic = "force-dynamic"

export default async function Page() {
  const { userId } = await auth()
  if (userId) redirect("/app")

  return <MarketingPage />
}
