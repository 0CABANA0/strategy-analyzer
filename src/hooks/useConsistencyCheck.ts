/** 전략 일관성 검증 훅 */
import { useCallback, useState } from 'react'
import { useStrategy } from './useStrategyDocument'
import { useSettings } from './useSettings'
import { callAI, parseJsonResponse } from '../services/aiService'
import { consistencyCheckPrompt } from '../services/prompts'
import { withRetry } from '../utils/retry'
import { getUserFriendlyMessage } from '../utils/errors'
import type { ConsistencyResult } from '../types'

interface UseConsistencyCheckReturn {
  result: ConsistencyResult | null
  isLoading: boolean
  error: string | null
  runCheck: () => Promise<void>
}

export function useConsistencyCheck(): UseConsistencyCheckReturn {
  const { state } = useStrategy()
  const { settings, apiKey, hasApiKey } = useSettings()
  const [result, setResult] = useState<ConsistencyResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runCheck = useCallback(async () => {
    if (!hasApiKey()) {
      setError('API 키가 필요합니다. 설정에서 OpenRouter API 키를 입력해 주세요.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { system, user } = consistencyCheckPrompt(state)

      const responseText = await withRetry(() =>
        callAI({
          apiKey,
          model: settings.model,
          system,
          user,
          temperature: 0.3,
          maxTokens: settings.maxTokens,
        })
      )
      const data = parseJsonResponse(responseText) as unknown as ConsistencyResult

      // 결과 검증
      if (typeof data.overallScore !== 'number' || !Array.isArray(data.issues)) {
        throw new Error('AI 응답 형식이 올바르지 않습니다.')
      }

      setResult(data)
    } catch (err: unknown) {
      console.error('일관성 검증 오류:', err)
      setError(getUserFriendlyMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [state, apiKey, settings.model, settings.maxTokens, hasApiKey])

  return { result, isLoading, error, runCheck }
}
