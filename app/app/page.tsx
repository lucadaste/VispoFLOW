import { IncorporationApp } from "@/components/incorporation-app"
import { AccountKindGate } from "@/components/account-kind-gate"
import { ClientContextBanner } from "@/components/client-context-banner"

export default function Page() {
  return (
    <AccountKindGate>
      <ClientContextBanner />
      <IncorporationApp />
    </AccountKindGate>
  )
}
