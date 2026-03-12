import React, { useState, lazy, Suspense } from 'react'
import { FRAMEWORKS } from '../../data/frameworkDefinitions'
import { useStrategy } from '../../hooks/useStrategyDocument'
import { useAiGeneration } from '../../hooks/useAiGeneration'
import { useAiCoaching, type CoachingResult } from '../../hooks/useAiCoaching'
import { Sparkles, RotateCcw, Loader2, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Star, ThumbsUp, X, Clock, ArrowLeftRight, GraduationCap } from 'lucide-react'

const ModelCompareModal = lazy(() => import('./ModelCompareModal'))
import { getRecommendationInfo } from '../../utils/recommendation'
import FrameworkCardSkeleton from './FrameworkCardSkeleton'

/** 초 단위 표시 (60초 미만: "23초", 이상: "1분 30초") */
function formatDurationSec(ms: number): string {
  const sec = Math.round(ms / 1000)
  if (sec < 60) return `${sec}초`
  const min = Math.floor(sec / 60)
  const remainSec = sec % 60
  return remainSec > 0 ? `${min}분 ${remainSec}초` : `${min}분`
}

const LEVEL_BADGE = {
  essential: { icon: Star, className: 'text-red-500 bg-red-50 dark:bg-red-900/30', label: '필수' },
  recommended: { icon: ThumbsUp, className: 'text-blue-500 bg-blue-50 dark:bg-blue-900/30', label: '권장' },
  optional: null,
} as const

const PRIORITY_COLORS = {
  high: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/30',
  medium: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/30',
  low: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/30',
} as const

function CoachingPanel({ coaching, loading }: { coaching?: CoachingResult; loading: boolean }) {
  if (loading) {
    return (
      <div className="mb-3 p-3 bg-amber-50/50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800 animate-pulse">
        <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          AI 코칭 분석 중...
        </div>
      </div>
    )
  }
  if (!coaching) return null

  return (
    <div className="mb-3 p-3 bg-amber-50/50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span className="text-sm font-medium text-amber-800 dark:text-amber-300">AI 코칭</span>
        </div>
        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-full">
          {coaching.score}점
        </span>
      </div>

      {coaching.strengths.length > 0 && (
        <div className="mb-2">
          <p className="text-[11px] font-medium text-green-700 dark:text-green-400 mb-1">잘한 점</p>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
            {coaching.strengths.map((s, i) => <li key={i} className="flex gap-1"><span className="text-green-500 shrink-0">+</span>{s}</li>)}
          </ul>
        </div>
      )}

      {coaching.improvements.length > 0 && (
        <div className="mb-2">
          <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400 mb-1">개선 제안</p>
          <div className="space-y-1.5">
            {coaching.improvements.map((imp, i) => (
              <div key={i} className="text-xs">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${PRIORITY_COLORS[imp.priority] ?? PRIORITY_COLORS.medium}`}>
                    {imp.priority === 'high' ? '높음' : imp.priority === 'medium' ? '보통' : '낮음'}
                  </span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{imp.area}</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 ml-1">{imp.suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {coaching.missingPerspectives.length > 0 && (
        <div className="mb-2">
          <p className="text-[11px] font-medium text-blue-700 dark:text-blue-400 mb-1">누락된 관점</p>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
            {coaching.missingPerspectives.map((m, i) => <li key={i} className="flex gap-1"><span className="text-blue-500 shrink-0">?</span>{m}</li>)}
          </ul>
        </div>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400 italic border-t border-amber-200 dark:border-amber-800 pt-2 mt-2">
        {coaching.overallAdvice}
      </p>
    </div>
  )
}

interface FrameworkCardProps {
  frameworkId: string
  children: React.ReactNode
}

export default function FrameworkCard({ frameworkId, children }: FrameworkCardProps) {
  const fw = FRAMEWORKS[frameworkId]
  const { state, clearFramework } = useStrategy()
  const { generate, cancel, elapsedMs, lastDurations, generatingSet, streamingText } = useAiGeneration()
  const { coach, getCoaching, loading: coachingLoading } = useAiCoaching()
  const fState = state?.frameworks[frameworkId]
  const [collapsed, setCollapsed] = useState(false)
  const [showCompare, setShowCompare] = useState(false)
  const [showCoaching, setShowCoaching] = useState(false)
  const coaching = getCoaching(frameworkId)

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
    <div data-framework-id={frameworkId} className={`rounded-xl border-2 transition-colors ${statusColors[status]}`} tabIndex={-1}>
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
            {/* 생성 중: 경과 시간 */}
            {status === 'generating' && generatingSet.has(frameworkId) && elapsedMs >= 1000 && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium text-primary-500 bg-primary-50 dark:bg-primary-900/30 shrink-0 tabular-nums">
                <Clock className="w-3 h-3" />
                {formatDurationSec(elapsedMs)}
              </span>
            )}
            {/* 완료: 소요 시간 */}
            {status === 'completed' && lastDurations.get(frameworkId) != null && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/30 shrink-0 tabular-nums">
                <Clock className="w-3 h-3" />
                {formatDurationSec(lastDurations.get(frameworkId)!)}
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
          {status === 'generating' ? (
            <button
              onClick={cancel}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
              aria-label="AI 생성 취소"
            >
              <X className="w-3 h-3" />
              취소
            </button>
          ) : (
            <>
              {status === 'completed' && (
                <button
                  onClick={() => {
                    setShowCoaching(!showCoaching)
                    if (!coaching && !coachingLoading) coach(frameworkId)
                  }}
                  disabled={coachingLoading}
                  className={`p-1.5 rounded-md transition-colors ${
                    showCoaching
                      ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20'
                      : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:text-gray-500 dark:hover:text-amber-400 dark:hover:bg-amber-900/20'
                  }`}
                  title="AI 코칭"
                >
                  {coachingLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <GraduationCap className="w-3.5 h-3.5" />}
                </button>
              )}
              <button
                onClick={() => setShowCompare(true)}
                className="p-1.5 text-gray-400 hover:text-primary-500 rounded-md hover:bg-primary-50 transition-colors dark:text-gray-500 dark:hover:text-primary-400 dark:hover:bg-primary-900/20"
                title="모델 A/B 비교"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleGenerate}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors bg-primary-600 text-white hover:bg-primary-700"
              >
                <Sparkles className="w-3 h-3" />
                AI 생성
              </button>
            </>
          )}
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

          {status === 'generating' && streamingText != null && generatingSet.has(frameworkId) && (
            <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg max-h-60 overflow-auto">
              <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap font-mono leading-relaxed">
                {streamingText || '⏳ 응답 대기 중...'}
                <span className="inline-block w-1.5 h-3.5 bg-primary-500 animate-pulse ml-0.5 align-text-bottom" />
              </pre>
            </div>
          )}
          {status === 'generating' && streamingText == null && <FrameworkCardSkeleton />}
          {/* AI 코칭 패널 */}
          {showCoaching && status === 'completed' && (
            <CoachingPanel coaching={coaching} loading={coachingLoading} />
          )}
          {(status === 'completed' || status === 'error') && children}
        </div>
      )}

      {/* A/B 비교 모달 */}
      {showCompare && (
        <Suspense fallback={null}>
          <ModelCompareModal frameworkId={frameworkId} onClose={() => setShowCompare(false)} />
        </Suspense>
      )}
    </div>
  )
}
