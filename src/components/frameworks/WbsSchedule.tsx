import FrameworkCard from './FrameworkCard'
import { ListField, DataTable } from './FieldRenderer'
import { useStrategy } from '../../hooks/useStrategyDocument'
import type { WbsData } from '../../types'

export default function WbsSchedule() {
  const { state } = useStrategy()
  const data = state?.frameworks.wbs?.data as WbsData | undefined

  return (
    <FrameworkCard frameworkId="wbs">
      <DataTable
        label="추진 단계"
        columns={['단계', '주요 활동', '산출물', '기간', '담당']}
        rows={data?.phases}
      />
      <ListField frameworkId="wbs" fieldKey="milestones" label="마일스톤" items={data?.milestones} />
    </FrameworkCard>
  )
}
