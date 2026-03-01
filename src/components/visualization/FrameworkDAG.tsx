/** 프레임워크 의존성 DAG 시각화 — 섹션 기반 계층 그래프 */
import { useMemo } from 'react'
import { useStrategy } from '../../hooks/useStrategyDocument'
import { SECTIONS } from '../../data/sectionDefinitions'
import { FRAMEWORKS } from '../../data/frameworkDefinitions'
import type { FrameworkStatus } from '../../types'

// --- 레이아웃 상수 ---
const NODE_W = 88
const NODE_H = 32
const NODE_GAP_X = 8
const NODE_GAP_Y = 10
const SECTION_PAD_X = 16
const SECTION_PAD_TOP = 32
const SECTION_PAD_BOTTOM = 12
const SECTION_GAP = 24
const ARROW_GAP = 16
const TOP_PAD = 8

// --- 상태별 스타일 ---
const STATUS_FILL: Record<FrameworkStatus, string> = {
  empty: '#f3f4f6',
  generating: '#dbeafe',
  completed: '#dcfce7',
  error: '#fee2e2',
}
const STATUS_STROKE: Record<FrameworkStatus, string> = {
  empty: '#d1d5db',
  generating: '#93c5fd',
  completed: '#86efac',
  error: '#fca5a5',
}
const STATUS_TEXT: Record<FrameworkStatus, string> = {
  empty: '#9ca3af',
  generating: '#3b82f6',
  completed: '#16a34a',
  error: '#dc2626',
}

// 섹션 색상 (tailwind 계열)
const SECTION_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  amber: { bg: '#fffbeb', border: '#fbbf24', text: '#92400e' },
  green: { bg: '#f0fdf4', border: '#4ade80', text: '#166534' },
  blue: { bg: '#eff6ff', border: '#60a5fa', text: '#1e40af' },
  red: { bg: '#fef2f2', border: '#f87171', text: '#991b1b' },
  emerald: { bg: '#ecfdf5', border: '#34d399', text: '#065f46' },
}

interface NodeLayout {
  id: string
  name: string
  status: FrameworkStatus
  x: number
  y: number
}

interface SectionLayout {
  number: number
  title: string
  color: string
  x: number
  y: number
  w: number
  h: number
  nodes: NodeLayout[]
}

function computeLayout(state: ReturnType<typeof useStrategy>['state']) {
  const sections: SectionLayout[] = []
  let currentY = TOP_PAD

  for (const sec of SECTIONS) {
    const fwIds = sec.frameworks
    const cols = Math.min(fwIds.length, 5)
    const rows = Math.ceil(fwIds.length / cols)

    const sectionW = cols * NODE_W + (cols - 1) * NODE_GAP_X + SECTION_PAD_X * 2
    const sectionH = rows * NODE_H + (rows - 1) * NODE_GAP_Y + SECTION_PAD_TOP + SECTION_PAD_BOTTOM

    const nodes: NodeLayout[] = fwIds.map((id, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      const fw = FRAMEWORKS[id as keyof typeof FRAMEWORKS]
      const fwState = state?.frameworks[id]
      return {
        id,
        name: fw?.name ?? id,
        status: (fwState?.status ?? 'empty') as FrameworkStatus,
        x: SECTION_PAD_X + col * (NODE_W + NODE_GAP_X),
        y: SECTION_PAD_TOP + row * (NODE_H + NODE_GAP_Y),
      }
    })

    sections.push({
      number: sec.number,
      title: `${sec.number}. ${sec.title}`,
      color: sec.color,
      x: 0,
      y: currentY,
      w: sectionW,
      h: sectionH,
      nodes,
    })

    currentY += sectionH + SECTION_GAP + ARROW_GAP
  }

  // 전체 너비 = 가장 넓은 섹션
  const totalW = Math.max(...sections.map((s) => s.w))
  // 섹션을 가운데 정렬
  for (const s of sections) {
    s.x = (totalW - s.w) / 2
  }

  const totalH = currentY - SECTION_GAP - ARROW_GAP + 8
  return { sections, totalW, totalH }
}

function ArrowDown({ x, y1, y2 }: { x: number; y1: number; y2: number }) {
  const midY = (y1 + y2) / 2
  return (
    <g>
      <path
        d={`M ${x} ${y1} C ${x} ${midY}, ${x} ${midY}, ${x} ${y2 - 6}`}
        fill="none"
        stroke="#94a3b8"
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />
      {/* 화살표 머리 */}
      <polygon
        points={`${x - 4},${y2 - 8} ${x + 4},${y2 - 8} ${x},${y2}`}
        fill="#94a3b8"
      />
    </g>
  )
}

function FrameworkNode({ node, offsetX, offsetY, onClick }: {
  node: NodeLayout
  offsetX: number
  offsetY: number
  onClick: (id: string) => void
}) {
  const x = offsetX + node.x
  const y = offsetY + node.y

  return (
    <g
      className="cursor-pointer"
      onClick={() => onClick(node.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(node.id)}
    >
      <rect
        x={x}
        y={y}
        width={NODE_W}
        height={NODE_H}
        rx={6}
        fill={STATUS_FILL[node.status]}
        stroke={STATUS_STROKE[node.status]}
        strokeWidth={1.5}
        className="transition-all duration-300 hover:brightness-95"
      />
      {node.status === 'generating' && (
        <rect
          x={x}
          y={y}
          width={NODE_W}
          height={NODE_H}
          rx={6}
          fill="none"
          stroke={STATUS_STROKE.generating}
          strokeWidth={2}
          className="animate-pulse"
        />
      )}
      <text
        x={x + NODE_W / 2}
        y={y + NODE_H / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={node.status === 'completed' ? 600 : 400}
        fill={STATUS_TEXT[node.status]}
        className="pointer-events-none select-none"
      >
        {node.name.length > 8 ? node.name.slice(0, 7) + '…' : node.name}
      </text>
    </g>
  )
}

export default function FrameworkDAG() {
  const { state } = useStrategy()

  const { sections, totalW, totalH } = useMemo(
    () => computeLayout(state),
    [state],
  )

  // 완료 통계
  const allFwIds = SECTIONS.flatMap((s) => s.frameworks)
  const completedCount = allFwIds.filter((id) => state?.frameworks[id]?.status === 'completed').length

  const handleNodeClick = (id: string) => {
    const el = document.getElementById(`framework-${id}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('ring-2', 'ring-primary-400')
      setTimeout(() => el.classList.remove('ring-2', 'ring-primary-400'), 2000)
    }
  }

  return (
    <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">프레임워크 의존성 맵</h3>
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm border" style={{ background: STATUS_FILL.completed, borderColor: STATUS_STROKE.completed }} />
            완료
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm border" style={{ background: STATUS_FILL.generating, borderColor: STATUS_STROKE.generating }} />
            생성중
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm border" style={{ background: STATUS_FILL.empty, borderColor: STATUS_STROKE.empty }} />
            미완료
          </span>
          <span className="font-medium text-gray-700 dark:text-gray-300">{completedCount}/{allFwIds.length}</span>
        </div>
      </div>

      {/* SVG DAG */}
      <div className="p-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${totalW} ${totalH}`}
          width="100%"
          style={{ maxHeight: 520, minWidth: 320 }}
          role="img"
          aria-label="프레임워크 의존성 그래프"
        >
          {/* 섹션 간 화살표 */}
          {sections.map((sec, i) => {
            if (i === sections.length - 1) return null
            const next = sections[i + 1]
            const arrowX = totalW / 2
            const y1 = sec.y + sec.h
            const y2 = next.y
            return <ArrowDown key={`arrow-${i}`} x={arrowX} y1={y1} y2={y2} />
          })}

          {/* 섹션 박스 + 노드 */}
          {sections.map((sec) => {
            const palette = SECTION_COLORS[sec.color] ?? SECTION_COLORS.blue
            return (
              <g key={sec.number}>
                {/* 섹션 배경 */}
                <rect
                  x={sec.x}
                  y={sec.y}
                  width={sec.w}
                  height={sec.h}
                  rx={8}
                  fill={palette.bg}
                  stroke={palette.border}
                  strokeWidth={1}
                  opacity={0.7}
                />
                {/* 섹션 제목 */}
                <text
                  x={sec.x + 12}
                  y={sec.y + 18}
                  fontSize={12}
                  fontWeight={700}
                  fill={palette.text}
                  className="select-none"
                >
                  {sec.title}
                </text>

                {/* 프레임워크 노드 */}
                {sec.nodes.map((node) => (
                  <FrameworkNode
                    key={node.id}
                    node={node}
                    offsetX={sec.x}
                    offsetY={sec.y}
                    onClick={handleNodeClick}
                  />
                ))}
              </g>
            )
          })}
        </svg>
      </div>

      {/* 설명 */}
      <div className="px-4 pb-3">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          각 섹션의 분석 결과가 다음 섹션의 AI 프롬프트에 자동 주입됩니다. 노드를 클릭하면 해당 프레임워크로 이동합니다.
        </p>
      </div>
    </div>
  )
}
