import { useState, useCallback } from 'react'
import { callAI, parseJsonResponse } from '../services/aiService'
import { buildCoachingPrompt } from '../services/prompts/coachingPrompt'
import { useSettings } from './useSettings'
import { useStrategy } from './useStrategyDocument'

export interface CoachingResult {
  score: number
  strengths: string[]
  improvements: { area: string; suggestion: string; priority: 'high' | 'medium' | 'low' }[]
  missingPerspectives: string[]
  overallAdvice: string
}

export function useAiCoaching() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Map<string, CoachingResult>>(new Map())
  const [error, setError] = useState<string | null>(null)
  const { settings, apiKey } = useSettings()
  const { state } = useStrategy()

  const coach = useCallback(async (frameworkId: string) => {
    if (!state?.businessItem) return
    const fState = state.frameworks[frameworkId]
    if (fState?.status !== 'completed' || !fState.data) return

    setLoading(true)
    setError(null)

    try {
      const key = apiKey || import.meta.env.VITE_OPENROUTER_API_KEY || ''
      // 다른 프레임워크 결과를 컨텍스트로 활용
      const context: Record<string, unknown> = {}
      for (const [fId, fs] of Object.entries(state.frameworks)) {
        if (fId !== frameworkId && fs.status === 'completed' && fs.data) {
          context[fId] = fs.data
        }
      }
      const { system, user } = buildCoachingPrompt({
        businessItem: state.businessItem,
        frameworkId,
        frameworkData: fState.data as unknown as Record<string, unknown>,
        context,
      })

      const raw = await callAI({ apiKey: key, model: settings.model, system, user })
      const parsed = parseJsonResponse(raw) as unknown as CoachingResult

      setResults((prev) => {
        const next = new Map(prev)
        next.set(frameworkId, parsed)
        return next
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI 코칭 생성 실패')
    } finally {
      setLoading(false)
    }
  }, [state, settings, apiKey])

  const getCoaching = useCallback((frameworkId: string) => results.get(frameworkId), [results])

  return { coach, getCoaching, loading, error }
}
