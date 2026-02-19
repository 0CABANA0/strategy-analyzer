import FrameworkCard from './FrameworkCard'
import { ListField, TextField } from './FieldRenderer'
import { useStrategy } from '../../hooks/useStrategyDocument'
import type { IlcData } from '../../types'

const STAGES: string[] = ['도입기', '성장기', '성숙기', '쇠퇴기']
const STAGE_COLORS: Record<string, string> = { '도입기': 'bg-blue-500', '성장기': 'bg-green-500', '성숙기': 'bg-amber-500', '쇠퇴기': 'bg-red-500' }

export default function IlcAnalysis() {
  const { state, updateFrameworkField } = useStrategy()
  const data = state?.frameworks.ilc?.data as IlcData | undefined

  return (
    <FrameworkCard frameworkId="ilc">
      <div className="mb-4">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">현재 단계</label>
        <div className="flex gap-1">
          {STAGES.map((stage: string) => (
            <button
              key={stage}
              onClick={() => updateFrameworkField('ilc', 'stage', stage)}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                data?.stage === stage
                  ? `${STAGE_COLORS[stage]} text-white shadow-sm`
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
              }`}
            >
              {stage}
            </button>
          ))}
        </div>
        {/* ILC 시각화 바 */}
        <div className="flex mt-2 h-2 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
          {STAGES.map((stage: string) => (
            <div
              key={stage}
              className={`flex-1 transition-all ${
                data?.stage === stage ? STAGE_COLORS[stage] : ''
              }`}
            />
          ))}
        </div>
      </div>
      <ListField frameworkId="ilc" fieldKey="evidence" label="판단 근거" hint="시장 성장률, 경쟁 강도, 기술 성숙도 등" items={data?.evidence} />
      <TextField frameworkId="ilc" fieldKey="implication" label="전략적 시사점" value={data?.implication} multiline />
    </FrameworkCard>
  )
}
