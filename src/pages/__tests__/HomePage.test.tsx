import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders, userEvent } from '../../test/helpers'
import HomePage from '../../pages/HomePage'

describe('HomePage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('입력 폼과 "전체 분석 시작" 버튼이 렌더링된다', () => {
    renderWithProviders(<HomePage />)

    expect(screen.getByPlaceholderText('예: AI 기반 예지보전 플랫폼')).toBeInTheDocument()
    expect(screen.getByText('전체 분석 시작')).toBeInTheDocument()
    expect(screen.getByText('전략분석기')).toBeInTheDocument()
  })

  it('예시 버튼들이 렌더링되고 클릭하면 입력을 채운다', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HomePage />)

    const exampleButton = screen.getByText('AI 기반 예지보전 플랫폼')
    expect(exampleButton).toBeInTheDocument()

    await user.click(exampleButton)

    const input = screen.getByPlaceholderText('예: AI 기반 예지보전 플랫폼') as HTMLInputElement
    expect(input.value).toBe('AI 기반 예지보전 플랫폼')
  })

  it('입력이 비어있으면 "전체 분석 시작" 버튼이 비활성화된다', () => {
    renderWithProviders(<HomePage />)

    const startButton = screen.getByText('전체 분석 시작').closest('button')
    expect(startButton).toBeDisabled()
  })

  it('입력에 텍스트를 입력하면 버튼이 활성화된다', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HomePage />)

    const input = screen.getByPlaceholderText('예: AI 기반 예지보전 플랫폼')
    await user.type(input, '테스트 전략')

    const startButton = screen.getByText('전체 분석 시작').closest('button')
    expect(startButton).not.toBeDisabled()
  })

  it('모든 예시 버튼이 렌더링된다', () => {
    renderWithProviders(<HomePage />)

    const examples = [
      'AI 기반 예지보전 플랫폼',
      '사내 DX 전환 전략',
      '동남아 시장 진출 전략',
      '신재생에너지 사업 다각화',
      '스마트팩토리 구축 로드맵',
      'B2B SaaS 수익모델 전환',
    ]

    for (const example of examples) {
      expect(screen.getByText(example)).toBeInTheDocument()
    }
  })

  it('설명 텍스트가 포함되어 있다', () => {
    renderWithProviders(<HomePage />)

    expect(
      screen.getByText(/전략분석 아이템을 입력하면 20개 프레임워크 기반/)
    ).toBeInTheDocument()
  })

  it('프레임워크 목록 텍스트가 표시된다', () => {
    renderWithProviders(<HomePage />)

    expect(screen.getByText(/PEST/)).toBeInTheDocument()
    expect(screen.getByText(/SWOT/)).toBeInTheDocument()
  })
})
