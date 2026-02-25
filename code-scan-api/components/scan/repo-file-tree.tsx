"use client"

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { ChevronRight, ChevronDown, Folder, FileCode, FileText, FileJson, AlertTriangle } from "lucide-react"

interface RepoFileTreeProps {
  repoUrl: string
  aiResponse: string | null | undefined
  hasVulnerabilities: boolean | null | undefined
}

interface FileNode {
  name: string
  type: "file" | "folder"
  children?: FileNode[]
  isVulnerable?: boolean
}

export function RepoFileTree({ repoUrl, aiResponse, hasVulnerabilities }: RepoFileTreeProps) {
  // Parse repo URL to extract name
  const repoName = useMemo(() => {
    try {
      const url = new URL(repoUrl)
      const parts = url.pathname.split("/").filter(Boolean)
      return parts[parts.length - 1] || "repository"
    } catch {
      return "repository"
    }
  }, [repoUrl])

  // Generate mock file tree (in production, this would come from the API)
  const fileTree: FileNode = useMemo(() => {
    const vulnerableFiles: string[] = []

    // Try to extract file mentions from AI response
    if (aiResponse && hasVulnerabilities) {
      const filePatterns = aiResponse.match(/[\w-]+\.(js|ts|tsx|jsx|py|rb|php|java|go|rs|c|cpp|h)/gi)
      if (filePatterns) {
        vulnerableFiles.push(...filePatterns)
      }
    }

    return {
      name: repoName,
      type: "folder",
      children: [
        {
          name: "src",
          type: "folder",
          children: [
            { name: "index.ts", type: "file", isVulnerable: vulnerableFiles.some((f) => f.includes("index")) },
            { name: "app.ts", type: "file", isVulnerable: vulnerableFiles.some((f) => f.includes("app")) },
            {
              name: "components",
              type: "folder",
              children: [
                { name: "Auth.tsx", type: "file", isVulnerable: vulnerableFiles.some((f) => f.includes("Auth")) },
                { name: "Dashboard.tsx", type: "file" },
              ],
            },
            {
              name: "utils",
              type: "folder",
              children: [
                { name: "helpers.ts", type: "file" },
                {
                  name: "validation.ts",
                  type: "file",
                  isVulnerable: vulnerableFiles.some((f) => f.includes("validation")),
                },
              ],
            },
          ],
        },
        { name: "package.json", type: "file" },
        { name: "tsconfig.json", type: "file" },
        { name: "README.md", type: "file" },
      ],
    }
  }, [repoName, aiResponse, hasVulnerabilities])

  return (
    <div className="rounded-lg bg-secondary p-4 font-mono text-sm">
      <TreeNode node={fileTree} level={0} />
    </div>
  )
}

function TreeNode({ node, level }: { node: FileNode; level: number }) {
  const [isOpen, setIsOpen] = useState(level < 2)

  const getFileIcon = (name: string) => {
    if (name.endsWith(".json")) return FileJson
    if (name.endsWith(".md")) return FileText
    return FileCode
  }

  const Icon = node.type === "folder" ? Folder : getFileIcon(node.name)

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 py-1 px-2 rounded hover:bg-muted/50 cursor-pointer",
          node.isVulnerable && "bg-destructive/10",
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => node.type === "folder" && setIsOpen(!isOpen)}
      >
        {node.type === "folder" && (
          <span className="text-muted-foreground">
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>
        )}
        <Icon className={cn("h-4 w-4", node.type === "folder" ? "text-primary" : "text-muted-foreground")} />
        <span className={cn("text-foreground", node.isVulnerable && "text-destructive font-medium")}>{node.name}</span>
        {node.isVulnerable && <AlertTriangle className="h-3 w-3 text-destructive ml-auto" />}
      </div>
      {node.type === "folder" && isOpen && node.children && (
        <div>
          {node.children.map((child, index) => (
            <TreeNode key={index} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
