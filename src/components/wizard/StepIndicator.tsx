import { SECTIONS } from '../../data/sectionDefinitions'
import { useWizard } from '../../hooks/useWizard'
import { useStrategy } from '../../hooks/useStrategyDocument'
export default function StepIndicator() {
  const { currentStep, goToStep } = useWizard()
  const { getStepProgress } = useStrategy()

  return (
    <div className="flex items-center justify-center gap-0.5 sm:gap-1 py-4 overflow-x-auto">
      {SECTIONS.map((section, idx: number) => {
        const progress = getStepProgress(section.number)
        const isActive = currentStep === section.number
        const isComplete = progress.percent === 100
        const isPast = section.number < currentStep

        return (
          <div key={section.number} className="flex items-center">
            <button
              onClick={() => goToStep(section.number)}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                isActive
                  ? 'bg-primary-600 text-white shadow-md'
                  : isComplete
                    ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-800/30'
                    : isPast
                      ? 'bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:hover:bg-gray-700'
              }`}
            >
              <span className="w-4 h-4 flex items-center justify-center rounded-full bg-white/20 text-[10px]">
                {section.number}
              </span>
              <span className="hidden sm:inline">{section.title}</span>
            </button>
            {idx < SECTIONS.length - 1 && (
              <div className={`w-3 sm:w-6 h-0.5 mx-0.5 rounded shrink-0 ${
                isPast || isComplete ? 'bg-primary-300 dark:bg-primary-700' : 'bg-gray-200 dark:bg-gray-700'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
