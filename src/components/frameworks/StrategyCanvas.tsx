import { memo } from 'react'
import FrameworkCard from './FrameworkCard'
import StrategyCanvasChart from './StrategyCanvasChart'
import { ListField, TextField, DataTable } from './FieldRenderer'
import { useStrategy } from '../../hooks/useStrategyDocument'
import type { StrategyCanvasData } from '../../types'

function StrategyCanvas() {
  const { state } = useStrategy()
  const data = state?.frameworks.strategyCanvas?.data as StrategyCanvasData | undefined

  const compData = data?.competitors || []

  return (
    <FrameworkCard frameworkId="strategyCanvas">
      {compData.length > 0 && <StrategyCanvasChart competitors={compData} />}
      <DataTable
        label="경쟁 요인별 점수"
        columns={['요인', '자사', '경쟁사A', '경쟁사B']}
        rows={data?.competitors}
      />
      <ListField frameworkId="strategyCanvas" fieldKey="factors" label="경쟁 요인" items={data?.factors} />
      <TextField frameworkId="strategyCanvas" fieldKey="insight" label="인사이트" value={data?.insight} multiline />
    </FrameworkCard>
  )
}

export default memo(StrategyCanvas)
