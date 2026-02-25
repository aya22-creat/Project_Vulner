"use client"

import Link from "next/link"
import { useScans } from "@/lib/hooks/use-scans"
import { useFilterStore } from "@/lib/store"
import { ScanStatus, ScanType } from "@/lib/api/types"
import { StatusBadge } from "@/components/ui/status-badge"
import { VulnerabilityBadge } from "@/components/ui/vulnerability-badge"
import { SkeletonTableRow } from "@/components/ui/skeleton-card"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDistanceToNow } from "date-fns"
import { Code, GitBranch, ExternalLink } from "lucide-react"
import type { ScanResponse } from "@/lib/api/types"

export function RecentScans() {
  const { data: scans, isLoading, error } = useScans()
  const { statusFilter, vulnerabilityFilter } = useFilterStore()

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {[...Array(5)].map((_, i) => (
            <SkeletonTableRow key={i} />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Failed to load scans. Please try again.</p>
        </CardContent>
      </Card>
    )
  }

  const filteredScans = scans?.filter((scan) => {
    if (statusFilter && statusFilter !== "all") {
      const statusMap: Record<string, ScanStatus> = {
        pending: ScanStatus.Pending,
        running: ScanStatus.Running,
        completed: ScanStatus.Completed,
        failed: ScanStatus.Failed,
      }
      if (scan.status !== statusMap[statusFilter]) return false
    }

    if (vulnerabilityFilter && vulnerabilityFilter !== "all") {
      if (vulnerabilityFilter === "vulnerable" && scan.hasVulnerabilities !== true) return false
      if (vulnerabilityFilter === "safe" && scan.hasVulnerabilities !== false) return false
      if (vulnerabilityFilter === "pending" && scan.hasVulnerabilities !== null) return false
    }

    return true
  })

  if (!filteredScans?.length) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No scans found matching your filters.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground">Type</TableHead>
            <TableHead className="text-muted-foreground">Source</TableHead>
            <TableHead className="text-muted-foreground">Status</TableHead>
            <TableHead className="text-muted-foreground">Result</TableHead>
            <TableHead className="text-muted-foreground">Confidence</TableHead>
            <TableHead className="text-muted-foreground">Created</TableHead>
            <TableHead className="text-muted-foreground sr-only">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredScans.map((scan) => (
            <ScanRow key={scan.id} scan={scan} />
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

function ScanRow({ scan }: { scan: ScanResponse }) {
  return (
    <TableRow className="border-border hover:bg-secondary/50">
      <TableCell>
        <div className="flex items-center gap-2">
          {scan.type === ScanType.Code ? (
            <Code className="h-4 w-4 text-primary" />
          ) : (
            <GitBranch className="h-4 w-4 text-primary" />
          )}
          <span className="text-sm font-medium">{scan.type === ScanType.Code ? "Code" : "Repository"}</span>
        </div>
      </TableCell>
      <TableCell className="max-w-[200px]">
        <span className="truncate block text-sm text-muted-foreground font-mono">
          {scan.type === ScanType.Code ? "Inline code snippet" : scan.repoUrl || "N/A"}
        </span>
      </TableCell>
      <TableCell>
        <StatusBadge status={scan.status} />
      </TableCell>
      <TableCell>
        <VulnerabilityBadge hasVulnerabilities={scan.hasVulnerabilities} />
      </TableCell>
      <TableCell>
        {scan.confidenceScore !== null && scan.confidenceScore !== undefined ? (
          <span className="text-sm font-medium">{(scan.confidenceScore * 100).toFixed(0)}%</span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatDistanceToNow(new Date(scan.createdAt), { addSuffix: true })}
      </TableCell>
      <TableCell>
        <Link href={`/scan/${scan.id}`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
          View
          <ExternalLink className="h-3 w-3" />
        </Link>
      </TableCell>
    </TableRow>
  )
}
