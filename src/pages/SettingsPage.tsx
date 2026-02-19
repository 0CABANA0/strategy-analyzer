import React, { useState } from 'react'
import { useSettings } from '../hooks/useSettings'
import { MODELS, MODEL_CATEGORIES, getModelById } from '../data/modelDefinitions'
import { Key, Bot, Eye, EyeOff, CheckCircle2, ExternalLink, Shield, Sun, Moon, Monitor, Loader2, Zap, SlidersHorizontal } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import { useToast } from '../hooks/useToast'
import type { ThemeMode } from '../hooks/useTheme'

export default function SettingsPage() {
  const { settings, updateSetting, apiKey, browserApiKey, setBrowserApiKey, envKeyExists } = useSettings()
  const [showKey, setShowKey] = useState(false)
  const [testingKey, setTestingKey] = useState(false)
  const selectedModel = getModelById(settings.model)
  const { theme, setTheme } = useTheme()
  const toast = useToast()

  const THEME_OPTIONS: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: '라이트', icon: Sun },
    { value: 'dark', label: '다크', icon: Moon },
    { value: 'system', label: '시스템', icon: Monitor },
  ]

  const handleTestApiKey = async () => {
    if (!apiKey) {
      toast.warning('API 키를 먼저 입력해 주세요.')
      return
    }

    setTestingKey(true)
    try {
      const response = await fetch('/api/openrouter/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      })

      if (response.ok) {
        toast.success('API 키가 유효합니다!')
      } else if (response.status === 401) {
        toast.error('API 키가 유효하지 않습니다. 키를 확인해 주세요.')
      } else {
        toast.error(`API 테스트 실패 (HTTP ${response.status})`)
      }
    } catch {
      toast.error('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해 주세요.')
    } finally {
      setTestingKey(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">설정</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
        {/* API Key */}
        <div className="p-5">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <Key className="w-4 h-4" />
            OpenRouter API Key
          </label>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-500 hover:underline inline-flex items-center gap-0.5"
            >
              openrouter.ai/keys <ExternalLink className="w-3 h-3" />
            </a>
            에서 발급받으세요. 하나의 키로 Claude, GPT, Gemini, DeepSeek 모두 사용 가능합니다.
          </p>

          {/* .env 키 상태 */}
          {envKeyExists && (
            <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-400">
              <Shield className="w-4 h-4" />
              <span><code>.env</code> 파일에서 API 키를 불러왔습니다.</span>
            </div>
          )}

          {/* 브라우저 입력 (fallback) */}
          {!envKeyExists && (
            <>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={browserApiKey}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBrowserApiKey(e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5">
                또는 <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">.env</code> 파일에{' '}
                <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">VITE_OPENROUTER_API_KEY=sk-or-v1-...</code>를 추가하세요 (권장).
              </p>
            </>
          )}

          {/* 키 상태 + 테스트 버튼 */}
          <div className="flex items-center gap-2 mt-2">
            {apiKey && (
              <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                API 키 설정됨 ({apiKey.slice(0, 12)}...{apiKey.slice(-4)})
              </div>
            )}
            {apiKey && (
              <button
                onClick={handleTestApiKey}
                disabled={testingKey}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50"
              >
                {testingKey ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Zap className="w-3 h-3" />
                )}
                테스트
              </button>
            )}
          </div>
        </div>

        {/* 테마 */}
        <div className="p-5">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            <Sun className="w-4 h-4" />
            테마
          </label>
          <div className="flex gap-2">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                  theme === value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                    : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* AI 파라미터 */}
        <div className="p-5">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            <SlidersHorizontal className="w-4 h-4" />
            AI 파라미터
          </label>

          {/* Temperature */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-500 dark:text-gray-400">Temperature</span>
              <span className="text-xs font-mono text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                {settings.temperature.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1.5"
              step="0.1"
              value={settings.temperature}
              onChange={(e) => updateSetting('temperature', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-primary-500"
            />
            <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
              <span>정확함 (0)</span>
              <span>창의적 (1.5)</span>
            </div>
          </div>

          {/* Max Tokens */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-500 dark:text-gray-400">최대 출력 토큰</span>
              <span className="text-xs font-mono text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                {settings.maxTokens.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="1024"
              max="16384"
              step="1024"
              value={settings.maxTokens}
              onChange={(e) => updateSetting('maxTokens', parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-primary-500"
            />
            <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
              <span>1,024</span>
              <span>16,384</span>
            </div>
          </div>
        </div>

        {/* 모델 선택 */}
        <div className="p-5">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            <Bot className="w-4 h-4" />
            AI 모델 선택
          </label>

          {MODEL_CATEGORIES.map((cat) => {
            const models = MODELS.filter((m) => m.category === cat.id)
            return (
              <div key={cat.id} className="mb-4">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  {cat.label}
                  <span className="font-normal text-gray-400 dark:text-gray-500 normal-case ml-1">— {cat.description}</span>
                </div>
                <div className="space-y-1.5">
                  {models.map((model) => {
                    const isSelected = settings.model === model.id
                    return (
                      <button
                        key={model.id}
                        onClick={() => updateSetting('model', model.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                            : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{model.name}</span>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                              {model.provider}
                            </span>
                            {model.badge && (
                              <span className="text-[10px] text-white bg-primary-500 px-1.5 py-0.5 rounded font-medium">
                                {model.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-400 dark:text-gray-500 text-right">
                            <span>${model.inputPrice} / ${model.outputPrice}</span>
                            <span className="ml-1">per M tokens</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{model.description}</p>
                        <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                          컨텍스트: {model.context} · ID: <code>{model.id}</code>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 현재 선택 요약 */}
      {selectedModel && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs text-gray-500 dark:text-gray-400 text-center">
          현재 모델: <strong className="text-gray-700 dark:text-gray-300">{selectedModel.name}</strong> ({selectedModel.provider})
          {' · '}입력 ${selectedModel.inputPrice}/M · 출력 ${selectedModel.outputPrice}/M
        </div>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 text-center">
        API 키가 없으면 샘플 데이터로 체험할 수 있습니다.
        {!envKeyExists && ' 브라우저에 입력한 키는 LocalStorage에만 저장됩니다.'}
      </p>
    </div>
  )
}
