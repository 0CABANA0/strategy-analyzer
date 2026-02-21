import { useState } from 'react'
import { useSettings } from '../../hooks/useSettings'
import { useToast } from '../../hooks/useToast'
import { MODELS, MODEL_CATEGORIES } from '../../data/modelDefinitions'
import { Bot, Loader2, Save } from 'lucide-react'

export default function ModelSelector() {
  const { settings, updateGlobalModel, isModelLoading } = useSettings()
  const toast = useToast()
  const [selected, setSelected] = useState(settings.model)
  const [isSaving, setIsSaving] = useState(false)

  const isDirty = selected !== settings.model

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
    </section>
  )
}
