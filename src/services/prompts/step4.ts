import type { PromptContext, PromptResult, PromptTemplate } from '../../types'
import { COMMON_SYSTEM, buildContext } from './common'

export const genericStrategy: PromptTemplate = ({ businessItem, context }: PromptContext): PromptResult => ({
  system: COMMON_SYSTEM,
  user: `전략분석 아이템: "${businessItem}"
${buildContext(context)}

Porter's Generic Strategy(포터의 본원적 전략: 원가우위 Cost Leadership / 차별화 Differentiation / 집중 Focus)를 선택하고 실행 방안을 제시하세요. 이 프레임워크는 기업이 산업 내에서 어떤 방식으로 경쟁우위를 확보할지 근본 방향을 설정하는 데 강점이 있습니다. SWOT의 선택 전략(selectedStrategies)과 5Forces 결과를 근거로 전략을 선택하세요.

JSON 형식:
{
  "strategy": "원가우위/차별화/집중(원가)/집중(차별화) 중 하나",
  "rationale": "선택 근거 상세 설명",
  "actions": ["실행방안 1", "실행방안 2", "실행방안 3", "실행방안 4"]
}`,
})

export const stp: PromptTemplate = ({ businessItem, context }: PromptContext): PromptResult => ({
  system: COMMON_SYSTEM,
  user: `전략분석 아이템: "${businessItem}"
${buildContext(context)}

STP(Segmentation 시장세분화, Targeting 타겟팅, Positioning 포지셔닝) 분석을 수행하세요. 이 프레임워크는 시장을 세분화하고 최적 타겟을 선정하여 고객 마음속 포지셔닝 전략을 수립하는 데 강점이 있습니다. 고객분석의 세그먼트/페르소나, 시장분석의 TAM/SAM/SOM과 일관되게 수행하세요.

JSON 형식:
{
  "segmentation": ["세그먼트 1: 설명", "세그먼트 2: 설명", "세그먼트 3: 설명"],
  "targeting": "타겟 세그먼트 선정과 근거 상세 설명",
  "positioning": "포지셔닝 전략과 태그라인/가치 제안"
}`,
})

export const errc: PromptTemplate = ({ businessItem, context }: PromptContext): PromptResult => ({
  system: COMMON_SYSTEM,
  user: `전략분석 아이템: "${businessItem}"
${buildContext(context)}

ERRC(Eliminate 제거, Reduce 감소, Raise 증가, Create 창조) 그리드 분석을 수행하세요. 이 프레임워크는 경쟁 요소를 4가지 행동으로 재설계하여 비용 절감과 가치 혁신을 동시에 달성하는 데 강점이 있습니다. 전략캔버스의 경쟁요인 분석을 기반으로 도출하세요.

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
  user: `전략분석 아이템: "${businessItem}"
${buildContext(context)}

마케팅 믹스 4P(Product 제품, Price 가격, Place 유통, Promotion 판촉) 전략을 수립하세요. 이 프레임워크는 마케팅 전략을 4가지 실행 요소로 구체화하여 시장 진입 계획을 수립하는 데 강점이 있습니다. STP의 타겟/포지셔닝, 본원적 전략의 방향과 일관된 4P를 설계하세요.

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
  user: `전략분석 아이템: "${businessItem}"
${buildContext(context)}

WBS(Work Breakdown Structure, 작업분해구조) 추진 일정을 수립하세요. 이 프레임워크는 전략 실행을 단계별 작업으로 분해하여 일정·산출물·담당을 명확히 하는 데 강점이 있습니다. 4P, STP, 본원적 전략의 실행방안을 구체적 일정으로 분해하세요.

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
