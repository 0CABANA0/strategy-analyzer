import { memo } from 'react'

interface ChartData {
  factors: string[]
  series: { name: string; values: number[]; color: string }[]
  maxScore: number
}

const COLORS = ['#6366f1', '#ef4444', '#f59e0b'] // primary, red, amber
const SERIES_NAMES = ['자사', '경쟁사A', '경쟁사B']

/**
 * 전략 캔버스 가치곡선 (Value Curve) SVG 라인 차트
 *
 * competitors 데이터: [['요인', 자사, 경쟁사A, 경쟁사B], ...]
 */
function StrategyCanvasChart({ competitors }: { competitors: unknown[][] }) {
  const chartData = parseChartData(competitors)
  if (!chartData || chartData.factors.length < 2) return null

  const { factors, series, maxScore } = chartData

  // 차트 레이아웃
  const width = 500
  const height = 220
  const padding = { top: 20, right: 20, bottom: 50, left: 35 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const xStep = chartW / (factors.length - 1)
  const yScale = (v: number) => padding.top + chartH - (v / maxScore) * chartH

  return (
    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">가치곡선 (Value Curve)</div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        role="img"
        aria-label="전략 캔버스 가치곡선 차트"
      >
        {/* Y축 그리드 + 라벨 */}
        {Array.from({ length: maxScore + 1 }, (_, i) => {
          const y = yScale(i)
          return (
            <g key={`y-${i}`}>
              <line
                x1={padding.left} y1={y}
                x2={width - padding.right} y2={y}
                stroke="currentColor"
                className="text-gray-200 dark:text-gray-700"
                strokeDasharray={i === 0 ? undefined : '3,3'}
              />
              <text
                x={padding.left - 8} y={y + 3}
                textAnchor="end"
                className="text-gray-400 dark:text-gray-500"
                fontSize="10"
              >
                {i}
              </text>
            </g>
          )
        })}

        {/* X축 라벨 */}
        {factors.map((f, i) => {
          const x = padding.left + i * xStep
          return (
            <text
              key={`x-${i}`}
              x={x} y={height - padding.bottom + 18}
              textAnchor="middle"
              className="text-gray-500 dark:text-gray-400 fill-current"
              fontSize="10"
            >
              {f.length > 6 ? f.slice(0, 5) + '…' : f}
            </text>
          )
        })}

        {/* 라인 + 포인트 */}
        {series.map((s, si) => {
          const points = s.values.map((v, i) => ({
            x: padding.left + i * xStep,
            y: yScale(v),
          }))
          const polyline = points.map((p) => `${p.x},${p.y}`).join(' ')
          return (
            <g key={`s-${si}`}>
              <polyline
                points={polyline}
                fill="none"
                stroke={s.color}
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity="0.85"
              />
              {points.map((p, pi) => (
                <g key={`p-${si}-${pi}`}>
                  <circle cx={p.x} cy={p.y} r="4" fill={s.color} opacity="0.9" />
                  <title>{`${factors[pi]} · ${s.name}: ${s.values[pi]}`}</title>
                </g>
              ))}
            </g>
          )
        })}
      </svg>

      {/* 범례 */}
      <div className="flex gap-4 mt-1 justify-center">
        {series.map((s) => (
          <div key={s.name} className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-400">
            <span className="w-3 h-0.5 rounded" style={{ backgroundColor: s.color }} />
            {s.name}
          </div>
        ))}
      </div>
    </div>
  )
}

/** competitors 배열을 차트 데이터로 변환 */
function parseChartData(competitors: unknown[][]): ChartData | null {
  if (!competitors || competitors.length === 0) return null

  const factors: string[] = []
  const seriesValues: number[][] = [[], [], []]
  let maxScore = 5

  for (const row of competitors) {
    const values = Array.isArray(row) ? row : Object.values(row as Record<string, unknown>)
    if (values.length < 2) continue
    factors.push(String(values[0]))

    for (let j = 1; j <= 3; j++) {
      const num = parseInt(String(values[j] ?? 0)) || 0
      if (j - 1 < seriesValues.length) {
        seriesValues[j - 1].push(num)
        if (num > maxScore) maxScore = num
      }
    }
  }

  if (factors.length < 2) return null

  const series = seriesValues
    .map((values, i) => ({
      name: SERIES_NAMES[i] || `시리즈${i + 1}`,
      values,
      color: COLORS[i] || '#888',
    }))
    .filter((s) => s.values.some((v) => v > 0))

  return { factors, series, maxScore }
}

export default memo(StrategyCanvasChart)
