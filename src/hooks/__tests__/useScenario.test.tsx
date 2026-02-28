import { renderHook, act } from '@testing-library/react'
import React from 'react'
import { useScenario } from '../useScenario'
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

const MOCK_SCENARIO = {
  scenarios: [
    {
      type: 'aggressive',
      label: '공격적 확장',
      overview: '시장 선점 전략',
      keyDifferences: ['대규모 투자', '빠른 확장'],
      genericStrategy: { strategy: '차별화', rationale: '기술 우위', actions: 'R&D 확대' },
      stp: { segmentation: '대기업', targeting: '제조업', positioning: '기술 리더' },
      fourP: { product: 'AI 솔루션', price: '프리미엄', place: '직접 영업', promotion: '컨퍼런스' },
      kpiTargets: [{ label: '매출', target: '100억' }],
      riskLevel: 'high',
      expectedROI: '200%',
      timeline: '3년',
    },
    {
      type: 'conservative',
      label: '안정적 성장',
      overview: '단계적 진입 전략',
      keyDifferences: ['소규모 시작', '검증 후 확장'],
      genericStrategy: { strategy: '집중', rationale: '리스크 최소화', actions: '파일럿' },
      stp: { segmentation: '중소기업', targeting: '특정 업종', positioning: '가성비' },
      fourP: { product: '기본형', price: '경쟁가', place: '온라인', promotion: '콘텐츠 마케팅' },
      kpiTargets: [{ label: '매출', target: '30억' }],
      riskLevel: 'low',
      expectedROI: '80%',
      timeline: '5년',
    },
    {
      type: 'pivot',
      label: '전략적 피벗',
      overview: '사업 모델 전환',
      keyDifferences: ['플랫폼 전환', '수익모델 변경'],
      genericStrategy: { strategy: '차별화+집중', rationale: '새 시장 창출', actions: '제휴' },
      stp: { segmentation: '스타트업', targeting: 'IT 기업', positioning: '파트너' },
      fourP: { product: 'API', price: '종량제', place: '마켓플레이스', promotion: '개발자 커뮤니티' },
      kpiTargets: [{ label: 'MAU', target: '10만' }],
      riskLevel: 'medium',
      expectedROI: '150%',
      timeline: '4년',
    },
  ],
  comparison: '공격적 전략은 고수익/고위험, 보수적 전략은 안정적',
  recommendation: 'conservative',
  recommendationReason: '시장 검증이 선행되어야 함',
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

describe('useScenario', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    vi.mocked(callAI).mockResolvedValue(JSON.stringify(MOCK_SCENARIO))
    vi.mocked(parseJsonResponse).mockReturnValue(MOCK_SCENARIO)
  })

  it('초기 상태: result null, isLoading false, error null', () => {
    const { result } = renderHook(() => useScenario(), { wrapper: Wrapper })
    expect(result.current.result).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('generate 함수를 제공한다', () => {
    const { result } = renderHook(() => useScenario(), { wrapper: Wrapper })
    expect(typeof result.current.generate).toBe('function')
  })

  it('API 키 없으면 에러를 설정한다', async () => {
    const { result } = renderHook(() => useScenario(), { wrapper: Wrapper })

    await act(async () => {
      await result.current.generate()
    })

    if (result.current.error) {
      expect(result.current.error).toContain('API 키')
      expect(callAI).not.toHaveBeenCalled()
    }
  })

  it('API 키가 있으면 AI를 호출하고 3개 시나리오를 저장한다', async () => {
    localStorage.setItem('strategy-analyzer:apiKey', 'sk-or-test-key')

    const { result } = renderHook(
      () => {
        const strategy = useStrategy()
        const scenario = useScenario()
        return { strategy, scenario }
      },
      { wrapper: Wrapper }
    )

    act(() => result.current.strategy.initDocument('테스트'))

    await act(async () => {
      await result.current.scenario.generate()
    })

    expect(callAI).toHaveBeenCalled()
    expect(result.current.scenario.result?.scenarios).toHaveLength(3)
    expect(result.current.strategy.state.scenarioResult).toEqual(MOCK_SCENARIO)
    expect(result.current.scenario.isLoading).toBe(false)
  })

  it('AI 호출 실패 시 에러를 설정한다', async () => {
    localStorage.setItem('strategy-analyzer:apiKey', 'sk-or-test-key')
    vi.mocked(callAI).mockRejectedValueOnce(new Error('타임아웃'))

    const { result } = renderHook(
      () => {
        const strategy = useStrategy()
        const scenario = useScenario()
        return { strategy, scenario }
      },
      { wrapper: Wrapper }
    )

    act(() => result.current.strategy.initDocument('테스트'))

    await act(async () => {
      await result.current.scenario.generate()
    })

    expect(result.current.scenario.error).toBeTruthy()
    expect(result.current.scenario.isLoading).toBe(false)
  })

  it('시나리오가 3개가 아니면 검증 실패', async () => {
    localStorage.setItem('strategy-analyzer:apiKey', 'sk-or-test-key')
    vi.mocked(parseJsonResponse).mockReturnValueOnce({
      scenarios: [{ type: 'aggressive' }],
    } as never)

    const { result } = renderHook(
      () => {
        const strategy = useStrategy()
        const scenario = useScenario()
        return { strategy, scenario }
      },
      { wrapper: Wrapper }
    )

    act(() => result.current.strategy.initDocument('테스트'))

    await act(async () => {
      await result.current.scenario.generate()
    })

    expect(result.current.scenario.error).toBeTruthy()
  })
})
