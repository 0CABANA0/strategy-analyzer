import type { PromptContext } from '../../types'
import type { SourceMaterial } from '../../types/source'

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

/** 소스 자료를 프롬프트 텍스트로 변환 (텍스트/URL만, 이미지는 멀티모달로 별도 처리) */
export function buildSourceContext(sources?: SourceMaterial[]): string {
  if (!sources?.length) return ''
  const textSources = sources.filter((s) => s.type !== 'image')
  if (textSources.length === 0) return ''

  let str = '\n\n[사용자 제공 참고 자료 — 분석에 적극 반영하세요]\n'
  for (const s of textSources) {
    if (s.type === 'text') {
      str += `\n--- ${s.name} ---\n${s.content.slice(0, 3000)}\n`
    } else if (s.type === 'url') {
      str += `- URL: ${s.content}`
      if (s.description) str += ` (${s.description})`
      str += '\n'
    }
  }
  return str
}
