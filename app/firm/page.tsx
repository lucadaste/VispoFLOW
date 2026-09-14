import { FirmDashboard } from "@/components/firm-dashboard"
import { FirmKindGate } from "@/components/firm-kind-gate"

export const metadata = { title: "Firm Dashboard — VispoFLOW" }

export default function FirmPage() {
  return (
    <FirmKindGate>
      <FirmDashboard />
    </FirmKindGate>
  )
}
