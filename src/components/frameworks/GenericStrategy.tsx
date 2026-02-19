import FrameworkCard from './FrameworkCard'
import { TextField, ListField } from './FieldRenderer'
import { useStrategy } from '../../hooks/useStrategyDocument'
import type { GenericStrategyData } from '../../types'

interface StrategyDef {
  id: string
  label: string
  desc: string
  color: string
}

const STRATEGIES: StrategyDef[] = [
  { id: '원가우위', label: '원가우위', desc: '업계 최저 비용으로 경쟁', color: 'bg-blue-500' },
  { id: '차별화', label: '차별화', desc: '고유한 가치로 프리미엄 확보', color: 'bg-purple-500' },
  { id: '집중(원가)', label: '집중(원가)', desc: '틈새시장에서 원가 우위', color: 'bg-teal-500' },
  { id: '집중(차별화)', label: '집중(차별화)', desc: '틈새시장에서 차별화', color: 'bg-amber-500' },
]

export default function GenericStrategy() {
  const { state, updateFrameworkField } = useStrategy()
  const data = state?.frameworks.genericStrategy?.data as GenericStrategyData | undefined

  return (
    <FrameworkCard frameworkId="genericStrategy">
      <div className="grid grid-cols-2 gap-2 mb-3">
        {STRATEGIES.map(({ id, label, desc, color }) => (
          <button
            key={id}
            onClick={() => updateFrameworkField('genericStrategy', 'strategy', id)}
            className={`p-3 rounded-lg border-2 text-left transition-all ${
              data?.strategy === id
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`w-2 h-2 rounded-full ${color}`} />
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
          </button>
        ))}
      </div>
      <TextField frameworkId="genericStrategy" fieldKey="rationale" label="선택 근거" value={data?.rationale} multiline />
      <ListField frameworkId="genericStrategy" fieldKey="actions" label="실행 방안" items={data?.actions} />
    </FrameworkCard>
  )
}
