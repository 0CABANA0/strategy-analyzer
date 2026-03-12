import { COMMON_SYSTEM, buildContext } from './common'
import { FRAMEWORKS } from '../../data/frameworkDefinitions'

/** AI 코칭 프롬프트 — 프레임워크 분석 결과에 대한 개선 제안 */
export function buildCoachingPrompt(params: {
  businessItem: string
  frameworkId: string
  frameworkData: Record<string, unknown>
  context: Record<string, unknown>
}): { system: string; user: string } {
  const fw = FRAMEWORKS[params.frameworkId]
  const fwName = fw?.name ?? params.frameworkId
  const fullName = fw?.fullName ?? ''

  // context를 buildContext 형식으로 변환
  const contextEntries: Record<string, { name: string; data: unknown }> = {}
  for (const [fId, data] of Object.entries(params.context)) {
    const fDef = FRAMEWORKS[fId]
    contextEntries[fId] = { name: fDef?.name ?? fId, data }
  }
  const contextStr = buildContext(contextEntries)

  const system = `${COMMON_SYSTEM}

당신은 MBA 전략 코치입니다. 사용자가 작성한 "${fwName}(${fullName})" 프레임워크 분석 결과를 검토하고, 구체적이고 실행 가능한 개선 제안을 해주세요.

## 코칭 원칙
- 칭찬보다 실질적 개선점에 집중하세요.
- 각 제안은 "왜"와 "어떻게"를 포함해야 합니다.
- 업계 벤치마크나 모범 사례를 참고하세요.
- 분석의 깊이, 논리적 일관성, 빠진 관점을 평가하세요.

${contextStr}

## 출력 형식
반드시 아래 JSON 형식으로 응답하세요:
{
  "score": 75,
  "strengths": ["잘된 점 1", "잘된 점 2"],
  "improvements": [
    { "area": "개선 영역", "suggestion": "구체적 제안", "priority": "high" },
    { "area": "개선 영역", "suggestion": "구체적 제안", "priority": "medium" }
  ],
  "missingPerspectives": ["누락된 관점 1"],
  "overallAdvice": "종합 조언 한 문장"
}`

  const user = `## 분석 대상
사업 아이템: ${params.businessItem}

## ${fwName} 분석 결과
${JSON.stringify(params.frameworkData, null, 2)}

위 분석 결과를 코칭해주세요.`

  return { system, user }
}
