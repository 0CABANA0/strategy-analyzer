import FrameworkCard from './FrameworkCard'
import { ListField } from './FieldRenderer'
import { useStrategy } from '../../hooks/useStrategyDocument'
import type { ErrcData } from '../../types'

interface ErrcQuadrantDef {
  key: keyof ErrcData
  label: string
  color: string
  icon: string
}

const ERRC_QUADRANTS: ErrcQuadrantDef[] = [
  { key: 'eliminate', label: '제거 (Eliminate)', color: 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400', icon: '✕' },
  { key: 'reduce', label: '감소 (Reduce)', color: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400', icon: '↓' },
  { key: 'raise', label: '증가 (Raise)', color: 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400', icon: '↑' },
  { key: 'create', label: '창조 (Create)', color: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400', icon: '★' },
]

export default function ErrcGrid() {
  const { state } = useStrategy()
  const data = state?.frameworks.errc?.data as ErrcData | undefined

  return (
    <FrameworkCard frameworkId="errc">
      <div className="grid grid-cols-2 gap-2">
        {ERRC_QUADRANTS.map(({ key, label, color, icon }) => (
          <div key={key} className={`rounded-lg border p-3 ${color}`}>
            <div className="flex items-center gap-1 mb-2">
              <span className="text-base">{icon}</span>
              <span className="text-xs font-bold">{label}</span>
            </div>
            <ListField frameworkId="errc" fieldKey={key} label="" items={data?.[key]} />
          </div>
        ))}
      </div>
    </FrameworkCard>
  )
}
