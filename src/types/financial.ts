/** 재무 시뮬레이션 타입 */

export interface MarketSizing {
  tam: { value: number; unit: string; description: string }
  sam: { value: number; unit: string; description: string }
  som: { value: number; unit: string; description: string }
}

export interface RevenueProjection {
  year: number
  revenue: number
  cost: number
  profit: number
  cumulativeProfit: number
}

export interface FinancialResult {
  marketSizing: MarketSizing
  revenueProjections: RevenueProjection[]
  breakEvenMonth: number
  initialInvestment: number
  roi3Year: number
  roi5Year: number
  keyAssumptions: string[]
  summary: string
}
