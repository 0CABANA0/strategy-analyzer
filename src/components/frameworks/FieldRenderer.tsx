import React from 'react'
import { useStrategy } from '../../hooks/useStrategyDocument'

// --- Props Interfaces ---

interface ListFieldProps {
  frameworkId: string
  fieldKey: string
  label: string
  hint?: string
  items?: string[]
}

interface TextFieldProps {
  frameworkId: string
  fieldKey: string
  label: string
  hint?: string
  value?: string
  multiline?: boolean
}

interface ReadOnlyListProps {
  label: string
  items?: string[]
  bulletColor?: string
}

interface ReadOnlyTextProps {
  label: string
  value?: string
}

interface DataTableProps {
  label?: string
  columns: string[]
  rows?: (string | number)[][] | Record<string, string | number>[]
}

/** 리스트 필드 (편집 가능) */
export function ListField({ frameworkId, fieldKey, label, hint, items }: ListFieldProps) {
  const { updateFrameworkField } = useStrategy()

  const handleChange = (index: number, value: string) => {
    const newItems = [...(items || [])]
    newItems[index] = value
    updateFrameworkField(frameworkId, fieldKey, newItems)
  }

  const handleAdd = () => {
    updateFrameworkField(frameworkId, fieldKey, [...(items || []), ''])
  }

  const handleRemove = (index: number) => {
    const newItems = (items || []).filter((_: string, i: number) => i !== index)
    updateFrameworkField(frameworkId, fieldKey, newItems)
  }

  return (
    <div className="mb-3">
      <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
        {label}
        {hint && <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">({hint})</span>}
      </label>
      <div className="space-y-1">
        {(items || []).map((item: string, i: number) => (
          <div key={i} className="flex gap-1 min-w-0">
            <input
              type="text"
              value={item}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(i, e.target.value)}
              className="flex-1 min-w-0 px-2 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            />
            <button
              onClick={() => handleRemove(i)}
              className="px-1.5 text-gray-300 hover:text-red-400 text-xs dark:text-gray-600 dark:hover:text-red-400"
            >
              x
            </button>
          </div>
        ))}
        <button
          onClick={handleAdd}
          className="text-xs text-primary-500 hover:text-primary-700"
        >
          + 항목 추가
        </button>
      </div>
    </div>
  )
}

/** 텍스트 필드 (편집 가능) */
export function TextField({ frameworkId, fieldKey, label, hint, value, multiline }: TextFieldProps) {
  const { updateFrameworkField } = useStrategy()

  const Component = multiline ? 'textarea' : 'input'

  return (
    <div className="mb-3">
      <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
        {label}
        {hint && <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">({hint})</span>}
      </label>
      <Component
        type={multiline ? undefined : 'text'}
        value={value || ''}
        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => updateFrameworkField(frameworkId, fieldKey, e.target.value)}
        rows={multiline ? 3 : undefined}
        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-400 resize-y dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
      />
    </div>
  )
}

/** 읽기 전용 리스트 */
export function ReadOnlyList({ label, items, bulletColor = 'bg-gray-400 dark:bg-gray-500' }: ReadOnlyListProps) {
  if (!items?.length) return null
  return (
    <div className="mb-3">
      <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">{label}</label>
      <ul className="space-y-0.5">
        {items.map((item: string, i: number) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
            <span className={`w-1.5 h-1.5 rounded-full ${bulletColor} mt-1.5 shrink-0`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** 읽기 전용 텍스트 */
export function ReadOnlyText({ label, value }: ReadOnlyTextProps) {
  if (!value) return null
  return (
    <div className="mb-3">
      <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">{label}</label>
      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{value}</p>
    </div>
  )
}

/** 테이블 표시 */
export function DataTable({ label, columns, rows }: DataTableProps) {
  if (!rows?.length) return null
  return (
    <div className="mb-3">
      {label && <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">{label}</label>}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700">
              {columns.map((col: string) => (
                <th key={col} className="px-2 py-1.5 text-left font-medium text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i: number) => (
              <tr key={i} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                {(Array.isArray(row) ? row : Object.values(row)).map((cell, j: number) => (
                  <td key={j} className="px-2 py-1.5 text-gray-700 dark:text-gray-300">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
