import React, { useRef, useState, lazy, Suspense, useMemo } from 'react'
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
import { FRAMEWORKS, registerCustomFramework } from '../../data/frameworkDefinitions'
import DynamicFramework from './DynamicFramework'
import { Sparkles, Loader2, Lightbulb, Zap, GripVertical, RotateCcw, PlusCircle } from 'lucide-react'
import { useAiGeneration } from '../../hooks/useAiGeneration'
import { useSettings } from '../../hooks/useSettings'
import { useFrameworkOrder } from '../../hooks/useFrameworkOrder'
import { getCustomFrameworks, type CustomFramework } from '../../utils/customFrameworks'

const CustomFrameworkEditor = lazy(() => import('./CustomFrameworkEditor'))
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
  const { generateAll, isGeneratingAny, currentGenerating, generatingSet, elapsedMs, streamingEnabled, setStreamingEnabled } = useAiGeneration()
  const { settings } = useSettings()
  const section = SECTIONS.find((s) => s.number === stepNumber)

  const [showCustomEditor, setShowCustomEditor] = useState(false)
  const [customVersion, setCustomVersion] = useState(0)

  // 이 섹션에 속하는 커스텀 프레임워크 (FRAMEWORKS에 동적 등록)
  const customFrameworks = useMemo(
    () => {
      const cfs = getCustomFrameworks().filter((cf) => cf.section === stepNumber)
      for (const cf of cfs) registerCustomFramework(cf)
      return cfs
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stepNumber, customVersion]
  )

  const allFrameworkIds = useMemo(() => {
    const base = section?.frameworks || []
    const customIds = customFrameworks.map((cf) => cf.id)
    return [...base, ...customIds]
  }, [section?.frameworks, customFrameworks])

  const { order: frameworkOrder, reorder, resetOrder, isCustomOrder } = useFrameworkOrder(
    section?.id || '', allFrameworkIds
  )
  const dragItemRef = useRef<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)

  if (!section) return null

  const frameworkIds = frameworkOrder

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
          onClick={() => setStreamingEnabled(!streamingEnabled)}
          className={`flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
            streamingEnabled
              ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-800'
              : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
          }`}
          title="스트리밍 모드: AI 응답을 실시간으로 표시"
        >
          <Zap className="w-3.5 h-3.5" />
          스트리밍
        </button>
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
      {isCustomOrder && (
        <div className="flex justify-end mb-2">
          <button
            onClick={resetOrder}
            className="flex items-center gap-1 px-2 py-1 text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="기본 순서로 복원"
          >
            <RotateCcw className="w-3 h-3" />
            순서 초기화
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {frameworkIds.map((fId: string, idx: number) => {
          const Component = COMPONENT_MAP[fId]
          const customFw = !Component ? customFrameworks.find((cf: CustomFramework) => cf.id === fId) : null
          if (!Component && !customFw) return null
          return (
            <div
              key={fId}
              draggable
              onDragStart={() => { dragItemRef.current = idx }}
              onDragOver={(e) => { e.preventDefault(); setDragOverIdx(idx) }}
              onDragLeave={() => setDragOverIdx(null)}
              onDrop={() => {
                if (dragItemRef.current !== null && dragItemRef.current !== idx) {
                  reorder(dragItemRef.current, idx)
                }
                dragItemRef.current = null
                setDragOverIdx(null)
              }}
              onDragEnd={() => { dragItemRef.current = null; setDragOverIdx(null) }}
              className={`relative group/drag ${dragOverIdx === idx ? 'ring-2 ring-primary-400 ring-offset-2 dark:ring-offset-gray-900 rounded-xl' : ''}`}
            >
              <div className="absolute -left-1 top-3 opacity-0 group-hover/drag:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10">
                <GripVertical className="w-4 h-4 text-gray-300 dark:text-gray-600" />
              </div>
              <ErrorBoundary>
                {Component ? <Component /> : <DynamicFramework framework={customFw!} />}
              </ErrorBoundary>
            </div>
          )
        })}
      </div>

      {/* 커스텀 프레임워크 추가 버튼 */}
      <div className="mt-4 flex justify-center">
        <button
          onClick={() => setShowCustomEditor(true)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-primary-500 dark:hover:text-primary-400 border border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-400 rounded-lg transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          커스텀 프레임워크 추가
        </button>
      </div>

      {showCustomEditor && (
        <Suspense fallback={null}>
          <CustomFrameworkEditor
            onClose={() => setShowCustomEditor(false)}
            onSaved={() => setCustomVersion((v) => v + 1)}
          />
        </Suspense>
      )}
    </div>
  )
}
