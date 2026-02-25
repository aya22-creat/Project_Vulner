import { Header } from "@/components/layout/header"
import { NewScanForm } from "@/components/scan/new-scan-form"

export default function NewScanPage() {
  return (
    <div className="min-h-screen">
      <Header title="New Scan" description="Create a new vulnerability scan" />
      <div className="p-6 max-w-3xl">
        <NewScanForm />
      </div>
    </div>
  )
}
