/** 전략 일관성 검증 프롬프트 */
import type { PromptResult } from '../../types'
import type { StrategyDocument } from '../../types'
import { FRAMEWORKS } from '../../data/frameworkDefinitions'

export function consistencyCheckPrompt(state: StrategyDocument): PromptResult {
  // 완료된 프레임워크만 수집
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
    system: `당신은 전략 문서 검증 전문가입니다. 전략 컨설팅 20년 경력의 시니어 파트너로서, 전략 문서의 일관성과 논리적 완결성을 검증합니다.
한국어로 답변하세요. 반드시 지정된 JSON 형식만 출력하세요. 설명이나 마크다운 코드블록 없이 순수 JSON만 반환하세요.`,
    user: `사업 아이템: "${state.businessItem}"

아래는 이 사업 아이템에 대해 20개 전략 프레임워크로 분석한 결과입니다.
전체 프레임워크 간 일관성, 논리 흐름, 완성도를 검증해 주세요.

[분석 데이터]
${JSON.stringify(completedData, null, 2)}

검증 포인트:
1. SWOT의 기회(Opportunities) → STP의 타겟 시장 → 4P의 마케팅 전략이 논리적으로 연결되는가?
2. 7S/VRIO에서 식별한 역량이 SWOT의 강점/약점과 일치하는가?
3. FAW의 가정(Assumptions)이 PEST/5Forces 분석 결과로 뒷받침되는가?
4. WBS의 일정/마일스톤이 KPI 목표와 정합하는가?
5. 전체 전략 방향이 일관적인가? (예: 공격적 vs 보수적 전략 혼재 여부)
6. 누락된 분석 영역이나 논리적 비약이 있는가?

JSON 형식:
{
  "overallScore": 0~100 정수 (종합 점수),
  "logicFlowScore": 0~100 정수 (논리 흐름 점수),
  "completenessScore": 0~100 정수 (완성도 점수),
  "alignmentScore": 0~100 정수 (정합성 점수),
  "issues": [
    {
      "type": "contradiction | gap | weak_link",
      "severity": "high | medium | low",
      "frameworks": ["관련 프레임워크 ID 배열"],
      "description": "이슈 상세 설명",
      "suggestion": "개선 제안"
    }
  ],
  "strengths": ["잘된 점 1", "잘된 점 2"],
  "summary": "종합 평가 (3~5문장)"
}

- type 설명: contradiction=모순, gap=누락, weak_link=약한 연결
- issues는 최소 3개, 최대 10개
- strengths는 최소 2개, 최대 5개`,
  }
}
