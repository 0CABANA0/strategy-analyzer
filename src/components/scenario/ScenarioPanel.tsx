/** 시나리오 분기 패널 */
import { useScenario } from '../../hooks/useScenario'
import { useToast } from '../../hooks/useToast'
import { ChevronDown, ChevronUp, Loader2, Star } from 'lucide-react'
import { useState } from 'react'
import type { ScenarioStrategy, ScenarioType } from '../../types'

const TAB_STYLES: Record<ScenarioType, { active: string; label: string }> = {
  aggressive: { active: 'bg-red-600 text-white', label: '공격적 확장' },
  conservative: { active: 'bg-blue-600 text-white', label: '안정적 성장' },
  pivot: { active: 'bg-purple-600 text-white', label: '전략적 피벗' },
}

const RISK_STYLES: Record<string, string> = {
  high: 'text-red-600 dark:text-red-400',
  medium: 'text-amber-600 dark:text-amber-400',
  low: 'text-green-600 dark:text-green-400',
}

const RISK_LABELS: Record<string, string> = {
  high: '높음',
  medium: '보통',
  low: '낮음',
}

function ScenarioDetail({ scenario }: { scenario: ScenarioStrategy }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-700 dark:text-gray-300">{scenario.overview}</p>

      {/* 차이점 */}
      {scenario.keyDifferences?.length > 0 && (
        <div>
          <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">기본 전략 대비 차이점</h5>
          <ul className="space-y-1">
            {scenario.keyDifferences.map((d, i) => (
              <li key={i} className="text-sm text-gray-700 dark:text-gray-300 pl-3">• {d}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 경쟁 전략 */}
      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">경쟁 전략</h5>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{scenario.genericStrategy.strategy}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">근거: {scenario.genericStrategy.rationale}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">실행: {scenario.genericStrategy.actions}</p>
      </div>

      {/* STP + 4P */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900">
          <h5 className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1.5">STP</h5>
          <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <p><span className="font-medium">세분화:</span> {scenario.stp.segmentation}</p>
            <p><span className="font-medium">타겟팅:</span> {scenario.stp.targeting}</p>
            <p><span className="font-medium">포지셔닝:</span> {scenario.stp.positioning}</p>
          </div>
        </div>
        <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-100 dark:border-purple-900">
          <h5 className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-1.5">4P</h5>
          <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <p><span className="font-medium">제품:</span> {scenario.fourP.product}</p>
            <p><span className="font-medium">가격:</span> {scenario.fourP.price}</p>
            <p><span className="font-medium">유통:</span> {scenario.fourP.place}</p>
            <p><span className="font-medium">프로모션:</span> {scenario.fourP.promotion}</p>
          </div>
        </div>
      </div>

      {/* KPI */}
      {scenario.kpiTargets?.length > 0 && (
        <div>
          <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">KPI 목표</h5>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-1.5 px-2 text-gray-500 dark:text-gray-400 font-medium">KPI</th>
                  <th className="text-left py-1.5 px-2 text-gray-500 dark:text-gray-400 font-medium">목표</th>
                </tr>
              </thead>
              <tbody>
                {scenario.kpiTargets.map((k, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-700/50">
                    <td className="py-1.5 px-2 text-gray-700 dark:text-gray-300">{k.label}</td>
                    <td className="py-1.5 px-2 font-medium text-gray-900 dark:text-gray-100">{k.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 리스크 / ROI / 타임라인 */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[100px] p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">리스크</p>
          <p className={`text-sm font-bold ${RISK_STYLES[scenario.riskLevel]}`}>{RISK_LABELS[scenario.riskLevel]}</p>
        </div>
        <div className="flex-1 min-w-[100px] p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">예상 ROI</p>
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{scenario.expectedROI}</p>
        </div>
        <div className="flex-1 min-w-[100px] p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">타임라인</p>
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{scenario.timeline}</p>
        </div>
      </div>
    </div>
  )
}

export default function ScenarioPanel() {
  const { result, isLoading, error, generate } = useScenario()
  const toast = useToast()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState<ScenarioType>('aggressive')

  const handleGenerate = async () => {
    await generate()
    toast.success('시나리오 개선 완료 — 미리보기에 반영되었습니다.')
  }

  if (!result && !isLoading && !error) {
    return (
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">시나리오 분석</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              공격적/보수적/피벗 3가지 시나리오별 전략 비교
            </p>
          </div>
          <button
            onClick={handleGenerate}
            className="px-4 py-2 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            시나리오 생성
          </button>
        </div>
      </div>
    )
  }

  const activeScenario = result?.scenarios.find((s) => s.type === activeTab)

  return (
    <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* 헤더 */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">시나리오 분석</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleGenerate() }}
            disabled={isLoading}
            className="text-xs text-violet-600 dark:text-violet-400 hover:underline disabled:opacity-50"
          >
            개선
          </button>
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      </div>

      {/* 로딩 */}
      {isLoading && (
        <div className="p-8 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">3가지 시나리오를 생성하고 있습니다...</p>
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
          {/* 탭 */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-700/50 rounded-lg p-1">
            {(['aggressive', 'conservative', 'pivot'] as ScenarioType[]).map((type) => {
              const isActive = activeTab === type
              const isRecommended = type === result.recommendation
              return (
                <button
                  key={type}
                  onClick={() => setActiveTab(type)}
                  className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 text-sm rounded-md transition-colors ${
                    isActive
                      ? TAB_STYLES[type].active
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600/50'
                  }`}
                >
                  {isRecommended && <Star className="w-3.5 h-3.5" />}
                  {TAB_STYLES[type].label}
                </button>
              )
            })}
          </div>

          {/* 시나리오 상세 */}
          {activeScenario && <ScenarioDetail scenario={activeScenario} />}

          {/* 비교 요약 */}
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">시나리오 비교 요약</h5>
            <p className="text-sm text-gray-700 dark:text-gray-300">{result.comparison}</p>
          </div>

          {/* AI 추천 */}
          <div className="p-3 bg-violet-50 dark:bg-violet-950/20 rounded-lg border border-violet-200 dark:border-violet-800">
            <div className="flex items-center gap-1.5 mb-1">
              <Star className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span className="text-sm font-semibold text-violet-700 dark:text-violet-400">
                AI 추천: {TAB_STYLES[result.recommendation].label}
              </span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">{result.recommendationReason}</p>
          </div>
        </div>
      )}
    </div>
  )
}
