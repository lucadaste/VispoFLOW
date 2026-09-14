import { IncorporationApp } from "@/components/incorporation-app"
import { AccountKindGate } from "@/components/account-kind-gate"

export default function Page() {
  return (
    <AccountKindGate>
      <IncorporationApp />
    </AccountKindGate>
  )
}
