import { renderHook, act } from '@testing-library/react'
import React from 'react'
import { useExecutiveSummary } from '../useExecutiveSummary'
import { StrategyProvider, useStrategy } from '../useStrategyDocument'
import { SettingsProvider } from '../useSettings'
import { AuthProvider } from '../useAuth'
import { ToastProvider } from '../useToast'
import { callAI, parseJsonResponse } from '../../services/aiService'

vi.mock('../../services/aiService', () => ({
  callAI: vi.fn(),
  parseJsonResponse: vi.fn(),
}))

vi.mock('../../utils/retry', () => ({
  withRetry: vi.fn((fn: () => Promise<unknown>) => fn()),
}))

const MOCK_SUMMARY = {
  title: 'AI 예지보전 플랫폼 — 제조업 디지털 전환의 핵심',
  opportunity: '제조업 예지보전 시장은 연 15% 성장 중',
  strategy: 'B2B SaaS 모델로 중견 제조업체 타겟',
  competitiveAdvantage: 'AI 알고리즘 기반 장비 고장 예측',
  keyMetrics: [
    { label: 'TAM', value: '5조원' },
    { label: '목표 점유율', value: '3%' },
  ],
  risks: ['기술 성숙도 부족', '고객 확보 난이도'],
  recommendation: 'conditional_go',
  recommendationReason: '기술 검증 후 단계적 진입 권장',
}

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
        in: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
      upsert: vi.fn().mockReturnValue({ then: vi.fn() }),
      insert: vi.fn().mockReturnValue({ then: vi.fn() }),
    }),
  },
}))

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <SettingsProvider>
          <StrategyProvider>{children}</StrategyProvider>
        </SettingsProvider>
      </ToastProvider>
    </AuthProvider>
  )
}

describe('useExecutiveSummary', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    vi.mocked(callAI).mockResolvedValue(JSON.stringify(MOCK_SUMMARY))
    vi.mocked(parseJsonResponse).mockReturnValue(MOCK_SUMMARY)
  })

  it('초기 상태: result null, isLoading false, error null', () => {
    const { result } = renderHook(() => useExecutiveSummary(), { wrapper: Wrapper })
    expect(result.current.result).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('generate 함수를 제공한다', () => {
    const { result } = renderHook(() => useExecutiveSummary(), { wrapper: Wrapper })
    expect(typeof result.current.generate).toBe('function')
  })

  it('API 키 없으면 에러를 설정한다', async () => {
    const { result } = renderHook(() => useExecutiveSummary(), { wrapper: Wrapper })

    await act(async () => {
      await result.current.generate()
    })

    if (result.current.error) {
      expect(result.current.error).toContain('API 키')
      expect(callAI).not.toHaveBeenCalled()
    }
  })

  it('API 키가 있으면 AI를 호출하고 Context에 저장한다', async () => {
    localStorage.setItem('strategy-analyzer:apiKey', 'sk-or-test-key')

    const { result } = renderHook(
      () => {
        const strategy = useStrategy()
        const exec = useExecutiveSummary()
        return { strategy, exec }
      },
      { wrapper: Wrapper }
    )

    act(() => result.current.strategy.initDocument('테스트'))

    await act(async () => {
      await result.current.exec.generate()
    })

    expect(callAI).toHaveBeenCalled()
    expect(result.current.exec.result).toEqual(MOCK_SUMMARY)
    // Context에도 저장되었는지 확인
    expect(result.current.strategy.state.executiveSummary).toEqual(MOCK_SUMMARY)
    expect(result.current.exec.isLoading).toBe(false)
  })

  it('AI 호출 실패 시 에러를 설정한다', async () => {
    localStorage.setItem('strategy-analyzer:apiKey', 'sk-or-test-key')
    vi.mocked(callAI).mockRejectedValueOnce(new Error('서버 오류'))

    const { result } = renderHook(
      () => {
        const strategy = useStrategy()
        const exec = useExecutiveSummary()
        return { strategy, exec }
      },
      { wrapper: Wrapper }
    )

    act(() => result.current.strategy.initDocument('테스트'))

    await act(async () => {
      await result.current.exec.generate()
    })

    expect(result.current.exec.error).toBeTruthy()
    expect(result.current.exec.isLoading).toBe(false)
  })

  it('응답에 title/recommendation 없으면 검증 실패', async () => {
    localStorage.setItem('strategy-analyzer:apiKey', 'sk-or-test-key')
    vi.mocked(parseJsonResponse).mockReturnValueOnce({ noTitle: true } as never)

    const { result } = renderHook(
      () => {
        const strategy = useStrategy()
        const exec = useExecutiveSummary()
        return { strategy, exec }
      },
      { wrapper: Wrapper }
    )

    act(() => result.current.strategy.initDocument('테스트'))

    await act(async () => {
      await result.current.exec.generate()
    })

    expect(result.current.exec.error).toBeTruthy()
  })
})
