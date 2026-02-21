import { memo } from 'react'
import FrameworkCard from './FrameworkCard'
import { ListField, DataTable } from './FieldRenderer'
import { useStrategy } from '../../hooks/useStrategyDocument'
import type { CompetitorData } from '../../types'

function CompetitorAnalysis() {
  const { state } = useStrategy()
  const data = state?.frameworks.competitorAnalysis?.data as CompetitorData | undefined

  return (
    <FrameworkCard frameworkId="competitorAnalysis">
      <DataTable
        label="주요 경쟁사"
        columns={['경쟁사명', '강점', '약점', '시장점유율', '전략']}
        rows={data?.competitors}
      />
      <ListField frameworkId="competitorAnalysis" fieldKey="differentiators" label="차별화 포인트" items={data?.differentiators} />
      <ListField frameworkId="competitorAnalysis" fieldKey="gaps" label="시장 갭" hint="경쟁사가 놓치고 있는 기회" items={data?.gaps} />
    </FrameworkCard>
  )
}

export default memo(CompetitorAnalysis)
