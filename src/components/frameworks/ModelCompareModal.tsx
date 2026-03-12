import { useState, useCallback } from 'react'
import { X, Loader2, Check, ArrowLeftRight } from 'lucide-react'
import { MODELS } from '../../data/modelDefinitions'
import { FRAMEWORKS } from '../../data/frameworkDefinitions'
import { useStrategy } from '../../hooks/useStrategyDocument'
import { useSettings } from '../../hooks/useSettings'
import { callAI, parseJsonResponse } from '../../services/aiService'
import { promptTemplates } from '../../services/prompts'
import { buildSourceContext } from '../../services/prompts/common'
import { withRetry } from '../../utils/retry'
import { getUserFriendlyMessage } from '../../utils/errors'
import type { FrameworkData, UserContent, ContentBlock } from '../../types'

interface ModelCompareModalProps {
  frameworkId: string
  onClose: () => void
}

interface CompareResult {
  model: string
  modelName: string
  data: FrameworkData | null
  error: string | null
  loading: boolean
  durationMs: number
}

/**
 * 모델 A/B 비교 모달
 * 같은 프레임워크를 2개 모델로 동시 생성 → 결과 비교 → 선택
 */
export default function ModelCompareModal({ frameworkId, onClose }: ModelCompareModalProps) {
  const { state, setFrameworkData, getFrameworkContext } = useStrategy()
  const { apiKey, settings } = useSettings()
  const fw = FRAMEWORKS[frameworkId]

  const [modelA, setModelA] = useState(settings.model)
  const [modelB, setModelB] = useState(
    MODELS.find((m) => m.id !== settings.model)?.id || MODELS[0].id
  )
  const [results, setResults] = useState<[CompareResult, CompareResult] | null>(null)

  const runCompare = useCallback(async () => {
    if (!state?.businessItem) return

    const template = promptTemplates[frameworkId as keyof typeof promptTemplates]
    if (!template) return

    const context = getFrameworkContext(frameworkId)
    const { system, user: userText } = template({
      businessItem: state.businessItem,
      context,
    })

    // 소스 자료 추가
    const sources = state.sourceMaterials ?? []
    const sourceText = buildSourceContext(sources)
    const fullUserText = sourceText ? userText + sourceText : userText

    // 멀티모달 콘텐츠
    const imageSources = sources.filter((s) => s.type === 'image' && s.content)
    let userContent: UserContent = fullUserText
    if (imageSources.length > 0) {
      const blocks: ContentBlock[] = [
        { type: 'text', text: fullUserText },
        ...imageSources.map((img) => ({
          type: 'image_url' as const,
          image_url: { url: img.content },
        })),
      ]
      userContent = blocks
    }

    const initialResults: [CompareResult, CompareResult] = [
      { model: modelA, modelName: MODELS.find((m) => m.id === modelA)?.name || modelA, data: null, error: null, loading: true, durationMs: 0 },
      { model: modelB, modelName: MODELS.find((m) => m.id === modelB)?.name || modelB, data: null, error: null, loading: true, durationMs: 0 },
    ]
    setResults([...initialResults])

    // 두 모델을 병렬로 실행
    const runModel = async (model: string, idx: 0 | 1) => {
      const start = Date.now()
      try {
        const responseText = await withRetry(() =>
          callAI({
            apiKey,
            model,
            system,
            user: userContent,
            temperature: settings.temperature,
            maxTokens: settings.maxTokens,
          })
        )
        const data = parseJsonResponse(responseText) as unknown as FrameworkData
        setResults((prev) => {
          if (!prev) return prev
          const next = [...prev] as [CompareResult, CompareResult]
          next[idx] = { ...next[idx], data, loading: false, durationMs: Date.now() - start }
          return next
        })
      } catch (err) {
        setResults((prev) => {
          if (!prev) return prev
          const next = [...prev] as [CompareResult, CompareResult]
          next[idx] = { ...next[idx], error: getUserFriendlyMessage(err), loading: false, durationMs: Date.now() - start }
          return next
        })
      }
    }

    await Promise.all([runModel(modelA, 0), runModel(modelB, 1)])
  }, [state, frameworkId, modelA, modelB, apiKey, settings, getFrameworkContext])

  const handleSelect = (idx: 0 | 1) => {
    if (!results?.[idx].data) return
    setFrameworkData(frameworkId, results[idx].data!)
    onClose()
  }

  const isRunning = results?.some((r) => r.loading) ?? false

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-primary-500" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">
              모델 A/B 비교 — {fw?.name}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 모델 선택 */}
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-3">
          <label className="text-xs text-gray-500 dark:text-gray-400">모델 A:</label>
          <select
            value={modelA}
            onChange={(e) => setModelA(e.target.value)}
            disabled={isRunning}
            className="text-sm px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>{m.name} ({m.provider})</option>
            ))}
          </select>

          <ArrowLeftRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />

          <label className="text-xs text-gray-500 dark:text-gray-400">모델 B:</label>
          <select
            value={modelB}
            onChange={(e) => setModelB(e.target.value)}
            disabled={isRunning}
            className="text-sm px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>{m.name} ({m.provider})</option>
            ))}
          </select>

          <button
            onClick={runCompare}
            disabled={isRunning || modelA === modelB}
            className="ml-auto flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowLeftRight className="w-4 h-4" />}
            {isRunning ? '비교 중...' : '비교 실행'}
          </button>
        </div>

        {/* 결과 비교 영역 */}
        <div className="flex-1 overflow-auto p-5">
          {!results ? (
            <div className="text-center py-12 text-sm text-gray-400 dark:text-gray-500">
              두 모델을 선택하고 "비교 실행"을 클릭하세요.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {results.map((r, idx) => (
                <div
                  key={r.model}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {r.modelName}
                    </span>
                    {!r.loading && r.durationMs > 0 && (
                      <span className="text-xs text-gray-400">{(r.durationMs / 1000).toFixed(1)}초</span>
                    )}
                  </div>
                  <div className="p-3 min-h-[200px]">
                    {r.loading && (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
                      </div>
                    )}
                    {r.error && (
                      <div className="text-sm text-red-500 dark:text-red-400">{r.error}</div>
                    )}
                    {r.data && (
                      <div className="space-y-2">
                        <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap max-h-60 overflow-auto bg-gray-50 dark:bg-gray-900 p-2 rounded">
                          {JSON.stringify(r.data, null, 2).slice(0, 2000)}
                          {JSON.stringify(r.data, null, 2).length > 2000 && '\n...'}
                        </pre>
                        <button
                          onClick={() => handleSelect(idx as 0 | 1)}
                          className="w-full flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          이 결과 선택
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
