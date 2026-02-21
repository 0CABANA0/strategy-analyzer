import React from 'react'
import { FileText, Trash2, ArrowRight, CheckSquare, Square, Loader2 } from 'lucide-react'
import type { DocumentMeta } from '../../types'

interface DocumentListProps {
  docs: DocumentMeta[]
  selected: Set<string>
  loadingDocId: string | null
  onLoad: (doc: DocumentMeta) => void
  onToggleSelect: (e: React.MouseEvent, id: string) => void
  onDeleteClick: (e: React.MouseEvent<HTMLButtonElement>, id: string) => void
}

export default function DocumentList({ docs, selected, loadingDocId, onLoad, onToggleSelect, onDeleteClick }: DocumentListProps) {
  return (
    <div className="space-y-2">
      {docs.map((doc: DocumentMeta) => (
        <div
          key={doc.id}
          onClick={() => onLoad(doc)}
          onKeyDown={(e) => e.key === 'Enter' && onLoad(doc)}
          role="button"
          tabIndex={0}
          className="w-full text-left bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-sm transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={(e) => onToggleSelect(e, doc.id)}
                className="shrink-0 text-gray-300 dark:text-gray-600 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                aria-label={selected.has(doc.id) ? '선택 해제' : '선택'}
              >
                {selected.has(doc.id) ? (
                  <CheckSquare className="w-5 h-5 text-primary-500" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
              </button>
              <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500 shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {doc.businessItem}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {new Date(doc.updatedAt).toLocaleString('ko-KR')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {loadingDocId === doc.id && <Loader2 className="w-4 h-4 animate-spin text-primary-500" />}
              <button
                onClick={(e) => onDeleteClick(e, doc.id)}
                className="p-1.5 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                aria-label="삭제"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors" aria-hidden="true" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
