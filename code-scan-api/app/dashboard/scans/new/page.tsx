"use client"

import React, { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { RouteGuard } from "@/components/route-guard"
import { useScans } from "@/components/providers"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Code2, Github, Globe, Loader2 } from "lucide-react"

function CreateScanContent() {
  const [activeTab, setActiveTab] = useState<"code" | "repository" | "website">("website")
  const [scanName, setScanName] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("javascript")
  const [codeSnippet, setCodeSnippet] = useState("")
  const [repoUrl, setRepoUrl] = useState("")
  const [repoBranch, setRepoBranch] = useState("main")
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { createScan } = useScans()
  const router = useRouter()

  const tabs = [
    { id: "code", label: "Source Code", icon: Code2 },
    { id: "repository", label: "Repository", icon: Github },
    { id: "website", label: "Website", icon: Globe },
  ] as const

  const canSubmit = useMemo(() => {
    if (activeTab === "code") return codeSnippet.trim().length > 0
    if (activeTab === "repository") return repoUrl.trim().length > 0
    return websiteUrl.trim().length > 0
  }, [activeTab, codeSnippet, repoUrl, websiteUrl])

  const handleCreateScan = async () => {
    if (!canSubmit) return

    setIsLoading(true)
    setError(null)

    try {
      const created = await createScan(
        activeTab === "code"
          ? {
              type: "code",
              code: codeSnippet,
              displayName: scanName || `${selectedLanguage} code scan`,
            }
          : activeTab === "repository"
            ? {
                type: "repository",
                repoUrl,
                branch: repoBranch,
                displayName: scanName || repoUrl,
              }
            : {
                type: "website",
                targetUrl: websiteUrl,
                displayName: scanName || websiteUrl,
              },
      )

      router.push(`/dashboard/scans/${created.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create scan")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Create New Scan</h1>
          <p className="mt-2 text-slate-400">Submit code, a repository, or a live website for backend processing.</p>
        </div>

        <div className="flex gap-2 border-b border-slate-800">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-violet-500 text-violet-400"
                    : "border-transparent text-slate-400 hover:text-slate-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        <Card className="space-y-6 border-slate-800 bg-slate-900/50 p-8">
          {activeTab === "code" && (
            <>
              <div>
                <h3 className="mb-2 text-lg font-bold">Scan Source Code</h3>
                <p className="mb-4 text-slate-400">Paste a code sample or snippet to send it to the backend scanner.</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Programming Language</label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
                >
                  <option value="javascript">JavaScript / TypeScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="csharp">C#</option>
                  <option value="ruby">Ruby</option>
                  <option value="go">Go</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Code</label>
                <Textarea
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  placeholder="Paste code here..."
                  className="min-h-48 border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
                />
              </div>
            </>
          )}

          {activeTab === "repository" && (
            <>
              <div>
                <h3 className="mb-2 text-lg font-bold">Connect Repository</h3>
                <p className="mb-4 text-slate-400">Send a repository URL to the backend for queued scanning.</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Repository URL</label>
                <Input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/owner/repo"
                  className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Branch</label>
                <Input
                  value={repoBranch}
                  onChange={(e) => setRepoBranch(e.target.value)}
                  placeholder="main"
                  className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
                />
              </div>
            </>
          )}

          {activeTab === "website" && (
            <>
              <div>
                <h3 className="mb-2 text-lg font-bold">Live Website Scan</h3>
                <p className="mb-4 text-slate-400">Submit a website URL and the backend will run ZAP and return the report.</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Website URL</label>
                <Input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
                />
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-400">
                The crawl depth is controlled by the backend ZAP job configuration.
              </div>
            </>
          )}

          <div className="border-t border-slate-800 pt-6">
            <label className="mb-2 block text-sm font-medium">Friendly Name (optional)</label>
            <Input
              value={scanName}
              onChange={(e) => setScanName(e.target.value)}
              placeholder="e.g., API Security Audit"
              className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
            />
          </div>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 border-slate-700" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateScan}
              disabled={!canSubmit || isLoading}
              className="flex-1 bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Scan...
                </span>
              ) : (
                "Start Scan"
              )}
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default function CreateScan() {
  return (
    <RouteGuard>
      <CreateScanContent />
    </RouteGuard>
  )
}
