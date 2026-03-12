import { memo } from 'react'
import CompletionChart from './CompletionChart'
import SectionHealthBar from './SectionHealthBar'
import { FRAMEWORKS } from '../../data/frameworkDefinitions'
import { useStrategy } from '../../hooks/useStrategyDocument'
import { BarChart3 } from 'lucide-react'

/**
 * 분석 대시보드 — 완료율, 프레임워크별 상태, 섹션 건강도
 */
function AnalysisDashboard() {
  const { state } = useStrategy()
  if (!state) return null

  const allIds = Object.keys(FRAMEWORKS)
  const total = allIds.length
  const completed = allIds.filter((id) => state.frameworks[id]?.status === 'completed').length
  const generating = allIds.filter((id) => state.frameworks[id]?.status === 'generating').length
  const errors = allIds.filter((id) => state.frameworks[id]?.status === 'error').length

  return (
    <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-primary-500" />
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">분석 대시보드</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 좌: 도넛 차트 + 요약 통계 */}
        <div className="flex flex-col items-center gap-3">
          <CompletionChart completed={completed} total={total} generating={generating} />
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-gray-600 dark:text-gray-400">완료 {completed}</span>
            </div>
            {generating > 0 && (
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-pulse" />
                <span className="text-gray-600 dark:text-gray-400">생성 중 {generating}</span>
              </div>
            )}
            {errors > 0 && (
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-gray-600 dark:text-gray-400">오류 {errors}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-gray-700" />
              <span className="text-gray-600 dark:text-gray-400">미생성 {total - completed - generating - errors}</span>
            </div>
          </div>
        </div>

        {/* 우: 섹션 건강도 */}
        <SectionHealthBar state={state} />
      </div>
    </div>
  )
}

export default memo(AnalysisDashboard)
