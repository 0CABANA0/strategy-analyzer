/** 경영진 요약 패널 */
import { useExecutiveSummary } from '../../hooks/useExecutiveSummary'
import { useToast } from '../../hooks/useToast'
import { ChevronDown, ChevronUp, Loader2, TrendingUp, AlertTriangle, Target } from 'lucide-react'
import { useState } from 'react'
import type { ExecutiveSummary } from '../../types'

const REC_STYLES: Record<ExecutiveSummary['recommendation'], { label: string; bg: string; text: string }> = {
  go: {
    label: 'GO',
    bg: 'bg-green-100 dark:bg-green-900/40',
    text: 'text-green-700 dark:text-green-400',
  },
  conditional_go: {
    label: 'CONDITIONAL GO',
    bg: 'bg-amber-100 dark:bg-amber-900/40',
    text: 'text-amber-700 dark:text-amber-400',
  },
  no_go: {
    label: 'NO-GO',
    bg: 'bg-red-100 dark:bg-red-900/40',
    text: 'text-red-700 dark:text-red-400',
  },
}

export default function ExecutiveSummaryPanel() {
  const { result, isLoading, error, generate } = useExecutiveSummary()
  const toast = useToast()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleGenerate = async () => {
    await generate()
    toast.success('경영진 요약 개선 완료 — 미리보기에 반영되었습니다.')
  }

  if (!result && !isLoading && !error) {
    return (
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">경영진 요약</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              전체 PRD를 1페이지 경영진 보고서로 자동 요약
            </p>
          </div>
          <button
            onClick={handleGenerate}
            className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            요약 생성
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* 헤더 */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">경영진 요약</h3>
          {result && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${REC_STYLES[result.recommendation].bg} ${REC_STYLES[result.recommendation].text}`}>
              {REC_STYLES[result.recommendation].label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleGenerate() }}
            disabled={isLoading}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline disabled:opacity-50"
          >
            개선
          </button>
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      </div>

      {/* 로딩 */}
      {isLoading && (
        <div className="p-8 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">경영진 요약을 생성하고 있습니다...</p>
        </div>
      )}

      {/* 에러 */}
      {error && (
        <div className="p-4 mx-4 mb-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* 결과 */}
      {result && !isCollapsed && (
        <div className="p-4 pt-0 space-y-4">
          {/* 타이틀 */}
          <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
            {result.title}
          </h4>

          {/* 기회 / 전략 / 경쟁우위 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900">
              <div className="flex items-center gap-1.5 mb-1.5">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">시장 기회</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{result.opportunity}</p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-100 dark:border-purple-900">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-semibold text-purple-700 dark:text-purple-400">핵심 전략</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{result.strategy}</p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-100 dark:border-emerald-900">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">경쟁 우위</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{result.competitiveAdvantage}</p>
            </div>
          </div>

          {/* 핵심 수치 */}
          {result.keyMetrics?.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {result.keyMetrics.map((m, i) => (
                <div key={i} className="flex-1 min-w-[140px] p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{m.label}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-0.5">{m.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* 리스크 */}
          {result.risks?.length > 0 && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-100 dark:border-amber-900">
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">주요 리스크</span>
              </div>
              <ul className="space-y-1">
                {result.risks.map((r, i) => (
                  <li key={i} className="text-sm text-gray-700 dark:text-gray-300">• {r}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Go/No-Go 판단 */}
          <div className={`p-3 rounded-lg border ${REC_STYLES[result.recommendation].bg} border-gray-200 dark:border-gray-700`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-sm font-bold ${REC_STYLES[result.recommendation].text}`}>
                의사결정 권고: {REC_STYLES[result.recommendation].label}
              </span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">{result.recommendationReason}</p>
          </div>
        </div>
      )}
    </div>
  )
}
