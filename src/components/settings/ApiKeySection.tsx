import React, { useState } from 'react'
import { useSettings } from '../../hooks/useSettings'
import { useToast } from '../../hooks/useToast'
import { Key, Eye, EyeOff, CheckCircle2, ExternalLink, Shield, Loader2, Zap } from 'lucide-react'

export default function ApiKeySection() {
  const { apiKey, browserApiKey, setBrowserApiKey, envKeyExists } = useSettings()
  const [showKey, setShowKey] = useState(false)
  const [testingKey, setTestingKey] = useState(false)
  const toast = useToast()

  const handleTestApiKey = async () => {
    if (!apiKey) {
      toast.warning('API 키를 먼저 입력해 주세요.')
      return
    }

    setTestingKey(true)
    try {
      const modelsUrl = import.meta.env.DEV
        ? '/api/openrouter/api/v1/models'
        : 'https://openrouter.ai/api/v1/models'
      const response = await fetch(modelsUrl, {
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

      {envKeyExists && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-400">
          <Shield className="w-4 h-4" />
          <span><code>.env</code> 파일에서 API 키를 불러왔습니다.</span>
        </div>
      )}

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
              aria-label={showKey ? 'API 키 숨기기' : 'API 키 보기'}
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
  )
}
