import type React from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Providers } from "@/components/providers"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="min-h-screen bg-background">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <main className="lg:pl-64">{children}</main>
      </div>
    </Providers>
  )
}
