import { memo } from 'react'
import FrameworkCard from './FrameworkCard'
import { TextField, ListField } from './FieldRenderer'
import { useStrategy } from '../../hooks/useStrategyDocument'
import type { MarketData } from '../../types'

interface MarketSizeDef {
  key: keyof Pick<MarketData, 'tam' | 'sam' | 'som'>
  label: string
  sub: string
  color: string
}

function MarketAnalysis() {
  const { state } = useStrategy()
  const data = state?.frameworks.marketAnalysis?.data as MarketData | undefined

  const marketSizes: MarketSizeDef[] = [
    { key: 'tam', label: 'TAM', sub: '전체 시장', color: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' },
    { key: 'sam', label: 'SAM', sub: '유효 시장', color: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' },
    { key: 'som', label: 'SOM', sub: '수익 시장', color: 'bg-cyan-50 border-cyan-200 dark:bg-cyan-900/20 dark:border-cyan-800' },
  ]

  return (
    <FrameworkCard frameworkId="marketAnalysis">
      <div className="grid grid-cols-3 gap-2 mb-3">
        {marketSizes.map(({ key, label, sub, color }) => (
          <div key={key} className={`rounded-lg border p-3 text-center ${color}`}>
            <div className="text-xs font-bold text-gray-700 dark:text-gray-300">{label}</div>
            <div className="text-[10px] text-gray-400 dark:text-gray-500 mb-1">{sub}</div>
            <input
              type="text"
              value={data?.[key] || ''}
              onChange={() => {/* handled by TextField */}}
              className="w-full text-center text-sm font-medium bg-transparent border-0 focus:outline-none"
              readOnly
            />
          </div>
        ))}
      </div>
      <TextField frameworkId="marketAnalysis" fieldKey="tam" label="TAM (전체 시장)" value={data?.tam} />
      <TextField frameworkId="marketAnalysis" fieldKey="sam" label="SAM (유효 시장)" value={data?.sam} />
      <TextField frameworkId="marketAnalysis" fieldKey="som" label="SOM (수익 시장)" value={data?.som} />
      <TextField frameworkId="marketAnalysis" fieldKey="growthRate" label="성장률" value={data?.growthRate} />
      <ListField frameworkId="marketAnalysis" fieldKey="trends" label="시장 트렌드" items={data?.trends} />
    </FrameworkCard>
  )
}

export default memo(MarketAnalysis)
