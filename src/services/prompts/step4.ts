import type { PromptContext, PromptResult, PromptTemplate } from '../../types'
import { COMMON_SYSTEM, buildContext } from './common'

export const genericStrategy: PromptTemplate = ({ businessItem, context }: PromptContext): PromptResult => ({
  system: COMMON_SYSTEM,
  user: `사업 아이템: "${businessItem}"
${buildContext(context)}

Porter의 본원적 전략을 선택하고 실행 방안을 제시하세요.

JSON 형식:
{
  "strategy": "원가우위/차별화/집중(원가)/집중(차별화) 중 하나",
  "rationale": "선택 근거 상세 설명",
  "actions": ["실행방안 1", "실행방안 2", "실행방안 3", "실행방안 4"]
}`,
})

export const stp: PromptTemplate = ({ businessItem, context }: PromptContext): PromptResult => ({
  system: COMMON_SYSTEM,
  user: `사업 아이템: "${businessItem}"
${buildContext(context)}

STP (Segmentation, Targeting, Positioning) 분석을 수행하세요.

JSON 형식:
{
  "segmentation": ["세그먼트 1: 설명", "세그먼트 2: 설명", "세그먼트 3: 설명"],
  "targeting": "타겟 세그먼트 선정과 근거 상세 설명",
  "positioning": "포지셔닝 전략과 태그라인/가치 제안"
}`,
})

export const errc: PromptTemplate = ({ businessItem, context }: PromptContext): PromptResult => ({
  system: COMMON_SYSTEM,
  user: `사업 아이템: "${businessItem}"
${buildContext(context)}

ERRC (Eliminate-Reduce-Raise-Create) 그리드 분석을 수행하세요.

JSON 형식:
{
  "eliminate": ["제거할 요소 1", "제거할 요소 2"],
  "reduce": ["감소시킬 요소 1", "감소시킬 요소 2"],
  "raise": ["증가시킬 요소 1", "증가시킬 요소 2"],
  "create": ["새로 만들 요소 1", "새로 만들 요소 2"]
}`,
})

export const fourP: PromptTemplate = ({ businessItem, context }: PromptContext): PromptResult => ({
  system: COMMON_SYSTEM,
  user: `사업 아이템: "${businessItem}"
${buildContext(context)}

마케팅 믹스 4P 전략을 수립하세요.

JSON 형식:
{
  "product": "제품 전략 (핵심 기능, 디자인, 브랜드)",
  "price": "가격 전략 (가격 모델, 수익 구조)",
  "place": "유통 전략 (채널, 접근성)",
  "promotion": "판촉 전략 (마케팅 커뮤니케이션)"
}`,
})

export const wbs: PromptTemplate = ({ businessItem, context }: PromptContext): PromptResult => ({
  system: COMMON_SYSTEM,
  user: `사업 아이템: "${businessItem}"
${buildContext(context)}

WBS (Work Breakdown Structure) 추진 일정을 수립하세요.

JSON 형식:
{
  "phases": [
    ["1단계: 준비", "주요 활동", "산출물", "1-2개월", "담당팀"],
    ["2단계: 개발", "주요 활동", "산출물", "3-4개월", "담당팀"],
    ["3단계: 런칭", "주요 활동", "산출물", "5-6개월", "담당팀"],
    ["4단계: 성장", "주요 활동", "산출물", "7-12개월", "담당팀"]
  ],
  "milestones": ["마일스톤 1 (시점)", "마일스톤 2 (시점)", "마일스톤 3 (시점)"]
}`,
})
