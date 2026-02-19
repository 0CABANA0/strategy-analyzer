import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from '../../hooks/useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('localStorage에 값이 없으면 초기값을 반환한다', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', '초기값'))

    expect(result.current[0]).toBe('초기값')
  })

  it('setValue로 값을 업데이트할 수 있다', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', '초기값'))

    act(() => {
      result.current[1]('새로운 값')
    })

    expect(result.current[0]).toBe('새로운 값')
  })

  it('localStorage에 저장된 값을 재렌더링 시 복원한다', () => {
    // 먼저 값을 저장
    localStorage.setItem('strategy-analyzer:test-key', JSON.stringify('저장된 값'))

    const { result } = renderHook(() => useLocalStorage('test-key', '초기값'))

    expect(result.current[0]).toBe('저장된 값')
  })

  it('객체 타입도 저장/복원할 수 있다', () => {
    const initialObj = { name: '테스트', count: 0 }
    const { result } = renderHook(() =>
      useLocalStorage('obj-key', initialObj)
    )

    expect(result.current[0]).toEqual(initialObj)

    act(() => {
      result.current[1]({ name: '업데이트', count: 5 })
    })

    expect(result.current[0]).toEqual({ name: '업데이트', count: 5 })
  })

  it('remove 함수로 값을 삭제하면 초기값으로 복원된다', () => {
    const { result } = renderHook(() => useLocalStorage('remove-key', '초기값'))

    act(() => {
      result.current[1]('변경됨')
    })
    expect(result.current[0]).toBe('변경됨')

    act(() => {
      result.current[2]() // remove
    })
    expect(result.current[0]).toBe('초기값')
  })

  it('함수형 업데이트를 지원한다', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 0))

    act(() => {
      result.current[1]((prev) => prev + 1)
    })
    expect(result.current[0]).toBe(1)

    act(() => {
      result.current[1]((prev) => prev + 10)
    })
    expect(result.current[0]).toBe(11)
  })
})
