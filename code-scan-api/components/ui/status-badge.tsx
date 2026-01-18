import { cn } from "@/lib/utils"
import { ScanStatus } from "@/lib/api/types"
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react"

interface StatusBadgeProps {
  status: ScanStatus
  className?: string
}

const statusConfig = {
  [ScanStatus.Pending]: {
    label: "Pending",
    icon: Clock,
    className: "bg-warning/10 text-warning border-warning/20",
  },
  [ScanStatus.Running]: {
    label: "Running",
    icon: Loader2,
    className: "bg-primary/10 text-primary border-primary/20",
    iconClassName: "animate-spin",
  },
  [ScanStatus.Completed]: {
    label: "Completed",
    icon: CheckCircle,
    className: "bg-success/10 text-success border-success/20",
  },
  [ScanStatus.Failed]: {
    label: "Failed",
    icon: XCircle,
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className,
      )}
    >
      <Icon className={cn("h-3 w-3", config.iconClassName)} />
      {config.label}
    </span>
  )
}
