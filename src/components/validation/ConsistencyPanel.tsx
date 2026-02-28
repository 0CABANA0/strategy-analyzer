/** 전략 일관성 검증 패널 */
import { useConsistencyCheck } from '../../hooks/useConsistencyCheck'
import { AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Loader2, XCircle } from 'lucide-react'
import { useState } from 'react'
import { FRAMEWORKS } from '../../data/frameworkDefinitions'
import type { ConsistencyIssue } from '../../types'

function ScoreGauge({ label, score }: { label: string; score: number }) {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444'
  const degree = (score / 100) * 360

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
    </div>
  )
}

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

function IssueCard({ issue }: { issue: ConsistencyIssue }) {
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
            <span className="text-xs text-gray-500 dark:text-gray-400">{frameworkNames}</span>
          </div>
          <p className="text-sm text-gray-800 dark:text-gray-200">{issue.description}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            💡 {issue.suggestion}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ConsistencyPanel() {
  const { result, isLoading, error, runCheck } = useConsistencyCheck()
  const [isCollapsed, setIsCollapsed] = useState(false)

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
          {/* 점수 게이지 */}
          <div className="flex justify-center gap-8 py-4">
            <ScoreGauge label="논리 흐름" score={result.logicFlowScore} />
            <ScoreGauge label="완성도" score={result.completenessScore} />
            <ScoreGauge label="정합성" score={result.alignmentScore} />
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

          {/* 이슈 목록 */}
          {result.issues?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                개선 필요 ({result.issues.length}건)
              </h4>
              <div className="space-y-2">
                {result.issues.map((issue, i) => (
                  <IssueCard key={i} issue={issue} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
