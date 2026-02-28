/** 전략 일관성 검증 + 경영진 요약 타입 */

export interface ConsistencyIssue {
  type: 'contradiction' | 'gap' | 'weak_link'
  severity: 'high' | 'medium' | 'low'
  frameworks: string[]
  description: string
  suggestion: string
}

export interface ConsistencyResult {
  overallScore: number
  logicFlowScore: number
  completenessScore: number
  alignmentScore: number
  issues: ConsistencyIssue[]
  strengths: string[]
  summary: string
}

export interface ExecutiveSummary {
  title: string
  opportunity: string
  strategy: string
  competitiveAdvantage: string
  keyMetrics: { label: string; value: string }[]
  risks: string[]
  recommendation: 'go' | 'conditional_go' | 'no_go'
  recommendationReason: string
}
