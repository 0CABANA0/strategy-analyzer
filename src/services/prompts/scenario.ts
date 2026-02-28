/** 시나리오 분기 프롬프트 */
import type { PromptResult } from '../../types'
import type { StrategyDocument } from '../../types'
import { FRAMEWORKS } from '../../data/frameworkDefinitions'

export function scenarioPrompt(state: StrategyDocument): PromptResult {
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
    system: `당신은 시나리오 플래닝 전문가입니다. 동일한 사업에 대해 3가지 전략 시나리오를 설계합니다.
한국어로 답변하세요. 반드시 지정된 JSON 형식만 출력하세요. 설명이나 마크다운 코드블록 없이 순수 JSON만 반환하세요.`,
    user: `사업 아이템: "${state.businessItem}"

아래는 이 사업의 기본 전략 분석 결과입니다. 이 데이터를 기반으로 3가지 시나리오별 전략을 생성해 주세요.

[기본 분석 데이터]
${JSON.stringify(completedData, null, 2)}

3가지 시나리오:
1. aggressive (공격적 확장): 시장 선점을 위해 공격적 투자와 빠른 확장을 추구
2. conservative (안정적 성장): 리스크를 최소화하면서 점진적 성장을 추구
3. pivot (전략적 피벗): 기존 전략을 재검토하고 새로운 방향으로 전환

JSON 형식:
{
  "scenarios": [
    {
      "type": "aggressive",
      "label": "공격적 확장",
      "overview": "시나리오 개요 (3~4문장)",
      "keyDifferences": ["기본 전략 대비 차이점 1", "차이점 2", "차이점 3"],
      "genericStrategy": {
        "strategy": "경쟁 전략 유형",
        "rationale": "전략 선택 근거",
        "actions": "핵심 실행 방안"
      },
      "stp": {
        "segmentation": "시장 세분화 전략",
        "targeting": "타겟팅 전략",
        "positioning": "포지셔닝 전략"
      },
      "fourP": {
        "product": "제품 전략",
        "price": "가격 전략",
        "place": "유통 전략",
        "promotion": "프로모션 전략"
      },
      "kpiTargets": [
        {"label": "KPI 이름", "target": "목표값"}
      ],
      "riskLevel": "high | medium | low",
      "expectedROI": "예상 ROI (예: '3년 내 150%')",
      "timeline": "실행 기간 (예: '18개월')"
    }
  ],
  "comparison": "3개 시나리오 비교 요약 (3~5문장)",
  "recommendation": "aggressive | conservative | pivot (가장 추천하는 시나리오)",
  "recommendationReason": "추천 근거 (2~3문장)"
}

- scenarios 배열은 반드시 aggressive, conservative, pivot 순서로 3개
- kpiTargets는 3~5개
- keyDifferences는 3~5개`,
  }
}
