import FrameworkCard from './FrameworkCard'
import { useStrategy } from '../../hooks/useStrategyDocument'
import type { AnsoffData } from '../../types'

interface CellDef {
  key: keyof Pick<AnsoffData, 'marketPenetration' | 'productDevelopment' | 'marketDevelopment' | 'diversification'>
  label: string
  sub: string
  pos: string
}

export default function AnsoffMatrix() {
  const { state, updateFrameworkField } = useStrategy()
  const data = state?.frameworks.ansoff?.data as AnsoffData | undefined

  const cells: CellDef[] = [
    { key: 'marketPenetration', label: '시장 침투', sub: '기존 시장 x 기존 제품', pos: 'col-start-1 row-start-1' },
    { key: 'productDevelopment', label: '제품 개발', sub: '기존 시장 x 신규 제품', pos: 'col-start-2 row-start-1' },
    { key: 'marketDevelopment', label: '시장 개발', sub: '신규 시장 x 기존 제품', pos: 'col-start-1 row-start-2' },
    { key: 'diversification', label: '다각화', sub: '신규 시장 x 신규 제품', pos: 'col-start-2 row-start-2' },
  ]

  return (
    <FrameworkCard frameworkId="ansoff">
      <div className="grid grid-cols-2 gap-2 mb-3">
        {cells.map((cell) => {
          const isSelected = data?.selectedStrategy === cell.label
          return (
            <div
              key={cell.key}
              onClick={() => updateFrameworkField('ansoff', 'selectedStrategy', cell.label)}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all text-sm ${
                isSelected
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500'
              } ${cell.pos}`}
            >
              <div className="font-medium text-gray-800 dark:text-gray-200">{cell.label}</div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mb-1">{cell.sub}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{data?.[cell.key] || ''}</p>
            </div>
          )
        })}
      </div>
      {data?.selectedStrategy && (
        <div className="text-xs bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 px-3 py-1.5 rounded-md">
          선택 전략: <strong>{data.selectedStrategy}</strong>
        </div>
      )}
    </FrameworkCard>
  )
}
