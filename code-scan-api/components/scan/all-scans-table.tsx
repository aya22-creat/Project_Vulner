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
import { formatDistanceToNow, format } from "date-fns"
import { Code, GitBranch, ExternalLink, MoreHorizontal, Trash2, RefreshCw } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import type { ScanResponse } from "@/lib/api/types"

export function AllScansTable() {
  const { data: scans, isLoading, error, mutate } = useScans()
  const { statusFilter, vulnerabilityFilter } = useFilterStore()

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {[...Array(10)].map((_, i) => (
            <SkeletonTableRow key={i} />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 text-center space-y-4">
          <p className="text-muted-foreground">Failed to load scans. Please try again.</p>
          <Button variant="outline" onClick={() => mutate()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
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
            <TableHead className="text-muted-foreground">ID</TableHead>
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
            <AllScanRow key={scan.id} scan={scan} />
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

function AllScanRow({ scan }: { scan: ScanResponse }) {
  return (
    <TableRow className="border-border hover:bg-secondary/50">
      <TableCell className="font-mono text-xs text-muted-foreground">{scan.id.slice(0, 8)}...</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {scan.type === ScanType.Code ? (
            <Code className="h-4 w-4 text-primary" />
          ) : (
            <GitBranch className="h-4 w-4 text-primary" />
          )}
          <span className="text-sm font-medium">{scan.type === ScanType.Code ? "Code" : "Repo"}</span>
        </div>
      </TableCell>
      <TableCell className="max-w-[200px]">
        <span className="truncate block text-sm text-muted-foreground font-mono">
          {scan.type === ScanType.Code ? "Inline snippet" : scan.repoUrl || "N/A"}
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
      <TableCell className="text-sm text-muted-foreground" title={format(new Date(scan.createdAt), "PPpp")}>
        {formatDistanceToNow(new Date(scan.createdAt), { addSuffix: true })}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Link
            href={`/scan/${scan.id}`}
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View
            <ExternalLink className="h-3 w-3" />
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  )
}
