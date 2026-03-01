/** 소스 자료 업로드 영역 — 드래그앤드롭 + 파일선택 + URL 입력 */
import { useState, useRef, useCallback } from 'react'
import { Upload, Link2, X, FileText, Image, Globe, Loader2, Plus } from 'lucide-react'
import { useStrategy } from '../../hooks/useStrategyDocument'
import { useToast } from '../../hooks/useToast'
import { processFile, createUrlSource, formatFileSize } from '../../utils/sourceProcessor'
import { MAX_SOURCES } from '../../types/source'
import type { SourceMaterial } from '../../types/source'

const TYPE_ICONS: Record<SourceMaterial['type'], React.ReactNode> = {
  text: <FileText className="w-4 h-4 text-blue-500" />,
  image: <Image className="w-4 h-4 text-green-500" />,
  url: <Globe className="w-4 h-4 text-purple-500" />,
}

export default function SourceUploadZone() {
  const { state, addSource, removeSource } = useStrategy()
  const toast = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlValue, setUrlValue] = useState('')
  const [urlDesc, setUrlDesc] = useState('')

  const sources = state.sourceMaterials ?? []
  const isMaxed = sources.length >= MAX_SOURCES

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArr = Array.from(files)
    if (sources.length + fileArr.length > MAX_SOURCES) {
      toast.error(`소스 자료는 최대 ${MAX_SOURCES}개까지 추가할 수 있습니다.`)
      return
    }

    setIsProcessing(true)
    for (const file of fileArr) {
      try {
        const source = await processFile(file)
        addSource(source)
        toast.success(`"${source.name}" 추가됨`)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : '파일 처리 실패')
      }
    }
    setIsProcessing(false)
  }, [sources.length, addSource, toast])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleAddUrl = () => {
    const trimmed = urlValue.trim()
    if (!trimmed) return
    try {
      new URL(trimmed)
    } catch {
      toast.error('올바른 URL을 입력해주세요. (예: https://example.com)')
      return
    }
    if (sources.length >= MAX_SOURCES) {
      toast.error(`소스 자료는 최대 ${MAX_SOURCES}개까지 추가할 수 있습니다.`)
      return
    }
    const source = createUrlSource(trimmed, urlDesc.trim())
    addSource(source)
    toast.success(`URL "${source.name}" 추가됨`)
    setUrlValue('')
    setUrlDesc('')
    setShowUrlInput(false)
  }

  const handleRemove = (id: string, name: string) => {
    removeSource(id)
    toast.success(`"${name}" 제거됨`)
  }

  // 소스가 없으면 간결한 추가 버튼만 표시
  if (sources.length === 0 && !showUrlInput) {
    return (
      <div className="mt-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            참고자료 추가
          </button>
          <button
            onClick={() => setShowUrlInput(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Link2 className="w-3.5 h-3.5" />
            URL 추가
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".txt,.md,.csv,.json,.xml,.html,.png,.jpg,.jpeg,.webp,.gif"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />
      </div>
    )
  }

  return (
    <div className="mt-3 space-y-2">
      {/* 소스 목록 */}
      {sources.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {sources.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-1.5 pl-2 pr-1 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs group"
              title={s.type === 'url' ? s.content : s.name}
            >
              {TYPE_ICONS[s.type]}
              <span className="text-gray-700 dark:text-gray-300 max-w-[140px] truncate">
                {s.name}
              </span>
              {s.size && (
                <span className="text-gray-400 text-[10px]">{formatFileSize(s.size)}</span>
              )}
              <button
                onClick={() => handleRemove(s.id, s.name)}
                className="p-0.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 드래그앤드롭 영역 (소스가 있을 때) */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border border-dashed rounded-lg p-2 transition-colors ${
          isDragging
            ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-gray-600'
        }`}
      >
        <div className="flex items-center gap-2">
          {isProcessing ? (
            <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
          ) : (
            <Plus className="w-4 h-4 text-gray-400" />
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isMaxed || isProcessing}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 disabled:opacity-50"
          >
            {isProcessing ? '처리 중...' : '파일 추가'}
          </button>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <button
            onClick={() => setShowUrlInput(!showUrlInput)}
            disabled={isMaxed}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 disabled:opacity-50"
          >
            URL 추가
          </button>
          <span className="ml-auto text-[10px] text-gray-400">{sources.length}/{MAX_SOURCES}</span>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".txt,.md,.csv,.json,.xml,.html,.png,.jpg,.jpeg,.webp,.gif"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files)
            e.target.value = ''
          }}
          className="hidden"
        />
      </div>

      {/* URL 입력 */}
      {showUrlInput && (
        <div className="flex flex-col gap-1.5 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <input
            type="url"
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            placeholder="https://example.com/article"
            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
            onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
          />
          <input
            type="text"
            value={urlDesc}
            onChange={(e) => setUrlDesc(e.target.value)}
            placeholder="설명 (선택사항): 이 페이지에 대한 간단한 설명"
            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
            onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
          />
          <div className="flex justify-end gap-1.5">
            <button
              onClick={() => { setShowUrlInput(false); setUrlValue(''); setUrlDesc('') }}
              className="px-2.5 py-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              취소
            </button>
            <button
              onClick={handleAddUrl}
              disabled={!urlValue.trim()}
              className="px-2.5 py-1 text-xs bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              추가
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
