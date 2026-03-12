import { memo, useMemo } from 'react'
import { computeDocumentDiff, type FrameworkDiff } from '../../utils/documentDiff'
import { CheckCircle2, XCircle, Minus } from 'lucide-react'
import type { StrategyDocument } from '../../types/document'

interface DocumentCompareViewProps {
  docA: StrategyDocument
  docB: StrategyDocument
}

const STATUS_LABELS: Record<string, string> = {
  completed: '완료',
  generating: '생성 중',
  error: '오류',
  empty: '미생성',
}

/**
 * 문서 나란히 비교 뷰 — diff 하이라이트
 */
function DocumentCompareView({ docA, docB }: DocumentCompareViewProps) {
  const diffs = useMemo(() => computeDocumentDiff(docA, docB), [docA, docB])

  if (diffs.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-gray-400 dark:text-gray-500">
        두 문서에 차이가 없습니다.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {diffs.length}개 프레임워크에서 차이 발견
      </div>

      {diffs.map((diff) => (
        <FrameworkDiffCard key={diff.frameworkId} diff={diff} />
      ))}
    </div>
  )
}

function FrameworkDiffCard({ diff }: { diff: FrameworkDiff }) {
  const changedFields = diff.fields.filter((f) => f.changed)

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800">
        <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
          {diff.frameworkName}
        </span>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
            A: {STATUS_LABELS[diff.statusA] || diff.statusA}
          </span>
          <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
            B: {STATUS_LABELS[diff.statusB] || diff.statusB}
          </span>
        </div>
      </div>

      {/* 필드 비교 */}
      {changedFields.length > 0 && (
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {changedFields.map((field) => (
            <div key={field.fieldKey} className="grid grid-cols-1 sm:grid-cols-[120px_1fr_1fr] gap-0">
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-600 dark:text-gray-400 flex items-start">
                {field.fieldLabel}
              </div>
              <div className="px-3 py-2 text-xs border-l border-gray-100 dark:border-gray-700">
                <DiffValue value={field.valueA} side="a" />
              </div>
              <div className="px-3 py-2 text-xs border-l border-gray-100 dark:border-gray-700">
                <DiffValue value={field.valueB} side="b" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function DiffValue({ value, side }: { value: string; side: 'a' | 'b' }) {
  if (!value) {
    return (
      <span className="flex items-center gap-1 text-gray-300 dark:text-gray-600">
        <Minus className="w-3 h-3" /> 없음
      </span>
    )
  }

  const bgClass = side === 'a'
    ? 'bg-blue-50 dark:bg-blue-900/20 text-gray-700 dark:text-gray-300'
    : 'bg-orange-50 dark:bg-orange-900/20 text-gray-700 dark:text-gray-300'

  // JSON 배열/객체면 포맷팅
  const displayValue = value.startsWith('[') || value.startsWith('{')
    ? truncate(value, 200)
    : truncate(value, 300)

  return (
    <div className={`p-1.5 rounded text-xs whitespace-pre-wrap ${bgClass}`}>
      {displayValue}
    </div>
  )
}

function truncate(str: string, maxLen: number): string {
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str
}

export default memo(DocumentCompareView)
