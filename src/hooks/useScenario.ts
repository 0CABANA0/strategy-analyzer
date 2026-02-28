/** 시나리오 분기 생성 훅 */
import { useCallback, useState } from 'react'
import { useStrategy } from './useStrategyDocument'
import { useSettings } from './useSettings'
import { callAI, parseJsonResponse } from '../services/aiService'
import { scenarioPrompt } from '../services/prompts'
import { withRetry } from '../utils/retry'
import { getUserFriendlyMessage } from '../utils/errors'
import type { ScenarioResult } from '../types'

interface UseScenarioReturn {
  result: ScenarioResult | null
  isLoading: boolean
  error: string | null
  generate: () => Promise<void>
}

export function useScenario(): UseScenarioReturn {
  const { state, setScenarioResult } = useStrategy()
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
      const { system, user } = scenarioPrompt(state)

      const responseText = await withRetry(() =>
        callAI({
          apiKey,
          model: settings.model,
          system,
          user,
          temperature: 0.7,
          maxTokens: settings.maxTokens,
        })
      )
      const data = parseJsonResponse(responseText) as unknown as ScenarioResult

      if (!Array.isArray(data.scenarios) || data.scenarios.length !== 3) {
        throw new Error('AI 응답 형식이 올바르지 않습니다.')
      }

      setScenarioResult(data)
    } catch (err: unknown) {
      console.error('시나리오 분석 오류:', err)
      setError(getUserFriendlyMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [state, apiKey, settings.model, settings.maxTokens, hasApiKey, setScenarioResult])

  return {
    result: state?.scenarioResult ?? null,
    isLoading,
    error,
    generate,
  }
}
