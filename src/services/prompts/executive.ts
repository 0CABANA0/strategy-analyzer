/** 경영진 요약 프롬프트 */
import type { PromptResult } from '../../types'
import type { StrategyDocument } from '../../types'
import { FRAMEWORKS } from '../../data/frameworkDefinitions'

export function executiveSummaryPrompt(state: StrategyDocument): PromptResult {
  const completedData: Record<string, { name: string; data: unknown }> = {}
  for (const [id, fState] of Object.entries(state.frameworks)) {
    if (fState.status === 'completed' && fState.data) {
      const def = FRAMEWORKS[id as keyof typeof FRAMEWORKS]
      if (def) {
        completedData[id] = { name: def.name, data: fState.data }
      }
    }
  }

  return {
    system: `당신은 글로벌 전략 컨설팅 펌의 시니어 파트너입니다. C-레벨 경영진을 위한 전략 요약 보고서를 작성합니다.
한국어로 답변하세요. 반드시 지정된 JSON 형식만 출력하세요. 설명이나 마크다운 코드블록 없이 순수 JSON만 반환하세요.`,
    user: `사업 아이템: "${state.businessItem}"

아래는 이 사업에 대한 전략 분석 결과입니다.
C-레벨 의사결정자가 1페이지로 사업 전체를 파악할 수 있는 경영진 요약을 작성해 주세요.

[분석 데이터]
${JSON.stringify(completedData, null, 2)}

JSON 형식:
{
  "title": "사업명 + 한 줄 핵심 요약 (예: 'AI 전력설비 진단 — 예지보전 시장의 게임 체인저')",
  "opportunity": "시장 기회 요약 (2~3문장, TAM/SAM/SOM 언급, 수치 포함)",
  "strategy": "핵심 전략 방향 (2~3문장, 차별화 포인트 명확히)",
  "competitiveAdvantage": "경쟁 우위 요소 (2~3문장, VRIO/가치사슬 기반)",
  "keyMetrics": [
    {"label": "목표 시장 규모", "value": "수치+단위"},
    {"label": "예상 BEP", "value": "기간"},
    {"label": "3년 ROI", "value": "퍼센트"}
  ],
  "risks": ["주요 리스크 1", "주요 리스크 2", "주요 리스크 3"],
  "recommendation": "go | conditional_go | no_go",
  "recommendationReason": "Go/No-Go 판단 근거 (2~3문장)"
}

- keyMetrics는 3~5개 (핵심 수치만)
- risks는 정확히 3개
- recommendation 판단 기준:
  - go: 시장 매력도 높고, 역량 적합하며, 리스크 관리 가능
  - conditional_go: 잠재력은 있으나 특정 조건 충족 필요
  - no_go: 리스크 대비 기회가 부족하거나 역량 미달`,
  }
}
