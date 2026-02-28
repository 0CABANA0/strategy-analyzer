/**
 * Skywork API 프로바이더
 * OpenAI 호환 형식 — 재무 시뮬레이션 전용
 * https://platform.skyworkmodel.ai
 */
import type { AiCallParams, OpenRouterResponse, OpenRouterErrorBody } from '../types'
import { NetworkError, AuthError, RateLimitError, ApiError } from '../utils/errors'

const SKYWORK_API_URL = 'https://api.skyworkmodel.ai/v1/chat/completions'
const SKYWORK_DEFAULT_MODEL = 'skywork/r1v4-lite'

export async function callSkywork({
  apiKey,
  model,
  system,
  user,
  temperature,
  maxTokens,
  signal,
}: AiCallParams): Promise<string> {
  let response: Response

  try {
    response = await fetch(SKYWORK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || SKYWORK_DEFAULT_MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: temperature ?? 0.3,
        max_tokens: maxTokens ?? 8192,
      }),
      signal,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    throw new NetworkError()
  }

  if (!response.ok) {
    const errBody: OpenRouterErrorBody = await response
      .json()
      .catch(() => ({ error: { message: response.statusText } }))
    const msg = errBody.error?.message || errBody.error?.code || `HTTP ${response.status}`

    if (response.status === 401) {
      throw new AuthError()
    }
    if (response.status === 429) {
      throw new RateLimitError()
    }
    if (response.status >= 500) {
      throw new ApiError(`Skywork API 오류: ${msg}`, response.status, true)
    }
    throw new ApiError(`Skywork API 오류: ${msg}`, response.status)
  }

  const data: OpenRouterResponse = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) {
    throw new ApiError(
      'Skywork AI가 빈 응답을 반환했습니다. 다시 시도해 주세요.',
      response.status,
      true
    )
  }
  return content
}
