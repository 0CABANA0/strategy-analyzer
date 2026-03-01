import React from 'react'
import ErrorBoundary from '../common/ErrorBoundary'
import FawAnalysis from './FawAnalysis'
import ThreeCAnalysis from './ThreeCAnalysis'
import AnsoffMatrix from './AnsoffMatrix'
import PestAnalysis from './PestAnalysis'
import FiveForcesAnalysis from './FiveForcesAnalysis'
import IlcAnalysis from './IlcAnalysis'
import MarketAnalysis from './MarketAnalysis'
import CustomerAnalysis from './CustomerAnalysis'
import CompetitorAnalysis from './CompetitorAnalysis'
import StrategyCanvas from './StrategyCanvas'
import ValueChainAnalysis from './ValueChainAnalysis'
import SevenSAnalysis from './SevenSAnalysis'
import VrioAnalysis from './VrioAnalysis'
import SwotAnalysis from './SwotAnalysis'
import GenericStrategy from './GenericStrategy'
import StpAnalysis from './StpAnalysis'
import ErrcGrid from './ErrcGrid'
import FourPAnalysis from './FourPAnalysis'
import WbsSchedule from './WbsSchedule'
import KpiDashboard from './KpiDashboard'
import { useStrategy } from '../../hooks/useStrategyDocument'
import { SECTIONS } from '../../data/sectionDefinitions'
import { FRAMEWORKS } from '../../data/frameworkDefinitions'
import { Sparkles, Loader2, Lightbulb } from 'lucide-react'
import { useAiGeneration } from '../../hooks/useAiGeneration'
import { useSettings } from '../../hooks/useSettings'
import GenerationProgress from '../common/GenerationProgress'
import { getEstimatedTotalDuration } from '../../utils/generationMetrics'

/** ms → "약 N초" 또는 "약 N분 N초" 형식 */
function formatEstimate(ms: number): string {
  const totalSec = Math.round(ms / 1000)
  if (totalSec < 10) return '약 10초'
  if (totalSec < 60) return `약 ${Math.round(totalSec / 5) * 5}초`
  const min = Math.floor(totalSec / 60)
  const sec = Math.round((totalSec % 60) / 10) * 10
  return sec > 0 ? `약 ${min}분 ${sec}초` : `약 ${min}분`
}

const COMPONENT_MAP: Record<string, React.ComponentType> = {
  faw: FawAnalysis,
  threeC: ThreeCAnalysis,
  ansoff: AnsoffMatrix,
  pest: PestAnalysis,
  fiveForces: FiveForcesAnalysis,
  ilc: IlcAnalysis,
  marketAnalysis: MarketAnalysis,
  customerAnalysis: CustomerAnalysis,
  competitorAnalysis: CompetitorAnalysis,
  strategyCanvas: StrategyCanvas,
  valueChain: ValueChainAnalysis,
  sevenS: SevenSAnalysis,
  vrio: VrioAnalysis,
  swot: SwotAnalysis,
  genericStrategy: GenericStrategy,
  stp: StpAnalysis,
  errc: ErrcGrid,
  fourP: FourPAnalysis,
  wbs: WbsSchedule,
  kpi: KpiDashboard,
}

interface SectionContainerProps {
  stepNumber: number
}

export default function SectionContainer({ stepNumber }: SectionContainerProps) {
  const { state } = useStrategy()
  const { generateAll, isGeneratingAny, currentGenerating, generatingSet, elapsedMs } = useAiGeneration()
  const { settings } = useSettings()
  const section = SECTIONS.find((s) => s.number === stepNumber)

  if (!section) return null

  const frameworkIds = section.frameworks

  // 현재 섹션에서 생성 중인 프레임워크 수 계산
  const sectionGeneratingIds = frameworkIds.filter((id: string) => generatingSet.has(id))
  const sectionCompletedCount = frameworkIds.filter(
    (id: string) => state?.frameworks[id]?.status === 'completed'
  ).length
  const isSectionGenerating = sectionGeneratingIds.length > 0

  // 미생성 프레임워크 (예상 시간 계산 대상)
  const uncompletedIds = frameworkIds.filter(
    (id: string) => state?.frameworks[id]?.status !== 'completed'
  )
  const estimatedTotalMs = !isSectionGenerating && uncompletedIds.length > 0
    ? getEstimatedTotalDuration(uncompletedIds, settings.model)
    : 0

  // GenerationProgress용: 현재 생성 중인 것 다음의 대기 프레임워크
  const remainingIds = currentGenerating
    ? frameworkIds.filter(
        (id: string) => id !== currentGenerating && !generatingSet.has(id) && state?.frameworks[id]?.status !== 'completed'
      )
    : []

  // 기획배경(Step 1)에서 FAW가 아직 완료되지 않았으면 기본 추천 배너 표시
  const fawNotCompleted = state?.frameworks['faw']?.status !== 'completed'
  const showDefaultGuide = stepNumber === 1 && fawNotCompleted
  const defaultFramework = showDefaultGuide ? FRAMEWORKS['faw'] : null

  return (
    <div>
      {/* 기획배경 기본 추천 가이드 */}
      {showDefaultGuide && defaultFramework && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div className="text-sm">
            <span className="font-medium text-amber-800 dark:text-amber-300">추천: </span>
            <span className="text-amber-700 dark:text-amber-400">
              <strong>{defaultFramework.name}</strong>({defaultFramework.fullName})부터 시작하세요.
              시장 팩트에서 가정을 도출하고, What-if 시나리오로 기회를 발견하는 기획의 출발점입니다.
            </span>
          </div>
        </div>
      )}

      {/* 전체 생성 버튼 + 진행 상황 */}
      <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:justify-end">
        <button
          onClick={() => generateAll(frameworkIds)}
          disabled={isGeneratingAny}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          {isGeneratingAny ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              생성 중...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              이 섹션 전체 AI 생성
              {estimatedTotalMs > 0 && (
                <span className="font-normal opacity-75 ml-0.5">· {formatEstimate(estimatedTotalMs)}</span>
              )}
            </>
          )}
        </button>
        {isSectionGenerating && (
          <GenerationProgress
            completedCount={sectionCompletedCount}
            totalCount={frameworkIds.length}
            currentFrameworkId={currentGenerating}
            elapsedMs={elapsedMs}
            remainingFrameworkIds={remainingIds}
            model={settings.model}
          />
        )}
      </div>

      {/* 프레임워크 카드 그리드 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {frameworkIds.map((fId: string) => {
          const Component = COMPONENT_MAP[fId]
          if (!Component) return null
          return (
            <ErrorBoundary key={fId}>
              <Component />
            </ErrorBoundary>
          )
        })}
      </div>
    </div>
  )
}
