import FrameworkCard from './FrameworkCard'
import { TextField, DataTable } from './FieldRenderer'
import { useStrategy } from '../../hooks/useStrategyDocument'
import type { VrioData } from '../../types'

export default function VrioAnalysis() {
  const { state } = useStrategy()
  const data = state?.frameworks.vrio?.data as VrioData | undefined

  return (
    <FrameworkCard frameworkId="vrio">
      <DataTable
        label="자원/역량 평가"
        columns={['자원/역량', '가치(V)', '희소성(R)', '모방불가(I)', '조직화(O)', '경쟁우위']}
        rows={data?.resources}
      />
      <TextField frameworkId="vrio" fieldKey="coreCompetence" label="핵심역량" hint="VRIO 모두 충족하는 역량" value={data?.coreCompetence} multiline />
    </FrameworkCard>
  )
}
