import { FRAMEWORKS } from '../../data/frameworkDefinitions'
import { Star, ThumbsUp, Lightbulb, ArrowRight, Loader2 } from 'lucide-react'
import type { RecommendationResult, FrameworkRecommendation } from '../../types'
import Skeleton from '../common/Skeleton'

interface RecommendationPanelProps {
  recommendation: RecommendationResult
  isLoading: boolean
  onStartAll: () => void
  onStartRecommended: () => void
}

const LEVEL_CONFIG = {
  essential: {
    label: '필수',
    color: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    barColor: 'bg-red-500',
    icon: Star,
    description: '이 사업 아이템 분석에 반드시 필요한 핵심 프레임워크',
  },
  recommended: {
    label: '권장',
    color: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    barColor: 'bg-blue-500',
    icon: ThumbsUp,
    description: '더 깊이 있는 분석을 위해 권장하는 프레임워크',
  },
  optional: {
    label: '선택',
    color: 'bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300',
    badge: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
    barColor: 'bg-gray-400',
    icon: Lightbulb,
    description: '필요 시 추가로 활용할 수 있는 프레임워크',
  },
} as const

function RecommendationGroup({
  level,
  items,
}: {
  level: keyof typeof LEVEL_CONFIG
  items: FrameworkRecommendation[]
}) {
  const config = LEVEL_CONFIG[level]
  const Icon = config.icon

  if (items.length === 0) return null

  return (
    <div className={`rounded-xl border p-4 ${config.color}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4" />
        <span className="font-semibold text-sm">{config.label}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${config.badge}`}>
          {items.length}개
        </span>
      </div>
      <p className="text-xs opacity-70 mb-3">{config.description}</p>
      <div className="space-y-2">
        {items.map((item) => {
          const fw = FRAMEWORKS[item.id]
          if (!fw) return null
          const score = item.score ?? (level === 'essential' ? 100 : 50)
          return (
            <div key={item.id} className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="font-medium text-sm">{fw.name}
                  <span className="text-xs opacity-60 ml-1.5">{fw.fullName}</span>
                </div>
                {level !== 'essential' && (
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${config.badge}`}>
                    {score}%
                  </span>
                )}
              </div>
              {item.description && (
                <p className="text-xs opacity-70 mb-1.5 leading-relaxed">{item.description}</p>
              )}
              <div className="flex items-start gap-1.5">
                <ArrowRight className="w-3 h-3 mt-0.5 shrink-0 opacity-50" />
                <span className="text-xs opacity-80 leading-relaxed">{item.reason}</span>
              </div>
              {level !== 'essential' && (
                <div className="mt-2 h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${config.barColor}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function RecommendationPanel({
  recommendation,
  isLoading,
  onStartAll,
  onStartRecommended,
}: RecommendationPanelProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
          <span className="text-sm text-gray-500 dark:text-gray-400">AI가 최적의 분석 전략을 추천 중입니다...</span>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton variant="circular" className="w-4 h-4" />
              <Skeleton className="h-4 w-16" />
              <Skeleton variant="circular" className="h-5 w-10" />
            </div>
            <Skeleton className="h-3 w-3/4" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" variant="rectangular" />
              <Skeleton className="h-10 w-full" variant="rectangular" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const essentialCount = recommendation.essential.length
  const recommendedCount = recommendation.recommended.length

  return (
    <div className="space-y-4 animate-fade-in">
      <RecommendationGroup level="essential" items={recommendation.essential} />
      <RecommendationGroup level="recommended" items={recommendation.recommended} />
      <RecommendationGroup level="optional" items={recommendation.optional} />

      <div className="flex flex-col sm:flex-row gap-2 pt-2">
        <button
          onClick={onStartRecommended}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors"
        >
          <Star className="w-4 h-4" />
          추천 전략만 분석 ({essentialCount + recommendedCount}개)
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={onStartAll}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
        >
          전체 분석 시작 (16개)
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
