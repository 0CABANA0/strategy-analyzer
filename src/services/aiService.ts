/**
 * AI API 추상화 레이어 — OpenRouter 통합
 */
import type { AiCallParams } from '../types'
import { callOpenRouter } from './openrouterProvider'
import { JsonParseError } from '../utils/errors'

export async function callAI(params: AiCallParams): Promise<string> {
  return callOpenRouter(params)
}

/** JSON 응답 파싱 — 다양한 AI 모델 출력 형태 대응 */
export function parseJsonResponse(text: string): Record<string, unknown> {
  let cleaned = text.trim()

  // DeepSeek R1 등 <think>...</think> 태그 제거
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/g, '').trim()

  // ```json ... ``` 코드블록 제거
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '')
  }

  // 1차 시도: 그대로 파싱
  try {
    const result = JSON.parse(cleaned)
    if (!result || typeof result !== 'object' || Object.keys(result).length === 0) {
      throw new JsonParseError('AI가 빈 객체를 반환했습니다.', cleaned)
    }
    return result
  } catch (e) {
    if (e instanceof JsonParseError) throw e
    // 2차 시도: 첫번째 { 부터 마지막 } 까지 추출
    const firstBrace = cleaned.indexOf('{')
    const lastBrace = cleaned.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        const result = JSON.parse(cleaned.slice(firstBrace, lastBrace + 1))
        if (!result || typeof result !== 'object' || Object.keys(result).length === 0) {
          throw new JsonParseError('AI가 빈 객체를 반환했습니다.', cleaned)
        }
        return result
      } catch (e2) {
        if (e2 instanceof JsonParseError) throw e2
        // 3차 시도: 잘린 문자열 복구 (끝이 잘린 경우)
        let partial = cleaned.slice(firstBrace, lastBrace + 1)
        // 닫히지 않은 문자열 닫기
        const openQuotes = (partial.match(/"/g) || []).length
        if (openQuotes % 2 !== 0) {
          partial += '"'
        }
        // 닫히지 않은 배열/객체 닫기
        const openBrackets = (partial.match(/\[/g) || []).length - (partial.match(/\]/g) || []).length
        const openBraces = (partial.match(/\{/g) || []).length - (partial.match(/\}/g) || []).length
        for (let i = 0; i < openBrackets; i++) partial += ']'
        for (let i = 0; i < openBraces; i++) partial += '}'
        // 후행 콤마 제거
        partial = partial.replace(/,\s*([\]}])/g, '$1')
        try {
          return JSON.parse(partial)
        } catch (e3) {
          throw new JsonParseError(
            `JSON 파싱 실패: ${(e3 as Error).message}`,
            cleaned.slice(0, 500),
          )
        }
      }
    }
    throw new JsonParseError(
      `JSON을 찾을 수 없습니다.`,
      cleaned.slice(0, 500),
    )
  }
}
