import { IncorporationApp } from "@/components/incorporation-app"
import { AccountKindGate } from "@/components/account-kind-gate"
import { ClientContextBanner } from "@/components/client-context-banner"

export default async function Page({ searchParams }: { searchParams: Promise<{ open?: string }> }) {
  const { open } = await searchParams
  return (
    <AccountKindGate>
      <ClientContextBanner />
      <IncorporationApp initialComplianceItemId={open || null} />
    </AccountKindGate>
  )
}
