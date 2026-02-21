import { memo } from 'react'
import FrameworkCard from './FrameworkCard'
import { ListField } from './FieldRenderer'
import { useStrategy } from '../../hooks/useStrategyDocument'
import QuadrantGrid from '../common/QuadrantGrid'
import type { QuadrantItem } from '../common/QuadrantGrid'
import type { ErrcData } from '../../types'

const ERRC_QUADRANTS: (QuadrantItem & { dataKey: keyof ErrcData })[] = [
  { key: 'eliminate', dataKey: 'eliminate', label: '제거 (Eliminate)', color: 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400', icon: '✕' },
  { key: 'reduce', dataKey: 'reduce', label: '감소 (Reduce)', color: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400', icon: '↓' },
  { key: 'raise', dataKey: 'raise', label: '증가 (Raise)', color: 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400', icon: '↑' },
  { key: 'create', dataKey: 'create', label: '창조 (Create)', color: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400', icon: '★' },
]

function ErrcGrid() {
  const { state } = useStrategy()
  const data = state?.frameworks.errc?.data as ErrcData | undefined

  return (
    <FrameworkCard frameworkId="errc">
      <QuadrantGrid
        items={ERRC_QUADRANTS}
        renderContent={(item) => {
          const q = ERRC_QUADRANTS.find((q) => q.key === item.key)!
          return <ListField frameworkId="errc" fieldKey={q.dataKey} label="" items={data?.[q.dataKey]} />
        }}
      />
    </FrameworkCard>
  )
}

export default memo(ErrcGrid)
