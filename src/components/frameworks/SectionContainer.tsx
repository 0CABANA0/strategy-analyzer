import React from 'react'
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
import { Sparkles, Loader2 } from 'lucide-react'
import { useAiGeneration } from '../../hooks/useAiGeneration'
import GenerationProgress from '../common/GenerationProgress'

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
  const { generateAll, isGeneratingAny, currentGenerating, generatingSet } = useAiGeneration()
  const section = SECTIONS.find((s) => s.number === stepNumber)

  if (!section) return null

  const frameworkIds = section.frameworks

  // 현재 섹션에서 생성 중인 프레임워크 수 계산
  const sectionGeneratingIds = frameworkIds.filter((id: string) => generatingSet.has(id))
  const sectionCompletedCount = frameworkIds.filter(
    (id: string) => state?.frameworks[id]?.status === 'completed'
  ).length
  const isSectionGenerating = sectionGeneratingIds.length > 0

  return (
    <div>
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
            </>
          )}
        </button>
        {isSectionGenerating && (
          <GenerationProgress
            completedCount={sectionCompletedCount}
            totalCount={frameworkIds.length}
            currentFrameworkId={currentGenerating}
          />
        )}
      </div>

      {/* 프레임워크 카드 그리드 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {frameworkIds.map((fId: string) => {
          const Component = COMPONENT_MAP[fId]
          if (!Component) return null
          return <Component key={fId} />
        })}
      </div>
    </div>
  )
}
