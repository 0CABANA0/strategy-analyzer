import { useState } from 'react'
import { Plus, X, Save, Trash2 } from 'lucide-react'
import {
  getCustomFrameworks,
  addCustomFramework,
  deleteCustomFramework,
  generateCustomId,
  type CustomFramework,
} from '../../utils/customFrameworks'
import { useToast } from '../../hooks/useToast'
import type { FieldDef, FieldType } from '../../types/framework'

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: '텍스트',
  list: '리스트',
  select: '선택',
  object: '객체',
  table: '테이블',
}

const DEFAULT_SECTIONS = [
  { value: 1, label: '1. 기획배경' },
  { value: 2, label: '2. 환경분석' },
  { value: 3, label: '3. 시사점' },
  { value: 4, label: '4. 추진전략' },
  { value: 5, label: '5. 기대효과' },
]

interface FieldEntry {
  key: string
  label: string
  type: FieldType
}

interface CustomFrameworkEditorProps {
  onClose: () => void
  onSaved: () => void
}

export default function CustomFrameworkEditor({ onClose, onSaved }: CustomFrameworkEditorProps) {
  const toast = useToast()
  const [existing] = useState(() => getCustomFrameworks())

  const [name, setName] = useState('')
  const [fullName, setFullName] = useState('')
  const [section, setSection] = useState(2)
  const [description, setDescription] = useState('')
  const [prompt, setPrompt] = useState('')
  const [fields, setFields] = useState<FieldEntry[]>([
    { key: 'analysis', label: '분석 결과', type: 'text' },
  ])

  const addField = () => {
    setFields([...fields, { key: `field${fields.length + 1}`, label: '', type: 'text' }])
  }

  const removeField = (idx: number) => {
    setFields(fields.filter((_, i) => i !== idx))
  }

  const updateField = (idx: number, updates: Partial<FieldEntry>) => {
    const next = [...fields]
    next[idx] = { ...next[idx], ...updates }
    setFields(next)
  }

  const handleSave = () => {
    if (!name.trim()) { toast.error('프레임워크 이름을 입력하세요.'); return }
    if (fields.length === 0) { toast.error('최소 1개 필드가 필요합니다.'); return }
    if (!prompt.trim()) { toast.error('AI 프롬프트를 입력하세요.'); return }

    const fieldDefs: Record<string, FieldDef> = {}
    for (const f of fields) {
      if (!f.key.trim() || !f.label.trim()) { toast.error('모든 필드의 키와 라벨을 입력하세요.'); return }
      fieldDefs[f.key] = { label: f.label, type: f.type } as FieldDef
    }

    const fw: CustomFramework = {
      id: generateCustomId(),
      name: name.trim(),
      fullName: fullName.trim() || name.trim(),
      section,
      description: description.trim(),
      fields: fieldDefs,
      prompt: prompt.trim(),
      createdAt: new Date().toISOString(),
    }

    addCustomFramework(fw)
    toast.success(`"${fw.name}" 프레임워크가 추가되었습니다.`)
    onSaved()
    onClose()
  }

  const handleDelete = (id: string, fwName: string) => {
    deleteCustomFramework(id)
    toast.success(`"${fwName}" 삭제됨`)
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">커스텀 프레임워크</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-5 space-y-4">
          {/* 기존 커스텀 프레임워크 목록 */}
          {existing.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">등록된 커스텀 프레임워크</div>
              {existing.map((fw) => (
                <div key={fw.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{fw.name}</span>
                    <span className="text-xs text-gray-400 ml-2">섹션 {fw.section}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(fw.id, fw.name)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <div className="border-b border-gray-200 dark:border-gray-700 pt-2" />
            </div>
          )}

          {/* 새 프레임워크 정의 */}
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400">새 프레임워크 추가</div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400">이름 *</label>
              <input
                value={name} onChange={(e) => setName(e.target.value)}
                placeholder="예: BCG 매트릭스"
                className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400">영문명</label>
              <input
                value={fullName} onChange={(e) => setFullName(e.target.value)}
                placeholder="예: BCG Growth-Share Matrix"
                className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400">섹션</label>
              <select
                value={section} onChange={(e) => setSection(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
              >
                {DEFAULT_SECTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400">설명</label>
              <input
                value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="프레임워크 설명"
                className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
              />
            </div>
          </div>

          {/* 필드 정의 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">필드 정의 *</label>
              <button onClick={addField} className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700">
                <Plus className="w-3 h-3" /> 필드 추가
              </button>
            </div>
            <div className="space-y-2">
              {fields.map((f, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    value={f.key} onChange={(e) => updateField(idx, { key: e.target.value })}
                    placeholder="키 (영문)"
                    className="w-28 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded"
                  />
                  <input
                    value={f.label} onChange={(e) => updateField(idx, { label: e.target.value })}
                    placeholder="라벨 (한글)"
                    className="flex-1 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded"
                  />
                  <select
                    value={f.type} onChange={(e) => updateField(idx, { type: e.target.value as FieldType })}
                    className="w-20 px-1 py-1.5 text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded"
                  >
                    {Object.entries(FIELD_TYPE_LABELS).map(([t, label]) => (
                      <option key={t} value={t}>{label}</option>
                    ))}
                  </select>
                  {fields.length > 1 && (
                    <button onClick={() => removeField(idx)} className="p-1 text-gray-400 hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI 프롬프트 */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">AI 프롬프트 *</label>
            <textarea
              value={prompt} onChange={(e) => setPrompt(e.target.value)}
              placeholder="이 프레임워크로 위 사업 아이템을 분석하세요. 다음 관점에서 분석하세요: ..."
              rows={4}
              className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
            />
          </div>
        </div>

        {/* 하단 */}
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            취소
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Save className="w-4 h-4" />
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
