import type { PromptResult } from '../../types'
import { FRAMEWORKS } from '../../data/frameworkDefinitions'

export function recommendationPrompt(businessItem: string): PromptResult {
  const frameworkList = Object.values(FRAMEWORKS)
    .map((f) => `- ${f.id}: ${f.name} (${f.fullName}) — ${f.description}`)
    .join('\n')

  return {
    system: `당신은 MBA 수준의 전략 컨설턴트입니다. 한국어로 답변하세요.
반드시 지정된 JSON 형식만 출력하세요. 설명이나 마크다운 코드블록 없이 순수 JSON만 반환하세요.`,
    user: `사업 아이템: "${businessItem}"

아래 전략 분석 프레임워크 목록에서 이 사업 아이템에 가장 적합한 프레임워크를 추천해 주세요.
각 프레임워크를 "필수(essential)", "권장(recommended)", "선택(optional)" 3단계로 분류하세요.

[프레임워크 목록]
${frameworkList}

분류 기준:
- essential: 이 사업 아이템 분석에 반드시 필요한 핵심 프레임워크 (3~5개, score=100)
- recommended: 더 깊이 있는 분석을 위해 권장하는 프레임워크 (3~5개, score=60~90)
- optional: 필요 시 추가로 활용할 수 있는 프레임워크 (나머지, score=20~55)

각 프레임워크에 대해 다음을 작성하세요:
1. description: 이 프레임워크가 무엇이고, 어떤 분석을 수행하는지 2~3문장으로 상세히 설명
2. reason: 이 사업 아이템에 왜 이 프레임워크가 필요한지 구체적 사유 (사업 아이템과 연결하여 설명)
3. score: 추천도 (0~100 정수). essential은 100, recommended는 60~90, optional은 20~55

JSON 형식:
{
  "essential": [{"id": "프레임워크ID", "description": "프레임워크 특징 상세 설명", "reason": "이 사업에 필요한 구체적 사유", "score": 100}],
  "recommended": [{"id": "프레임워크ID", "description": "프레임워크 특징 상세 설명", "reason": "이 사업에 필요한 구체적 사유", "score": 75}],
  "optional": [{"id": "프레임워크ID", "description": "프레임워크 특징 상세 설명", "reason": "이 사업에 필요한 구체적 사유", "score": 40}]
}`,
  }
}
