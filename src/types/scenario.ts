/** 시나리오 분기 타입 */

export type ScenarioType = 'aggressive' | 'conservative' | 'pivot'

export interface ScenarioStrategy {
  type: ScenarioType
  label: string
  overview: string
  keyDifferences: string[]
  genericStrategy: { strategy: string; rationale: string; actions: string }
  stp: { segmentation: string; targeting: string; positioning: string }
  fourP: { product: string; price: string; place: string; promotion: string }
  kpiTargets: { label: string; target: string }[]
  riskLevel: 'high' | 'medium' | 'low'
  expectedROI: string
  timeline: string
}

export interface ScenarioResult {
  scenarios: ScenarioStrategy[]
  comparison: string
  recommendation: ScenarioType
  recommendationReason: string
}
