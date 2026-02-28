import { useWizard } from '../../hooks/useWizard'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Eye, Pencil } from 'lucide-react'

export default function StepNavigation() {
  const { canGoPrev, canGoNext, goPrev, goNext, currentStep, totalSteps } = useWizard()
  const navigate = useNavigate()

  const isFirstStep = currentStep === 1

  return (
    <div className="flex items-center justify-between pt-6 pb-4 border-t border-gray-200 dark:border-gray-700 mt-8">
      {isFirstStep ? (
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20"
        >
          <Pencil className="w-3.5 h-3.5" />
          아이템 수정
        </button>
      ) : (
        <button
          onClick={goPrev}
          disabled={!canGoPrev}
          className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          <ChevronLeft className="w-4 h-4" />
          이전
        </button>
      )}

      <span className="text-xs text-gray-400 dark:text-gray-500">
        Step {currentStep} / {totalSteps}
      </span>

      {canGoNext ? (
        <button
          onClick={goNext}
          className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
        >
          다음
          <ChevronRight className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={() => navigate('/preview')}
          className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
        >
          <Eye className="w-4 h-4" />
          미리보기
        </button>
      )}
    </div>
  )
}
