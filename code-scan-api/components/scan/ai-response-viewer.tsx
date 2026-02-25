"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface AiResponseViewerProps {
  response: string
}

export function AiResponseViewer({ response }: AiResponseViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(response)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="gap-2">
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {isExpanded ? "Collapse" : "Expand"} Raw Output
        </Button>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-2">
          {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <div
        className={cn(
          "rounded-lg bg-secondary p-4 font-mono text-sm overflow-auto transition-all",
          isExpanded ? "max-h-[500px]" : "max-h-32",
        )}
      >
        <pre className="whitespace-pre-wrap text-muted-foreground">{response}</pre>
      </div>
    </div>
  )
}
