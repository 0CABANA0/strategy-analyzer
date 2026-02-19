/**
 * 5개 전략 PRD 섹션 정의
 */

import type { SectionDefinition } from '../types'

export const SECTIONS: SectionDefinition[] = [
  {
    number: 1,
    id: 'background',
    title: '기획배경',
    subtitle: 'Business Background & Opportunity',
    description: '사업 기회를 발견하고 성장 방향을 설정합니다.',
    frameworks: ['faw', 'threeC', 'ansoff'],
    color: 'amber',
    icon: 'Lightbulb',
  },
  {
    number: 2,
    id: 'environment',
    title: '환경분석',
    subtitle: 'Environmental Analysis',
    description: '외부/내부 환경을 체계적으로 분석합니다.',
    frameworks: [
      'pest', 'fiveForces', 'ilc',
      'marketAnalysis', 'customerAnalysis', 'competitorAnalysis',
      'strategyCanvas', 'valueChain', 'sevenS', 'vrio',
    ],
    color: 'green',
    icon: 'Search',
  },
  {
    number: 3,
    id: 'implications',
    title: '시사점',
    subtitle: 'Strategic Implications (SWOT)',
    description: '환경분석 결과를 종합하여 전략 방향을 도출합니다.',
    frameworks: ['swot'],
    color: 'blue',
    icon: 'Compass',
  },
  {
    number: 4,
    id: 'strategy',
    title: '추진전략',
    subtitle: 'Strategy Formulation',
    description: '구체적인 경쟁전략과 실행 계획을 수립합니다.',
    frameworks: ['genericStrategy', 'stp', 'errc', 'fourP', 'wbs'],
    color: 'red',
    icon: 'Rocket',
  },
  {
    number: 5,
    id: 'expected',
    title: '기대효과',
    subtitle: 'Expected Outcomes & KPIs',
    description: '정량/정성 기대효과와 KPI 체계를 정의합니다.',
    frameworks: ['kpi'],
    color: 'emerald',
    icon: 'Trophy',
  },
]

export const TOTAL_STEPS: number = SECTIONS.length

export function getSectionByNumber(num: number): SectionDefinition | undefined {
  return SECTIONS.find((s) => s.number === num)
}
