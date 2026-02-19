import { Loader2 } from 'lucide-react'
import { FRAMEWORKS } from '../../data/frameworkDefinitions'

interface GenerationProgressProps {
  completedCount: number
  totalCount: number
  currentFrameworkId: string | null
}

export default function GenerationProgress({
  completedCount,
  totalCount,
  currentFrameworkId,
}: GenerationProgressProps) {
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const currentName = currentFrameworkId ? FRAMEWORKS[currentFrameworkId]?.name : null

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl text-sm">
      <Loader2 className="w-4 h-4 text-primary-500 animate-spin shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-primary-700 dark:text-primary-300 font-medium truncate">
            {currentName ? `${currentName} 생성 중...` : '생성 준비 중...'}
          </span>
          <span className="text-xs text-primary-500 dark:text-primary-400 shrink-0 ml-2">
            {completedCount}/{totalCount}
          </span>
        </div>
        <div className="h-1.5 bg-primary-100 dark:bg-primary-900/40 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  )
}
