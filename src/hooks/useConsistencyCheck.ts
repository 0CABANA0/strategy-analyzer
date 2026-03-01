/** 전략 일관성 검증 훅 — 개선 이력 + 되돌리기 포함 */
import { useCallback, useRef, useState } from 'react'
import { useStrategy } from './useStrategyDocument'
import { useSettings } from './useSettings'
import { callAI, parseJsonResponse } from '../services/aiService'
import { consistencyCheckPrompt } from '../services/prompts'
import { withRetry } from '../utils/retry'
import { getUserFriendlyMessage } from '../utils/errors'
import { diffFrameworkData, trackIssueChanges } from '../utils/frameworkDiff'
import { FRAMEWORKS } from '../data/frameworkDefinitions'
import type { ConsistencyResult, ConsistencyIssue, ImprovementRecord, FrameworkChange, ScoreSnapshot, FrameworkData } from '../types'
import type { FieldDef } from '../types'

/** 점수 스냅샷 추출 */
function extractScore(r: ConsistencyResult): ScoreSnapshot {
  return {
    overallScore: r.overallScore,
    logicFlowScore: r.logicFlowScore,
    completenessScore: r.completenessScore,
    alignmentScore: r.alignmentScore,
  }
}

interface UseConsistencyCheckReturn {
  result: ConsistencyResult | null
  previousResult: ConsistencyResult | null
  isLoading: boolean
  error: string | null
  history: ImprovementRecord[]
  runCheck: () => Promise<void>
  /** 개선 실행: 스냅샷 캡처 → 재생성 → 재검증 → 이력 기록 */
  runImprovement: (
    frameworkIds: string[],
    feedback: string,
    issue: ConsistencyIssue,
    generateAll: (ids: string[], feedback: string) => Promise<void>,
  ) => Promise<Set<string>>
  /** 마지막 개선 되돌리기 */
  undoLastImprovement: () => ImprovementRecord | null
}

export function useConsistencyCheck(): UseConsistencyCheckReturn {
  const { state, setFrameworkData } = useStrategy()
  const { settings, apiKey, hasApiKey } = useSettings()
  const [result, setResult] = useState<ConsistencyResult | null>(null)
  const [previousResult, setPreviousResult] = useState<ConsistencyResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<ImprovementRecord[]>([])
  // undo용 프레임워크 데이터 스냅샷 스택
  const undoStackRef = useRef<{ frameworkSnapshots: Record<string, FrameworkData>; record: ImprovementRecord }[]>([])

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

      // 이전 결과 보존
      setResult((prev) => {
        if (prev) setPreviousResult(prev)
        return data
      })
    } catch (err: unknown) {
      console.error('일관성 검증 오류:', err)
      setError(getUserFriendlyMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [state, apiKey, settings.model, settings.maxTokens, hasApiKey])

  const runImprovement = useCallback(async (
    frameworkIds: string[],
    feedback: string,
    issue: ConsistencyIssue,
    generateAll: (ids: string[], feedback: string) => Promise<void>,
  ): Promise<Set<string>> => {
    // 1. 스냅샷: 개선 전 데이터 캡처
    const scoreBefore = result ? extractScore(result) : { overallScore: 0, logicFlowScore: 0, completenessScore: 0, alignmentScore: 0 }
    const issuesBefore = result?.issues ?? []
    const beforeData: Record<string, Record<string, unknown>> = {}
    const frameworkSnapshots: Record<string, FrameworkData> = {}

    for (const fId of frameworkIds) {
      const fState = state.frameworks[fId]
      if (fState?.data) {
        beforeData[fId] = JSON.parse(JSON.stringify(fState.data)) as Record<string, unknown>
        frameworkSnapshots[fId] = JSON.parse(JSON.stringify(fState.data)) as FrameworkData
      }
    }

    // 2. AI 재생성
    await generateAll(frameworkIds, feedback)

    // 3. 변경된 프레임워크 추출
    const frameworkChanges: FrameworkChange[] = []
    const changedIds = new Set<string>()

    for (const fId of frameworkIds) {
      const fw = FRAMEWORKS[fId]
      if (!fw) continue
      const afterState = state.frameworks[fId]
      const afterData = afterState?.data ? (afterState.data as unknown as Record<string, unknown>) : null
      const fieldDefs = fw.fields as Record<string, FieldDef>

      const fields = diffFrameworkData(
        fId,
        beforeData[fId] ?? null,
        afterData,
        fieldDefs,
      )

      if (fields.length > 0) {
        changedIds.add(fId)
        frameworkChanges.push({
          frameworkId: fId,
          frameworkName: fw.name,
          fields,
        })
      }
    }

    // 4. 재검증
    // runCheck 직접 호출 대신 인라인 실행 (result를 즉시 사용하기 위해)
    let scoreAfter = scoreBefore
    let issuesAfter: ConsistencyIssue[] = []

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
      const newResult = parseJsonResponse(responseText) as unknown as ConsistencyResult
      if (typeof newResult.overallScore === 'number' && Array.isArray(newResult.issues)) {
        scoreAfter = extractScore(newResult)
        issuesAfter = newResult.issues
        setPreviousResult(result)
        setResult(newResult)
      }
    } catch (err) {
      console.error('개선 후 재검증 오류:', err)
    }

    // 5. 이슈 변경 추적
    const trackedIssues = trackIssueChanges(issuesBefore, issuesAfter)

    // 6. 이력 기록
    const record: ImprovementRecord = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      trigger: issue,
      frameworkChanges,
      scoreBefore,
      scoreAfter,
      trackedIssues,
    }
    setHistory((prev) => [...prev, record])

    // 7. Undo 스택에 push
    undoStackRef.current.push({ frameworkSnapshots, record })

    return changedIds
  }, [result, state, apiKey, settings.model, settings.maxTokens])

  const undoLastImprovement = useCallback((): ImprovementRecord | null => {
    const entry = undoStackRef.current.pop()
    if (!entry) return null

    // 프레임워크 데이터 복원
    for (const [fId, data] of Object.entries(entry.frameworkSnapshots)) {
      setFrameworkData(fId, data)
    }

    // 이력에서 제거
    setHistory((prev) => prev.filter((r) => r.id !== entry.record.id))

    return entry.record
  }, [setFrameworkData])

  return { result, previousResult, isLoading, error, history, runCheck, runImprovement, undoLastImprovement }
}
