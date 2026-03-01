import type { PromptContext, PromptResult, PromptTemplate } from '../../types'
import { COMMON_SYSTEM, buildContext } from './common'

export const swot: PromptTemplate = ({ businessItem, context }: PromptContext): PromptResult => ({
  system: COMMON_SYSTEM,
  user: `전략분석 아이템: "${businessItem}"
${buildContext(context)}

SWOT 크로스분석을 수행하세요. 이전 환경분석 결과를 반드시 종합 반영하세요.
- 강점/약점: 3C 자사역량, 가치사슬, 7S, VRIO 결과에서 도출
- 기회/위협: PEST, 5Forces, ILC, 시장분석 결과에서 도출
이전 분석과 모순되는 항목이 없어야 합니다.

JSON 형식:
{
  "strengths": ["강점1", "강점2", "강점3"],
  "weaknesses": ["약점1", "약점2", "약점3"],
  "opportunities": ["기회1", "기회2", "기회3"],
  "threats": ["위협1", "위협2", "위협3"],
  "so": ["SO전략1: 강점으로 기회 활용", "SO전략2"],
  "wo": ["WO전략1: 약점 보완으로 기회 활용", "WO전략2"],
  "st": ["ST전략1: 강점으로 위협 대응", "ST전략2"],
  "wt": ["WT전략1: 약점·위협 최소화", "WT전략2"],
  "selectedStrategies": ["최종 선택 전략1", "최종 선택 전략2"]
}`,
})
