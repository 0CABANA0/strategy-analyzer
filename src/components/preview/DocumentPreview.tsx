import { FRAMEWORKS } from '../../data/frameworkDefinitions'
import { SECTIONS } from '../../data/sectionDefinitions'
import type { StrategyDocument, FrameworkData } from '../../types'
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
}

function FrameworkPreview({ id, data }: FrameworkPreviewProps) {
  const fw = FRAMEWORKS[id]
  if (!fw || !data) return null

  return (
    <div className="mb-6 break-inside-avoid">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">{fw.name}</h3>
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

interface DocumentPreviewProps {
  state: StrategyDocument
}

export default function DocumentPreview({ state }: DocumentPreviewProps) {
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
              return <FrameworkPreview key={fId} id={fId} data={fState.data} />
            })}
          </div>
        )
      })}

      <div className="text-center text-xs text-gray-400 dark:text-gray-500 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
        Generated by Strategy Analyzer
      </div>
    </div>
  )
}
