import { render, screen, fireEvent } from '@testing-library/react'
import ConfirmModal from '../common/ConfirmModal'
import { describe, it, expect, vi } from 'vitest'

describe('ConfirmModal', () => {
  const defaultProps = {
    isOpen: true,
    title: '삭제 확인',
    message: '정말 삭제하시겠습니까?',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  }

  it('isOpen=false일 때 렌더링하지 않음', () => {
    render(<ConfirmModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByText('삭제 확인')).toBeNull()
  })

  it('isOpen=true일 때 제목과 메시지 표시', () => {
    render(<ConfirmModal {...defaultProps} />)
    expect(screen.getByText('삭제 확인')).toBeTruthy()
    expect(screen.getByText('정말 삭제하시겠습니까?')).toBeTruthy()
  })

  it('확인 버튼 클릭 시 onConfirm 호출', () => {
    const onConfirm = vi.fn()
    render(<ConfirmModal {...defaultProps} onConfirm={onConfirm} />)
    fireEvent.click(screen.getByText('확인'))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('취소 버튼 클릭 시 onCancel 호출', () => {
    const onCancel = vi.fn()
    render(<ConfirmModal {...defaultProps} onCancel={onCancel} />)
    fireEvent.click(screen.getByText('취소'))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('ESC 키로 닫기', () => {
    const onCancel = vi.fn()
    render(<ConfirmModal {...defaultProps} onCancel={onCancel} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('danger variant에서 경고 아이콘 표시', () => {
    render(<ConfirmModal {...defaultProps} variant="danger" confirmLabel="삭제" />)
    expect(screen.getByText('삭제')).toBeTruthy()
  })

  it('커스텀 버튼 라벨 적용', () => {
    render(
      <ConfirmModal
        {...defaultProps}
        confirmLabel="네, 삭제합니다"
        cancelLabel="아니오"
      />
    )
    expect(screen.getByText('네, 삭제합니다')).toBeTruthy()
    expect(screen.getByText('아니오')).toBeTruthy()
  })
})
