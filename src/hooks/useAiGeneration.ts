import { useCallback, useReducer, useRef } from 'react'
import { useStrategy } from './useStrategyDocument'
import { useSettings } from './useSettings'
import { useAuth } from './useAuth'
import { callAI, parseJsonResponse } from '../services/aiService'
import { promptTemplates } from '../services/prompts'
import { sampleData } from '../data/sampleData'
import { withRetry } from '../utils/retry'
import { getUserFriendlyMessage } from '../utils/errors'
import type { FrameworkData } from '../types'

interface UseAiGenerationReturn {
  generate: (frameworkId: string) => Promise<void>
  generateAll: (frameworkIds: string[]) => Promise<void>
  cancel: () => void
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
  const { logActivity } = useAuth()

  // Set<string>을 useRef로 관리하여 불필요한 Set 복사 방지
  const generatingRef = useRef(new Set<string>())
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0)
  const abortRef = useRef<AbortController | null>(null)

  const addGenerating = (id: string) => {
    generatingRef.current.add(id)
    forceUpdate()
  }

  const removeGenerating = (id: string) => {
    generatingRef.current.delete(id)
    forceUpdate()
  }

  const generate = useCallback(async (frameworkId: string) => {
    if (!state?.businessItem) return

    // API 키가 없으면 샘플 데이터 사용
    if (!hasApiKey()) {
      setFrameworkGenerating(frameworkId)
      addGenerating(frameworkId)

      await new Promise<void>((r) => setTimeout(r, 500))
      const sample = sampleData[frameworkId as keyof typeof sampleData]
      if (sample) {
        setFrameworkData(frameworkId, sample as FrameworkData)
      } else {
        setFrameworkError(frameworkId, '이 프레임워크의 샘플 데이터가 없습니다. API 키를 설정해 주세요.')
      }
      removeGenerating(frameworkId)
      return
    }

    setFrameworkGenerating(frameworkId)
    addGenerating(frameworkId)

    try {
      const template = promptTemplates[frameworkId as keyof typeof promptTemplates]
      if (!template) throw new Error(`프롬프트 템플릿이 없습니다: ${frameworkId}`)

      const context = getFrameworkContext(frameworkId)
      const { system, user } = template({
        businessItem: state.businessItem,
        context,
      })

      const controller = new AbortController()
      abortRef.current = controller

      const responseText = await withRetry(() =>
        callAI({
          apiKey,
          model: settings.model,
          system,
          user,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
          signal: controller.signal,
        })
      )
      const data = parseJsonResponse(responseText)
      setFrameworkData(frameworkId, data as unknown as FrameworkData)
      logActivity('ai_generate', { framework: frameworkId, model: settings.model })
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setFrameworkError(frameworkId, 'AI 생성이 취소되었습니다.')
      } else {
        console.error(`AI 생성 오류 (${frameworkId}):`, err)
        setFrameworkError(frameworkId, getUserFriendlyMessage(err))
      }
    } finally {
      removeGenerating(frameworkId)
    }
  }, [state, settings, apiKey, hasApiKey, setFrameworkGenerating, setFrameworkData, setFrameworkError, getFrameworkContext, logActivity])

  const generateAll = useCallback(async (frameworkIds: string[]) => {
    for (const id of frameworkIds) {
      await generate(id)
    }
  }, [generate])

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
  }, [])

  const generatingSet = generatingRef.current
  const isGeneratingAny = generatingSet.size > 0
  const currentGenerating = generatingSet.size > 0 ? [...generatingSet][0] : null

  return { generate, generateAll, cancel, isGeneratingAny, currentGenerating, generatingSet }
}
