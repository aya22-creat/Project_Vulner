"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api } from "@/lib/api/client"
import { ScanType } from "@/lib/api/types"
import { Code, GitBranch, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function NewScanForm() {
  const router = useRouter()
  const [scanType, setScanType] = useState<"code" | "repo">("code")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Code scan fields
  const [code, setCode] = useState("")

  // Repo scan fields
  const [repoUrl, setRepoUrl] = useState("")
  const [branch, setBranch] = useState("main")

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (scanType === "code") {
      if (!code.trim()) {
        newErrors.code = "Code is required"
      } else if (code.trim().length < 10) {
        newErrors.code = "Code must be at least 10 characters"
      }
    } else {
      if (!repoUrl.trim()) {
        newErrors.repoUrl = "Repository URL is required"
      } else if (!isValidUrl(repoUrl)) {
        newErrors.repoUrl = "Please enter a valid URL"
      }
      if (!branch.trim()) {
        newErrors.branch = "Branch is required"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const request = {
        type: scanType === "code" ? ScanType.Code : ScanType.RepoUrl,
        ...(scanType === "code" ? { code } : { repoUrl, branch }),
      }

      const response = await api.createScan(request)
      toast.success("Scan created successfully!")
      router.push(`/scan/${response.id}`)
    } catch (error) {
      toast.error("Failed to create scan. Please try again.")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Create Vulnerability Scan</CardTitle>
        <CardDescription>Scan your code or repository for security vulnerabilities using AI</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Tabs value={scanType} onValueChange={(v) => setScanType(v as "code" | "repo")} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-secondary">
              <TabsTrigger value="code" className="flex items-center gap-2 data-[state=active]:bg-background">
                <Code className="h-4 w-4" />
                Inline Code
              </TabsTrigger>
              <TabsTrigger value="repo" className="flex items-center gap-2 data-[state=active]:bg-background">
                <GitBranch className="h-4 w-4" />
                Git Repository
              </TabsTrigger>
            </TabsList>

            <TabsContent value="code" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code Snippet</Label>
                <Textarea
                  id="code"
                  placeholder="Paste your code here for vulnerability analysis..."
                  className="min-h-[300px] font-mono text-sm bg-secondary border-border"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                {errors.code && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.code}</AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>

            <TabsContent value="repo" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="repoUrl">Repository URL</Label>
                <Input
                  id="repoUrl"
                  type="url"
                  placeholder="https://github.com/username/repository"
                  className="bg-secondary border-border"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                />
                {errors.repoUrl && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.repoUrl}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Input
                  id="branch"
                  placeholder="main"
                  className="bg-secondary border-border"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                />
                {errors.branch && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.branch}</AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Scan...
                </>
              ) : (
                "Start Vulnerability Scan"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
