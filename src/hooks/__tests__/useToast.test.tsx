import { renderHook, act } from '@testing-library/react'
import { ToastProvider, useToast } from '../useToast'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
)

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('success 토스트 추가', () => {
    const { result } = renderHook(() => useToast(), { wrapper })
    act(() => result.current.success('저장됨'))
    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].type).toBe('success')
    expect(result.current.toasts[0].message).toBe('저장됨')
  })

  it('error 토스트 추가', () => {
    const { result } = renderHook(() => useToast(), { wrapper })
    act(() => result.current.error('오류 발생'))
    expect(result.current.toasts[0].type).toBe('error')
  })

  it('최대 5개까지만 유지', () => {
    const { result } = renderHook(() => useToast(), { wrapper })
    act(() => {
      for (let i = 0; i < 7; i++) {
        result.current.info(`메시지 ${i}`)
      }
    })
    expect(result.current.toasts.length).toBeLessThanOrEqual(5)
  })

  it('자동 제거 (3초 후)', () => {
    const { result } = renderHook(() => useToast(), { wrapper })
    act(() => result.current.success('곧 사라짐'))
    expect(result.current.toasts).toHaveLength(1)
    act(() => { vi.advanceTimersByTime(4000) })
    expect(result.current.toasts).toHaveLength(0)
  })

  it('removeToast로 수동 제거', () => {
    const { result } = renderHook(() => useToast(), { wrapper })
    act(() => result.current.warning('경고'))
    const id = result.current.toasts[0].id
    act(() => result.current.removeToast(id))
    expect(result.current.toasts).toHaveLength(0)
  })
})
