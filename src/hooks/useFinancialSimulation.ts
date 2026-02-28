/** 재무 시뮬레이션 생성 훅 — Skywork API 키가 있으면 Skywork, 없으면 OpenRouter 사용 */
import { useCallback, useState } from 'react'
import { useStrategy } from './useStrategyDocument'
import { useSettings } from './useSettings'
import { useAuth } from './useAuth'
import { callAI, parseJsonResponse } from '../services/aiService'
import { callSkywork } from '../services/skyworkProvider'
import { financialPrompt } from '../services/prompts'
import { withRetry } from '../utils/retry'
import { getUserFriendlyMessage } from '../utils/errors'
import type { FinancialResult } from '../types'

interface UseFinancialSimulationReturn {
  result: FinancialResult | null
  isLoading: boolean
  error: string | null
  isPremiumRequired: boolean
  generate: () => Promise<void>
}

export function useFinancialSimulation(): UseFinancialSimulationReturn {
  const { state, setFinancialResult } = useStrategy()
  const { settings, apiKey, hasApiKey, skyworkApiKey } = useSettings()
  const { isPremium } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async () => {
    // 프리미엄 사용자만 이용 가능
    if (!isPremium) {
      setError('프리미엄 사용자만 재무 시뮬레이션을 이용할 수 있습니다. 관리자에게 문의해 주세요.')
      return
    }

    // Skywork API 키 우선, 없으면 OpenRouter API 키 사용
    const useSkywork = !!skyworkApiKey
    if (!useSkywork && !hasApiKey()) {
      setError('API 키가 필요합니다. 설정에서 OpenRouter API 키를 입력해 주세요.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { system, user } = financialPrompt(state)

      let responseText: string
      if (useSkywork) {
        responseText = await withRetry(() =>
          callSkywork({
            apiKey: skyworkApiKey,
            model: '',
            system,
            user,
            temperature: 0.3,
            maxTokens: settings.maxTokens,
          })
        )
      } else {
        responseText = await withRetry(() =>
          callAI({
            apiKey,
            model: settings.model,
            system,
            user,
            temperature: 0.3,
            maxTokens: settings.maxTokens,
          })
        )
      }
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
  }, [state, apiKey, skyworkApiKey, settings.model, settings.maxTokens, hasApiKey, isPremium, setFinancialResult])

  return {
    result: state?.financialResult ?? null,
    isLoading,
    error,
    isPremiumRequired: !isPremium,
    generate,
  }
}
