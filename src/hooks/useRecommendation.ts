import { useCallback, useState } from 'react'
import { useStrategy } from './useStrategyDocument'
import { useSettings } from './useSettings'
import { callAI, parseJsonResponse } from '../services/aiService'
import { recommendationPrompt } from '../services/promptTemplates'
import { withRetry } from '../utils/retry'
import { getUserFriendlyMessage } from '../utils/errors'
import type { RecommendationResult } from '../types'

interface UseRecommendationReturn {
  recommendation: RecommendationResult | null
  isLoading: boolean
  error: string | null
  generateRecommendation: (businessItem: string) => Promise<void>
}

export function useRecommendation(): UseRecommendationReturn {
  const { state, setRecommendation } = useStrategy()
  const { settings, apiKey, hasApiKey } = useSettings()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateRecommendation = useCallback(async (businessItem: string) => {
    if (!hasApiKey()) {
      setError('API 키가 필요합니다. 설정에서 OpenRouter API 키를 입력해 주세요.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { system, user } = recommendationPrompt(businessItem)

      const responseText = await withRetry(() =>
        callAI({
          apiKey,
          model: settings.model,
          system,
          user,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
        })
      )
      const data = parseJsonResponse(responseText) as unknown as RecommendationResult

      // 결과 검증
      if (!data.essential || !data.recommended || !data.optional) {
        throw new Error('AI 응답 형식이 올바르지 않습니다.')
      }

      setRecommendation(data)
    } catch (err: unknown) {
      console.error('추천 생성 오류:', err)
      setError(getUserFriendlyMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [apiKey, settings.model, hasApiKey, setRecommendation])

  return {
    recommendation: state?.recommendation ?? null,
    isLoading,
    error,
    generateRecommendation,
  }
}
