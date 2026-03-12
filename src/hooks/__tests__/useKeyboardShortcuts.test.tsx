import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import React from 'react'

const mockNavigate = vi.fn()
const mockGenerate = vi.fn()
const mockGenerateAll = vi.fn()
const mockGoToStep = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/analyzer' }),
  }
})

vi.mock('../useWizard', () => ({
  useWizard: () => ({ currentStep: 1, goToStep: mockGoToStep }),
}))

vi.mock('../useAiGeneration', () => ({
  useAiGeneration: () => ({
    generate: mockGenerate,
    generateAll: mockGenerateAll,
    isGeneratingAny: false,
  }),
}))

vi.mock('../useStrategyDocument', () => ({
  useStrategy: () => ({
    state: { frameworks: {} },
  }),
}))

import { useKeyboardShortcuts } from '../useKeyboardShortcuts'

function Wrapper({ children }: { children: React.ReactNode }) {
  return <BrowserRouter>{children}</BrowserRouter>
}

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('Ctrl+E를 누르면 미리보기 페이지로 이동한다', () => {
    renderHook(() => useKeyboardShortcuts(), { wrapper: Wrapper })

    fireEvent.keyDown(document, { key: 'e', ctrlKey: true })

    expect(mockNavigate).toHaveBeenCalledWith('/preview')
  })

  it('Alt+1을 누르면 1단계로 이동한다', () => {
    renderHook(() => useKeyboardShortcuts(), { wrapper: Wrapper })

    fireEvent.keyDown(document, { key: '1', altKey: true })

    expect(mockGoToStep).toHaveBeenCalledWith(1)
  })

  it('Alt+5를 누르면 5단계로 이동한다', () => {
    renderHook(() => useKeyboardShortcuts(), { wrapper: Wrapper })

    fireEvent.keyDown(document, { key: '5', altKey: true })

    expect(mockGoToStep).toHaveBeenCalledWith(5)
  })

  it('input 요소에 포커스된 상태에서는 단축키가 비활성화된다', () => {
    renderHook(() => useKeyboardShortcuts(), { wrapper: Wrapper })

    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()

    fireEvent.keyDown(input, { key: 'e', ctrlKey: true })

    expect(mockNavigate).not.toHaveBeenCalled()

    document.body.removeChild(input)
  })
})
