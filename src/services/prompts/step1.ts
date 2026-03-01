import type { PromptContext, PromptResult, PromptTemplate } from '../../types'
import { COMMON_SYSTEM, buildContext } from './common'

export const faw: PromptTemplate = ({ businessItem, context }: PromptContext): PromptResult => ({
  system: COMMON_SYSTEM,
  user: `전략분석 아이템: "${businessItem}"
${buildContext(context)}

FAW(Fact-Assumption-What if, 사실-가정-만약) 분석을 수행하세요. 이 프레임워크는 사실과 가정을 명확히 구분하여 의사결정의 불확실성을 체계적으로 관리하는 데 강점이 있습니다.

JSON 형식:
{
  "facts": ["팩트1", "팩트2", "팩트3", "팩트4", "팩트5"],
  "assumptions": ["가정1", "가정2", "가정3", "가정4"],
  "whatIfs": ["What-if 시나리오1", "What-if 시나리오2", "What-if 시나리오3"]
}`,
})

export const threeC: PromptTemplate = ({ businessItem, context }: PromptContext): PromptResult => ({
  system: COMMON_SYSTEM,
  user: `전략분석 아이템: "${businessItem}"
${buildContext(context)}

3C 분석 (Company 자사, Customer 고객, Competitor 경쟁사)을 수행하세요. 이 프레임워크는 기업·고객·경쟁사 3축 관점에서 시장 내 자사 위치를 입체적으로 파악하는 데 강점이 있습니다.

JSON 형식:
{
  "company": ["자사 역량/강점 1", "자사 역량/강점 2", "자사 역량/강점 3"],
  "customer": ["고객 특성/니즈 1", "고객 특성/니즈 2", "고객 특성/니즈 3"],
  "competitor": ["경쟁사 분석 1", "경쟁사 분석 2", "경쟁사 분석 3"]
}`,
})

export const ansoff: PromptTemplate = ({ businessItem, context }: PromptContext): PromptResult => ({
  system: COMMON_SYSTEM,
  user: `전략분석 아이템: "${businessItem}"
${buildContext(context)}

Ansoff Growth Matrix(앤소프 성장 매트릭스) 분석을 수행하세요. 이 프레임워크는 시장(기존/신규)과 제품(기존/신규)의 조합으로 최적 성장 방향을 설정하는 데 강점이 있습니다.

JSON 형식:
{
  "marketPenetration": "기존 시장 × 기존 제품 전략 설명",
  "marketDevelopment": "신규 시장 × 기존 제품 전략 설명",
  "productDevelopment": "기존 시장 × 신규 제품 전략 설명",
  "diversification": "신규 시장 × 신규 제품 전략 설명",
  "selectedStrategy": "가장 적합한 전략 (시장 침투/시장 개발/제품 개발/다각화 중 하나)"
}`,
})
