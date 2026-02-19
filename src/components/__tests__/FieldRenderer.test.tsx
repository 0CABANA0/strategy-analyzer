import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders, userEvent } from '../../test/helpers'
import { ListField, TextField, ReadOnlyList, ReadOnlyText, DataTable } from '../frameworks/FieldRenderer'

describe('ListField', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('리스트 항목들을 렌더링한다', () => {
    const items = ['항목 1', '항목 2', '항목 3']
    renderWithProviders(
      <ListField frameworkId="faw" fieldKey="facts" label="팩트" items={items} />
    )

    expect(screen.getByText('팩트')).toBeInTheDocument()
    // 각 항목이 input으로 렌더링됨
    const inputs = screen.getAllByRole('textbox')
    expect(inputs).toHaveLength(3)
    expect(inputs[0]).toHaveValue('항목 1')
    expect(inputs[1]).toHaveValue('항목 2')
    expect(inputs[2]).toHaveValue('항목 3')
  })

  it('빈 리스트에서도 "항목 추가" 버튼이 렌더링된다', () => {
    renderWithProviders(
      <ListField frameworkId="faw" fieldKey="facts" label="팩트" items={[]} />
    )

    expect(screen.getByText('+ 항목 추가')).toBeInTheDocument()
  })

  it('힌트가 있으면 표시된다', () => {
    renderWithProviders(
      <ListField
        frameworkId="faw"
        fieldKey="facts"
        label="팩트"
        hint="시장 관찰 사실"
        items={[]}
      />
    )

    expect(screen.getByText('(시장 관찰 사실)')).toBeInTheDocument()
  })

  it('"항목 추가" 버튼 클릭이 오류 없이 동작한다', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <ListField frameworkId="faw" fieldKey="facts" label="팩트" items={[]} />
    )

    const addButton = screen.getByText('+ 항목 추가')
    // ListField는 props.items를 직접 렌더링하고, 클릭 시 Context를 통해 상태 업데이트
    // 여기서는 클릭이 에러 없이 실행되는지 확인
    await user.click(addButton)

    // 버튼이 여전히 존재함 확인
    expect(screen.getByText('+ 항목 추가')).toBeInTheDocument()
  })

  it('항목이 있는 상태에서 삭제 버튼이 렌더링된다', () => {
    renderWithProviders(
      <ListField frameworkId="faw" fieldKey="facts" label="팩트" items={['항목1']} />
    )

    // x 버튼이 존재하는지 확인
    expect(screen.getByText('x')).toBeInTheDocument()
  })
})

describe('TextField', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('텍스트 필드를 렌더링한다', () => {
    renderWithProviders(
      <TextField
        frameworkId="ansoff"
        fieldKey="marketPenetration"
        label="시장 침투"
        value="기존 시장 확대"
      />
    )

    expect(screen.getByText('시장 침투')).toBeInTheDocument()
    expect(screen.getByDisplayValue('기존 시장 확대')).toBeInTheDocument()
  })

  it('값이 없으면 빈 input을 렌더링한다', () => {
    renderWithProviders(
      <TextField
        frameworkId="ansoff"
        fieldKey="marketPenetration"
        label="시장 침투"
      />
    )

    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('')
  })

  it('힌트가 있으면 표시된다', () => {
    renderWithProviders(
      <TextField
        frameworkId="ansoff"
        fieldKey="marketPenetration"
        label="시장 침투"
        hint="기존 시장 x 기존 제품"
      />
    )

    expect(screen.getByText('(기존 시장 x 기존 제품)')).toBeInTheDocument()
  })
})

describe('ReadOnlyList', () => {
  it('리스트 항목들을 읽기 전용으로 렌더링한다', () => {
    const items = ['강점 A', '강점 B']
    renderWithProviders(
      <ReadOnlyList label="강점" items={items} />
    )

    expect(screen.getByText('강점')).toBeInTheDocument()
    expect(screen.getByText('강점 A')).toBeInTheDocument()
    expect(screen.getByText('강점 B')).toBeInTheDocument()
  })

  it('항목이 없으면 아무것도 렌더링하지 않는다', () => {
    const { container } = renderWithProviders(
      <ReadOnlyList label="강점" items={[]} />
    )

    expect(container.innerHTML).toBe('')
  })
})

describe('ReadOnlyText', () => {
  it('텍스트를 읽기 전용으로 렌더링한다', () => {
    renderWithProviders(
      <ReadOnlyText label="선택 전략" value="차별화 전략" />
    )

    expect(screen.getByText('선택 전략')).toBeInTheDocument()
    expect(screen.getByText('차별화 전략')).toBeInTheDocument()
  })

  it('값이 없으면 아무것도 렌더링하지 않는다', () => {
    const { container } = renderWithProviders(
      <ReadOnlyText label="선택 전략" value="" />
    )

    expect(container.innerHTML).toBe('')
  })
})

describe('DataTable', () => {
  it('테이블 컬럼과 행을 렌더링한다', () => {
    const columns = ['이름', '점수', '등급']
    const rows = [
      ['홍길동', '95', 'A'],
      ['김철수', '87', 'B'],
    ]

    renderWithProviders(
      <DataTable label="성적표" columns={columns} rows={rows} />
    )

    expect(screen.getByText('성적표')).toBeInTheDocument()
    expect(screen.getByText('이름')).toBeInTheDocument()
    expect(screen.getByText('점수')).toBeInTheDocument()
    expect(screen.getByText('등급')).toBeInTheDocument()
    expect(screen.getByText('홍길동')).toBeInTheDocument()
    expect(screen.getByText('95')).toBeInTheDocument()
    expect(screen.getByText('김철수')).toBeInTheDocument()
  })

  it('행이 없으면 아무것도 렌더링하지 않는다', () => {
    const { container } = renderWithProviders(
      <DataTable columns={['A', 'B']} rows={[]} />
    )

    expect(container.innerHTML).toBe('')
  })
})
