/**
 * OpenRouter API 프로바이더
 * 개발: Vite 프록시(/api/openrouter) 경유
 * 프로덕션: OpenRouter API 직접 호출 (CORS 지원)
 */
import type { AiCallParams, OpenRouterResponse, OpenRouterErrorBody } from '../types'
import { NetworkError, AuthError, RateLimitError, ApiError } from '../utils/errors'

function getApiUrl(): string {
  // 개발 환경: Vite 프록시 사용
  if (import.meta.env.DEV) {
    return '/api/openrouter/api/v1/chat/completions'
  }
  // 프로덕션: OpenRouter 직접 호출
  return 'https://openrouter.ai/api/v1/chat/completions'
}

export async function callOpenRouter({ apiKey, model, system, user, temperature, maxTokens, signal }: AiCallParams): Promise<string> {
  let response: Response

  // 멀티모달 콘텐츠 감지 (이미지 포함 여부)
  const hasImages = Array.isArray(user) && user.some((b) => b.type === 'image_url')

  try {
    response = await fetch(getApiUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Strategy Analyzer',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: temperature ?? 0.7,
        max_tokens: maxTokens ?? 8192,
        // 이미지 포함 시 JSON 모드 비활성화 (일부 모델 비호환)
        ...(hasImages ? {} : { response_format: { type: 'json_object' } }),
      }),
      signal,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    throw new NetworkError()
  }

  if (!response.ok) {
    const errBody: OpenRouterErrorBody = await response.json().catch(() => ({ error: { message: response.statusText } }))
    const msg = errBody.error?.message || errBody.error?.code || `HTTP ${response.status}`

    if (response.status === 401) {
      throw new AuthError()
    }
    if (response.status === 429) {
      throw new RateLimitError()
    }
    if (response.status >= 500) {
      throw new ApiError(`OpenRouter API 오류: ${msg}`, response.status, true)
    }
    throw new ApiError(`OpenRouter API 오류: ${msg}`, response.status)
  }

  const data: OpenRouterResponse = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) {
    throw new ApiError('AI 모델이 빈 응답을 반환했습니다. 다시 시도해 주세요.', response.status, true)
  }
  return content
}
