import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDocumentList } from '../hooks/useLocalStorage'
import { useStrategy } from '../hooks/useStrategyDocument'
import { useToast } from '../hooks/useToast'
import ConfirmModal from '../components/common/ConfirmModal'
import { FileText, Trash2, Clock, ArrowRight, Search, ArrowUpDown, CheckSquare, Square } from 'lucide-react'
import type { DocumentMeta } from '../types'

type SortKey = 'date' | 'name'
type SortDir = 'asc' | 'desc'

export default function HistoryPage() {
  const { docs, removeDocument, removeDocuments } = useDocumentList()
  const { loadDocument } = useStrategy()
  const navigate = useNavigate()
  const toast = useToast()

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const filteredDocs = useMemo(() => {
    let result = docs
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter((d) => d.businessItem.toLowerCase().includes(q))
    }
    result = [...result].sort((a, b) => {
      if (sortKey === 'date') {
        return sortDir === 'desc'
          ? new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          : new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      }
      return sortDir === 'desc'
        ? b.businessItem.localeCompare(a.businessItem, 'ko')
        : a.businessItem.localeCompare(b.businessItem, 'ko')
    })
    return result
  }, [docs, search, sortKey, sortDir])

  const handleLoad = (doc: DocumentMeta) => {
    try {
      const stored = localStorage.getItem('strategy-analyzer:doc:' + doc.id)
      if (stored) {
        loadDocument(JSON.parse(stored))
        navigate('/analyzer')
      }
    } catch (e) {
      console.error('문서 불러오기 실패:', e)
      toast.error('문서를 불러오는데 실패했습니다.')
    }
  }

  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.stopPropagation()
    setDeleteTarget(id)
  }

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      removeDocument(deleteTarget)
      selected.delete(deleteTarget)
      setSelected(new Set(selected))
      toast.success('문서가 삭제되었습니다.')
      setDeleteTarget(null)
    }
  }

  const handleToggleSelect = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  const handleSelectAll = () => {
    if (selected.size === filteredDocs.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filteredDocs.map((d) => d.id)))
    }
  }

  const handleBulkDelete = () => {
    if (selected.size === 0) return
    setBulkDeleteMode(true)
  }

  const handleConfirmBulkDelete = () => {
    removeDocuments([...selected])
    toast.success(`${selected.size}개 문서가 삭제되었습니다.`)
    setSelected(new Set())
    setBulkDeleteMode(false)
  }

  const toggleSort = () => {
    if (sortKey === 'date' && sortDir === 'desc') setSortDir('asc')
    else if (sortKey === 'date' && sortDir === 'asc') { setSortKey('name'); setSortDir('asc') }
    else if (sortKey === 'name' && sortDir === 'asc') setSortDir('desc')
    else { setSortKey('date'); setSortDir('desc') }
  }

  const sortLabel = sortKey === 'date'
    ? `날짜 ${sortDir === 'desc' ? '↓' : '↑'}`
    : `이름 ${sortDir === 'desc' ? '↓' : '↑'}`

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">히스토리</h1>

      {docs.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>저장된 문서가 없습니다.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-sm text-primary-600 hover:underline"
          >
            새 분석 시작하기
          </button>
        </div>
      ) : (
        <>
          {/* 검색 + 정렬 + 벌크 */}
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="문서 검색..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
            <button
              onClick={toggleSort}
              className="flex items-center gap-1 px-3 py-2 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors shrink-0"
              title="정렬"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              {sortLabel}
            </button>
          </div>

          {/* 벌크 선택 바 */}
          {selected.size > 0 && (
            <div className="flex items-center justify-between mb-3 px-3 py-2 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg text-sm">
              <div className="flex items-center gap-2">
                <button onClick={handleSelectAll} className="text-primary-600 dark:text-primary-400 hover:underline text-xs">
                  {selected.size === filteredDocs.length ? '전체 해제' : '전체 선택'}
                </button>
                <span className="text-primary-700 dark:text-primary-300 font-medium">{selected.size}개 선택됨</span>
              </div>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-md transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                삭제
              </button>
            </div>
          )}

          {filteredDocs.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm">
              검색 결과가 없습니다.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDocs.map((doc: DocumentMeta) => (
                <button
                  key={doc.id}
                  onClick={() => handleLoad(doc)}
                  className="w-full text-left bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={(e) => handleToggleSelect(e, doc.id)}
                        className="shrink-0 text-gray-300 dark:text-gray-600 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                      >
                        {selected.has(doc.id) ? (
                          <CheckSquare className="w-5 h-5 text-primary-500" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                      <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500 shrink-0" />
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
                      <button
                        onClick={(e) => handleDeleteClick(e, doc.id)}
                        className="p-1.5 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* 단일 삭제 모달 */}
      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="문서 삭제"
        message="이 문서를 삭제하시겠습니까? 삭제된 문서는 복구할 수 없습니다."
        confirmLabel="삭제"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* 벌크 삭제 모달 */}
      <ConfirmModal
        isOpen={bulkDeleteMode}
        title="문서 일괄 삭제"
        message={`선택한 ${selected.size}개 문서를 삭제하시겠습니까? 삭제된 문서는 복구할 수 없습니다.`}
        confirmLabel="삭제"
        variant="danger"
        onConfirm={handleConfirmBulkDelete}
        onCancel={() => setBulkDeleteMode(false)}
      />
    </div>
  )
}
