import dynamic from "next/dynamic"

const IncorporationApp = dynamic(
  () => import("@/components/incorporation-app").then((m) => ({ default: m.IncorporationApp })),
  { ssr: false },
)

export default function Page() {
  return <IncorporationApp />
}
