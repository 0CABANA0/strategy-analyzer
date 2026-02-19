/**
 * OpenRouter API 프로바이더
 * OpenAI 호환 API — Vite 프록시: /api/openrouter → https://openrouter.ai
 */
import type { AiCallParams, OpenRouterResponse, OpenRouterErrorBody } from '../types'
import { NetworkError, AuthError, RateLimitError, ApiError } from '../utils/errors'

export async function callOpenRouter({ apiKey, model, system, user, temperature, maxTokens }: AiCallParams): Promise<string> {
  let response: Response

  try {
    response = await fetch('/api/openrouter/api/v1/chat/completions', {
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
        response_format: { type: 'json_object' },
      }),
    })
  } catch {
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
  return data.choices?.[0]?.message?.content || ''
}
