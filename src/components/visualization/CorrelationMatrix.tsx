/**
 * 프레임워크 상관관계 매트릭스 — SVG 히트맵 시각화
 * - 20×20 매트릭스 히트맵 (색상 강도로 관계 표현)
 * - 호버 시 관계 설명 툴팁
 * - 클러스터 구분선
 * - 상위 관계 목록
 */
import { useMemo, useState, useCallback } from 'react'
import { useStrategy } from '../../hooks/useStrategyDocument'
import { FRAMEWORKS } from '../../data/frameworkDefinitions'
import {
  analyzeCorrelations,
  getShortName,
  type CorrelationEntry,
} from '../../utils/correlationAnalyzer'
import type { FrameworkId } from '../../types'

// ─── 레이아웃 상수 ───
const CELL = 28
const LABEL_W = 52
const LABEL_H = 52
const GAP = 1

export default function CorrelationMatrix() {
  const { state } = useStrategy()
  const [hovered, setHovered] = useState<CorrelationEntry | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const result = useMemo(() => analyzeCorrelations(state), [state])
  const { frameworks, matrix, entries, clusters } = result
  const n = frameworks.length

  const svgW = LABEL_W + n * (CELL + GAP)
  const svgH = LABEL_H + n * (CELL + GAP)

  // 셀 색상 (0 → 투명, 1 → 진한 파란색)
  const cellColor = useCallback((value: number, isDark: boolean) => {
    if (value < 0.01) return isDark ? 'rgba(55,65,81,0.3)' : 'rgba(243,244,246,0.8)'
    const alpha = 0.15 + value * 0.85
    return isDark
      ? `rgba(96,165,250,${alpha})`   // blue-400
      : `rgba(59,130,246,${alpha})`    // blue-500
  }, [])

  // 완료된 프레임워크 수
  const completedCount = frameworks.filter(
    (id) => state.frameworks[id]?.status === 'completed'
  ).length

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }, [])

  const handleCellHover = useCallback(
    (i: number, j: number) => {
      if (i === j) { setHovered(null); return }
      const a = frameworks[Math.min(i, j)]
      const b = frameworks[Math.max(i, j)]
      const entry = entries.find(
        (e) => (e.from === a && e.to === b) || (e.from === b && e.to === a)
      )
      setHovered(
        entry ?? {
          from: a,
          to: b,
          static: 0,
          dynamic: 0,
          combined: 0,
          label: '직접적 관계 없음',
        }
      )
    },
    [frameworks, entries]
  )

  // 상위 10개 관계
  const topRelations = entries.slice(0, 10)

  // 다크모드 감지
  const isDark = document.documentElement.classList.contains('dark')

  return (
    <div className="mb-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      {/* 헤더 */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
            <rect x="1" y="1" width="4" height="4" rx="0.5" opacity="0.3" />
            <rect x="6" y="1" width="4" height="4" rx="0.5" opacity="0.6" />
            <rect x="11" y="1" width="4" height="4" rx="0.5" opacity="0.9" />
            <rect x="1" y="6" width="4" height="4" rx="0.5" opacity="0.6" />
            <rect x="6" y="6" width="4" height="4" rx="0.5" opacity="0.3" />
            <rect x="11" y="6" width="4" height="4" rx="0.5" opacity="0.6" />
            <rect x="1" y="11" width="4" height="4" rx="0.5" opacity="0.9" />
            <rect x="6" y="11" width="4" height="4" rx="0.5" opacity="0.6" />
            <rect x="11" y="11" width="4" height="4" rx="0.5" opacity="0.3" />
          </svg>
          프레임워크 상관관계 매트릭스
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {completedCount}/{n}개 프레임워크 완료 · 정적(이론) 60% + 동적(데이터) 40% 가중
        </p>
      </div>

      {/* 히트맵 + 관계 목록 2열 레이아웃 */}
      <div className="flex flex-col lg:flex-row">
        {/* 히트맵 */}
        <div
          className="flex-1 overflow-x-auto p-4"
          onMouseMove={handleMouseMove}
        >
          <svg
            width={svgW}
            height={svgH}
            className="select-none"
            style={{ minWidth: svgW }}
          >
            {/* 상단 라벨 (세로 텍스트) */}
            {frameworks.map((id, j) => (
              <text
                key={`top-${id}`}
                x={LABEL_W + j * (CELL + GAP) + CELL / 2}
                y={LABEL_H - 4}
                textAnchor="end"
                fontSize="9"
                fill={
                  state.frameworks[id]?.status === 'completed'
                    ? (isDark ? '#86efac' : '#16a34a')
                    : (isDark ? '#9ca3af' : '#6b7280')
                }
                fontWeight={state.frameworks[id]?.status === 'completed' ? 600 : 400}
                transform={`rotate(-45, ${LABEL_W + j * (CELL + GAP) + CELL / 2}, ${LABEL_H - 4})`}
              >
                {getShortName(id)}
              </text>
            ))}

            {/* 좌측 라벨 */}
            {frameworks.map((id, i) => (
              <text
                key={`left-${id}`}
                x={LABEL_W - 4}
                y={LABEL_H + i * (CELL + GAP) + CELL / 2 + 3}
                textAnchor="end"
                fontSize="9"
                fill={
                  state.frameworks[id]?.status === 'completed'
                    ? (isDark ? '#86efac' : '#16a34a')
                    : (isDark ? '#9ca3af' : '#6b7280')
                }
                fontWeight={state.frameworks[id]?.status === 'completed' ? 600 : 400}
              >
                {getShortName(id)}
              </text>
            ))}

            {/* 셀 그리드 */}
            {frameworks.map((_, i) =>
              frameworks.map((_, j) => {
                const x = LABEL_W + j * (CELL + GAP)
                const y = LABEL_H + i * (CELL + GAP)
                const value = i === j ? 1 : matrix[i][j]
                const isDiagonal = i === j

                return (
                  <g key={`${i}-${j}`}>
                    <rect
                      x={x}
                      y={y}
                      width={CELL}
                      height={CELL}
                      rx={2}
                      fill={isDiagonal ? (isDark ? 'rgba(55,65,81,0.5)' : '#e5e7eb') : cellColor(value, isDark)}
                      stroke={isDark ? '#374151' : '#e5e7eb'}
                      strokeWidth={0.5}
                      className="cursor-pointer transition-opacity"
                      opacity={hovered && !isDiagonal && (
                        (hovered.from === frameworks[i] && hovered.to === frameworks[j]) ||
                        (hovered.from === frameworks[j] && hovered.to === frameworks[i])
                      ) ? 1 : undefined}
                      onMouseEnter={() => handleCellHover(i, j)}
                      onMouseLeave={() => setHovered(null)}
                    />
                    {/* 대각선은 빗금 표시 */}
                    {isDiagonal && (
                      <line
                        x1={x + 2} y1={y + 2}
                        x2={x + CELL - 2} y2={y + CELL - 2}
                        stroke={isDark ? '#4b5563' : '#d1d5db'}
                        strokeWidth={1}
                      />
                    )}
                    {/* 값이 0.3 이상이면 숫자 표시 */}
                    {!isDiagonal && value >= 0.3 && (
                      <text
                        x={x + CELL / 2}
                        y={y + CELL / 2 + 3}
                        textAnchor="middle"
                        fontSize="8"
                        fontWeight={600}
                        fill={value > 0.5 ? '#fff' : (isDark ? '#d1d5db' : '#374151')}
                        pointerEvents="none"
                      >
                        {(value * 100).toFixed(0)}
                      </text>
                    )}
                  </g>
                )
              })
            )}

            {/* 클러스터 구분선 */}
            {(() => {
              // 클러스터 경계 인덱스 계산
              const boundaries: number[] = []
              let offset = 0
              for (const cluster of clusters) {
                const clusterFws = cluster.frameworks.filter((f) =>
                  frameworks.includes(f as FrameworkId)
                )
                offset += clusterFws.length
                if (offset < n) boundaries.push(offset)
              }
              // 실제로 프레임워크 순서가 클러스터와 다를 수 있으므로 섹션 경계 사용
              const sectionBoundaries: number[] = []
              let prevSection = FRAMEWORKS[frameworks[0]]?.section
              for (let i = 1; i < n; i++) {
                const section = FRAMEWORKS[frameworks[i]]?.section
                if (section !== prevSection) {
                  sectionBoundaries.push(i)
                  prevSection = section
                }
              }
              return sectionBoundaries.map((idx) => (
                <g key={`boundary-${idx}`}>
                  <line
                    x1={LABEL_W + idx * (CELL + GAP) - GAP / 2}
                    y1={LABEL_H}
                    x2={LABEL_W + idx * (CELL + GAP) - GAP / 2}
                    y2={LABEL_H + n * (CELL + GAP)}
                    stroke={isDark ? '#6b7280' : '#9ca3af'}
                    strokeWidth={1.5}
                    strokeDasharray="3,2"
                  />
                  <line
                    x1={LABEL_W}
                    y1={LABEL_H + idx * (CELL + GAP) - GAP / 2}
                    x2={LABEL_W + n * (CELL + GAP)}
                    y2={LABEL_H + idx * (CELL + GAP) - GAP / 2}
                    stroke={isDark ? '#6b7280' : '#9ca3af'}
                    strokeWidth={1.5}
                    strokeDasharray="3,2"
                  />
                </g>
              ))
            })()}
          </svg>

          {/* 호버 툴팁 */}
          {hovered && (
            <div
              className="absolute z-20 px-3 py-2 text-xs bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg shadow-lg pointer-events-none max-w-[240px]"
              style={{
                left: Math.min(mousePos.x + 12, svgW - 200),
                top: mousePos.y - 60,
              }}
            >
              <div className="font-semibold mb-1">
                {getShortName(hovered.from)} ↔ {getShortName(hovered.to)}
              </div>
              <div className="text-gray-300 dark:text-gray-600 mb-1">{hovered.label}</div>
              <div className="flex gap-3">
                <span>이론: {(hovered.static * 100).toFixed(0)}%</span>
                <span>데이터: {(hovered.dynamic * 100).toFixed(0)}%</span>
                <span className="font-bold">종합: {(hovered.combined * 100).toFixed(0)}%</span>
              </div>
            </div>
          )}

          {/* 범례 */}
          <div className="flex items-center gap-3 mt-3 text-[10px] text-gray-500 dark:text-gray-400">
            <span>약함</span>
            <div className="flex gap-0.5">
              {[0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 1.0].map((v) => (
                <div
                  key={v}
                  className="w-5 h-3 rounded-sm"
                  style={{ backgroundColor: cellColor(v, isDark) }}
                />
              ))}
            </div>
            <span>강함</span>
            <span className="ml-4">--- 섹션 경계</span>
          </div>
        </div>

        {/* 상위 관계 목록 */}
        <div className="lg:w-72 border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-gray-700 p-4">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">
            핵심 연결 관계 Top 10
          </h4>
          <div className="space-y-2">
            {topRelations.map((entry, idx) => (
              <div
                key={`${entry.from}-${entry.to}`}
                className="flex items-start gap-2 text-xs group"
                onMouseEnter={() => setHovered(entry)}
                onMouseLeave={() => setHovered(null)}
              >
                <span className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {getShortName(entry.from)} ↔ {getShortName(entry.to)}
                    <span className="ml-1.5 text-[10px] text-gray-400">
                      {(entry.combined * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 truncate">
                    {entry.label}
                  </div>
                </div>
                {/* 강도 바 */}
                <div className="shrink-0 w-12 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${entry.combined * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* 클러스터 */}
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-5 mb-2">
            전략 클러스터
          </h4>
          <div className="space-y-2">
            {clusters.map((c) => (
              <div key={c.name} className="text-xs">
                <span className="font-medium text-gray-700 dark:text-gray-300">{c.name}</span>
                <span className="text-gray-400 dark:text-gray-500 ml-1">
                  ({c.frameworks.map((f) => getShortName(f as FrameworkId)).join(', ')})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
