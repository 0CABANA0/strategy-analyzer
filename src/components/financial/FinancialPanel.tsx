/** 재무 시뮬레이션 패널 */
import { useFinancialSimulation } from '../../hooks/useFinancialSimulation'
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { useState } from 'react'
import type { RevenueProjection } from '../../types'

/** 숫자를 읽기 쉬운 형태로 포맷 (만원 기준) */
function formatMoney(value: number): string {
  if (Math.abs(value) >= 10000) return `${(value / 10000).toLocaleString(undefined, { maximumFractionDigits: 1 })}억원`
  return `${value.toLocaleString()}만원`
}

/** CSS 기반 수평 바 차트 */
function BarChart({ projections }: { projections: RevenueProjection[] }) {
  const maxVal = Math.max(...projections.flatMap((p) => [p.revenue, p.cost]))

  return (
    <div className="space-y-3">
      {projections.map((p) => (
        <div key={p.year} className="space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium">{p.year}년차</span>
            <span className={p.profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              이익: {formatMoney(p.profit)}
            </span>
          </div>
          {/* 매출 바 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-8">매출</span>
            <div className="flex-1 h-5 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded transition-all duration-500 flex items-center justify-end px-1"
                style={{ width: maxVal > 0 ? `${(p.revenue / maxVal) * 100}%` : '0%' }}
              >
                {p.revenue > 0 && (
                  <span className="text-[10px] text-white font-medium whitespace-nowrap">{formatMoney(p.revenue)}</span>
                )}
              </div>
            </div>
          </div>
          {/* 비용 바 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-8">비용</span>
            <div className="flex-1 h-5 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
              <div
                className="h-full bg-red-400 rounded transition-all duration-500 flex items-center justify-end px-1"
                style={{ width: maxVal > 0 ? `${(p.cost / maxVal) * 100}%` : '0%' }}
              >
                {p.cost > 0 && (
                  <span className="text-[10px] text-white font-medium whitespace-nowrap">{formatMoney(p.cost)}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/** TAM/SAM/SOM 시각화 */
function MarketSizingChart({ tam, sam, som }: {
  tam: { value: number; unit: string; description: string }
  sam: { value: number; unit: string; description: string }
  som: { value: number; unit: string; description: string }
}) {
  const maxVal = tam.value || 1

  return (
    <div className="space-y-3">
      {[
        { label: 'TAM', data: tam, color: 'bg-blue-300 dark:bg-blue-700' },
        { label: 'SAM', data: sam, color: 'bg-blue-500 dark:bg-blue-500' },
        { label: 'SOM', data: som, color: 'bg-blue-700 dark:bg-blue-300' },
      ].map(({ label, data, color }) => (
        <div key={label}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-gray-700 dark:text-gray-300">{label}</span>
            <span className="text-gray-500 dark:text-gray-400">{data.value.toLocaleString()}{data.unit}</span>
          </div>
          <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
            <div
              className={`h-full ${color} rounded transition-all duration-500`}
              style={{ width: `${Math.max((data.value / maxVal) * 100, 2)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{data.description}</p>
        </div>
      ))}
    </div>
  )
}

export default function FinancialPanel() {
  const { result, isLoading, error, generate } = useFinancialSimulation()
  const [isCollapsed, setIsCollapsed] = useState(false)

  if (!result && !isLoading && !error) {
    return (
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">재무 시뮬레이션</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              TAM/SAM/SOM → 매출 예측 → BEP → ROI 자동 계산
            </p>
          </div>
          <button
            onClick={generate}
            className="px-4 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            시뮬레이션 실행
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
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">재무 시뮬레이션</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); generate() }}
            disabled={isLoading}
            className="text-xs text-amber-600 dark:text-amber-400 hover:underline disabled:opacity-50"
          >
            재실행
          </button>
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      </div>

      {/* 로딩 */}
      {isLoading && (
        <div className="p-8 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">재무 시뮬레이션을 수행하고 있습니다...</p>
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
          {/* 핵심 수치 하이라이트 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-center border border-blue-100 dark:border-blue-900">
              <p className="text-xs text-gray-500 dark:text-gray-400">초기 투자</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatMoney(result.initialInvestment)}</p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg text-center border border-green-100 dark:border-green-900">
              <p className="text-xs text-gray-500 dark:text-gray-400">BEP</p>
              <p className="text-lg font-bold text-green-700 dark:text-green-400">{result.breakEvenMonth}개월</p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg text-center border border-purple-100 dark:border-purple-900">
              <p className="text-xs text-gray-500 dark:text-gray-400">3년 ROI</p>
              <p className="text-lg font-bold text-purple-700 dark:text-purple-400">{result.roi3Year}%</p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg text-center border border-amber-100 dark:border-amber-900">
              <p className="text-xs text-gray-500 dark:text-gray-400">5년 ROI</p>
              <p className="text-lg font-bold text-amber-700 dark:text-amber-400">{result.roi5Year}%</p>
            </div>
          </div>

          {/* 시장 규모 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">시장 규모 (TAM/SAM/SOM)</h4>
            <MarketSizingChart
              tam={result.marketSizing.tam}
              sam={result.marketSizing.sam}
              som={result.marketSizing.som}
            />
          </div>

          {/* 5년 매출 차트 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">5년 매출/비용 추이</h4>
            <BarChart projections={result.revenueProjections} />
          </div>

          {/* 전제 조건 */}
          {result.keyAssumptions?.length > 0 && (
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">전제 조건</h4>
              <ul className="space-y-1">
                {result.keyAssumptions.map((a, i) => (
                  <li key={i} className="text-sm text-gray-600 dark:text-gray-400">• {a}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 재무 요약 */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-100 dark:border-amber-900">
            <h4 className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1.5">재무 분석 요약</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">{result.summary}</p>
          </div>
        </div>
      )}
    </div>
  )
}
