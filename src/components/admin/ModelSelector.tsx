import { useState } from 'react'
import { useSettings } from '../../hooks/useSettings'
import { useToast } from '../../hooks/useToast'
import { MODELS, MODEL_CATEGORIES } from '../../data/modelDefinitions'
import { Bot, Loader2, Save, Key, Eye, EyeOff } from 'lucide-react'

export default function ModelSelector() {
  const { settings, updateGlobalModel, isModelLoading, skyworkApiKey, updateSkyworkApiKey } = useSettings()
  const toast = useToast()
  const [selected, setSelected] = useState(settings.model)
  const [isSaving, setIsSaving] = useState(false)
  const [skyworkKey, setSkyworkKey] = useState(skyworkApiKey)
  const [isSavingSkywork, setIsSavingSkywork] = useState(false)
  const [showSkyworkKey, setShowSkyworkKey] = useState(false)

  const isDirty = selected !== settings.model
  const isSkyworkDirty = skyworkKey !== skyworkApiKey

  const handleSave = async () => {
    setIsSaving(true)
    const { error } = await updateGlobalModel(selected)
    setIsSaving(false)
    if (error) {
      toast.error(`모델 변경 실패: ${error}`)
    } else {
      toast.success('전역 AI 모델이 변경되었습니다.')
    }
  }

  const handleSaveSkywork = async () => {
    setIsSavingSkywork(true)
    const { error } = await updateSkyworkApiKey(skyworkKey.trim())
    setIsSavingSkywork(false)
    if (error) {
      toast.error(`Skywork API 키 저장 실패: ${error}`)
    } else {
      toast.success('Skywork API 키가 저장되었습니다.')
    }
  }

  if (isModelLoading) {
    return (
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          모델 설정 로딩 중...
        </div>
      </section>
    )
  }

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
          <Bot className="w-5 h-5" />
          전역 AI 모델 설정
        </h2>
        {isDirty && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            저장
          </button>
        )}
      </div>

      <div className="p-5">
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
                  const isSelected = selected === model.id
                  return (
                    <button
                      key={model.id}
                      onClick={() => setSelected(model.id)}
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

        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">
          선택한 모델은 모든 사용자에게 즉시 적용됩니다.
        </p>
      </div>

      {/* Skywork API 키 관리 */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <Key className="w-4 h-4" />
            Skywork API 키 (재무 시뮬레이션용)
          </h3>
          {isSkyworkDirty && (
            <button
              onClick={handleSaveSkywork}
              disabled={isSavingSkywork}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-lg text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 transition-colors"
            >
              {isSavingSkywork ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              저장
            </button>
          )}
        </div>
        <div className="relative">
          <input
            type={showSkyworkKey ? 'text' : 'password'}
            value={skyworkKey}
            onChange={(e) => setSkyworkKey(e.target.value)}
            placeholder="sk-... (Skywork API 키를 입력하세요)"
            className="w-full pr-10 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="button"
            onClick={() => setShowSkyworkKey(!showSkyworkKey)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showSkyworkKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5">
          Skywork API 키를 설정하면 프리미엄 사용자의 재무 시뮬레이션에 Skywork AI가 사용됩니다.
          미설정 시 OpenRouter를 통해 실행됩니다.
        </p>
      </div>
    </section>
  )
}
