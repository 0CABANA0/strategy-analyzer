import React, { useState } from 'react'
import { FRAMEWORKS } from '../../data/frameworkDefinitions'
import { useStrategy } from '../../hooks/useStrategyDocument'
import { useAiGeneration } from '../../hooks/useAiGeneration'
import { Sparkles, RotateCcw, Loader2, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Star, ThumbsUp } from 'lucide-react'
import type { RecommendationResult, FrameworkRecommendation } from '../../types'
import FrameworkCardSkeleton from './FrameworkCardSkeleton'

function getRecommendationInfo(
  frameworkId: string,
  recommendation?: RecommendationResult
): { level: 'essential' | 'recommended' | 'optional'; item: FrameworkRecommendation } | null {
  if (!recommendation) return null
  const essential = recommendation.essential.find((r) => r.id === frameworkId)
  if (essential) return { level: 'essential', item: essential }
  const recommended = recommendation.recommended.find((r) => r.id === frameworkId)
  if (recommended) return { level: 'recommended', item: recommended }
  const optional = recommendation.optional.find((r) => r.id === frameworkId)
  if (optional) return { level: 'optional', item: optional }
  return null
}

const LEVEL_BADGE = {
  essential: { icon: Star, className: 'text-red-500 bg-red-50 dark:bg-red-900/30', label: '필수' },
  recommended: { icon: ThumbsUp, className: 'text-blue-500 bg-blue-50 dark:bg-blue-900/30', label: '권장' },
  optional: null,
} as const

interface FrameworkCardProps {
  frameworkId: string
  children: React.ReactNode
}

export default function FrameworkCard({ frameworkId, children }: FrameworkCardProps) {
  const fw = FRAMEWORKS[frameworkId]
  const { state, clearFramework } = useStrategy()
  const { generate } = useAiGeneration()
  const fState = state?.frameworks[frameworkId]
  const [collapsed, setCollapsed] = useState(false)

  if (!fw) return null

  const status = fState?.status || 'empty'
  const recInfo = getRecommendationInfo(frameworkId, state?.recommendation)
  const badge = recInfo ? LEVEL_BADGE[recInfo.level] : null
  const score = recInfo?.item.score

  const statusColors: Record<string, string> = {
    empty: 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800',
    generating: 'border-primary-300 bg-primary-50/50 dark:border-primary-700 dark:bg-primary-900/30',
    completed: 'border-green-200 bg-white dark:border-green-800 dark:bg-gray-800',
    error: 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/20',
  }

  const handleGenerate = () => {
    generate(frameworkId)
  }

  const handleReset = () => {
    clearFramework(frameworkId)
  }

  return (
    <div className={`rounded-xl border-2 transition-colors ${statusColors[status]}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <button
          className="flex items-center gap-2 min-w-0 text-left"
          onClick={() => setCollapsed(!collapsed)}
        >
          <div className="flex items-center gap-2 min-w-0">
            {status === 'completed' && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
            {status === 'generating' && <Loader2 className="w-4 h-4 text-primary-500 animate-spin shrink-0" />}
            {status === 'error' && <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">{fw.name}</h3>
            <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline truncate">{fw.fullName}</span>
            {badge && (
              <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${badge.className}`}>
                <badge.icon className="w-3 h-3" />
                {badge.label}
                {score != null && score < 100 && <span className="ml-0.5">{score}%</span>}
              </span>
            )}
          </div>
          {status === 'completed' && (
            collapsed ? <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" /> : <ChevronUp className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
          )}
        </button>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {status === 'completed' && (
            <button
              onClick={handleReset}
              className="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-red-900/20"
              title="초기화"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={handleGenerate}
            disabled={status === 'generating'}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              status === 'generating'
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            {status === 'generating' ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                생성중...
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3" />
                AI 생성
              </>
            )}
          </button>
        </div>
      </div>

      {/* 본문 */}
      {!collapsed && (
        <div className="p-4">
          {status === 'empty' && (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
              {fw.description}
              <br />
              <span className="text-xs">AI 생성 버튼을 클릭하거나 직접 입력하세요.</span>
            </p>
          )}

          {status === 'error' && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg mb-3">
              <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{fState.error || 'AI 생성 중 오류가 발생했습니다.'}</span>
              </div>
              <button
                onClick={handleGenerate}
                className="mt-2 ml-6 flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                aria-label="재시도"
              >
                <RotateCcw className="w-3 h-3" />
                재시도
              </button>
            </div>
          )}

          {status === 'generating' && <FrameworkCardSkeleton />}
          {(status === 'completed' || status === 'error') && children}
        </div>
      )}
    </div>
  )
}
