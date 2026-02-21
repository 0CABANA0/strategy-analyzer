import type { PromptContext } from '../../types'

export const COMMON_SYSTEM = `당신은 MBA 수준의 전략 컨설턴트입니다. 한국어로 답변하세요.
반드시 지정된 JSON 형식만 출력하세요. 설명이나 마크다운 코드블록 없이 순수 JSON만 반환하세요.`

export function buildContext(context: PromptContext['context']): string {
  if (!context || Object.keys(context).length === 0) return ''
  let str = '\n\n[이전 분석 결과 참고]\n'
  for (const [_id, { name, data }] of Object.entries(context)) {
    str += `- ${name}: ${JSON.stringify(data, null, 0).slice(0, 500)}\n`
  }
  return str
}
