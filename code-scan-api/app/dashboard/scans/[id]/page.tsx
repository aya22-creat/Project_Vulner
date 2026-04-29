"use client"

import React, { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { RouteGuard } from "@/components/route-guard"
import { useScans } from "@/components/providers"
import { ZapResultsViewer } from "@/components/zap-results-viewer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle, BarChart3, CheckCircle2, Download, Globe, Loader2, Trash2 } from "lucide-react"
import { parseResultsReport } from "@/lib/backend-api"

function ScanResultsContent() {
  const params = useParams()
  const router = useRouter()
  const { scans, deleteScan, isLoading } = useScans()
  const [activeTab, setActiveTab] = useState<"overview" | "vulnerabilities" | "raw-report">("overview")

  const scanId = params.id as string
  const scan = scans.find((s) => s.id === scanId)

  const report = useMemo(() => parseResultsReport(scan?.resultsJson), [scan?.resultsJson])

  if (isLoading && !scan) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center text-slate-400">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading scan...
        </div>
      </DashboardLayout>
    )
  }

  if (!scan) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-2xl font-bold">Scan Not Found</h2>
          <p className="mb-6 text-slate-400">The scan you&apos;re looking for does not exist or has not loaded yet.</p>
          <Button onClick={() => router.push("/dashboard/scans")}>Back to Scans</Button>
        </div>
      </DashboardLayout>
    )
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this scan?")) return
    await deleteScan(scanId)
    router.push("/dashboard/scans")
  }

  const summaryCards = [
    { label: "Total Issues", value: report?.summary.total ?? scan.issueCount, tone: "slate" },
    { label: "High", value: report?.summary.high ?? scan.high, tone: "red" },
    { label: "Medium", value: report?.summary.medium ?? scan.medium, tone: "amber" },
    { label: "Low", value: report?.summary.low ?? scan.low, tone: "cyan" },
  ] as const

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{scan.name}</h1>
            <p className="mt-2 text-slate-400">
              {new Date(scan.createdAt).toLocaleString()} • Status: {scan.status}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2 border-slate-700">
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
            <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {summaryCards.map((stat) => (
            <Card key={stat.label} className={`border-slate-800 bg-slate-900/50 p-4`}>
              <div className="text-xs uppercase tracking-wide text-slate-400">{stat.label}</div>
              <div className="mt-2 text-2xl font-bold text-white">{stat.value}</div>
            </Card>
          ))}
        </div>

        <div className="flex gap-2 border-b border-slate-800">
          {[
            { key: "overview", label: "Overview" },
            { key: "vulnerabilities", label: "Findings" },
            { key: "raw-report", label: "Raw Report" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`border-b-2 px-4 py-3 font-medium transition-colors ${
                activeTab === tab.key ? "border-violet-500 text-violet-400" : "border-transparent text-slate-400 hover:text-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
            <Card className="space-y-4 border-slate-800 bg-slate-900/50 p-6">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                Scan summary
              </div>
              <p className="text-sm text-slate-400">
                {scan.type === "website"
                  ? "This live website scan was processed by the backend and ZAP findings are shown below."
                  : "This scan was processed by the backend pipeline and the report has been attached to the scan record."}
              </p>

              <div className="grid gap-3 md:grid-cols-2">
                <Meta label="Target" value={scan.targetUrl || scan.repoUrl || "Code scan"} />
                <Meta label="ZAP Scan ID" value={scan.zapScanId || "Pending"} />
                <Meta label="Vulnerability Type" value={scan.vulnerabilityType || "None"} />
                <Meta label="Confidence" value={scan.confidenceScore != null ? `${Math.round(scan.confidenceScore * 100)}%` : "n/a"} />
              </div>

              {scan.errorMessage ? (
                <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-300">{scan.errorMessage}</div>
              ) : null}
            </Card>

            <Card className="space-y-4 border-slate-800 bg-slate-900/50 p-6">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Globe className="h-5 w-5 text-cyan-400" />
                Scan context
              </div>
              <div className="space-y-3 text-sm text-slate-300">
                <Row label="Type" value={scan.type} />
                <Row label="Status" value={scan.status} />
                <Row label="Created" value={new Date(scan.createdAt).toLocaleString()} />
                <Row label="Updated" value={new Date(scan.updatedAt).toLocaleString()} />
              </div>
            </Card>
          </div>
        )}

        {activeTab === "vulnerabilities" && <ZapResultsViewer resultsJson={scan.resultsJson} />}

        {activeTab === "raw-report" && (
          <Card className="border-slate-800 bg-slate-950/60 p-6">
            <pre className="overflow-auto text-sm text-slate-300">
              {scan.resultsJson || "No raw report data has been saved yet."}
            </pre>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 wrap-break-word text-sm text-white">{value}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/50 p-3">
      <span className="text-slate-500">{label}</span>
      <span className="text-right text-white">{value}</span>
    </div>
  )
}

export default function ScanResults() {
  return (
    <RouteGuard>
      <ScanResultsContent />
    </RouteGuard>
  )
}
