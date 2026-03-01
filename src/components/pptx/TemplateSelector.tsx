/** PPTX 템플릿 선택 + 업로드 드롭다운 */
import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Upload, Trash2, Loader2 } from 'lucide-react'
import {
  getTemplates,
  setSelectedTemplateId,
  addTemplate,
  deleteTemplate,
  isBuiltInTemplate,
  extractTemplateFromPptx,
} from '../../utils/pptxTemplateStore'
import type { PptxTemplate } from '../../types/pptxTemplate'
import { useToast } from '../../hooks/useToast'

interface TemplateSelectorProps {
  selectedId: string
  onSelect: (id: string, template: PptxTemplate) => void
}

export default function TemplateSelector({ selectedId, onSelect }: TemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [templates, setTemplates] = useState<PptxTemplate[]>(() => getTemplates())
  const [isUploading, setIsUploading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  const selected = templates.find((t) => t.id === selectedId) || templates[0]

  // 바깥 클릭 시 닫기
  useEffect(() => {
    if (!isOpen) return
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  const handleSelect = (t: PptxTemplate) => {
    setSelectedTemplateId(t.id)
    onSelect(t.id, t)
    setIsOpen(false)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const template = await extractTemplateFromPptx(file)
      addTemplate(template)
      const updated = getTemplates()
      setTemplates(updated)
      handleSelect(template)
      toast.success(`템플릿 "${template.name}" 추가됨`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '템플릿 추출 실패')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = (e: React.MouseEvent, t: PptxTemplate) => {
    e.stopPropagation()
    deleteTemplate(t.id)
    const updated = getTemplates()
    setTemplates(updated)
    if (selectedId === t.id) {
      handleSelect(updated[0])
    }
    toast.success(`템플릿 "${t.name}" 삭제됨`)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        {/* 색상 미리보기 */}
        <span
          className="w-2.5 h-2.5 rounded-sm shrink-0"
          style={{ backgroundColor: `#${selected.colors.primary}` }}
        />
        <span className="truncate max-w-[120px]">{selected.name}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-1">
          {/* 템플릿 목록 */}
          {templates.map((t) => (
            <button
              type="button"
              key={t.id}
              onClick={() => handleSelect(t)}
              className={`flex items-center gap-2 px-3 py-2 w-full text-left cursor-pointer transition-colors ${
                t.id === selectedId
                  ? 'bg-indigo-50 dark:bg-indigo-900/20'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              {/* 선택 표시 */}
              <span
                className={`w-3 h-3 rounded-full border-2 shrink-0 ${
                  t.id === selectedId
                    ? 'border-indigo-500 bg-indigo-500'
                    : 'border-gray-300 dark:border-gray-500'
                }`}
              />

              {/* 정보 */}
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-800 dark:text-gray-200 truncate">{t.name}</div>
                <div className="text-xs text-gray-400">
                  {t.layout.type === 'CUSTOM'
                    ? `${t.layout.width}" × ${t.layout.height}"`
                    : t.layout.type.replace('LAYOUT_', '')}
                  {t.isDefault && ' · 기본'}
                </div>
              </div>

              {/* 색상 칩 */}
              <div className="flex gap-0.5 shrink-0">
                {[t.colors.primary, t.colors.secondary, t.colors.accent].map((c, i) => (
                  <span
                    key={i}
                    className="w-3 h-3 rounded-sm border border-gray-200 dark:border-gray-600"
                    style={{ backgroundColor: `#${c}` }}
                  />
                ))}
              </div>

              {/* 삭제 버튼 (커스텀만) */}
              {!isBuiltInTemplate(t.id) && (
                <button
                  onClick={(e) => handleDelete(e, t)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                  title="삭제"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </button>
          ))}

          {/* 구분선 + 업로드 */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
          <label
            className={`flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer transition-colors ${
              isUploading ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {isUploading ? '테마 추출 중...' : 'PPTX 템플릿 업로드'}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pptx"
              onChange={handleUpload}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  )
}
