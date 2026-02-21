import { memo } from 'react'
import FrameworkCard from './FrameworkCard'
import { ListField } from './FieldRenderer'
import { useStrategy } from '../../hooks/useStrategyDocument'
import type { FawData } from '../../types'

function FawAnalysis() {
  const { state } = useStrategy()
  const data = state?.frameworks.faw?.data as FawData | undefined

  return (
    <FrameworkCard frameworkId="faw">
      <ListField frameworkId="faw" fieldKey="facts" label="팩트 (Fact)" hint="시장/산업에서 관찰되는 객관적 사실" items={data?.facts} />
      <ListField frameworkId="faw" fieldKey="assumptions" label="가정 (Assumption)" hint="팩트에서 도출한 가정/추론" items={data?.assumptions} />
      <ListField frameworkId="faw" fieldKey="whatIfs" label="What-if" hint="가정 기반 사업 기회 시나리오" items={data?.whatIfs} />
    </FrameworkCard>
  )
}

export default memo(FawAnalysis)
