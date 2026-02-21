import { memo } from 'react'
import FrameworkCard from './FrameworkCard'
import { TextField } from './FieldRenderer'
import { useStrategy } from '../../hooks/useStrategyDocument'
import QuadrantGrid from '../common/QuadrantGrid'
import type { QuadrantItem } from '../common/QuadrantGrid'
import type { FourPData } from '../../types'

const FOUR_P: (QuadrantItem & { dataKey: keyof FourPData })[] = [
  { key: 'product', dataKey: 'product', label: '제품 (Product)', icon: '📦', color: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' },
  { key: 'price', dataKey: 'price', label: '가격 (Price)', icon: '💰', color: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' },
  { key: 'place', dataKey: 'place', label: '유통 (Place)', icon: '🏪', color: 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800' },
  { key: 'promotion', dataKey: 'promotion', label: '판촉 (Promotion)', icon: '📢', color: 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800' },
]

function FourPAnalysis() {
  const { state } = useStrategy()
  const data = state?.frameworks.fourP?.data as FourPData | undefined

  return (
    <FrameworkCard frameworkId="fourP">
      <QuadrantGrid
        items={FOUR_P}
        renderContent={(item) => {
          const p = FOUR_P.find((p) => p.key === item.key)!
          return <TextField frameworkId="fourP" fieldKey={p.dataKey} label="" value={data?.[p.dataKey]} multiline />
        }}
      />
    </FrameworkCard>
  )
}

export default memo(FourPAnalysis)
