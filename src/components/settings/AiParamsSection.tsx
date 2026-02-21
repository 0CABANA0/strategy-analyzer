import { useSettings } from '../../hooks/useSettings'
import { getModelById } from '../../data/modelDefinitions'
import { Bot, SlidersHorizontal, Loader2 } from 'lucide-react'

export default function AiParamsSection() {
  const { settings, updateSetting, isModelLoading } = useSettings()
  const currentModel = getModelById(settings.model)

  return (
    <>
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

      {/* 현재 모델 (읽기 전용) */}
      <div className="p-5">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          <Bot className="w-4 h-4" />
          현재 AI 모델
        </label>

        {isModelLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            모델 정보 로딩 중...
          </div>
        ) : currentModel ? (
          <div className="px-3 py-2.5 rounded-lg border-2 border-primary-500 bg-primary-50 dark:bg-primary-900/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{currentModel.name}</span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                  {currentModel.provider}
                </span>
                {currentModel.badge && (
                  <span className="text-[10px] text-white bg-primary-500 px-1.5 py-0.5 rounded font-medium">
                    {currentModel.badge}
                  </span>
                )}
              </div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500 text-right">
                <span>${currentModel.inputPrice} / ${currentModel.outputPrice}</span>
                <span className="ml-1">per M tokens</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{currentModel.description}</p>
            <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
              컨텍스트: {currentModel.context} · ID: <code>{currentModel.id}</code>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            모델: <code className="text-xs">{settings.model}</code>
          </p>
        )}

        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">
          모델은 관리자가 설정합니다. 변경이 필요하면 관리자에게 문의하세요.
        </p>
      </div>
    </>
  )
}
