import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getSharedDocument } from '../utils/shareDocument'
import DocumentPreview from '../components/preview/DocumentPreview'
import { Loader2, AlertCircle, ArrowLeft, Share2 } from 'lucide-react'
import type { StrategyDocument } from '../types/document'

/** 공유 문서 읽기 전용 페이지 */
export default function SharedDocumentPage() {
  const { shareId } = useParams<{ shareId: string }>()
  const [state, setState] = useState<StrategyDocument | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!shareId) return

    setLoading(true)
    getSharedDocument(shareId)
      .then((doc) => {
        if (doc) {
          setState(doc)
          // 동적 메타 태그 업데이트 (브라우저 탭 + Google 크롤러)
          document.title = `${doc.businessItem} — 전략 PRD | 전략분석기`
          const desc = `${doc.businessItem} 전략 PRD — 20개 프레임워크 기반 AI 전략분석 결과`
          document.querySelector('meta[name="description"]')?.setAttribute('content', desc)
          document.querySelector('meta[property="og:title"]')?.setAttribute('content', `${doc.businessItem} — 전략 PRD`)
          document.querySelector('meta[property="og:description"]')?.setAttribute('content', desc)
          document.querySelector('meta[property="og:url"]')?.setAttribute('content', window.location.href)
        } else {
          setError('공유 문서를 찾을 수 없거나 만료되었습니다.')
        }
      })
      .catch(() => setError('문서를 불러오는 중 오류가 발생했습니다.'))
      .finally(() => setLoading(false))

    // cleanup: 원래 title 복원
    return () => { document.title = '전략분석기 | AI 전략 PRD 자동 생성' }
  }, [shareId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
      </div>
    )
  }

  if (error || !state) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          문서를 찾을 수 없습니다
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {error || '링크가 잘못되었거나 만료되었습니다.'}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-1 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <ArrowLeft className="w-4 h-4" />
          홈으로 돌아가기
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 공유 문서 상단 바 */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-3 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Share2 className="w-4 h-4" />
            <span>공유 문서 (읽기 전용)</span>
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {state.businessItem}
          </span>
        </div>
      </div>

      {/* 문서 미리보기 */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <DocumentPreview state={state} highlightedFrameworks={new Set()} />
      </div>
    </div>
  )
}
