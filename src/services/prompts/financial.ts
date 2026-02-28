/** 재무 시뮬레이션 프롬프트 */
import type { PromptResult } from '../../types'
import type { StrategyDocument } from '../../types'
import { FRAMEWORKS } from '../../data/frameworkDefinitions'

export function financialPrompt(state: StrategyDocument): PromptResult {
  // 재무 분석에 관련성 높은 프레임워크만 선별 주입
  const relevantIds = [
    'marketAnalysis', 'customerAnalysis', 'competitorAnalysis',
    'fourP', 'kpi', 'wbs', 'swot', 'stp', 'fiveForces',
  ]
  const completedData: Record<string, { name: string; data: unknown }> = {}
  for (const [id, fState] of Object.entries(state.frameworks)) {
    if (fState.status === 'completed' && fState.data && relevantIds.includes(id)) {
      const def = FRAMEWORKS[id as keyof typeof FRAMEWORKS]
      if (def) {
        completedData[id] = { name: def.name, data: fState.data }
      }
    }
  }

  return {
    system: `당신은 사업 타당성 분석 전문가이자 재무 모델링 전문가입니다. 전략 분석 결과를 기반으로 재무 시뮬레이션을 수행합니다.
한국어로 답변하세요. 반드시 지정된 JSON 형식만 출력하세요. 설명이나 마크다운 코드블록 없이 순수 JSON만 반환하세요.
모든 금액 단위는 만원입니다. 수치는 반드시 숫자(number)로 반환하세요.`,
    user: `사업 아이템: "${state.businessItem}"

아래는 이 사업의 전략 분석 결과입니다. 이를 기반으로 재무 시뮬레이션을 수행해 주세요.

[분석 데이터]
${JSON.stringify(completedData, null, 2)}

JSON 형식 (모든 금액 단위: 만원):
{
  "marketSizing": {
    "tam": {"value": 숫자, "unit": "만원 또는 억원", "description": "전체 시장 규모 설명"},
    "sam": {"value": 숫자, "unit": "만원 또는 억원", "description": "유효 시장 규모 설명"},
    "som": {"value": 숫자, "unit": "만원 또는 억원", "description": "획득 가능 시장 규모 설명"}
  },
  "revenueProjections": [
    {"year": 1, "revenue": 숫자, "cost": 숫자, "profit": 숫자, "cumulativeProfit": 숫자},
    {"year": 2, "revenue": 숫자, "cost": 숫자, "profit": 숫자, "cumulativeProfit": 숫자},
    {"year": 3, "revenue": 숫자, "cost": 숫자, "profit": 숫자, "cumulativeProfit": 숫자},
    {"year": 4, "revenue": 숫자, "cost": 숫자, "profit": 숫자, "cumulativeProfit": 숫자},
    {"year": 5, "revenue": 숫자, "cost": 숫자, "profit": 숫자, "cumulativeProfit": 숫자}
  ],
  "breakEvenMonth": 숫자 (BEP 달성 개월 수),
  "initialInvestment": 숫자 (초기 투자금, 만원),
  "roi3Year": 숫자 (3년 ROI, %),
  "roi5Year": 숫자 (5년 ROI, %),
  "keyAssumptions": ["전제 조건 1", "전제 조건 2", "전제 조건 3"],
  "summary": "재무 분석 종합 요약 (3~5문장)"
}

주의사항:
- revenueProjections는 반드시 5년치 (year 1~5)
- profit = revenue - cost
- cumulativeProfit은 누적 이익 (초기 투자 차감 후)
- keyAssumptions는 3~5개 (수치 근거의 전제 조건)
- 비현실적 수치 금지 — 시장 분석 데이터에 기반하여 합리적 추정`,
  }
}
