/** 경영진 요약 생성 훅 */
import { useCallback, useState } from 'react'
import { useStrategy } from './useStrategyDocument'
import { useSettings } from './useSettings'
import { callAI, parseJsonResponse } from '../services/aiService'
import { executiveSummaryPrompt } from '../services/prompts'
import { withRetry } from '../utils/retry'
import { getUserFriendlyMessage } from '../utils/errors'
import type { ExecutiveSummary } from '../types'

interface UseExecutiveSummaryReturn {
  result: ExecutiveSummary | null
  isLoading: boolean
  error: string | null
  generate: () => Promise<void>
}

export function useExecutiveSummary(): UseExecutiveSummaryReturn {
  const { state, setExecutiveSummary } = useStrategy()
  const { settings, apiKey, hasApiKey } = useSettings()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async () => {
    if (!hasApiKey()) {
      setError('API 키가 필요합니다. 설정에서 OpenRouter API 키를 입력해 주세요.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { system, user } = executiveSummaryPrompt(state)

      const responseText = await withRetry(() =>
        callAI({
          apiKey,
          model: settings.model,
          system,
          user,
          temperature: 0.5,
          maxTokens: settings.maxTokens,
        })
      )
      const data = parseJsonResponse(responseText) as unknown as ExecutiveSummary

      if (!data.title || !data.recommendation) {
        throw new Error('AI 응답 형식이 올바르지 않습니다.')
      }

      setExecutiveSummary(data)
    } catch (err: unknown) {
      console.error('경영진 요약 생성 오류:', err)
      setError(getUserFriendlyMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [state, apiKey, settings.model, settings.maxTokens, hasApiKey, setExecutiveSummary])

  return {
    result: state?.executiveSummary ?? null,
    isLoading,
    error,
    generate,
  }
}
