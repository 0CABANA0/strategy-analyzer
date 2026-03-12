import { describe, it, expect } from 'vitest'
import { INDUSTRY_TEMPLATES } from '../industryTemplates'

describe('INDUSTRY_TEMPLATES', () => {
  it('모든 템플릿에 필수 필드가 존재한다', () => {
    for (const template of INDUSTRY_TEMPLATES) {
      expect(template.id).toBeTruthy()
      expect(template.name).toBeTruthy()
      expect(template.icon).toBeTruthy()
      expect(template.description).toBeTruthy()
      expect(Array.isArray(template.examples)).toBe(true)
    }
  })

  it('각 템플릿에 최소 2개의 예시가 있다', () => {
    for (const template of INDUSTRY_TEMPLATES) {
      expect(template.examples.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('모든 템플릿 ID가 고유하다', () => {
    const ids = INDUSTRY_TEMPLATES.map((t) => t.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })
})
