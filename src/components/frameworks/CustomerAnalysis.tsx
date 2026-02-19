import FrameworkCard from './FrameworkCard'
import { ListField, TextField } from './FieldRenderer'
import { useStrategy } from '../../hooks/useStrategyDocument'
import type { CustomerData } from '../../types'

export default function CustomerAnalysis() {
  const { state } = useStrategy()
  const data = state?.frameworks.customerAnalysis?.data as CustomerData | undefined

  return (
    <FrameworkCard frameworkId="customerAnalysis">
      <ListField frameworkId="customerAnalysis" fieldKey="segments" label="고객 세그먼트" hint="인구통계, 행동, 니즈 기반 분류" items={data?.segments} />
      <TextField frameworkId="customerAnalysis" fieldKey="primaryPersona" label="핵심 페르소나" hint="이름, 연령, 직업, 목표, 페인포인트" value={data?.primaryPersona} multiline />
      <ListField frameworkId="customerAnalysis" fieldKey="needs" label="핵심 니즈" items={data?.needs} />
      <ListField frameworkId="customerAnalysis" fieldKey="painPoints" label="페인포인트" items={data?.painPoints} />
    </FrameworkCard>
  )
}
