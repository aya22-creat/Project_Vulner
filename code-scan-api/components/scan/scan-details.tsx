"use client"

import { useScan } from "@/lib/hooks/use-scans"
import { ScanStatus, ScanType } from "@/lib/api/types"
import { StatusBadge } from "@/components/ui/status-badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { ScanTimeline } from "./scan-timeline"
import { ConfidenceGauge } from "./confidence-gauge"
import { AiResponseViewer } from "./ai-response-viewer"
import { RepoFileTree } from "./repo-file-tree"
import { CodeViewer } from "./code-viewer"
import { ShieldCheck, ShieldAlert, Code, GitBranch, Clock, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface ScanDetailsProps {
  scanId: string
}

export function ScanDetails({ scanId }: ScanDetailsProps) {
  const { data: scan, isLoading, error } = useScan(scanId)

  if (isLoading) {
    return <ScanDetailsSkeleton />
  }

  if (error || !scan) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Failed to load scan details. Please try again.</p>
          <Link href="/" className="mt-4 inline-block">
            <Button variant="outline">Return to Dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  const isRunning = scan.status === ScanStatus.Running || scan.status === ScanStatus.Pending
  const isCompleted = scan.status === ScanStatus.Completed

  return (
    <div className="space-y-6">
      {/* Verdict Banner */}
      {isCompleted && (
        <Card
          className={`border-2 ${
            scan.hasVulnerabilities ? "bg-destructive/5 border-destructive/20" : "bg-success/5 border-success/20"
          }`}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              {scan.hasVulnerabilities ? (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                  <ShieldAlert className="h-8 w-8 text-destructive" />
                </div>
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                  <ShieldCheck className="h-8 w-8 text-success" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {scan.hasVulnerabilities ? "Vulnerabilities Detected" : "No Vulnerabilities Found"}
                </h2>
                <p className="text-muted-foreground">
                  {scan.hasVulnerabilities
                    ? "This code contains potential security issues that should be addressed."
                    : "The AI analysis found no security vulnerabilities in this code."}
                </p>
              </div>
              {scan.confidenceScore !== null && scan.confidenceScore !== undefined && (
                <div className="ml-auto">
                  <ConfidenceGauge score={scan.confidenceScore} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status & Info Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <StatusBadge status={scan.status} />
            {isRunning && <span className="text-sm text-muted-foreground animate-pulse">Analyzing code...</span>}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Scan Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {scan.type === ScanType.Code ? (
                <Code className="h-5 w-5 text-primary" />
              ) : (
                <GitBranch className="h-5 w-5 text-primary" />
              )}
              <span className="font-medium">{scan.type === ScanType.Code ? "Inline Code" : "Repository"}</span>
            </div>
            {scan.type === ScanType.RepoUrl && scan.repoUrl && (
              <a
                href={scan.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center gap-1 text-sm text-primary hover:underline"
              >
                {scan.repoUrl}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{format(new Date(scan.createdAt), "PPp")}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Scan Timeline</CardTitle>
          <CardDescription>Progress of your vulnerability scan</CardDescription>
        </CardHeader>
        <CardContent>
          <ScanTimeline status={scan.status} createdAt={scan.createdAt} />
        </CardContent>
      </Card>

      {/* Code or Repo Section */}
      {scan.type === ScanType.Code && scan.code && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Scanned Code</CardTitle>
            <CardDescription>The code that was analyzed for vulnerabilities</CardDescription>
          </CardHeader>
          <CardContent>
            <CodeViewer code={scan.code} />
          </CardContent>
        </Card>
      )}

      {scan.type === ScanType.RepoUrl && scan.repoUrl && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Repository Structure</CardTitle>
            <CardDescription>Files scanned in the repository</CardDescription>
          </CardHeader>
          <CardContent>
            <RepoFileTree
              repoUrl={scan.repoUrl}
              aiResponse={scan.aiRawResponse}
              hasVulnerabilities={scan.hasVulnerabilities}
            />
          </CardContent>
        </Card>
      )}

      {/* AI Response */}
      {scan.aiRawResponse && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>AI Analysis</CardTitle>
            <CardDescription>Raw output from the AI vulnerability scanner</CardDescription>
          </CardHeader>
          <CardContent>
            <AiResponseViewer response={scan.aiRawResponse} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ScanDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-6 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-card border-border">
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}
