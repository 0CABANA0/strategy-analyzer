import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../test/helpers'
import TeamPage from '../TeamPage'
import { useTeam } from '../../hooks/useTeam'

vi.mock('../../hooks/useTeam', () => ({
  useTeam: vi.fn(),
}))

vi.mock('../../hooks/useToast', async () => {
  const actual = await vi.importActual('../../hooks/useToast')
  return {
    ...actual,
    useToast: () => ({ success: vi.fn(), error: vi.fn() }),
  }
})

const mockUseTeam = useTeam as unknown as ReturnType<typeof vi.fn>

describe('TeamPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loading=true일 때 로딩 스피너를 표시한다', () => {
    mockUseTeam.mockReturnValue({
      team: null,
      members: [],
      documents: [],
      loading: true,
      error: null,
      createTeam: vi.fn(),
      inviteMember: vi.fn(),
      removeMember: vi.fn(),
    })

    const { container } = renderWithProviders(<TeamPage />)

    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('에러가 있을 때 에러 메시지를 표시한다', () => {
    mockUseTeam.mockReturnValue({
      team: null,
      members: [],
      documents: [],
      loading: false,
      error: '팀 정보를 불러오는데 실패했습니다.',
      createTeam: vi.fn(),
      inviteMember: vi.fn(),
      removeMember: vi.fn(),
    })

    renderWithProviders(<TeamPage />)

    expect(screen.getByText('팀 정보를 불러오는데 실패했습니다.')).toBeInTheDocument()
  })

  it('팀이 없을 때 팀 생성 화면을 표시한다', () => {
    mockUseTeam.mockReturnValue({
      team: null,
      members: [],
      documents: [],
      loading: false,
      error: null,
      createTeam: vi.fn(),
      inviteMember: vi.fn(),
      removeMember: vi.fn(),
    })

    renderWithProviders(<TeamPage />)

    expect(screen.getByText('팀 워크스페이스')).toBeInTheDocument()
  })

  it('팀이 있을 때 팀 이름과 탭을 표시한다', () => {
    mockUseTeam.mockReturnValue({
      team: {
        id: '1',
        name: '전략기획팀',
        createdBy: 'u1',
        createdAt: '2026-01-01',
      },
      members: [
        {
          userId: 'u1',
          email: 'a@a.com',
          displayName: 'A',
          role: 'owner',
          joinedAt: '2026-01-01',
        },
      ],
      documents: [],
      loading: false,
      error: null,
      createTeam: vi.fn(),
      inviteMember: vi.fn(),
      removeMember: vi.fn(),
    })

    renderWithProviders(<TeamPage />)

    expect(screen.getByText('전략기획팀')).toBeInTheDocument()

    const buttons = screen.getAllByRole('button')
    const tabTexts = buttons.map(b => b.textContent)
    expect(tabTexts.some(t => t?.includes('문서'))).toBe(true)
    expect(tabTexts.some(t => t?.includes('설정'))).toBe(true)
  })
})
