import type { PromptContext } from '../../types'
import type { SourceMaterial } from '../../types/source'

export const COMMON_SYSTEM = `당신은 MBA 수준의 전략 컨설턴트입니다. 한국어로 답변하세요.
반드시 지정된 JSON 형식만 출력하세요. 설명이나 마크다운 코드블록 없이 순수 JSON만 반환하세요.
[이전 분석 결과]가 제공되면, 해당 결과의 핵심 사실·가정·전략 방향과 논리적으로 일관된 분석을 수행하세요. 이전 분석과 모순되는 내용을 생성하지 마세요.
약어를 사용할 때는 처음 등장 시 "약어(Full Name, 한국어 설명)" 형식으로 풀네임을 병기하세요 (예: TAM(Total Addressable Market, 전체 시장 규모)).
각 분석 항목에서 해당 프레임워크가 어떤 분석 영역에 강점이 있는 도구인지 분석 내용에 자연스럽게 반영하세요.`

export function buildContext(context: PromptContext['context']): string {
  if (!context || Object.keys(context).length === 0) return ''
  let str = '\n\n[이전 분석 결과 — 아래 내용과 일관성을 반드시 유지하세요]\n'
  for (const [_id, { name, data }] of Object.entries(context)) {
    str += `- ${name}: ${JSON.stringify(data, null, 0).slice(0, 1000)}\n`
  }
  str += '\n⚠️ 위 분석에서 언급된 시장 규모, 타겟 고객, 경쟁 구도, 핵심 역량, 전략 방향과 모순되지 않도록 하세요.\n'
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
