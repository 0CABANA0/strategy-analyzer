import { useCallback } from 'react'
import { TOTAL_STEPS } from '../data/sectionDefinitions'
import { useStrategy } from './useStrategyDocument'
import type { StepProgress } from '../types'

interface UseWizardReturn {
  currentStep: number
  totalSteps: number
  canGoNext: boolean
  canGoPrev: boolean
  goNext: () => void
  goPrev: () => void
  goToStep: (step: number) => void
  getStepProgress: (stepNumber: number) => StepProgress
}

export function useWizard(): UseWizardReturn {
  const { state, setStep, getStepProgress } = useStrategy()
  const currentStep = state?.currentStep ?? 1

  const canGoNext = currentStep < TOTAL_STEPS
  const canGoPrev = currentStep > 1

  const goNext = useCallback(() => {
    if (canGoNext) setStep(currentStep + 1)
  }, [canGoNext, currentStep, setStep])

  const goPrev = useCallback(() => {
    if (canGoPrev) setStep(currentStep - 1)
  }, [canGoPrev, currentStep, setStep])

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= TOTAL_STEPS) setStep(step)
  }, [setStep])

  return {
    currentStep,
    totalSteps: TOTAL_STEPS,
    canGoNext,
    canGoPrev,
    goNext,
    goPrev,
    goToStep,
    getStepProgress,
  }
}
