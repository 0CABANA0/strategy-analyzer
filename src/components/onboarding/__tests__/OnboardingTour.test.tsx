import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import OnboardingTour from '../OnboardingTour'

describe('OnboardingTour', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('localStorage에 onboarding-done이 없으면 투어가 렌더링된다', () => {
    render(<OnboardingTour />)

    // 800ms 딜레이 후 active가 true로 변경됨
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    // 첫 번째 스텝의 제목이 표시되어야 함
    expect(screen.getByText('사업 아이템')).toBeTruthy()
  })

  it('localStorage에 onboarding-done이 true이면 투어가 렌더링되지 않는다', () => {
    localStorage.setItem('strategy-analyzer:onboarding-done', 'true')

    render(<OnboardingTour />)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(screen.queryByText('사업 아이템')).toBeNull()
  })

  it('투어 스텝 카운터가 올바르게 표시된다', () => {
    render(<OnboardingTour />)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(screen.getByText('1 / 4')).toBeTruthy()
  })
})
