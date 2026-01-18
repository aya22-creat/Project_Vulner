import { Header } from "@/components/layout/header"
import { ScanDetails } from "@/components/scan/scan-details"

export default async function ScanDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div className="min-h-screen">
      <Header title="Scan Details" description="View scan progress and results" />
      <div className="p-6">
        <ScanDetails scanId={id} />
      </div>
    </div>
  )
}
