import { describe, it, expect } from 'vitest'
import { computeDocumentDiff } from '../documentDiff'
import type { StrategyDocument } from '../../types/document'

/* eslint-disable @typescript-eslint/no-explicit-any */
function createEmptyDoc(overrides: Partial<StrategyDocument> = {}): StrategyDocument {
  return {
    id: 'test-doc',
    businessItem: '테스트 사업',
    frameworks: {},
    ...overrides,
  } as StrategyDocument
}

describe('computeDocumentDiff', () => {
  it('동일한 두 문서 → 빈 배열 반환', () => {
    const doc = createEmptyDoc({
      frameworks: {
        swot: { status: 'completed', data: { strengths: ['강점1'] } as any, updatedAt: '2026-01-01' },
      },
    })

    const result = computeDocumentDiff(doc, doc)
    expect(result).toEqual([])
  })

  it('한 프레임워크의 status가 다르면 해당 프레임워크 포함', () => {
    const docA = createEmptyDoc({
      frameworks: {
        swot: { status: 'empty', data: null as any, updatedAt: '' },
      },
    })
    const docB = createEmptyDoc({
      frameworks: {
        swot: { status: 'completed', data: null as any, updatedAt: '2026-01-01' },
      },
    })

    const result = computeDocumentDiff(docA, docB)
    const swotDiff = result.find((d) => d.frameworkId === 'swot')
    expect(swotDiff).toBeDefined()
  })

  it('한 프레임워크의 필드값이 다르면 changed=true', () => {
    const docA = createEmptyDoc({
      frameworks: {
        swot: { status: 'completed', data: { strengths: ['강점A'] } as any, updatedAt: '2026-01-01' },
      },
    })
    const docB = createEmptyDoc({
      frameworks: {
        swot: { status: 'completed', data: { strengths: ['강점B'] } as any, updatedAt: '2026-01-01' },
      },
    })

    const result = computeDocumentDiff(docA, docB)
    const swotDiff = result.find((d) => d.frameworkId === 'swot')
    expect(swotDiff).toBeDefined()
    const changedFields = swotDiff!.fields.filter((f) => f.changed)
    expect(changedFields.length).toBeGreaterThan(0)
  })

  it('둘 다 empty 상태이면 변경 없음 → 제외', () => {
    const docA = createEmptyDoc({
      frameworks: {
        swot: { status: 'empty', data: null as any, updatedAt: '' },
      },
    })
    const docB = createEmptyDoc({
      frameworks: {
        swot: { status: 'empty', data: null as any, updatedAt: '' },
      },
    })

    const result = computeDocumentDiff(docA, docB)
    const swotDiff = result.find((d) => d.frameworkId === 'swot')
    expect(swotDiff).toBeUndefined()
  })
})
