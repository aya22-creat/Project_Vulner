"use client"

interface ConfidenceGaugeProps {
  score: number
}

export function ConfidenceGauge({ score }: ConfidenceGaugeProps) {
  const percentage = Math.round(score * 100)

  const getColor = () => {
    if (percentage >= 80) return "text-success"
    if (percentage >= 60) return "text-warning"
    return "text-muted-foreground"
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-20 w-20">
        <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-muted/30"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className={getColor()}
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${percentage}, 100`}
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-lg font-bold ${getColor()}`}>{percentage}%</span>
        </div>
      </div>
      <span className="mt-1 text-xs text-muted-foreground">Confidence</span>
    </div>
  )
}
