"use client"

import { ComplianceView } from "@/components/compliance-view"
import { initialAnswers } from "@/lib/flow"

export default function TestCompliancePage() {
  return (
    <div className="flex h-screen w-screen">
      <ComplianceView answers={initialAnswers} />
    </div>
  )
}
