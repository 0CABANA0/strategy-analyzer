import type { PromptContext, PromptResult, PromptTemplate } from '../../types'
import { COMMON_SYSTEM, buildContext } from './common'

export const kpi: PromptTemplate = ({ businessItem, context }: PromptContext): PromptResult => ({
  system: COMMON_SYSTEM,
  user: `전략분석 아이템: "${businessItem}"
${buildContext(context)}

기대효과와 KPI 체계(Input→Throughput→Output→Outcome)를 설계하세요. 시장분석의 TAM/SAM/SOM 수치, 4P 전략, WBS 마일스톤과 정합되는 현실적 KPI를 설계하세요.

JSON 형식:
{
  "quantitative": ["정량적 기대효과 1 (구체적 수치 포함)", "정량적 기대효과 2", "정량적 기대효과 3"],
  "qualitative": ["정성적 기대효과 1", "정성적 기대효과 2", "정성적 기대효과 3"],
  "input": ["Input KPI 1 (예: 초기 투자금 X억원)", "Input KPI 2"],
  "throughput": ["Throughput KPI 1 (예: 월 스프린트 완료율)", "Throughput KPI 2"],
  "output": ["Output KPI 1 (예: MAU X만명)", "Output KPI 2"],
  "outcome": ["Outcome KPI 1 (예: 연 매출 X억원)", "Outcome KPI 2"]
}`,
})
