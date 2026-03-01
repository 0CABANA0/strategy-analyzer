import { describe, it, expect } from 'vitest'
import { diffFrameworkData, trackIssueChanges } from '../frameworkDiff'
import type { ConsistencyIssue } from '../../types'

describe('diffFrameworkData', () => {
  it('변경 없으면 빈 배열 반환', () => {
    const data = { strengths: ['기술력'], weaknesses: ['인지도 부족'] }
    const result = diffFrameworkData('swot', data, data, {
      strengths: { label: '강점', type: 'list' as const },
      weaknesses: { label: '약점', type: 'list' as const },
    })
    expect(result).toEqual([])
  })

  it('변경된 필드만 감지', () => {
    const before = { strengths: ['기술력'], weaknesses: ['인지도 부족'] }
    const after = { strengths: ['고유 기술 프로세스'], weaknesses: ['인지도 부족'] }
    const result = diffFrameworkData('swot', before, after, {
      strengths: { label: '강점', type: 'list' as const },
      weaknesses: { label: '약점', type: 'list' as const },
    })
    expect(result).toHaveLength(1)
    expect(result[0].field).toBe('strengths')
    expect(result[0].fieldLabel).toBe('강점')
    expect(result[0].before).toEqual(['기술력'])
    expect(result[0].after).toEqual(['고유 기술 프로세스'])
  })

  it('before가 null이면 모든 필드를 변경으로 감지', () => {
    const after = { strengths: ['기술력'] }
    const result = diffFrameworkData('swot', null, after, {
      strengths: { label: '강점', type: 'list' as const },
    })
    expect(result).toHaveLength(1)
    expect(result[0].before).toBeNull()
  })

  it('after가 null이면 모든 필드를 변경으로 감지', () => {
    const before = { strengths: ['기술력'] }
    const result = diffFrameworkData('swot', before, null, {
      strengths: { label: '강점', type: 'list' as const },
    })
    expect(result).toHaveLength(1)
    expect(result[0].after).toBeNull()
  })

  it('깊은 객체 비교 (테이블 데이터)', () => {
    const before = { matrix: [['A', 'B'], ['C', 'D']] }
    const after = { matrix: [['A', 'B'], ['C', 'E']] }
    const result = diffFrameworkData('errc', before, after, {
      matrix: { label: 'ERRC 매트릭스', type: 'table' as const },
    })
    expect(result).toHaveLength(1)
    expect(result[0].field).toBe('matrix')
  })
})

describe('trackIssueChanges', () => {
  const makeIssue = (
    type: ConsistencyIssue['type'],
    frameworks: string[],
    desc = '설명',
  ): ConsistencyIssue => ({
    type,
    severity: 'high',
    frameworks,
    description: desc,
    suggestion: '제안',
  })

  it('동일 이슈가 유지되면 maintained', () => {
    const before = [makeIssue('contradiction', ['swot', 'vrio'])]
    const after = [makeIssue('contradiction', ['swot', 'vrio'], '다른 설명')]
    const result = trackIssueChanges(before, after)
    expect(result).toHaveLength(1)
    expect(result[0].status).toBe('maintained')
  })

  it('이전에 있었지만 사라지면 resolved', () => {
    const before = [makeIssue('contradiction', ['swot', 'vrio'])]
    const after: ConsistencyIssue[] = []
    const result = trackIssueChanges(before, after)
    expect(result).toHaveLength(1)
    expect(result[0].status).toBe('resolved')
  })

  it('이전에 없었고 새로 생기면 new', () => {
    const before: ConsistencyIssue[] = []
    const after = [makeIssue('gap', ['pest'])]
    const result = trackIssueChanges(before, after)
    expect(result).toHaveLength(1)
    expect(result[0].status).toBe('new')
  })

  it('복합: 해결 + 유지 + 신규 동시 처리', () => {
    const before = [
      makeIssue('contradiction', ['swot', 'vrio']),
      makeIssue('gap', ['pest']),
    ]
    const after = [
      makeIssue('gap', ['pest'], '유지됨'),
      makeIssue('weak_link', ['faw', 'threeC']),
    ]
    const result = trackIssueChanges(before, after)

    const resolved = result.filter((t) => t.status === 'resolved')
    const maintained = result.filter((t) => t.status === 'maintained')
    const newOnes = result.filter((t) => t.status === 'new')

    expect(resolved).toHaveLength(1)
    expect(resolved[0].issue.type).toBe('contradiction')

    expect(maintained).toHaveLength(1)
    expect(maintained[0].issue.type).toBe('gap')

    expect(newOnes).toHaveLength(1)
    expect(newOnes[0].issue.type).toBe('weak_link')
  })

  it('frameworks 순서가 달라도 동일하게 매칭', () => {
    const before = [makeIssue('contradiction', ['vrio', 'swot'])]
    const after = [makeIssue('contradiction', ['swot', 'vrio'], '다른 설명')]
    const result = trackIssueChanges(before, after)
    expect(result).toHaveLength(1)
    expect(result[0].status).toBe('maintained')
  })
})
