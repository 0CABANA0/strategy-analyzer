import { memo } from 'react'

interface CompletionChartProps {
  completed: number
  total: number
  generating: number
}

/**
 * 완료율 도넛 차트 — SVG stroke-dasharray 기반
 */
function CompletionChart({ completed, total, generating }: CompletionChartProps) {
  const r = 45
  const circumference = 2 * Math.PI * r
  const completedPct = total > 0 ? completed / total : 0
  const generatingPct = total > 0 ? generating / total : 0
  const emptyPct = 1 - completedPct - generatingPct

  // 각 세그먼트의 dash 값
  const completedDash = circumference * completedPct
  const generatingDash = circumference * generatingPct
  const emptyDash = circumference * emptyPct

  const pctText = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 120 120" className="w-32 h-32">
        <g transform="rotate(-90 60 60)">
          {/* 완료 (초록) */}
          <circle
            cx="60" cy="60" r={r}
            fill="none" stroke="#22c55e" strokeWidth="10"
            strokeDasharray={`${completedDash} ${circumference - completedDash}`}
            strokeDashoffset="0"
            strokeLinecap="round"
          />
          {/* 생성 중 (파랑 점선) */}
          {generatingPct > 0 && (
            <circle
              cx="60" cy="60" r={r}
              fill="none" stroke="#6366f1" strokeWidth="10"
              strokeDasharray={`${generatingDash} ${circumference - generatingDash}`}
              strokeDashoffset={`${-completedDash}`}
              className="animate-pulse"
            />
          )}
          {/* 빈 영역 (회색) */}
          <circle
            cx="60" cy="60" r={r}
            fill="none" strokeWidth="10"
            className="stroke-gray-200 dark:stroke-gray-700"
            strokeDasharray={`${emptyDash} ${circumference - emptyDash}`}
            strokeDashoffset={`${-(completedDash + generatingDash)}`}
          />
        </g>
        {/* 중앙 텍스트 */}
        <text
          x="60" y="56" textAnchor="middle"
          className="text-2xl font-bold fill-gray-800 dark:fill-gray-100"
          fontSize="24"
        >
          {pctText}%
        </text>
        <text
          x="60" y="72" textAnchor="middle"
          className="fill-gray-400 dark:fill-gray-500"
          fontSize="10"
        >
          {completed}/{total} 완료
        </text>
      </svg>
    </div>
  )
}

export default memo(CompletionChart)
