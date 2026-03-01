import { Loader2 } from 'lucide-react'
import { FRAMEWORKS } from '../../data/frameworkDefinitions'
import { getEstimatedDuration } from '../../utils/generationMetrics'

/** ms → "0:23" 형식 */
function formatTime(ms: number): string {
  const totalSec = Math.max(0, Math.round(ms / 1000))
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${String(sec).padStart(2, '0')}`
}

interface GenerationProgressProps {
  completedCount: number
  totalCount: number
  currentFrameworkId: string | null
  /** 현재 생성의 경과 시간 (ms) */
  elapsedMs?: number
  /** 아직 생성 대기 중인 프레임워크 ID 목록 (현재 진행 중 제외) */
  remainingFrameworkIds?: string[]
  /** 현재 사용 중인 모델 */
  model?: string
}

export default function GenerationProgress({
  completedCount,
  totalCount,
  currentFrameworkId,
  elapsedMs = 0,
  remainingFrameworkIds = [],
  model = '',
}: GenerationProgressProps) {
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const currentName = currentFrameworkId ? FRAMEWORKS[currentFrameworkId]?.name : null

  // 남은 시간 계산: 현재 프레임워크 남은 + 대기 프레임워크 합산
  let estimatedRemainingMs = 0
  if (currentFrameworkId && model) {
    const currentEstimate = getEstimatedDuration(currentFrameworkId, model)
    estimatedRemainingMs += Math.max(0, currentEstimate - elapsedMs)
    for (const id of remainingFrameworkIds) {
      estimatedRemainingMs += getEstimatedDuration(id, model)
    }
  }

  const showElapsed = elapsedMs >= 1000
  const showRemaining = estimatedRemainingMs > 0 && showElapsed

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl text-sm">
      <Loader2 className="w-4 h-4 text-primary-500 animate-spin shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-primary-700 dark:text-primary-300 font-medium truncate">
            {currentName ? `${currentName} 생성 중...` : '생성 준비 중...'}
          </span>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            {showElapsed && (
              <span className="text-xs text-primary-500 dark:text-primary-400 tabular-nums">
                {formatTime(elapsedMs)} 경과
                {showRemaining && <span className="text-primary-400 dark:text-primary-500"> · ~{formatTime(estimatedRemainingMs)} 남음</span>}
              </span>
            )}
            <span className="text-xs text-primary-500 dark:text-primary-400 shrink-0">
              {completedCount}/{totalCount}
            </span>
          </div>
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
