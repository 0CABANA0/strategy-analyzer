import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { useStrategy } from './useStrategyDocument'
import { useSettings } from './useSettings'
import { useAuth } from './useAuth'
import { callAI, parseJsonResponse } from '../services/aiService'
import { promptTemplates } from '../services/prompts'
import { buildSourceContext } from '../services/prompts/common'
import { sampleData } from '../data/sampleData'
import { withRetry } from '../utils/retry'
import { getUserFriendlyMessage } from '../utils/errors'
import { recordMetric } from '../utils/generationMetrics'
import type { FrameworkData, UserContent, ContentBlock } from '../types'

interface UseAiGenerationReturn {
  generate: (frameworkId: string, feedback?: string) => Promise<void>
  generateAll: (frameworkIds: string[], feedback?: string) => Promise<void>
  cancel: () => void
  isGeneratingAny: boolean
  currentGenerating: string | null
  generatingSet: ReadonlySet<string>
  /** 현재 생성의 경과 시간 (ms) */
  elapsedMs: number
  /** 최근 완료된 프레임워크별 소요 시간 (세션 한정) */
  lastDurations: ReadonlyMap<string, number>
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

  // 타이머: 생성 시작 시점 + 경과 시간 + 완료 소요 시간
  const startTimeRef = useRef<number>(0)
  const [elapsedMs, setElapsedMs] = useState(0)
  const lastDurationsRef = useRef(new Map<string, number>())

  const addGenerating = (id: string) => {
    generatingRef.current.add(id)
    forceUpdate()
  }

  const removeGenerating = (id: string) => {
    generatingRef.current.delete(id)
    forceUpdate()
  }

  const generate = useCallback(async (frameworkId: string, feedback?: string) => {
    if (!state?.businessItem) return

    const genStartTime = Date.now()

    // API 키가 없으면 샘플 데이터 사용
    if (!hasApiKey()) {
      setFrameworkGenerating(frameworkId)
      addGenerating(frameworkId)
      startTimeRef.current = genStartTime

      await new Promise<void>((r) => setTimeout(r, 500))
      const sample = sampleData[frameworkId as keyof typeof sampleData]
      if (sample) {
        setFrameworkData(frameworkId, sample as FrameworkData)
      } else {
        setFrameworkError(frameworkId, '이 프레임워크의 샘플 데이터가 없습니다. API 키를 설정해 주세요.')
      }
      const durationMs = Date.now() - genStartTime
      lastDurationsRef.current.set(frameworkId, durationMs)
      removeGenerating(frameworkId)
      return
    }

    setFrameworkGenerating(frameworkId)
    addGenerating(frameworkId)
    startTimeRef.current = genStartTime

    try {
      const template = promptTemplates[frameworkId as keyof typeof promptTemplates]
      if (!template) throw new Error(`프롬프트 템플릿이 없습니다: ${frameworkId}`)

      const context = getFrameworkContext(frameworkId)
      let { system, user } = template({
        businessItem: state.businessItem,
        context,
      })

      // 소스 자료(텍스트/URL)를 user 프롬프트에 추가
      const sources = state.sourceMaterials ?? []
      const sourceText = buildSourceContext(sources)
      if (sourceText) {
        user += sourceText
      }

      // 일관성 검증 피드백이 있으면 프롬프트에 개선 요청 추가
      if (feedback) {
        user += `\n\n[전략 일관성 검증 피드백 — 반드시 반영]\n${feedback}\n위 피드백을 반영하여 기존 분석을 개선해 주세요. 다른 프레임워크와의 일관성을 확보하면서 해당 이슈를 해결하세요.`
      }

      // 이미지 소스가 있으면 멀티모달 콘텐츠 블록으로 변환
      const imageSources = sources.filter((s) => s.type === 'image' && s.content)
      let userContent: UserContent = user
      if (imageSources.length > 0) {
        const blocks: ContentBlock[] = [
          { type: 'text', text: user },
          ...imageSources.map((img) => ({
            type: 'image_url' as const,
            image_url: { url: img.content },
          })),
        ]
        userContent = blocks
      }

      const controller = new AbortController()
      abortRef.current = controller

      const responseText = await withRetry(() =>
        callAI({
          apiKey,
          model: settings.model,
          system,
          user: userContent,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
          signal: controller.signal,
        })
      )
      const data = parseJsonResponse(responseText)
      setFrameworkData(frameworkId, data as unknown as FrameworkData)

      // 성공 시 메트릭 기록
      const durationMs = Date.now() - genStartTime
      lastDurationsRef.current.set(frameworkId, durationMs)
      recordMetric({ frameworkId, model: settings.model, durationMs })

      logActivity('ai_generate', { framework: frameworkId, model: settings.model, feedback: !!feedback })
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

  const generateAll = useCallback(async (frameworkIds: string[], feedback?: string) => {
    for (const id of frameworkIds) {
      await generate(id, feedback)
    }
  }, [generate])

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
  }, [])

  const generatingSet = generatingRef.current
  const isGeneratingAny = generatingSet.size > 0
  const currentGenerating = generatingSet.size > 0 ? [...generatingSet][0] : null

  // 1초 간격으로 elapsedMs 갱신 (생성 중일 때만)
  useEffect(() => {
    if (!isGeneratingAny) {
      setElapsedMs(0)
      return
    }
    const timer = setInterval(() => {
      if (startTimeRef.current > 0) {
        setElapsedMs(Date.now() - startTimeRef.current)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [isGeneratingAny])

  return {
    generate, generateAll, cancel,
    isGeneratingAny, currentGenerating, generatingSet,
    elapsedMs,
    lastDurations: lastDurationsRef.current,
  }
}
