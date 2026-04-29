"use client"

import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { parseResultsReport } from "@/lib/backend-api"

interface ZapResultsViewerProps {
  resultsJson?: string | null
}

export function ZapResultsViewer({ resultsJson }: ZapResultsViewerProps) {
  const report = parseResultsReport(resultsJson)

  if (!report) {
    return (
      <Card className="border-slate-800 bg-slate-950/60 p-6 text-slate-400">
        No parsed ZAP report is available yet.
      </Card>
    )
  }

  if (report.findings.length === 0) {
    return (
      <Card className="border-emerald-500/20 bg-emerald-500/5 p-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400" />
          <div>
            <p className="font-semibold text-emerald-300">No vulnerabilities found</p>
            <p className="text-sm text-slate-400">The scan completed successfully and no ZAP findings were returned.</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="border-slate-800 bg-slate-950/60 p-4">
        <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          <Stat label="Total" value={report.summary.total} />
          <Stat label="High" value={report.summary.high} tone="red" />
          <Stat label="Medium" value={report.summary.medium} tone="amber" />
          <Stat label="Low" value={report.summary.low} tone="cyan" />
        </div>
      </Card>

      <div className="space-y-3">
        {report.findings.map((finding, index) => {
          const toneClass =
            finding.risk.toLowerCase() === "high"
              ? "border-red-500/20 bg-red-500/5"
              : finding.risk.toLowerCase() === "medium"
                ? "border-amber-500/20 bg-amber-500/5"
                : "border-cyan-500/20 bg-cyan-500/5"

          return (
            <Card key={`${finding.title}-${index}`} className={`p-5 ${toneClass}`}>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-violet-400" />
                    <h3 className="text-base font-semibold text-white">{finding.title}</h3>
                    <Badge variant="outline" className="border-slate-700 text-slate-300">
                      {finding.risk}
                    </Badge>
                  </div>
                  <p className="text-sm leading-6 text-slate-300">{finding.description || "No description provided."}</p>
                  {finding.solution ? (
                    <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-300">
                      <span className="mb-1 block text-xs uppercase tracking-wide text-slate-500">Recommended fix</span>
                      {finding.solution}
                    </div>
                  ) : null}
                </div>
                {finding.url ? (
                  <div className="max-w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-slate-400 md:max-w-xs">
                    <div className="mb-1 text-[10px] uppercase tracking-wide text-slate-500">Affected URL</div>
                    <div className="break-all">{finding.url}</div>
                  </div>
                ) : null}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function Stat({ label, value, tone = "slate" }: { label: string; value: number; tone?: "slate" | "red" | "amber" | "cyan" }) {
  const valueClass =
    tone === "red"
      ? "text-red-400"
      : tone === "amber"
        ? "text-amber-400"
        : tone === "cyan"
          ? "text-cyan-400"
          : "text-white"

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${valueClass}`}>{value}</div>
    </div>
  )
}
