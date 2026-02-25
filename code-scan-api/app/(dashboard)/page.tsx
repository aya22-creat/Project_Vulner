import { Header } from "@/components/layout/header"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentScans } from "@/components/dashboard/recent-scans"
import { ScanFilters } from "@/components/dashboard/scan-filters"

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <Header title="Dashboard" description="Overview of your vulnerability scans" />
      <div className="p-6 space-y-6">
        <DashboardStats />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent Scans</h2>
            <ScanFilters />
          </div>
          <RecentScans />
        </div>
      </div>
    </div>
  )
}
