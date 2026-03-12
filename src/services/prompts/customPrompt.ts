/**
 * 커스텀 프레임워크 동적 프롬프트 생성
 */
import { COMMON_SYSTEM, buildContext } from './common'
import type { PromptContext, PromptResult } from '../../types'
import type { CustomFramework } from '../../utils/customFrameworks'

/** 커스텀 프레임워크의 필드 정의에서 JSON 스키마 문자열 생성 */
function buildJsonSchema(fields: CustomFramework['fields']): string {
  const entries = Object.entries(fields).map(([key, def]) => {
    if (def.type === 'text') return `  "${key}": "string"`
    if (def.type === 'list') return `  "${key}": ["string", ...]`
    if (def.type === 'table') {
      const cols = (def as { columns: string[] }).columns
      return `  "${key}": [["${cols.join('", "')}"], ...]`
    }
    if (def.type === 'object') {
      const subs = Object.keys((def as { subfields: Record<string, string> }).subfields)
      return `  "${key}": { ${subs.map((s) => `"${s}": "string"`).join(', ')} }`
    }
    return `  "${key}": "string"`
  })
  return `{\n${entries.join(',\n')}\n}`
}

/**
 * 커스텀 프레임워크용 프롬프트 템플릿 팩토리
 */
export function createCustomPrompt(fw: CustomFramework) {
  return (params: PromptContext): PromptResult => {
    const contextStr = buildContext(params.context)
    const jsonSchema = buildJsonSchema(fw.fields)

    const system = `${COMMON_SYSTEM}

다음 프레임워크로 분석합니다:
- 이름: ${fw.name} (${fw.fullName})
- 설명: ${fw.description}

반드시 다음 JSON 형식으로 응답하세요:
${jsonSchema}`

    const user = `사업 아이템: ${params.businessItem}

${fw.prompt}
${contextStr}`

    return { system, user }
  }
}
