"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDashboardStats } from "@/lib/hooks/use-scans"
import { SkeletonCard } from "@/components/ui/skeleton-card"
import { FileCode, ShieldAlert, ShieldCheck, Clock } from "lucide-react"

export function DashboardStats() {
  const { data: stats, isLoading, error } = useDashboardStats()

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Scans" value={0} icon={FileCode} description="All scans" />
        <StatsCard title="Vulnerable" value={0} icon={ShieldAlert} description="Issues found" variant="destructive" />
        <StatsCard title="Safe" value={0} icon={ShieldCheck} description="No issues" variant="success" />
        <StatsCard title="Pending" value={0} icon={Clock} description="In progress" variant="warning" />
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard title="Total Scans" value={stats?.totalScans || 0} icon={FileCode} description="All scans" />
      <StatsCard
        title="Vulnerable"
        value={stats?.vulnerableScans || 0}
        icon={ShieldAlert}
        description="Issues found"
        variant="destructive"
      />
      <StatsCard
        title="Safe"
        value={stats?.safeScans || 0}
        icon={ShieldCheck}
        description="No issues"
        variant="success"
      />
      <StatsCard
        title="Pending"
        value={stats?.pendingScans || 0}
        icon={Clock}
        description="In progress"
        variant="warning"
      />
    </div>
  )
}

interface StatsCardProps {
  title: string
  value: number
  icon: React.ElementType
  description: string
  variant?: "default" | "destructive" | "success" | "warning"
}

function StatsCard({ title, value, icon: Icon, description, variant = "default" }: StatsCardProps) {
  const iconClasses = {
    default: "text-primary",
    destructive: "text-destructive",
    success: "text-success",
    warning: "text-warning",
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconClasses[variant]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
