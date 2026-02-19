import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStrategy } from '../hooks/useStrategyDocument'
import { useSettings } from '../hooks/useSettings'
import { useRecommendation } from '../hooks/useRecommendation'
import RecommendationPanel from '../components/recommendation/RecommendationPanel'
import { Brain, ArrowRight, AlertCircle, Sparkles, Wand2 } from 'lucide-react'

const EXAMPLES: string[] = [
  'AI 기반 식단관리 앱',
  '중소기업 ERP SaaS 플랫폼',
  '전기차 충전 인프라 사업',
  'K-뷰티 해외 D2C 플랫폼',
  '노인돌봄 로봇 서비스',
]

export default function HomePage() {
  const [input, setInput] = useState('')
  const navigate = useNavigate()
  const { initDocument } = useStrategy()
  const { hasApiKey } = useSettings()
  const { recommendation, isLoading, error, generateRecommendation } = useRecommendation()

  const [showRecommendation, setShowRecommendation] = useState(false)

  const handleStart = () => {
    const item = input.trim()
    if (!item) return
    initDocument(item)
    navigate('/analyzer')
  }

  const handleRecommend = async () => {
    const item = input.trim()
    if (!item) return
    initDocument(item)
    setShowRecommendation(true)
    await generateRecommendation(item)
  }

  const handleStartRecommended = () => {
    navigate('/analyzer')
  }

  const handleStartAll = () => {
    navigate('/analyzer')
  }

  const handleExample = (example: string) => {
    setInput(example)
    setShowRecommendation(false)
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-xl animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/40 mb-4">
            <Brain className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">전략분석기</h1>
          <p className="text-gray-500 dark:text-gray-400">
            사업 아이템을 입력하면 16개 프레임워크 기반
            <br />
            전략 PRD를 AI가 자동 생성합니다.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            사업 아이템
          </label>
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setInput(e.target.value)
                setShowRecommendation(false)
              }}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleStart()}
              placeholder="예: AI 기반 식단관리 앱"
              className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              autoFocus
            />
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {EXAMPLES.map((ex: string) => (
              <button
                key={ex}
                onClick={() => handleExample(ex)}
                className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-full transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>

          {!hasApiKey() && (
            <div className="flex items-start gap-2 mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-sm text-amber-700 dark:text-amber-400">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                AI 생성을 위해{' '}
                <button
                  onClick={() => navigate('/settings')}
                  className="underline font-medium"
                >
                  설정
                </button>
                에서 OpenRouter API 키를 입력하세요 (또는 <code className="text-xs bg-amber-100 dark:bg-amber-900/30 px-1 rounded">.env</code> 파일). 키 없이 샘플 데이터로도 사용 가능합니다.
              </span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-700 dark:text-red-400">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {showRecommendation && (isLoading || recommendation) ? (
            <div className="mt-4">
              <RecommendationPanel
                recommendation={recommendation!}
                isLoading={isLoading}
                onStartAll={handleStartAll}
                onStartRecommended={handleStartRecommended}
              />
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              {hasApiKey() && (
                <button
                  onClick={handleRecommend}
                  disabled={!input.trim() || isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 border-2 border-primary-300 dark:border-primary-700 hover:border-primary-400 dark:hover:border-primary-600 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:border-gray-200 dark:disabled:border-gray-600 disabled:cursor-not-allowed text-primary-700 dark:text-primary-400 disabled:text-gray-400 dark:disabled:text-gray-500 font-medium rounded-xl transition-colors"
                >
                  <Wand2 className="w-5 h-5" />
                  분석 전략 추천받기
                </button>
              )}
              <button
                onClick={handleStart}
                disabled={!input.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
              >
                <Sparkles className="w-5 h-5" />
                전체 분석 시작
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
          PEST / 3C / SWOT / 5Forces / Value Chain / 7S / VRIO / Ansoff / BCG
          <br />
          Generic Strategy / Strategy Canvas / ERRC / STP / 4P / ILC / FAW
        </p>
      </div>
    </div>
  )
}
