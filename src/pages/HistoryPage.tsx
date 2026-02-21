import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDocumentList } from '../hooks/useLocalStorage'
import { useStrategy } from '../hooks/useStrategyDocument'
import { useToast } from '../hooks/useToast'
import { supabase } from '../lib/supabase'
import ConfirmModal from '../components/common/ConfirmModal'
import SearchSortBar from '../components/history/SearchSortBar'
import DocumentList from '../components/history/DocumentList'
import { Clock, Trash2, Loader2 } from 'lucide-react'
import type { DocumentMeta, StrategyDocument } from '../types'

type SortKey = 'date' | 'name'
type SortDir = 'asc' | 'desc'

export default function HistoryPage() {
  const { docs, isLoading: docsLoading, removeDocument, removeDocuments } = useDocumentList()
  const { loadDocument } = useStrategy()
  const navigate = useNavigate()
  const toast = useToast()

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loadingDocId, setLoadingDocId] = useState<string | null>(null)

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

  const handleLoad = async (doc: DocumentMeta) => {
    setLoadingDocId(doc.id)
    try {
      const { data, error } = await supabase
        .from('strategy_documents')
        .select('*')
        .eq('id', doc.id)
        .single()
      if (!error && data) {
        const stratDoc: StrategyDocument = {
          id: data.id,
          businessItem: data.business_item,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          currentStep: data.current_step,
          frameworks: data.frameworks as StrategyDocument['frameworks'],
          recommendation: data.recommendation as StrategyDocument['recommendation'],
        }
        loadDocument(stratDoc)
        navigate('/analyzer')
        return
      }
      const stored = localStorage.getItem('strategy-analyzer:doc:' + doc.id)
      if (stored) {
        loadDocument(JSON.parse(stored))
        navigate('/analyzer')
      } else {
        toast.error('문서를 찾을 수 없습니다.')
      }
    } catch (e) {
      console.error('문서 불러오기 실패:', e)
      toast.error('문서를 불러오는데 실패했습니다.')
    } finally {
      setLoadingDocId(null)
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
    <main id="main-content" className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">히스토리</h1>

      {docsLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
        </div>
      ) : docs.length === 0 ? (
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
          <SearchSortBar
            search={search}
            onSearchChange={setSearch}
            sortLabel={sortLabel}
            onToggleSort={toggleSort}
          />

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
            <DocumentList
              docs={filteredDocs}
              selected={selected}
              loadingDocId={loadingDocId}
              onLoad={handleLoad}
              onToggleSelect={handleToggleSelect}
              onDeleteClick={handleDeleteClick}
            />
          )}
        </>
      )}

      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="문서 삭제"
        message="이 문서를 삭제하시겠습니까? 삭제된 문서는 복구할 수 없습니다."
        confirmLabel="삭제"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmModal
        isOpen={bulkDeleteMode}
        title="문서 일괄 삭제"
        message={`선택한 ${selected.size}개 문서를 삭제하시겠습니까? 삭제된 문서는 복구할 수 없습니다.`}
        confirmLabel="삭제"
        variant="danger"
        onConfirm={handleConfirmBulkDelete}
        onCancel={() => setBulkDeleteMode(false)}
      />
    </main>
  )
}
