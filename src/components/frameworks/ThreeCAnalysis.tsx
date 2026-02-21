import { memo } from 'react'
import FrameworkCard from './FrameworkCard'
import { ListField } from './FieldRenderer'
import { useStrategy } from '../../hooks/useStrategyDocument'
import type { ThreeCData } from '../../types'

function ThreeCAnalysis() {
  const { state } = useStrategy()
  const data = state?.frameworks.threeC?.data as ThreeCData | undefined

  return (
    <FrameworkCard frameworkId="threeC">
      <ListField frameworkId="threeC" fieldKey="company" label="자사 (Company)" hint="핵심 역량, 자원, 강점/약점" items={data?.company} />
      <ListField frameworkId="threeC" fieldKey="customer" label="고객 (Customer)" hint="타겟 고객, 니즈, 행동 패턴" items={data?.customer} />
      <ListField frameworkId="threeC" fieldKey="competitor" label="경쟁사 (Competitor)" hint="주요 경쟁사, 전략, 차별점" items={data?.competitor} />
    </FrameworkCard>
  )
}

export default memo(ThreeCAnalysis)
