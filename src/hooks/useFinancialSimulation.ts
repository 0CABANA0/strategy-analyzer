/** 재무 시뮬레이션 생성 훅 — OpenRouter API 사용 */
import { useCallback, useState } from 'react'
import { useStrategy } from './useStrategyDocument'
import { useSettings } from './useSettings'
import { callAI, parseJsonResponse } from '../services/aiService'
import { financialPrompt } from '../services/prompts'
import { withRetry } from '../utils/retry'
import { getUserFriendlyMessage } from '../utils/errors'
import type { FinancialResult } from '../types'

interface UseFinancialSimulationReturn {
  result: FinancialResult | null
  isLoading: boolean
  error: string | null
  generate: () => Promise<void>
}

export function useFinancialSimulation(): UseFinancialSimulationReturn {
  const { state, setFinancialResult } = useStrategy()
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
      const { system, user } = financialPrompt(state)

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
      const data = parseJsonResponse(responseText) as unknown as FinancialResult

      if (!data.marketSizing || !Array.isArray(data.revenueProjections)) {
        throw new Error('AI 응답 형식이 올바르지 않습니다.')
      }

      setFinancialResult(data)
    } catch (err: unknown) {
      console.error('재무 시뮬레이션 오류:', err)
      setError(getUserFriendlyMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [state, apiKey, settings.model, settings.maxTokens, hasApiKey, setFinancialResult])

  return {
    result: state?.financialResult ?? null,
    isLoading,
    error,
    generate,
  }
}
