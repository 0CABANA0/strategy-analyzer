import FrameworkCard from './FrameworkCard'
import { ListField } from './FieldRenderer'
import { useStrategy } from '../../hooks/useStrategyDocument'
import type { SwotData } from '../../types'

interface QuadrantDef {
  key: keyof Pick<SwotData, 'strengths' | 'weaknesses' | 'opportunities' | 'threats'>
  label: string
  color: string
  textColor: string
}

interface CrossDef {
  key: keyof Pick<SwotData, 'so' | 'wo' | 'st' | 'wt'>
  label: string
  hint: string
  color: string
}

const QUADRANTS: QuadrantDef[] = [
  { key: 'strengths', label: '강점 (S)', color: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800', textColor: 'text-blue-700 dark:text-blue-400' },
  { key: 'weaknesses', label: '약점 (W)', color: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800', textColor: 'text-red-700 dark:text-red-400' },
  { key: 'opportunities', label: '기회 (O)', color: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800', textColor: 'text-green-700 dark:text-green-400' },
  { key: 'threats', label: '위협 (T)', color: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800', textColor: 'text-amber-700 dark:text-amber-400' },
]

const CROSS: CrossDef[] = [
  { key: 'so', label: 'SO 전략', hint: '강점으로 기회 활용', color: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' },
  { key: 'wo', label: 'WO 전략', hint: '약점 보완하여 기회 활용', color: 'bg-sky-50 border-sky-200 dark:bg-sky-900/20 dark:border-sky-800' },
  { key: 'st', label: 'ST 전략', hint: '강점으로 위협 대응', color: 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800' },
  { key: 'wt', label: 'WT 전략', hint: '약점·위협 최소화', color: 'bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800' },
]

export default function SwotAnalysis() {
  const { state } = useStrategy()
  const data = state?.frameworks.swot?.data as SwotData | undefined

  return (
    <FrameworkCard frameworkId="swot">
      {/* SWOT 2x2 매트릭스 */}
      <div className="mb-4">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">SWOT 분석</div>
        <div className="grid grid-cols-2 gap-2">
          {QUADRANTS.map(({ key, label, color, textColor }) => (
            <div key={key} className={`rounded-lg border p-3 ${color}`}>
              <div className={`text-xs font-bold mb-2 ${textColor}`}>{label}</div>
              <ListField frameworkId="swot" fieldKey={key} label="" items={data?.[key]} />
            </div>
          ))}
        </div>
      </div>

      {/* 크로스분석 */}
      <div>
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">크로스 분석 (전략 도출)</div>
        <div className="grid grid-cols-2 gap-2">
          {CROSS.map(({ key, label, hint, color }) => (
            <div key={key} className={`rounded-lg border p-3 ${color}`}>
              <div className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">{label}</div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500 mb-1">{hint}</div>
              <ListField frameworkId="swot" fieldKey={key} label="" items={data?.[key]} />
            </div>
          ))}
        </div>
      </div>

      {/* 선택 전략 */}
      <div className="mt-3">
        <ListField frameworkId="swot" fieldKey="selectedStrategies" label="선택 전략 (최종)" items={data?.selectedStrategies} />
      </div>
    </FrameworkCard>
  )
}
