/**
 * OpenRouter SSE 스트리밍 호출
 * 텍스트 누적 방식: 스트리밍 중 원문 표시 → 완료 후 JSON 파싱
 */
import type { AiCallParams } from '../types'
import { NetworkError, AuthError, RateLimitError, ApiError } from '../utils/errors'

function getApiUrl(): string {
  if (import.meta.env.DEV) {
    return '/api/openrouter/api/v1/chat/completions'
  }
  return 'https://openrouter.ai/api/v1/chat/completions'
}

export interface StreamCallbacks {
  /** 청크 수신 시 호출 (누적 텍스트 전달) */
  onChunk: (accumulated: string) => void
  /** 완료 시 호출 (전체 텍스트 전달) */
  onComplete: (fullText: string) => void
  /** 에러 시 호출 */
  onError: (error: Error) => void
}

/**
 * SSE 스트리밍 호출 — 청크를 수집하며 onChunk 콜백으로 실시간 전달
 * 완료 후 전체 텍스트를 onComplete로 반환
 */
export async function callOpenRouterStream(
  params: AiCallParams,
  callbacks: StreamCallbacks,
): Promise<void> {
  const { apiKey, model, system, user, temperature, maxTokens, signal } = params

  const hasImages = Array.isArray(user) && user.some((b) => b.type === 'image_url')

  let response: Response
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
        stream: true,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: temperature ?? 0.7,
        max_tokens: maxTokens ?? 8192,
        ...(hasImages ? {} : { response_format: { type: 'json_object' } }),
      }),
      signal,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    throw new NetworkError()
  }

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({ error: { message: response.statusText } }))
    const msg = errBody.error?.message || errBody.error?.code || `HTTP ${response.status}`

    if (response.status === 401) throw new AuthError()
    if (response.status === 429) throw new RateLimitError()
    if (response.status >= 500) throw new ApiError(`OpenRouter API 오류: ${msg}`, response.status, true)
    throw new ApiError(`OpenRouter API 오류: ${msg}`, response.status)
  }

  if (!response.body) {
    throw new ApiError('스트리밍 응답 본문이 없습니다.', 0, true)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let accumulated = ''
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // SSE 라인 파싱
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // 마지막 미완성 라인은 버퍼에 유지

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed === 'data: [DONE]') continue
        if (!trimmed.startsWith('data: ')) continue

        try {
          const json = JSON.parse(trimmed.slice(6))
          const delta = json.choices?.[0]?.delta?.content
          if (delta) {
            accumulated += delta
            callbacks.onChunk(accumulated)
          }
        } catch {
          // JSON 파싱 실패는 무시 (부분 데이터)
        }
      }
    }

    if (!accumulated) {
      throw new ApiError('AI 모델이 빈 응답을 반환했습니다. 다시 시도해 주세요.', 0, true)
    }

    callbacks.onComplete(accumulated)
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    callbacks.onError(err instanceof Error ? err : new Error(String(err)))
    throw err
  }
}
