"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useFilterStore } from "@/lib/store"
import { X } from "lucide-react"

export function ScanFilters() {
  const { statusFilter, vulnerabilityFilter, setStatusFilter, setVulnerabilityFilter, resetFilters } = useFilterStore()

  const hasFilters = statusFilter || vulnerabilityFilter

  return (
    <div className="flex items-center gap-3">
      <Select value={statusFilter || ""} onValueChange={(val) => setStatusFilter(val || null)}>
        <SelectTrigger className="w-36 bg-secondary border-border">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="running">Running</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
        </SelectContent>
      </Select>

      <Select value={vulnerabilityFilter || ""} onValueChange={(val) => setVulnerabilityFilter(val || null)}>
        <SelectTrigger className="w-36 bg-secondary border-border">
          <SelectValue placeholder="Result" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Results</SelectItem>
          <SelectItem value="vulnerable">Vulnerable</SelectItem>
          <SelectItem value="safe">Safe</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={resetFilters} className="h-9 px-2">
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  )
}
