import { memo } from 'react'
import { SECTIONS } from '../../data/sectionDefinitions'
import { FRAMEWORKS } from '../../data/frameworkDefinitions'
import type { StrategyDocument } from '../../types/document'

interface SectionHealthBarProps {
  state: StrategyDocument
}

const STATUS_COLORS = {
  completed: 'bg-green-500',
  generating: 'bg-primary-500 animate-pulse',
  error: 'bg-red-500',
  empty: 'bg-gray-200 dark:bg-gray-700',
} as const

/**
 * 섹션별 건강도 바 — 각 프레임워크의 상태를 색상 블록으로 표시
 */
function SectionHealthBar({ state }: SectionHealthBarProps) {
  return (
    <div className="space-y-3">
      {SECTIONS.map((section) => {
        const completed = section.frameworks.filter(
          (id) => state.frameworks[id]?.status === 'completed'
        ).length
        const total = section.frameworks.length
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0

        return (
          <div key={section.id}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {section.number}. {section.title}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {completed}/{total} ({pct}%)
              </span>
            </div>
            <div className="flex gap-1 h-3">
              {section.frameworks.map((fId) => {
                const status = state.frameworks[fId]?.status || 'empty'
                const fw = FRAMEWORKS[fId]
                return (
                  <div
                    key={fId}
                    className={`flex-1 rounded-sm ${STATUS_COLORS[status]} transition-colors`}
                    title={`${fw?.name || fId}: ${status === 'completed' ? '완료' : status === 'generating' ? '생성 중' : status === 'error' ? '오류' : '미생성'}`}
                  />
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default memo(SectionHealthBar)
