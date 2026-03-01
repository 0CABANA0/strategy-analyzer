import { FRAMEWORKS } from '../../data/frameworkDefinitions'
import { SECTIONS } from '../../data/sectionDefinitions'
import type { StrategyDocument, FrameworkData, ExecutiveSummary, ScenarioResult, FinancialResult } from '../../types'
import type { FieldDef, ObjectFieldDef } from '../../types'

interface ListItemsProps {
  items?: string[]
}

function ListItems({ items }: ListItemsProps) {
  if (!items?.length) return <span className="text-gray-400 dark:text-gray-500 italic text-sm">데이터 없음</span>
  return (
    <ul className="list-disc list-inside space-y-0.5 text-sm text-gray-700 dark:text-gray-300">
      {items.map((item: string, i: number) => <li key={i}>{item}</li>)}
    </ul>
  )
}

// --- 마크다운 테이블 파서 (텍스트 필드 내 임베디드 테이블 감지) ---

type TextSegment =
  | { kind: 'text'; text: string }
  | { kind: 'table'; columns: string[]; rows: string[][] }

function isTableRow(line: string): boolean {
  const t = line.trim()
  return t.startsWith('|') && t.endsWith('|') && t.split('|').length >= 3
}

function isSeparator(line: string): boolean {
  return /^\|[\s\-:|]+\|$/.test(line.trim())
}

function splitCells(line: string): string[] {
  return line.trim().slice(1, -1).split('|').map((c) => c.trim())
}

function parseTextWithTables(text: string): TextSegment[] {
  const lines = text.split('\n')
  const segments: TextSegment[] = []
  let buf: string[] = []
  let i = 0

  const flush = () => {
    const t = buf.join('\n').trim()
    if (t) segments.push({ kind: 'text', text: t })
    buf = []
  }

  while (i < lines.length) {
    if (isTableRow(lines[i]) && i + 1 < lines.length && isSeparator(lines[i + 1])) {
      flush()
      const columns = splitCells(lines[i])
      i += 2
      const rows: string[][] = []
      while (i < lines.length && isTableRow(lines[i])) {
        rows.push(splitCells(lines[i]))
        i++
      }
      if (rows.length > 0) segments.push({ kind: 'table', columns, rows })
    } else {
      buf.push(lines[i])
      i++
    }
  }
  flush()
  return segments
}

// --- 리치 텍스트 렌더러 (일반 텍스트 + 임베디드 마크다운 테이블) ---

function RichText({ text }: { text: string }) {
  const segments = parseTextWithTables(text)

  if (segments.length === 1 && segments[0].kind === 'text') {
    return <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{text}</p>
  }

  return (
    <div className="space-y-3">
      {segments.map((seg, i) =>
        seg.kind === 'table' ? (
          <TableView key={i} columns={seg.columns} rows={seg.rows} />
        ) : (
          <p key={i} className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{seg.text}</p>
        )
      )}
    </div>
  )
}

interface TableViewProps {
  columns: string[]
  rows?: (string | number)[][] | Record<string, string | number>[]
}

function TableView({ columns, rows }: TableViewProps) {
  if (!rows?.length) return null
  return (
    <div className="overflow-x-auto break-inside-avoid">
      <table className="w-full text-sm border-2 border-gray-300 dark:border-gray-600 rounded border-collapse">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700">
            {columns.map((col: string) => (
              <th key={col} className="px-3 py-2 text-left font-bold text-gray-800 dark:text-gray-200 border-b-2 border-gray-300 dark:border-gray-600">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i: number) => {
            const cells = Array.isArray(row) ? row : Object.values(row)
            return (
              <tr key={i} className="border-b border-gray-200 dark:border-gray-700 even:bg-gray-50 dark:even:bg-gray-700/30">
                {cells.map((cell, j: number) => (
                  <td key={j} className={`px-3 py-2 text-gray-700 dark:text-gray-300${j === 0 ? ' font-medium' : ''}`}>{String(cell)}</td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

interface FrameworkPreviewProps {
  id: string
  data: FrameworkData
  isHighlighted?: boolean
}

function FrameworkPreview({ id, data, isHighlighted }: FrameworkPreviewProps) {
  const fw = FRAMEWORKS[id]
  if (!fw || !data) return null

  return (
    <div
      id={`framework-${id}`}
      className={`mb-6 break-inside-avoid transition-all duration-300 ${isHighlighted ? 'ring-2 ring-indigo-400 rounded-lg bg-indigo-50/30 dark:bg-indigo-950/20 p-3 -mx-3' : ''}`}
    >
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">{fw.name}</h3>
        {isHighlighted && (
          <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/40 px-1.5 py-0.5 rounded no-print">
            ↻ 개선됨
          </span>
        )}
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">{fw.fullName} — {fw.description}</p>

      {Object.entries(fw.fields).map(([key, fieldDef]: [string, FieldDef]) => {
        const value = (data as unknown as Record<string, unknown>)[key]
        if (value === undefined || value === null) return null

        return (
          <div key={key} className="mb-3">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{fieldDef.label}</h4>
            {fieldDef.type === 'list' && <ListItems items={value as string[]} />}
            {(fieldDef.type === 'text' || fieldDef.type === 'select') && (
              <RichText text={String(value)} />
            )}
            {fieldDef.type === 'table' && (
              <TableView columns={fieldDef.columns} rows={value as (string | number)[][]} />
            )}
            {fieldDef.type === 'object' && typeof value === 'object' && (
              <div className="space-y-1">
                {Object.entries(value as Record<string, unknown>).map(([subKey, subVal]) => (
                  <div key={subKey} className="text-sm">
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      {(fieldDef as ObjectFieldDef).subfields?.[subKey] || subKey}:
                    </span>{' '}
                    <span className="text-gray-700 dark:text-gray-300">
                      {typeof subVal === 'object' ? JSON.stringify(subVal) : String(subVal)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// --- 경영진 요약 렌더링 ---

const REC_LABELS: Record<string, string> = { go: 'GO', conditional_go: 'CONDITIONAL GO', no_go: 'NO-GO' }
const REC_COLORS: Record<string, string> = {
  go: 'bg-green-100 text-green-800',
  conditional_go: 'bg-amber-100 text-amber-800',
  no_go: 'bg-red-100 text-red-800',
}

function ExecutiveSummaryPreview({ data }: { data: ExecutiveSummary }) {
  return (
    <div className="mb-8 break-inside-avoid">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 border-b-2 border-emerald-500 pb-2 break-after-avoid">
        Executive Summary
      </h2>
      <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-3 mb-3">{data.title}</p>

      <div className="space-y-3 mb-4">
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">시장 기회</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">{data.opportunity}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">핵심 전략</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">{data.strategy}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">경쟁 우위</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">{data.competitiveAdvantage}</p>
        </div>
      </div>

      {data.keyMetrics?.length > 0 && (
        <div className="overflow-x-auto mb-4 break-inside-avoid">
          <table className="w-full text-sm border-2 border-gray-300 dark:border-gray-600 border-collapse">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                <th className="px-3 py-2 text-left font-bold text-gray-800 dark:text-gray-200 border-b-2 border-gray-300 dark:border-gray-600">지표</th>
                <th className="px-3 py-2 text-left font-bold text-gray-800 dark:text-gray-200 border-b-2 border-gray-300 dark:border-gray-600">값</th>
              </tr>
            </thead>
            <tbody>
              {data.keyMetrics.map((m, i) => (
                <tr key={i} className="border-b border-gray-200 dark:border-gray-700 even:bg-gray-50 dark:even:bg-gray-700/30">
                  <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{m.label}</td>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{m.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data.risks?.length > 0 && (
        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">주요 리스크</h4>
          <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-0.5">
            {data.risks.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      )}

      <div className="flex items-center gap-2 mt-3">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">의사결정 권고:</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${REC_COLORS[data.recommendation] ?? ''}`}>
          {REC_LABELS[data.recommendation] ?? data.recommendation}
        </span>
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{data.recommendationReason}</p>
    </div>
  )
}

// --- 시나리오 분석 렌더링 ---

const SCENARIO_LABELS: Record<string, string> = {
  aggressive: '공격적 확장',
  conservative: '안정적 성장',
  pivot: '전략적 피벗',
}

function ScenarioPreview({ data }: { data: ScenarioResult }) {
  return (
    <div className="mb-8 break-inside-avoid">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 border-b-2 border-violet-500 pb-2 break-after-avoid">
        시나리오 분석
      </h2>

      {data.scenarios.map((s) => {
        const isRec = s.type === data.recommendation
        return (
          <div key={s.type} className="mt-4 mb-6 break-inside-avoid">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
              {s.label} {isRec && '⭐'}
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{s.overview}</p>

            {s.keyDifferences?.length > 0 && (
              <div className="mb-2">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">차이점</h4>
                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-0.5">
                  {s.keyDifferences.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm mb-2">
              <div>
                <h4 className="font-medium text-gray-500 dark:text-gray-400 text-xs">경쟁 전략</h4>
                <p className="text-gray-700 dark:text-gray-300">{s.genericStrategy.strategy}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-500 dark:text-gray-400 text-xs">STP</h4>
                <p className="text-gray-700 dark:text-gray-300">타겟: {s.stp.targeting}</p>
                <p className="text-gray-700 dark:text-gray-300">포지셔닝: {s.stp.positioning}</p>
              </div>
            </div>

            {s.kpiTargets?.length > 0 && (
              <div className="overflow-x-auto break-inside-avoid">
                <table className="w-full text-sm border-2 border-gray-300 dark:border-gray-600 border-collapse">
                  <thead>
                    <tr className="bg-gray-200 dark:bg-gray-700">
                      <th className="px-3 py-1.5 text-left font-bold text-gray-800 dark:text-gray-200 border-b-2 border-gray-300 dark:border-gray-600">KPI</th>
                      <th className="px-3 py-1.5 text-left font-bold text-gray-800 dark:text-gray-200 border-b-2 border-gray-300 dark:border-gray-600">목표</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.kpiTargets.map((k, i) => (
                      <tr key={i} className="border-b border-gray-200 dark:border-gray-700">
                        <td className="px-3 py-1.5 font-medium text-gray-700 dark:text-gray-300">{k.label}</td>
                        <td className="px-3 py-1.5 text-gray-700 dark:text-gray-300">{k.target}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              리스크: {s.riskLevel} | 예상 ROI: {s.expectedROI} | 타임라인: {s.timeline}
            </p>
          </div>
        )
      })}

      <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg break-inside-avoid">
        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">시나리오 비교 요약</h4>
        <p className="text-sm text-gray-700 dark:text-gray-300">{data.comparison}</p>
        <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
          <span className="font-medium">AI 추천:</span> {SCENARIO_LABELS[data.recommendation]} — {data.recommendationReason}
        </p>
      </div>
    </div>
  )
}

// --- 재무 시뮬레이션 렌더링 ---

function formatMoneyPreview(value: number): string {
  if (Math.abs(value) >= 10000) return `${(value / 10000).toLocaleString(undefined, { maximumFractionDigits: 1 })}억원`
  return `${value.toLocaleString()}만원`
}

function FinancialPreview({ data }: { data: FinancialResult }) {
  return (
    <div className="mb-8 break-inside-avoid">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 border-b-2 border-amber-500 pb-2 break-after-avoid">
        재무 시뮬레이션
      </h2>

      {/* 시장 규모 */}
      <div className="mt-4 mb-4 break-inside-avoid">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">시장 규모</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-2 border-gray-300 dark:border-gray-600 border-collapse">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                <th className="px-3 py-2 text-left font-bold text-gray-800 dark:text-gray-200 border-b-2 border-gray-300 dark:border-gray-600">구분</th>
                <th className="px-3 py-2 text-left font-bold text-gray-800 dark:text-gray-200 border-b-2 border-gray-300 dark:border-gray-600">규모</th>
                <th className="px-3 py-2 text-left font-bold text-gray-800 dark:text-gray-200 border-b-2 border-gray-300 dark:border-gray-600">설명</th>
              </tr>
            </thead>
            <tbody>
              {(['tam', 'sam', 'som'] as const).map((key) => {
                const m = data.marketSizing[key]
                return (
                  <tr key={key} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300 uppercase">{key}</td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{m.value.toLocaleString()}{m.unit}</td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{m.description}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5년 매출 예측 */}
      {data.revenueProjections?.length > 0 && (
        <div className="mb-4 break-inside-avoid">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">5년 매출 예측</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-2 border-gray-300 dark:border-gray-600 border-collapse">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700">
                  <th className="px-3 py-2 text-left font-bold text-gray-800 dark:text-gray-200 border-b-2 border-gray-300 dark:border-gray-600">연도</th>
                  <th className="px-3 py-2 text-right font-bold text-gray-800 dark:text-gray-200 border-b-2 border-gray-300 dark:border-gray-600">매출</th>
                  <th className="px-3 py-2 text-right font-bold text-gray-800 dark:text-gray-200 border-b-2 border-gray-300 dark:border-gray-600">비용</th>
                  <th className="px-3 py-2 text-right font-bold text-gray-800 dark:text-gray-200 border-b-2 border-gray-300 dark:border-gray-600">이익</th>
                  <th className="px-3 py-2 text-right font-bold text-gray-800 dark:text-gray-200 border-b-2 border-gray-300 dark:border-gray-600">누적</th>
                </tr>
              </thead>
              <tbody>
                {data.revenueProjections.map((r) => (
                  <tr key={r.year} className="border-b border-gray-200 dark:border-gray-700 even:bg-gray-50 dark:even:bg-gray-700/30">
                    <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.year}년차</td>
                    <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{formatMoneyPreview(r.revenue)}</td>
                    <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{formatMoneyPreview(r.cost)}</td>
                    <td className={`px-3 py-2 text-right font-medium ${r.profit >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                      {formatMoneyPreview(r.profit)}
                    </td>
                    <td className={`px-3 py-2 text-right ${r.cumulativeProfit >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                      {formatMoneyPreview(r.cumulativeProfit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 핵심 지표 */}
      <div className="grid grid-cols-4 gap-3 mb-4 text-sm break-inside-avoid">
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/30 rounded">
          <p className="text-xs text-gray-500 dark:text-gray-400">초기 투자</p>
          <p className="font-bold text-gray-900 dark:text-gray-100">{formatMoneyPreview(data.initialInvestment)}</p>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/30 rounded">
          <p className="text-xs text-gray-500 dark:text-gray-400">BEP</p>
          <p className="font-bold text-gray-900 dark:text-gray-100">{data.breakEvenMonth}개월</p>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/30 rounded">
          <p className="text-xs text-gray-500 dark:text-gray-400">3년 ROI</p>
          <p className="font-bold text-gray-900 dark:text-gray-100">{data.roi3Year}%</p>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/30 rounded">
          <p className="text-xs text-gray-500 dark:text-gray-400">5년 ROI</p>
          <p className="font-bold text-gray-900 dark:text-gray-100">{data.roi5Year}%</p>
        </div>
      </div>

      {/* 전제 조건 */}
      {data.keyAssumptions?.length > 0 && (
        <div className="mb-3 break-inside-avoid">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">전제 조건</h4>
          <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-0.5">
            {data.keyAssumptions.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}

      <p className="text-sm text-gray-700 dark:text-gray-300">{data.summary}</p>
    </div>
  )
}

// --- DocumentPreview 메인 ---

interface DocumentPreviewProps {
  state: StrategyDocument
  highlightedFrameworks?: Set<string>
}

export default function DocumentPreview({ state, highlightedFrameworks }: DocumentPreviewProps) {
  if (!state) return null

  const completedCount = Object.values(state.frameworks).filter(
    (f) => f.status === 'completed'
  ).length

  return (
    <div id="document-preview" className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
      {/* 제목 */}
      <div className="text-center mb-8 border-b border-gray-200 dark:border-gray-700 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{state.businessItem}</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400">전략 PRD (Product Requirements Document)</p>
        <div className="flex justify-center gap-4 mt-3 text-xs text-gray-400 dark:text-gray-500">
          <span>생성일: {new Date(state.createdAt).toLocaleDateString('ko-KR')}</span>
          <span>분석 완료: {completedCount}/{Object.keys(FRAMEWORKS).length}</span>
        </div>
      </div>

      {/* 경영진 요약 (문서 최상단) */}
      {state.executiveSummary && <ExecutiveSummaryPreview data={state.executiveSummary} />}

      {/* 섹션별 내용 */}
      {SECTIONS.map((section) => {
        const hasData = section.frameworks.some(
          (fId: string) => state.frameworks[fId]?.status === 'completed'
        )
        if (!hasData) return null

        return (
          <div key={section.number} className="mb-8 break-before-auto break-after-auto">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 border-b-2 border-primary-500 pb-2 break-after-avoid">
              {section.number}. {section.title}
            </h2>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">{section.subtitle}</p>

            {section.frameworks.map((fId: string) => {
              const fState = state.frameworks[fId]
              if (fState?.status !== 'completed' || !fState.data) return null
              return <FrameworkPreview key={fId} id={fId} data={fState.data} isHighlighted={highlightedFrameworks?.has(fId)} />
            })}
          </div>
        )
      })}

      {/* 시나리오 분석 */}
      {state.scenarioResult && <ScenarioPreview data={state.scenarioResult} />}

      {/* 재무 시뮬레이션 */}
      {state.financialResult && <FinancialPreview data={state.financialResult} />}

      <div className="text-center text-xs text-gray-400 dark:text-gray-500 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
        Generated by Strategy Analyzer
      </div>
    </div>
  )
}
