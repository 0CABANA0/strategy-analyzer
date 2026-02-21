import { memo } from 'react'
import FrameworkCard from './FrameworkCard'
import { ListField } from './FieldRenderer'
import { useStrategy } from '../../hooks/useStrategyDocument'
import type { PestData } from '../../types'

interface PestFieldDef {
  key: keyof PestData
  label: string
  hint: string
  color: string
}

const PEST_FIELDS: PestFieldDef[] = [
  { key: 'political', label: '정치적 (Political)', hint: '규제, 정책, 법률 변화', color: 'bg-red-400' },
  { key: 'economic', label: '경제적 (Economic)', hint: '경기, 환율, 금리, 소비 트렌드', color: 'bg-blue-400' },
  { key: 'social', label: '사회적 (Social)', hint: '인구구조, 문화, 라이프스타일', color: 'bg-green-400' },
  { key: 'technological', label: '기술적 (Technological)', hint: 'AI, 디지털전환, 신기술 동향', color: 'bg-purple-400' },
]

function PestAnalysis() {
  const { state } = useStrategy()
  const data = state?.frameworks.pest?.data as PestData | undefined

  return (
    <FrameworkCard frameworkId="pest">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PEST_FIELDS.map(({ key, label, hint, color }) => (
          <div key={key} className="rounded-lg border border-gray-100 dark:border-gray-700 p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <span className={`w-2 h-2 rounded-full ${color}`} />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span>
            </div>
            <ListField frameworkId="pest" fieldKey={key} label="" hint={hint} items={data?.[key]} />
          </div>
        ))}
      </div>
    </FrameworkCard>
  )
}

export default memo(PestAnalysis)
