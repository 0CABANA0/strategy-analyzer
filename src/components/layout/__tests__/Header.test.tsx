vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useLocation: vi.fn(() => ({ pathname: '/analyzer' })),
  }
})

vi.mock('../../../hooks/useStrategyDocument', () => ({
  useStrategy: vi.fn(() => ({
    getTotalProgress: () => ({ completed: 5, total: 20, percent: 25 }),
    saveStatus: 'saved',
  })),
  StrategyProvider: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    isAdmin: false,
    signOut: vi.fn(),
  })),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock('../../../hooks/useTheme', () => ({
  useTheme: vi.fn(() => ({
    theme: 'light',
    setTheme: vi.fn(),
    isDark: false,
  })),
}))

vi.mock('../../../hooks/useMobileSidebar', () => ({
  useMobileSidebar: vi.fn(() => ({
    isOpen: false,
    toggle: vi.fn(),
    close: vi.fn(),
  })),
  MobileSidebarProvider: ({ children }: { children: React.ReactNode }) => children,
}))

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Header from '../Header'
import { useStrategy } from '../../../hooks/useStrategyDocument'

function renderHeader() {
  return render(
    <BrowserRouter>
      <Header />
    </BrowserRouter>
  )
}

describe('Header 저장 상태 표시', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('saveStatus가 saved일 때 "저장됨" 텍스트를 표시한다', () => {
    vi.mocked(useStrategy).mockReturnValue({
      getTotalProgress: () => ({ completed: 5, total: 20, percent: 25 }),
      saveStatus: 'saved',
    } as ReturnType<typeof useStrategy>)

    renderHeader()
    expect(screen.getByText('저장됨')).toBeTruthy()
  })

  it('saveStatus가 saving일 때 "저장 중" 텍스트를 표시한다', () => {
    vi.mocked(useStrategy).mockReturnValue({
      getTotalProgress: () => ({ completed: 5, total: 20, percent: 25 }),
      saveStatus: 'saving',
    } as ReturnType<typeof useStrategy>)

    renderHeader()
    expect(screen.getByText('저장 중')).toBeTruthy()
  })
})
