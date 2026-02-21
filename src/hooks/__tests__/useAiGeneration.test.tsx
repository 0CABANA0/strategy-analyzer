import { renderHook, act } from '@testing-library/react'
import React from 'react'
import { useAiGeneration } from '../useAiGeneration'
import { StrategyProvider, useStrategy } from '../useStrategyDocument'
import { SettingsProvider } from '../useSettings'
import { AuthProvider } from '../useAuth'
import { ToastProvider } from '../useToast'

// Mock services
vi.mock('../../services/aiService', () => ({
  callAI: vi.fn().mockResolvedValue('{"facts":["a"],"assumptions":["b"],"whatIfs":["c"]}'),
  parseJsonResponse: vi.fn().mockReturnValue({ facts: ['a'], assumptions: ['b'], whatIfs: ['c'] }),
}))

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
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

describe('useAiGeneration', () => {
  beforeEach(() => localStorage.clear())

  it('starts with no generation', () => {
    const { result } = renderHook(() => useAiGeneration(), { wrapper: Wrapper })
    expect(result.current.isGeneratingAny).toBe(false)
    expect(result.current.currentGenerating).toBeNull()
  })

  it('provides generate function', () => {
    const { result } = renderHook(() => useAiGeneration(), { wrapper: Wrapper })
    expect(typeof result.current.generate).toBe('function')
  })

  it('provides generateAll function', () => {
    const { result } = renderHook(() => useAiGeneration(), { wrapper: Wrapper })
    expect(typeof result.current.generateAll).toBe('function')
  })

  it('provides cancel function', () => {
    const { result } = renderHook(() => useAiGeneration(), { wrapper: Wrapper })
    expect(typeof result.current.cancel).toBe('function')
  })

  it('does nothing when no businessItem', async () => {
    const { result } = renderHook(() => useAiGeneration(), { wrapper: Wrapper })
    await act(async () => {
      await result.current.generate('faw')
    })
    expect(result.current.isGeneratingAny).toBe(false)
  })

  it('uses sample data when no API key', async () => {
    const { result } = renderHook(() => {
      const strategy = useStrategy()
      const ai = useAiGeneration()
      return { strategy, ai }
    }, { wrapper: Wrapper })

    act(() => result.current.strategy.initDocument('테스트'))

    await act(async () => {
      await result.current.ai.generate('faw')
    })

    // 샘플 데이터 사용 후 completed 또는 error 상태
    const status = result.current.strategy.state.frameworks.faw.status
    expect(['completed', 'error']).toContain(status)
  })

  it('generatingSet is empty after completion', async () => {
    const { result } = renderHook(() => {
      const strategy = useStrategy()
      const ai = useAiGeneration()
      return { strategy, ai }
    }, { wrapper: Wrapper })

    act(() => result.current.strategy.initDocument('테스트'))

    await act(async () => {
      await result.current.ai.generate('faw')
    })

    expect(result.current.ai.generatingSet.size).toBe(0)
  })
})
