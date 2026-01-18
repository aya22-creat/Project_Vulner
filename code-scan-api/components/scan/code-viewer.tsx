"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

interface CodeViewerProps {
  code: string
}

export function CodeViewer({ code }: CodeViewerProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const lines = code.split("\n")

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" onClick={handleCopy} className="absolute right-2 top-2 gap-2 z-10">
        {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied" : "Copy"}
      </Button>
      <div className="rounded-lg bg-secondary overflow-auto max-h-[400px]">
        <table className="w-full">
          <tbody>
            {lines.map((line, index) => (
              <tr key={index} className="hover:bg-muted/50">
                <td className="px-4 py-0.5 text-right text-xs text-muted-foreground select-none border-r border-border w-12">
                  {index + 1}
                </td>
                <td className="px-4 py-0.5 font-mono text-sm whitespace-pre text-foreground">{line || " "}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
