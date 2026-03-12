import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFrameworkOrder } from '../useFrameworkOrder'

const STORAGE_KEY = 'strategy-analyzer:framework-order'
const defaultOrder = ['swot', 'pestel', 'porter5']

describe('useFrameworkOrder', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('초기 상태에서 defaultOrder를 반환하고 isCustomOrder는 false이다', () => {
    const { result } = renderHook(() => useFrameworkOrder('section1', defaultOrder))

    expect(result.current.order).toEqual(defaultOrder)
    expect(result.current.isCustomOrder).toBe(false)
  })

  it('reorder(0, 2)로 순서를 변경하면 isCustomOrder가 true가 된다', () => {
    const { result } = renderHook(() => useFrameworkOrder('section1', defaultOrder))

    act(() => {
      result.current.reorder(0, 2)
    })

    expect(result.current.order).toEqual(['pestel', 'porter5', 'swot'])
    expect(result.current.isCustomOrder).toBe(true)
  })

  it('resetOrder 호출 시 defaultOrder로 복원되고 isCustomOrder가 false가 된다', () => {
    const { result } = renderHook(() => useFrameworkOrder('section1', defaultOrder))

    act(() => {
      result.current.reorder(0, 2)
    })
    expect(result.current.isCustomOrder).toBe(true)

    act(() => {
      result.current.resetOrder()
    })

    expect(result.current.order).toEqual(defaultOrder)
    expect(result.current.isCustomOrder).toBe(false)
  })

  it('reorder 후 localStorage에 저장된다', () => {
    const { result } = renderHook(() => useFrameworkOrder('section1', defaultOrder))

    act(() => {
      result.current.reorder(0, 1)
    })

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    expect(stored['section1']).toBeDefined()
    expect(stored['section1']).toEqual(result.current.order)
  })

  it('같은 인덱스로 reorder하면 순서가 변경되지 않는다', () => {
    const { result } = renderHook(() => useFrameworkOrder('section1', defaultOrder))

    act(() => {
      result.current.reorder(1, 1)
    })

    expect(result.current.order).toEqual(defaultOrder)
    expect(result.current.isCustomOrder).toBe(false)
  })
})
