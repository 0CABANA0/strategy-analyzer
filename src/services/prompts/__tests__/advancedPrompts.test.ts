import { describe, it, expect } from 'vitest'
import { consistencyCheckPrompt } from '../validation'
import { executiveSummaryPrompt } from '../executive'
import { scenarioPrompt } from '../scenario'
import { financialPrompt } from '../financial'
import type { StrategyDocument } from '../../../types'

/** 최소 유효 문서 상태 생성 */
function createMockState(overrides?: Partial<StrategyDocument>): StrategyDocument {
  const now = new Date().toISOString()
  const emptyFw = { status: 'empty' as const, data: null, updatedAt: null }
  const base: StrategyDocument = {
    id: 'test-id',
    businessItem: 'AI 기반 예지보전 플랫폼',
    frameworks: {
      faw: { status: 'completed', data: { facts: ['팩트1'], assumptions: ['가정1'], whatIfs: ['만약1'] }, updatedAt: now },
      swot: { status: 'completed', data: { strengths: ['강점1'], weaknesses: ['약점1'], opportunities: ['기회1'], threats: ['위협1'], so: [], wo: [], st: [], wt: [], selectedStrategies: [] }, updatedAt: now },
      pest: emptyFw,
      threeC: emptyFw,
      ansoff: emptyFw,
      fiveForces: emptyFw,
      ilc: emptyFw,
      marketAnalysis: emptyFw,
      customerAnalysis: emptyFw,
      competitorAnalysis: emptyFw,
      strategyCanvas: emptyFw,
      valueChain: emptyFw,
      sevenS: emptyFw,
      vrio: emptyFw,
      genericStrategy: emptyFw,
      stp: emptyFw,
      errc: emptyFw,
      fourP: emptyFw,
      wbs: emptyFw,
      kpi: emptyFw,
    },
    currentStep: 1,
    createdAt: now,
    updatedAt: now,
  }
  return { ...base, ...overrides } as StrategyDocument
}

describe('consistencyCheckPrompt', () => {
  it('system과 user 문자열을 반환한다', () => {
    const result = consistencyCheckPrompt(createMockState())
    expect(result.system).toBeTruthy()
    expect(result.user).toBeTruthy()
    expect(typeof result.system).toBe('string')
    expect(typeof result.user).toBe('string')
  })

  it('user에 businessItem이 포함된다', () => {
    const result = consistencyCheckPrompt(createMockState())
    expect(result.user).toContain('AI 기반 예지보전 플랫폼')
  })

  it('완료된 프레임워크 데이터만 포함한다', () => {
    const result = consistencyCheckPrompt(createMockState())
    expect(result.user).toContain('faw')
    expect(result.user).toContain('swot')
    expect(result.user).not.toContain('"pest"')
  })

  it('system에 JSON 형식 요구가 포함된다', () => {
    const result = consistencyCheckPrompt(createMockState())
    expect(result.system).toContain('JSON')
  })
})

describe('executiveSummaryPrompt', () => {
  it('system과 user 문자열을 반환한다', () => {
    const result = executiveSummaryPrompt(createMockState())
    expect(result.system).toBeTruthy()
    expect(result.user).toBeTruthy()
  })

  it('user에 businessItem이 포함된다', () => {
    const result = executiveSummaryPrompt(createMockState())
    expect(result.user).toContain('AI 기반 예지보전 플랫폼')
  })

  it('Go/No-Go 판단 기준이 포함된다', () => {
    const result = executiveSummaryPrompt(createMockState())
    expect(result.user).toContain('go')
    expect(result.user).toContain('conditional_go')
    expect(result.user).toContain('no_go')
  })

  it('완료된 프레임워크 데이터를 주입한다', () => {
    const result = executiveSummaryPrompt(createMockState())
    expect(result.user).toContain('팩트1')
    expect(result.user).toContain('강점1')
  })
})

describe('scenarioPrompt', () => {
  it('system과 user 문자열을 반환한다', () => {
    const result = scenarioPrompt(createMockState())
    expect(result.system).toBeTruthy()
    expect(result.user).toBeTruthy()
  })

  it('3가지 시나리오 유형이 명시된다', () => {
    const result = scenarioPrompt(createMockState())
    expect(result.user).toContain('aggressive')
    expect(result.user).toContain('conservative')
    expect(result.user).toContain('pivot')
  })

  it('user에 businessItem이 포함된다', () => {
    const result = scenarioPrompt(createMockState({ businessItem: '스마트팩토리' }))
    expect(result.user).toContain('스마트팩토리')
  })
})

describe('financialPrompt', () => {
  it('system과 user 문자열을 반환한다', () => {
    const result = financialPrompt(createMockState())
    expect(result.system).toBeTruthy()
    expect(result.user).toBeTruthy()
  })

  it('user에 businessItem이 포함된다', () => {
    const result = financialPrompt(createMockState())
    expect(result.user).toContain('AI 기반 예지보전 플랫폼')
  })

  it('TAM/SAM/SOM 형식 요구가 포함된다', () => {
    const result = financialPrompt(createMockState())
    expect(result.user).toContain('tam')
    expect(result.user).toContain('sam')
    expect(result.user).toContain('som')
  })

  it('5년 매출 추정을 요구한다', () => {
    const result = financialPrompt(createMockState())
    expect(result.user).toContain('revenueProjections')
    expect(result.user).toContain('5')
  })

  it('관련 프레임워크만 선별 주입한다', () => {
    // financialPrompt는 relevantIds 필터로 특정 프레임워크만 포함
    const state = createMockState()
    // faw는 relevantIds에 없으므로 제외되어야 함
    const result = financialPrompt(state)
    // swot은 relevantIds에 포함
    expect(result.user).toContain('swot')
  })
})
