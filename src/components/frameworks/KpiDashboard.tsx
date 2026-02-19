import FrameworkCard from './FrameworkCard'
import { ListField } from './FieldRenderer'
import { useStrategy } from '../../hooks/useStrategyDocument'
import type { KpiData } from '../../types'

interface KpiLevelDef {
  key: keyof Pick<KpiData, 'input' | 'throughput' | 'output' | 'outcome'>
  label: string
  desc: string
  color: string
}

const KPI_LEVELS: KpiLevelDef[] = [
  { key: 'input', label: 'Input', desc: '투입 지표', color: 'bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600' },
  { key: 'throughput', label: 'Throughput', desc: '과정 지표', color: 'bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-800' },
  { key: 'output', label: 'Output', desc: '산출 지표', color: 'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-800' },
  { key: 'outcome', label: 'Outcome', desc: '성과 지표', color: 'bg-amber-50 border-amber-300 dark:bg-amber-900/20 dark:border-amber-800' },
]

export default function KpiDashboard() {
  const { state } = useStrategy()
  const data = state?.frameworks.kpi?.data as KpiData | undefined

  return (
    <FrameworkCard frameworkId="kpi">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 rounded-lg p-3">
          <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">정량적 기대효과</div>
          <ListField frameworkId="kpi" fieldKey="quantitative" label="" items={data?.quantitative} />
        </div>
        <div className="bg-purple-50 border border-purple-200 dark:bg-purple-900/20 dark:border-purple-800 rounded-lg p-3">
          <div className="text-xs font-bold text-purple-700 dark:text-purple-400 mb-1">정성적 기대효과</div>
          <ListField frameworkId="kpi" fieldKey="qualitative" label="" items={data?.qualitative} />
        </div>
      </div>

      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">KPI 체계 (Input → Throughput → Output → Outcome)</div>
      <div className="flex gap-1">
        {KPI_LEVELS.map(({ key, label, desc, color }, i: number) => (
          <div key={key} className="flex items-center flex-1">
            <div className={`flex-1 rounded-lg border p-2 ${color}`}>
              <div className="text-[10px] font-bold text-gray-700 dark:text-gray-300 text-center">{label}</div>
              <div className="text-[9px] text-gray-400 dark:text-gray-500 text-center mb-1">{desc}</div>
              <ListField frameworkId="kpi" fieldKey={key} label="" items={data?.[key]} />
            </div>
            {i < KPI_LEVELS.length - 1 && (
              <span className="text-gray-300 dark:text-gray-600 px-0.5 shrink-0">→</span>
            )}
          </div>
        ))}
      </div>
    </FrameworkCard>
  )
}
