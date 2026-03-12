import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import DocumentCompareView from '../components/compare/DocumentCompareView'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import type { StrategyDocument } from '../types'

/** 2개 문서 비교 페이지 — /compare?a={id}&b={id} */
export default function ComparePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const idA = searchParams.get('a')
  const idB = searchParams.get('b')

  const [docA, setDocA] = useState<StrategyDocument | null>(null)
  const [docB, setDocB] = useState<StrategyDocument | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!idA || !idB) {
      setError('비교할 두 문서를 선택해주세요.')
      setLoading(false)
      return
    }

    const loadDoc = async (id: string): Promise<StrategyDocument | null> => {
      // Supabase 시도
      const { data } = await supabase
        .from('strategy_documents')
        .select('*')
        .eq('id', id)
        .single()

      if (data) {
        return {
          id: data.id,
          businessItem: data.business_item,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          currentStep: data.current_step,
          frameworks: data.frameworks as StrategyDocument['frameworks'],
          recommendation: data.recommendation as StrategyDocument['recommendation'],
        }
      }

      // localStorage fallback
      const stored = localStorage.getItem('strategy-analyzer:doc:' + id)
      return stored ? JSON.parse(stored) : null
    }

    Promise.all([loadDoc(idA), loadDoc(idB)])
      .then(([a, b]) => {
        if (!a || !b) {
          setError('하나 이상의 문서를 찾을 수 없습니다.')
          return
        }
        setDocA(a)
        setDocB(b)
      })
      .catch(() => setError('문서를 불러오는 중 오류가 발생했습니다.'))
      .finally(() => setLoading(false))
  }, [idA, idB])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
      </div>
    )
  }

  if (error || !docA || !docB) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{error}</p>
        <button
          onClick={() => navigate('/history')}
          className="inline-flex items-center gap-1 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <ArrowLeft className="w-4 h-4" />
          히스토리로 돌아가기
        </button>
      </div>
    )
  }

  return (
    <main id="main-content" className="max-w-5xl mx-auto px-4 py-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/history')}
          className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <ArrowLeft className="w-4 h-4" />
          히스토리
        </button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">문서 비교</h1>
      </div>

      {/* 문서 정보 헤더 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-xs text-blue-500 dark:text-blue-400 font-medium mb-1">문서 A</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{docA.businessItem}</div>
          <div className="text-xs text-gray-400 mt-0.5">
            {new Date(docA.updatedAt).toLocaleDateString('ko-KR')}
          </div>
        </div>
        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="text-xs text-orange-500 dark:text-orange-400 font-medium mb-1">문서 B</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{docB.businessItem}</div>
          <div className="text-xs text-gray-400 mt-0.5">
            {new Date(docB.updatedAt).toLocaleDateString('ko-KR')}
          </div>
        </div>
      </div>

      <DocumentCompareView docA={docA} docB={docB} />
    </main>
  )
}
