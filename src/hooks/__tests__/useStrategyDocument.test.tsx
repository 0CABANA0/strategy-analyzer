import { renderHook, act } from '@testing-library/react'
import React from 'react'
import { StrategyProvider, useStrategy } from '../useStrategyDocument'
import { ToastProvider } from '../useToast'

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <StrategyProvider>{children}</StrategyProvider>
    </ToastProvider>
  )
}

describe('useStrategyDocument', () => {
  beforeEach(() => localStorage.clear())

  it('creates empty document by default', () => {
    const { result } = renderHook(() => useStrategy(), { wrapper: Wrapper })
    expect(result.current.state).toBeDefined()
    expect(result.current.state.businessItem).toBe('')
  })

  it('INIT_DOCUMENT sets business item', () => {
    const { result } = renderHook(() => useStrategy(), { wrapper: Wrapper })
    act(() => result.current.initDocument('테스트 사업'))
    expect(result.current.state.businessItem).toBe('테스트 사업')
  })

  it('SET_STEP updates current step', () => {
    const { result } = renderHook(() => useStrategy(), { wrapper: Wrapper })
    act(() => result.current.setStep(3))
    expect(result.current.state.currentStep).toBe(3)
  })

  it('SET_FRAMEWORK_GENERATING changes status', () => {
    const { result } = renderHook(() => useStrategy(), { wrapper: Wrapper })
    act(() => result.current.setFrameworkGenerating('faw'))
    expect(result.current.state.frameworks.faw.status).toBe('generating')
  })

  it('SET_FRAMEWORK_DATA stores data and marks completed', () => {
    const { result } = renderHook(() => useStrategy(), { wrapper: Wrapper })
    const data = { facts: ['a'], assumptions: ['b'], whatIfs: ['c'] }
    act(() => result.current.setFrameworkData('faw', data as any))
    expect(result.current.state.frameworks.faw.status).toBe('completed')
    expect(result.current.state.frameworks.faw.data).toEqual(data)
  })

  it('SET_FRAMEWORK_ERROR stores error message', () => {
    const { result } = renderHook(() => useStrategy(), { wrapper: Wrapper })
    act(() => result.current.setFrameworkError('faw', '에러 메시지'))
    expect(result.current.state.frameworks.faw.status).toBe('error')
    expect(result.current.state.frameworks.faw.error).toBe('에러 메시지')
  })

  it('CLEAR_FRAMEWORK resets to empty', () => {
    const { result } = renderHook(() => useStrategy(), { wrapper: Wrapper })
    act(() => result.current.setFrameworkData('faw', { facts: [], assumptions: [], whatIfs: [] } as any))
    act(() => result.current.clearFramework('faw'))
    expect(result.current.state.frameworks.faw.status).toBe('empty')
    expect(result.current.state.frameworks.faw.data).toBeNull()
  })

  it('UPDATE_FRAMEWORK_FIELD updates a single field', () => {
    const { result } = renderHook(() => useStrategy(), { wrapper: Wrapper })
    act(() => result.current.setFrameworkData('faw', { facts: ['a'], assumptions: ['b'], whatIfs: ['c'] } as any))
    act(() => result.current.updateFrameworkField('faw', 'facts', ['x', 'y']))
    expect((result.current.state.frameworks.faw.data as any).facts).toEqual(['x', 'y'])
    expect((result.current.state.frameworks.faw.data as any).assumptions).toEqual(['b'])
  })

  it('LOAD_DOCUMENT replaces entire state', () => {
    const { result } = renderHook(() => useStrategy(), { wrapper: Wrapper })
    const doc = {
      ...result.current.state,
      businessItem: '로드된 문서',
      currentStep: 4,
    }
    act(() => result.current.loadDocument(doc))
    expect(result.current.state.businessItem).toBe('로드된 문서')
    expect(result.current.state.currentStep).toBe(4)
  })

  it('SET_RECOMMENDATION stores recommendation', () => {
    const { result } = renderHook(() => useStrategy(), { wrapper: Wrapper })
    const rec = { essential: [], recommended: [], optional: [] }
    act(() => result.current.setRecommendation(rec))
    expect(result.current.state.recommendation).toEqual(rec)
  })

  it('getStepProgress calculates correctly', () => {
    const { result } = renderHook(() => useStrategy(), { wrapper: Wrapper })
    const progress = result.current.getStepProgress(1)
    expect(progress.total).toBe(3) // faw, threeC, ansoff
    expect(progress.completed).toBe(0)
    expect(progress.percent).toBe(0)
  })

  it('getTotalProgress starts at zero', () => {
    const { result } = renderHook(() => useStrategy(), { wrapper: Wrapper })
    const progress = result.current.getTotalProgress()
    expect(progress.completed).toBe(0)
    expect(progress.total).toBeGreaterThan(0)
  })

  it('getFrameworkContext returns empty for first framework', () => {
    const { result } = renderHook(() => useStrategy(), { wrapper: Wrapper })
    const ctx = result.current.getFrameworkContext('faw')
    expect(Object.keys(ctx)).toHaveLength(0)
  })

  it('saves to localStorage automatically', () => {
    const { result } = renderHook(() => useStrategy(), { wrapper: Wrapper })
    act(() => result.current.initDocument('자동 저장 테스트'))
    const lastId = localStorage.getItem('strategy-analyzer:lastDocId')
    expect(lastId).toBeDefined()
    const stored = localStorage.getItem('strategy-analyzer:doc:' + lastId)
    expect(stored).toBeDefined()
    expect(JSON.parse(stored!).businessItem).toBe('자동 저장 테스트')
  })
})
