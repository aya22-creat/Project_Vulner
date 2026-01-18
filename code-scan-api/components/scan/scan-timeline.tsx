"use client"

import { ScanStatus } from "@/lib/api/types"
import { cn } from "@/lib/utils"
import { Check, Loader2, Clock, AlertCircle } from "lucide-react"

interface ScanTimelineProps {
  status: ScanStatus
  createdAt: string
}

const steps = [
  { id: 0, name: "Queued", description: "Scan request received" },
  { id: 1, name: "Analyzing", description: "AI is scanning your code" },
  { id: 2, name: "Complete", description: "Results are ready" },
]

export function ScanTimeline({ status }: ScanTimelineProps) {
  const currentStep = status === ScanStatus.Failed ? -1 : status

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isComplete = currentStep > step.id
          const isCurrent = currentStep === step.id
          const isPending = currentStep < step.id
          const isFailed = status === ScanStatus.Failed && step.id === 1

          return (
            <div key={step.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                    isComplete && "border-success bg-success/10 text-success",
                    isCurrent && !isFailed && "border-primary bg-primary/10 text-primary",
                    isPending && "border-muted bg-muted text-muted-foreground",
                    isFailed && "border-destructive bg-destructive/10 text-destructive",
                  )}
                >
                  {isComplete ? (
                    <Check className="h-5 w-5" />
                  ) : isCurrent && !isFailed ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : isFailed ? (
                    <AlertCircle className="h-5 w-5" />
                  ) : (
                    <Clock className="h-5 w-5" />
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      (isComplete || isCurrent) && !isFailed && "text-foreground",
                      isPending && "text-muted-foreground",
                      isFailed && "text-destructive",
                    )}
                  >
                    {isFailed ? "Failed" : step.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{isFailed ? "An error occurred" : step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={cn("h-0.5 flex-1 mx-4 transition-colors", isComplete ? "bg-success" : "bg-muted")} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
