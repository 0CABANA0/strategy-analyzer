import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from '../../hooks/useToast'
import { StrategyProvider } from '../../hooks/useStrategyDocument'
import { SettingsProvider } from '../../hooks/useSettings'
import { useWizard } from '../../hooks/useWizard'
import { TOTAL_STEPS } from '../../data/sectionDefinitions'

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <ToastProvider>
        <SettingsProvider>
          <StrategyProvider>
            {children}
          </StrategyProvider>
        </SettingsProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

describe('useWizard', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('초기 step은 1이다', () => {
    const { result } = renderHook(() => useWizard(), { wrapper: AllProviders })

    expect(result.current.currentStep).toBe(1)
    expect(result.current.totalSteps).toBe(TOTAL_STEPS)
  })

  it('goToStep으로 스텝을 변경할 수 있다', () => {
    const { result } = renderHook(() => useWizard(), { wrapper: AllProviders })

    act(() => {
      result.current.goToStep(3)
    })

    expect(result.current.currentStep).toBe(3)
  })

  it('1보다 작은 스텝으로 이동할 수 없다', () => {
    const { result } = renderHook(() => useWizard(), { wrapper: AllProviders })

    act(() => {
      result.current.goToStep(0)
    })
    expect(result.current.currentStep).toBe(1)

    act(() => {
      result.current.goToStep(-1)
    })
    expect(result.current.currentStep).toBe(1)
  })

  it('최대 스텝을 초과할 수 없다', () => {
    const { result } = renderHook(() => useWizard(), { wrapper: AllProviders })

    act(() => {
      result.current.goToStep(TOTAL_STEPS + 1)
    })
    expect(result.current.currentStep).toBe(1) // 변경되지 않음
  })

  it('goNext로 다음 스텝으로 이동한다', () => {
    const { result } = renderHook(() => useWizard(), { wrapper: AllProviders })

    expect(result.current.canGoNext).toBe(true)
    expect(result.current.canGoPrev).toBe(false)

    act(() => {
      result.current.goNext()
    })

    expect(result.current.currentStep).toBe(2)
    expect(result.current.canGoPrev).toBe(true)
  })

  it('goPrev로 이전 스텝으로 이동한다', () => {
    const { result } = renderHook(() => useWizard(), { wrapper: AllProviders })

    act(() => {
      result.current.goToStep(3)
    })

    act(() => {
      result.current.goPrev()
    })

    expect(result.current.currentStep).toBe(2)
  })

  it('첫 번째 스텝에서 goPrev는 동작하지 않는다', () => {
    const { result } = renderHook(() => useWizard(), { wrapper: AllProviders })

    expect(result.current.currentStep).toBe(1)

    act(() => {
      result.current.goPrev()
    })

    expect(result.current.currentStep).toBe(1)
  })

  it('마지막 스텝에서 goNext는 동작하지 않는다', () => {
    const { result } = renderHook(() => useWizard(), { wrapper: AllProviders })

    act(() => {
      result.current.goToStep(TOTAL_STEPS)
    })
    expect(result.current.currentStep).toBe(TOTAL_STEPS)
    expect(result.current.canGoNext).toBe(false)

    act(() => {
      result.current.goNext()
    })

    expect(result.current.currentStep).toBe(TOTAL_STEPS)
  })
})
