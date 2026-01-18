"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Plus, Shield, Settings, FileCode } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "New Scan", href: "/scan/new", icon: Plus },
  { name: "All Scans", href: "/scans", icon: FileCode },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border">
      <div className="flex h-16 items-center gap-3 px-6 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Shield className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <span className="text-lg font-semibold text-sidebar-foreground">ProjectVuln</span>
          <p className="text-xs text-muted-foreground">AI Security Scanner</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>
    </aside>
  )
}
