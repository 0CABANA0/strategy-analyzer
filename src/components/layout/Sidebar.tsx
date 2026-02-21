import { SECTIONS } from '../../data/sectionDefinitions'
import { FRAMEWORKS } from '../../data/frameworkDefinitions'
import { useStrategy } from '../../hooks/useStrategyDocument'
import { useWizard } from '../../hooks/useWizard'
import { CheckCircle2, Circle, Loader2, Star, ThumbsUp } from 'lucide-react'
import { getRecommendationInfo } from '../../utils/recommendation'

const LEVEL_BADGE = {
  essential: { icon: Star, className: 'text-red-500', title: '필수' },
  recommended: { icon: ThumbsUp, className: 'text-blue-500', title: '권장' },
  optional: null,
} as const

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { state, getStepProgress } = useStrategy()
  const { currentStep, goToStep } = useWizard()

  if (!state) return null

  const recommendation = state.recommendation

  const handleGoToStep = (step: number) => {
    goToStep(step)
    onNavigate?.()
  }

  return (
    <div className="space-y-1">
        {SECTIONS.map((section) => {
          const progress = getStepProgress(section.number)
          const isActive = currentStep === section.number
          const isComplete = progress.percent === 100

          return (
            <div key={section.number}>
              <button
                onClick={() => handleGoToStep(section.number)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-medium dark:bg-primary-900/30 dark:text-primary-400'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 mr-1.5">
                      {section.number}.
                    </span>
                    {section.title}
                  </span>
                  {isComplete && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                </div>
                {isActive && (
                  <div className="mt-1.5 w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all duration-300"
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                )}
              </button>

              {isActive && (
                <div className="ml-4 mt-1 space-y-0.5">
                  {section.frameworks.map((fId: string) => {
                    const fw = FRAMEWORKS[fId]
                    const fState = state.frameworks[fId]
                    const recInfo = getRecommendationInfo(fId, recommendation)
                    const badge = recInfo ? LEVEL_BADGE[recInfo.level] : null
                    const score = recInfo?.item.score

                    return (
                      <div
                        key={fId}
                        className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-500 dark:text-gray-400"
                      >
                        {fState?.status === 'completed' ? (
                          <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" aria-hidden="true" />
                        ) : fState?.status === 'generating' ? (
                          <Loader2 className="w-3 h-3 text-primary-500 animate-spin shrink-0" aria-hidden="true" />
                        ) : (
                          <Circle className="w-3 h-3 text-gray-300 dark:text-gray-600 shrink-0" aria-hidden="true" />
                        )}
                        <span className="truncate flex-1">{fw.name}</span>
                        {badge && (
                          <span className={`shrink-0 flex items-center gap-0.5 ${badge.className}`}>
                            <badge.icon className="w-3 h-3" />
                            {score != null && score < 100 && (
                              <span className="text-[10px]">{score}%</span>
                            )}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
  )
}

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-18">
        <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-2">
          목차
        </h3>
        <SidebarContent />
      </div>
    </aside>
  )
}
