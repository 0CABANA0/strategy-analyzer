import { render } from '@testing-library/react'
import Skeleton from '../common/Skeleton'
import { describe, it, expect } from 'vitest'

describe('Skeleton', () => {
  it('기본 렌더링 (text variant)', () => {
    const { container } = render(<Skeleton />)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('animate-pulse')
    expect(el.className).toContain('rounded')
    expect(el.className).toContain('h-4')
  })

  it('rectangular variant', () => {
    const { container } = render(<Skeleton variant="rectangular" />)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('rounded-lg')
  })

  it('circular variant', () => {
    const { container } = render(<Skeleton variant="circular" />)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('rounded-full')
  })

  it('커스텀 className 적용', () => {
    const { container } = render(<Skeleton className="w-32 h-8" />)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('w-32')
    expect(el.className).toContain('h-8')
  })
})
