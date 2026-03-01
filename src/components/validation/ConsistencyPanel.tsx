/** 전략 일관성 검증 패널 — 개선 이력 + 이슈 추적 + 되돌리기 */
import { useConsistencyCheck } from '../../hooks/useConsistencyCheck'
import { useAiGeneration } from '../../hooks/useAiGeneration'
import { useToast } from '../../hooks/useToast'
import { AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Loader2, RefreshCw, XCircle, Undo2, Clock } from 'lucide-react'
import { useState, useCallback } from 'react'
import { FRAMEWORKS } from '../../data/frameworkDefinitions'
import type { ConsistencyIssue, ImprovementRecord, TrackedIssue, IssueChangeStatus } from '../../types'

// --- ScoreGauge (이전 점수 비교 지원) ---

function ScoreGauge({ label, score, prevScore }: { label: string; score: number; prevScore?: number }) {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444'
  const degree = (score / 100) * 360
  const diff = prevScore != null ? score - prevScore : null

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative w-20 h-20 rounded-full flex items-center justify-center"
        style={{
          background: `conic-gradient(${color} ${degree}deg, #e5e7eb ${degree}deg)`,
        }}
      >
        <div className="w-14 h-14 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
          <span className="text-lg font-bold" style={{ color }}>{score}</span>
        </div>
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      {diff != null && diff !== 0 && (
        <span className={`text-xs font-medium ${diff > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {diff > 0 ? '+' : ''}{diff}
        </span>
      )}
    </div>
  )
}

// --- 이슈 상태 배지 ---

const ISSUE_STATUS_STYLES: Record<IssueChangeStatus, { label: string; className: string }> = {
  resolved: { label: '해결됨', className: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' },
  maintained: { label: '유지', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' },
  new: { label: '신규', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' },
}

function IssueStatusBadge({ status }: { status: IssueChangeStatus }) {
  const style = ISSUE_STATUS_STYLES[status]
  return (
    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${style.className}`}>
      {style.label}
    </span>
  )
}

// --- IssueCard ---

const SEVERITY_STYLES: Record<ConsistencyIssue['severity'], { bg: string; border: string; icon: React.ReactNode }> = {
  high: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800',
    icon: <XCircle className="w-4 h-4 text-red-500 shrink-0" />,
  },
  medium: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    icon: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
  },
  low: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    icon: <AlertTriangle className="w-4 h-4 text-blue-500 shrink-0" />,
  },
}

const TYPE_LABELS: Record<ConsistencyIssue['type'], string> = {
  contradiction: '모순',
  gap: '누락',
  weak_link: '약한 연결',
}

function IssueCard({ issue, issueStatus, onReanalyze, isReanalyzing }: {
  issue: ConsistencyIssue
  issueStatus?: IssueChangeStatus
  onReanalyze: (frameworkIds: string[], feedback: string, issue: ConsistencyIssue) => void
  isReanalyzing: boolean
}) {
  const style = SEVERITY_STYLES[issue.severity]
  const frameworkNames = issue.frameworks
    .map((id) => FRAMEWORKS[id as keyof typeof FRAMEWORKS]?.name ?? id)
    .join(', ')

  return (
    <div className={`rounded-lg border p-3 ${style.bg} ${style.border}`}>
      <div className="flex items-start gap-2">
        {style.icon}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-white/50 dark:bg-gray-700/50">
              {TYPE_LABELS[issue.type]}
            </span>
            {issueStatus && <IssueStatusBadge status={issueStatus} />}
            <span className="text-xs text-gray-500 dark:text-gray-400">{frameworkNames}</span>
          </div>
          <p className="text-sm text-gray-800 dark:text-gray-200">{issue.description}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            💡 {issue.suggestion}
          </p>
          {issueStatus !== 'resolved' && (
            <button
              onClick={() => onReanalyze(issue.frameworks, `문제: ${issue.description}\n제안: ${issue.suggestion}`, issue)}
              disabled={isReanalyzing}
              className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md text-indigo-700 dark:text-indigo-300 bg-white/70 dark:bg-gray-700/50 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 disabled:opacity-50 transition-colors"
            >
              {isReanalyzing ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
              개선
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// --- 개선 이력 레코드 UI ---

function ImprovementRecordView({ record, index, isLatest, onUndo }: {
  record: ImprovementRecord
  index: number
  isLatest: boolean
  onUndo: () => void
}) {
  const [isExpanded, setIsExpanded] = useState(index === 0)
  const time = new Date(record.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  const scoreDiff = record.scoreAfter.overallScore - record.scoreBefore.overallScore

  const resolvedCount = record.trackedIssues.filter((t) => t.status === 'resolved').length
  const maintainedCount = record.trackedIssues.filter((t) => t.status === 'maintained').length
  const newCount = record.trackedIssues.filter((t) => t.status === 'new').length

  // 트리거 이슈의 프레임워크명
  const triggerFrameworks = record.trigger.frameworks
    .map((id) => FRAMEWORKS[id as keyof typeof FRAMEWORKS]?.name ?? id)
    .join(' ↔ ')
  const triggerLabel = `${TYPE_LABELS[record.trigger.type]}: ${triggerFrameworks}`

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* 헤더 (토글) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 shrink-0" />}
          <span className="text-xs font-medium text-gray-500">#{record.id.slice(0, 4)}</span>
          <Clock className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-500">{time}</span>
          <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{triggerLabel}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-bold ${scoreDiff > 0 ? 'text-green-600' : scoreDiff < 0 ? 'text-red-600' : 'text-gray-500'}`}>
            {record.scoreBefore.overallScore} → {record.scoreAfter.overallScore}
            {scoreDiff !== 0 && ` (${scoreDiff > 0 ? '+' : ''}${scoreDiff})`}
          </span>
        </div>
      </button>

      {/* 상세 내용 */}
      {isExpanded && (
        <div className="p-3 pt-0 space-y-3 border-t border-gray-100 dark:border-gray-700">
          {/* 점수 비교 바 */}
          <div className="flex items-center gap-3 py-2">
            <span className="text-xs text-gray-500 w-8">점수</span>
            <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
              {/* before 마커 */}
              <div
                className="absolute top-0 h-full bg-gray-400/50"
                style={{ width: `${record.scoreBefore.overallScore}%` }}
              />
              {/* after */}
              <div
                className={`absolute top-0 h-full rounded-full ${scoreDiff >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${record.scoreAfter.overallScore}%` }}
              />
            </div>
            <span className={`text-xs font-bold min-w-[3rem] text-right ${scoreDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {scoreDiff > 0 ? '+' : ''}{scoreDiff}
            </span>
          </div>

          {/* 변경 프레임워크 */}
          {record.frameworkChanges.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">변경 프레임워크:</p>
              {record.frameworkChanges.map((fc) => (
                <div key={fc.frameworkId} className="ml-2 mb-2 p-2 bg-gray-50 dark:bg-gray-700/30 rounded text-xs">
                  <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">{fc.frameworkName}</p>
                  {fc.fields.map((f) => (
                    <div key={f.field} className="ml-2 mb-1">
                      <span className="text-gray-500">{f.fieldLabel}:</span>
                      <div className="ml-2 space-y-0.5">
                        <p className="text-red-600 dark:text-red-400 line-through opacity-60">
                          {formatFieldValue(f.before)}
                        </p>
                        <p className="text-green-600 dark:text-green-400">
                          {formatFieldValue(f.after)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* 이슈 변경 요약 */}
          <div className="flex items-center gap-3 text-xs">
            <span className="text-gray-500">이슈 변경:</span>
            {resolvedCount > 0 && (
              <span className="text-green-600">✅ 해결 {resolvedCount}</span>
            )}
            {maintainedCount > 0 && (
              <span className="text-amber-600">⚠️ 유지 {maintainedCount}</span>
            )}
            {newCount > 0 && (
              <span className="text-blue-600">🔵 신규 {newCount}</span>
            )}
          </div>

          {/* 되돌리기 버튼 (최신 레코드만) */}
          {isLatest && (
            <div className="flex justify-end">
              <button
                onClick={onUndo}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <Undo2 className="w-3 h-3" />
                되돌리기
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/** 필드 값을 표시 가능한 문자열로 변환 */
function formatFieldValue(value: unknown): string {
  if (value === null || value === undefined) return '(없음)'
  if (typeof value === 'string') return value.length > 100 ? value.slice(0, 100) + '…' : value
  if (Array.isArray(value)) {
    if (value.length === 0) return '(비어있음)'
    // 1차원 문자열 배열
    if (typeof value[0] === 'string') return value.join(', ')
    // 2차원 (테이블)
    return `[표 ${value.length}행]`
  }
  if (typeof value === 'object') return JSON.stringify(value).slice(0, 100) + '…'
  return String(value)
}

// --- ConsistencyPanel 메인 ---

interface ConsistencyPanelProps {
  onHighlightChange?: (highlighted: Set<string>) => void
}

export default function ConsistencyPanel({ onHighlightChange }: ConsistencyPanelProps) {
  const { result, previousResult, isLoading, error, history, runCheck, runImprovement, undoLastImprovement } = useConsistencyCheck()
  const { generateAll, isGeneratingAny } = useAiGeneration()
  const toast = useToast()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isImproving, setIsImproving] = useState(false)
  const [showConfirmUndo, setShowConfirmUndo] = useState(false)

  // 최신 이력의 trackedIssues를 기반으로 이슈 상태 맵 생성
  const latestRecord = history.length > 0 ? history[history.length - 1] : null
  const issueStatusMap = new Map<string, IssueChangeStatus>()
  if (latestRecord) {
    for (const ti of latestRecord.trackedIssues) {
      const key = `${ti.issue.type}:${[...ti.issue.frameworks].sort().join(',')}`
      issueStatusMap.set(key, ti.status)
    }
  }

  const getIssueStatus = (issue: ConsistencyIssue): IssueChangeStatus | undefined => {
    if (!latestRecord) return undefined
    const key = `${issue.type}:${[...issue.frameworks].sort().join(',')}`
    return issueStatusMap.get(key)
  }

  const handleReanalyze = useCallback(async (frameworkIds: string[], feedback: string, issue: ConsistencyIssue) => {
    setIsImproving(true)
    try {
      const changedIds = await runImprovement(frameworkIds, feedback, issue, generateAll)
      const names = frameworkIds
        .map((id) => FRAMEWORKS[id as keyof typeof FRAMEWORKS]?.name ?? id)
        .join(', ')
      toast.success(`개선 완료: ${names} — 미리보기에 반영되었습니다.`)
      // 하이라이트 전달
      onHighlightChange?.(changedIds)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '개선 중 오류가 발생했습니다.')
    } finally {
      setIsImproving(false)
    }
  }, [runImprovement, generateAll, toast, onHighlightChange])

  const handleUndo = useCallback(() => {
    const undone = undoLastImprovement()
    if (undone) {
      const names = undone.frameworkChanges.map((fc) => fc.frameworkName).join(', ')
      toast.success(`되돌리기 완료: ${names}`)
      onHighlightChange?.(new Set())
      setShowConfirmUndo(false)
    }
  }, [undoLastImprovement, toast, onHighlightChange])

  if (!result && !isLoading && !error) {
    return (
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">전략 일관성 검증</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              20개 프레임워크 간 모순 탐지 + 논리 흐름 점수화
            </p>
          </div>
          <button
            onClick={runCheck}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            검증 실행
          </button>
        </div>
      </div>
    )
  }

  const isReanalyzing = isGeneratingAny || isImproving

  return (
    <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* 헤더 */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">전략 일관성 검증</h3>
          {result && (
            <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${
              result.overallScore >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
              result.overallScore >= 60 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
              'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {result.overallScore}점
            </span>
          )}
          {history.length > 0 && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              개선 {history.length}회
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); runCheck() }}
            disabled={isLoading}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50"
          >
            재검증
          </button>
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      </div>

      {/* 로딩 */}
      {isLoading && (
        <div className="p-8 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">프레임워크 간 일관성을 분석하고 있습니다...</p>
        </div>
      )}

      {/* 에러 */}
      {error && (
        <div className="p-4 mx-4 mb-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* 결과 */}
      {result && !isCollapsed && (
        <div className="p-4 pt-0 space-y-5">
          {/* 점수 게이지 — 이전 점수 비교 */}
          <div className="flex justify-center gap-8 py-4">
            <ScoreGauge label="논리 흐름" score={result.logicFlowScore} prevScore={previousResult?.logicFlowScore} />
            <ScoreGauge label="완성도" score={result.completenessScore} prevScore={previousResult?.completenessScore} />
            <ScoreGauge label="정합성" score={result.alignmentScore} prevScore={previousResult?.alignmentScore} />
          </div>

          {/* 종합 평가 */}
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">{result.summary}</p>
          </div>

          {/* 강점 */}
          {result.strengths?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                강점
              </h4>
              <ul className="space-y-1">
                {result.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-gray-600 dark:text-gray-400 pl-5">• {s}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 이슈 목록 — 상태 배지 포함 */}
          {result.issues?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                개선 필요 ({result.issues.length}건)
              </h4>
              <div className="space-y-2">
                {result.issues.map((issue, i) => (
                  <IssueCard
                    key={i}
                    issue={issue}
                    issueStatus={getIssueStatus(issue)}
                    onReanalyze={handleReanalyze}
                    isReanalyzing={isReanalyzing}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 해결된 이슈 표시 (최신 이력에서) */}
          {latestRecord && latestRecord.trackedIssues.filter((t) => t.status === 'resolved').length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                해결된 이슈 ({latestRecord.trackedIssues.filter((t) => t.status === 'resolved').length}건)
              </h4>
              <div className="space-y-2">
                {latestRecord.trackedIssues
                  .filter((t): t is TrackedIssue & { status: 'resolved' } => t.status === 'resolved')
                  .map((t, i) => (
                    <IssueCard
                      key={`resolved-${i}`}
                      issue={t.issue}
                      issueStatus="resolved"
                      onReanalyze={handleReanalyze}
                      isReanalyzing={isReanalyzing}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* 개선 이력 */}
          {history.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                📋 개선 이력 ({history.length}건)
              </h4>
              <div className="space-y-2">
                {[...history].reverse().map((record, i) => (
                  <ImprovementRecordView
                    key={record.id}
                    record={record}
                    index={i}
                    isLatest={i === 0}
                    onUndo={() => setShowConfirmUndo(true)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 되돌리기 확인 다이얼로그 */}
          {showConfirmUndo && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-300 mb-2">
                마지막 개선을 되돌리시겠습니까? 프레임워크 데이터가 개선 전 상태로 복원됩니다.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleUndo}
                  className="px-3 py-1 text-xs font-medium bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
                >
                  되돌리기
                </button>
                <button
                  onClick={() => setShowConfirmUndo(false)}
                  className="px-3 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
