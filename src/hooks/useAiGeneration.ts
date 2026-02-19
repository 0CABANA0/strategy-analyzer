import { useCallback, useState } from 'react'
import { useStrategy } from './useStrategyDocument'
import { useSettings } from './useSettings'
import { callAI, parseJsonResponse } from '../services/aiService'
import { promptTemplates } from '../services/promptTemplates'
import { sampleData } from '../data/sampleData'
import { withRetry } from '../utils/retry'
import { getUserFriendlyMessage } from '../utils/errors'

interface UseAiGenerationReturn {
  generate: (frameworkId: string) => Promise<void>
  generateAll: (frameworkIds: string[]) => Promise<void>
  isGeneratingAny: boolean
  currentGenerating: string | null
  generatingSet: ReadonlySet<string>
}

export function useAiGeneration(): UseAiGenerationReturn {
  const {
    state,
    setFrameworkGenerating,
    setFrameworkData,
    setFrameworkError,
    getFrameworkContext,
  } = useStrategy()
  const { settings, apiKey, hasApiKey } = useSettings()
  const [generatingSet, setGeneratingSet] = useState<Set<string>>(new Set())

  const generate = useCallback(async (frameworkId: string) => {
    if (!state?.businessItem) return

    // API 키가 없으면 샘플 데이터 사용
    if (!hasApiKey()) {
      setFrameworkGenerating(frameworkId)
      setGeneratingSet((prev) => new Set([...prev, frameworkId]))

      await new Promise<void>((r) => setTimeout(r, 500))
      const sample = sampleData[frameworkId as keyof typeof sampleData]
      if (sample) {
        setFrameworkData(frameworkId, sample as Record<string, unknown>)
      } else {
        setFrameworkError(frameworkId, '이 프레임워크의 샘플 데이터가 없습니다. API 키를 설정해 주세요.')
      }
      setGeneratingSet((prev) => {
        const next = new Set(prev)
        next.delete(frameworkId)
        return next
      })
      return
    }

    setFrameworkGenerating(frameworkId)
    setGeneratingSet((prev) => new Set([...prev, frameworkId]))

    try {
      const template = promptTemplates[frameworkId as keyof typeof promptTemplates]
      if (!template) throw new Error(`프롬프트 템플릿이 없습니다: ${frameworkId}`)

      const context = getFrameworkContext(frameworkId)
      const { system, user } = template({
        businessItem: state.businessItem,
        context,
      })

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
      const data = parseJsonResponse(responseText)
      setFrameworkData(frameworkId, data as Record<string, unknown>)
    } catch (err: unknown) {
      console.error(`AI 생성 오류 (${frameworkId}):`, err)
      setFrameworkError(frameworkId, getUserFriendlyMessage(err))
    } finally {
      setGeneratingSet((prev) => {
        const next = new Set(prev)
        next.delete(frameworkId)
        return next
      })
    }
  }, [state, settings, apiKey, hasApiKey, setFrameworkGenerating, setFrameworkData, setFrameworkError, getFrameworkContext])

  const generateAll = useCallback(async (frameworkIds: string[]) => {
    for (const id of frameworkIds) {
      await generate(id)
    }
  }, [generate])

  const isGeneratingAny = generatingSet.size > 0
  const currentGenerating = generatingSet.size > 0 ? [...generatingSet][0] : null

  return { generate, generateAll, isGeneratingAny, currentGenerating, generatingSet }
}
