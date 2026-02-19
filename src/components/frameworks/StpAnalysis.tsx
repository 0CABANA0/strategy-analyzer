import FrameworkCard from './FrameworkCard'
import { ListField, TextField } from './FieldRenderer'
import { useStrategy } from '../../hooks/useStrategyDocument'
import type { StpData } from '../../types'

export default function StpAnalysis() {
  const { state } = useStrategy()
  const data = state?.frameworks.stp?.data as StpData | undefined

  return (
    <FrameworkCard frameworkId="stp">
      <div className="flex items-center gap-2 mb-4">
        {['Segmentation', 'Targeting', 'Positioning'].map((step: string, i: number) => (
          <div key={step} className="flex items-center gap-2">
            <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${
              i === 0 ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' :
              i === 1 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
              'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
            }`}>
              {step}
            </div>
            {i < 2 && <span className="text-gray-300 dark:text-gray-600">→</span>}
          </div>
        ))}
      </div>
      <ListField frameworkId="stp" fieldKey="segmentation" label="세분화 (S)" hint="시장 세그먼트 기준과 결과" items={data?.segmentation} />
      <TextField frameworkId="stp" fieldKey="targeting" label="타겟팅 (T)" hint="선택한 타겟 세그먼트와 근거" value={data?.targeting} multiline />
      <TextField frameworkId="stp" fieldKey="positioning" label="포지셔닝 (P)" hint="포지셔닝 맵, 태그라인" value={data?.positioning} multiline />
    </FrameworkCard>
  )
}
