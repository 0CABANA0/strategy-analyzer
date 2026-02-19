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

interface TableViewProps {
  columns: string[]
  rows?: (string | number)[][] | Record<string, string | number>[]
}

function TableView({ columns, rows }: TableViewProps) {
  if (!rows?.length) return null
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            {columns.map((col: string) => (
              <th key={col} className="px-3 py-1.5 text-left font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i: number) => (
            <tr key={i} className="border-b border-gray-200 dark:border-gray-700">
              {(Array.isArray(row) ? row : Object.values(row)).map((cell, j: number) => (
                <td key={j} className="px-3 py-1.5 text-gray-700 dark:text-gray-300">{String(cell)}</td>
              ))}
            </tr>
          ))}
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
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{value as string}</p>
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
          <div key={section.number} className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 border-b-2 border-primary-500 pb-2">
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
