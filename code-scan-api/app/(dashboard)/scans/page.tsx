"use client"

import React, { useEffect, useState } from "react"
import { Header } from "@/components/layout/header"
import { AllScansTable } from "@/components/scan/all-scans-table"
import { ScanFilters } from "@/components/dashboard/scan-filters"
import { api } from "@/lib/api/client"
import { ScanResponse } from "@/lib/api/types"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function AllScansPage() {
  const [scans, setScans] = useState<ScanResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all scans on component mount
  useEffect(() => {
    const fetchScans = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log("[Page] Fetching scans...")
        
        const allScans = await api.getAllScans()
        setScans(allScans || [])
        
        console.log("[Page] Scans loaded:", allScans?.length)
      } catch (err) {
        console.error("[Page] Error fetching scans:", err)
        const errorMessage = err instanceof Error ? err.message : "Failed to load scans"
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchScans()
  }, [])

  const handleRefresh = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("[Page] Refreshing scans...")
      
      const allScans = await api.getAllScans()
      setScans(allScans || [])
    } catch (err) {
      console.error("[Page] Error refreshing scans:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to refresh scans"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = async (filters: any) => {
    try {
      setLoading(true)
      setError(null)
      console.log("[Page] Applying filters:", filters)
      
      // TODO: Implement filtering on the backend
      const allScans = await api.getAllScans()
      setScans(allScans || [])
    } catch (err) {
      console.error("[Page] Error applying filters:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to apply filters"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header 
        title="All Scans" 
        description="View and manage all your vulnerability scans" 
      />
      
      <div className="p-6 space-y-4">
        {/* Header with filters and create button */}
        <div className="flex items-center justify-between">
          <ScanFilters onFilter={handleFilter} />
          <Link href="/scan/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Scan
            </Button>
          </Link>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            <p className="font-semibold">Error loading scans</p>
            <p className="text-sm">{error}</p>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Loading state */}
        {loading && !error && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading scans...</p>
            </div>
          </div>
        )}

        {/* Scans table */}
        {!loading && !error && (
          <>
            <AllScansTable scans={scans} onRefresh={handleRefresh} />
            {scans.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p className="mb-4">No scans found</p>
                <Link href="/scan/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Scan
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
