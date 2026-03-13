import { describe, it, expect } from 'vitest'
import { analyzeCorrelations, getShortName } from '../correlationAnalyzer'
import type { StrategyDocument } from '../../types/document'

// 빈 문서
const emptyDoc: StrategyDocument = {
  id: 'test-doc',
  businessItem: '테스트 아이템',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  currentStep: 1,
  frameworks: {},
}

// 일부 프레임워크에 데이터가 있는 문서
const partialDoc: StrategyDocument = {
  ...emptyDoc,
  frameworks: {
    swot: {
      status: 'completed',
      data: {
        strengths: ['AI 기술력', '특허 보유'],
        weaknesses: ['인력 부족'],
        opportunities: ['시장 성장', 'AI 수요 증가'],
        threats: ['경쟁 심화'],
        so: ['AI 기술력으로 시장 선점'],
        wo: ['외부 파트너십 활용'],
        st: ['특허로 경쟁 방어'],
        wt: ['핵심 인력 확보'],
        selectedStrategies: ['AI 기술력으로 시장 선점'],
      },
      updatedAt: new Date().toISOString(),
    },
    pest: {
      status: 'completed',
      data: {
        political: ['정부 AI 지원 정책', 'R&D 세제 혜택'],
        economic: ['시장 성장 전망', 'AI 투자 확대'],
        social: ['AI 수요 증가', '디지털 전환 가속'],
        technological: ['AI 기술 발전', '클라우드 인프라 확장'],
      },
      updatedAt: new Date().toISOString(),
    },
    stp: {
      status: 'completed',
      data: {
        segmentation: ['B2B AI 시장', 'B2C AI 시장'],
        targeting: 'B2B 기업 타겟',
        positioning: 'AI 기술력 차별화 포지셔닝',
      },
      updatedAt: new Date().toISOString(),
    },
  },
}

describe('correlationAnalyzer', () => {
  describe('analyzeCorrelations', () => {
    it('빈 문서에서도 정적 관계가 계산된다', () => {
      const result = analyzeCorrelations(emptyDoc)

      expect(result.frameworks).toHaveLength(20)
      expect(result.matrix).toHaveLength(20)
      expect(result.matrix[0]).toHaveLength(20)
      expect(result.entries.length).toBeGreaterThan(0)

      // 정적 관계만 있어야 함 (동적 관계는 0)
      for (const entry of result.entries) {
        expect(entry.dynamic).toBe(0)
        expect(entry.static).toBeGreaterThan(0)
      }
    })

    it('매트릭스가 대칭이다', () => {
      const result = analyzeCorrelations(emptyDoc)
      const { matrix } = result

      for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
          expect(matrix[i][j]).toBe(matrix[j][i])
        }
      }
    })

    it('대각선은 항상 0이다', () => {
      const result = analyzeCorrelations(partialDoc)
      for (let i = 0; i < result.matrix.length; i++) {
        expect(result.matrix[i][i]).toBe(0)
      }
    })

    it('데이터가 있으면 동적 관계가 0보다 크다', () => {
      const result = analyzeCorrelations(partialDoc)

      // PEST와 SWOT은 데이터가 있고 공통 키워드가 있으므로 동적 관계 > 0
      const pestSwot = result.entries.find(
        (e) =>
          (e.from === 'pest' && e.to === 'swot') ||
          (e.from === 'swot' && e.to === 'pest')
      )
      expect(pestSwot).toBeDefined()
      expect(pestSwot!.dynamic).toBeGreaterThan(0)
      expect(pestSwot!.combined).toBeGreaterThan(pestSwot!.static * 0.6) // 동적이 추가로 기여
    })

    it('entries는 combined 내림차순으로 정렬된다', () => {
      const result = analyzeCorrelations(partialDoc)
      for (let i = 1; i < result.entries.length; i++) {
        expect(result.entries[i - 1].combined).toBeGreaterThanOrEqual(result.entries[i].combined)
      }
    })

    it('클러스터가 5개 정의되어 있다', () => {
      const result = analyzeCorrelations(emptyDoc)
      expect(result.clusters).toHaveLength(5)
    })

    it('ERRC ↔ 전략캔버스 관계가 가장 강하다 (블루오션 쌍)', () => {
      const result = analyzeCorrelations(emptyDoc)
      const errcCanvas = result.entries.find(
        (e) =>
          (e.from === 'errc' && e.to === 'strategyCanvas') ||
          (e.from === 'strategyCanvas' && e.to === 'errc')
      )
      expect(errcCanvas).toBeDefined()
      expect(errcCanvas!.static).toBe(0.9) // 블루오션 전략의 핵심 쌍
    })
  })

  describe('getShortName', () => {
    it('모든 프레임워크에 약칭이 있다', () => {
      const ids = ['faw', 'threeC', 'ansoff', 'pest', 'fiveForces', 'ilc',
        'marketAnalysis', 'customerAnalysis', 'competitorAnalysis',
        'strategyCanvas', 'valueChain', 'sevenS', 'vrio', 'swot',
        'genericStrategy', 'stp', 'errc', 'fourP', 'wbs', 'kpi'] as const

      for (const id of ids) {
        const name = getShortName(id)
        expect(name).toBeTruthy()
        expect(name.length).toBeLessThanOrEqual(6)
      }
    })
  })
})
