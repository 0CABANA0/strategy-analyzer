import FrameworkCard from './FrameworkCard'
import { TextField } from './FieldRenderer'
import { useStrategy } from '../../hooks/useStrategyDocument'
import type { FourPData } from '../../types'

interface FourPDef {
  key: keyof FourPData
  label: string
  icon: string
  color: string
}

const FOUR_P: FourPDef[] = [
  { key: 'product', label: '제품 (Product)', icon: '📦', color: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' },
  { key: 'price', label: '가격 (Price)', icon: '💰', color: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' },
  { key: 'place', label: '유통 (Place)', icon: '🏪', color: 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800' },
  { key: 'promotion', label: '판촉 (Promotion)', icon: '📢', color: 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800' },
]

export default function FourPAnalysis() {
  const { state } = useStrategy()
  const data = state?.frameworks.fourP?.data as FourPData | undefined

  return (
    <FrameworkCard frameworkId="fourP">
      <div className="grid grid-cols-2 gap-3">
        {FOUR_P.map(({ key, label, icon, color }) => (
          <div key={key} className={`rounded-lg border p-3 ${color}`}>
            <div className="flex items-center gap-1.5 mb-2">
              <span>{icon}</span>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{label}</span>
            </div>
            <TextField frameworkId="fourP" fieldKey={key} label="" value={data?.[key]} multiline />
          </div>
        ))}
      </div>
    </FrameworkCard>
  )
}
