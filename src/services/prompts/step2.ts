import type { PromptContext, PromptResult, PromptTemplate } from '../../types'
import { COMMON_SYSTEM, buildContext } from './common'

export const pest: PromptTemplate = ({ businessItem, context }: PromptContext): PromptResult => ({
  system: COMMON_SYSTEM,
  user: `사업 아이템: "${businessItem}"
${buildContext(context)}

PEST 거시환경 분석을 수행하세요.

JSON 형식:
{
  "political": ["정치적 요인 1", "정치적 요인 2", "정치적 요인 3"],
  "economic": ["경제적 요인 1", "경제적 요인 2", "경제적 요인 3"],
  "social": ["사회적 요인 1", "사회적 요인 2", "사회적 요인 3"],
  "technological": ["기술적 요인 1", "기술적 요인 2", "기술적 요인 3"]
}`,
})

export const fiveForces: PromptTemplate = ({ businessItem, context }: PromptContext): PromptResult => ({
  system: COMMON_SYSTEM,
  user: `사업 아이템: "${businessItem}"
${buildContext(context)}

Porter's Five Forces 분석을 수행하세요. 각 세력의 강도를 1-5로 평가하세요.

JSON 형식:
{
  "rivalry": {"level": 3, "factors": "기존 경쟁 분석"},
  "newEntrants": {"level": 2, "factors": "신규 진입자 위협 분석"},
  "substitutes": {"level": 3, "factors": "대체재 위협 분석"},
  "buyerPower": {"level": 3, "factors": "구매자 교섭력 분석"},
  "supplierPower": {"level": 2, "factors": "공급자 교섭력 분석"},
  "overall": "종합 매력도 평가"
}`,
})

export const ilc: PromptTemplate = ({ businessItem, context }: PromptContext): PromptResult => ({
  system: COMMON_SYSTEM,
  user: `사업 아이템: "${businessItem}"
${buildContext(context)}

산업 수명주기(ILC) 분석을 수행하세요.

JSON 형식:
{
  "stage": "도입기/성장기/성숙기/쇠퇴기 중 하나",
  "evidence": ["판단 근거 1", "판단 근거 2", "판단 근거 3"],
  "implication": "해당 단계에서의 전략적 시사점"
}`,
})

export const marketAnalysis: PromptTemplate = ({ businessItem, context }: PromptContext): PromptResult => ({
  system: COMMON_SYSTEM,
  user: `사업 아이템: "${businessItem}"
${buildContext(context)}

시장 분석 (TAM/SAM/SOM + 트렌드)을 수행하세요.

JSON 형식:
{
  "tam": "전체 시장 규모 (금액 포함)",
  "sam": "유효 시장 규모 (금액 포함)",
  "som": "목표 시장 규모 (금액 포함)",
  "growthRate": "연간 성장률",
  "trends": ["시장 트렌드 1", "시장 트렌드 2", "시장 트렌드 3"]
}`,
})

export const customerAnalysis: PromptTemplate = ({ businessItem, context }: PromptContext): PromptResult => ({
  system: COMMON_SYSTEM,
  user: `사업 아이템: "${businessItem}"
${buildContext(context)}

고객 분석 (세그먼트 + 페르소나)을 수행하세요.

JSON 형식:
{
  "segments": ["세그먼트 1 (기준: 설명)", "세그먼트 2", "세그먼트 3"],
  "primaryPersona": "이름/연령/직업/목표/일상 시나리오 형태로 상세히",
  "needs": ["핵심 니즈 1", "핵심 니즈 2", "핵심 니즈 3"],
  "painPoints": ["페인포인트 1", "페인포인트 2", "페인포인트 3"]
}`,
})

export const competitorAnalysis: PromptTemplate = ({ businessItem, context }: PromptContext): PromptResult => ({
  system: COMMON_SYSTEM,
  user: `사업 아이템: "${businessItem}"
${buildContext(context)}

경쟁사 프로파일링을 수행하세요.

JSON 형식:
{
  "competitors": [
    ["경쟁사A", "강점", "약점", "시장점유율", "전략"],
    ["경쟁사B", "강점", "약점", "시장점유율", "전략"],
    ["경쟁사C", "강점", "약점", "시장점유율", "전략"]
  ],
  "differentiators": ["차별화 포인트 1", "차별화 포인트 2"],
  "gaps": ["시장 갭 1", "시장 갭 2"]
}`,
})

export const strategyCanvas: PromptTemplate = ({ businessItem, context }: PromptContext): PromptResult => ({
  system: COMMON_SYSTEM,
  user: `사업 아이템: "${businessItem}"
${buildContext(context)}

전략 캔버스 (Blue Ocean) 분석을 수행하세요. 경쟁 요인별 1-5 점수를 매기세요.

JSON 형식:
{
  "factors": ["경쟁요인1", "경쟁요인2", "경쟁요인3", "경쟁요인4", "경쟁요인5", "경쟁요인6"],
  "competitors": [
    ["경쟁요인1", 4, 3, 3],
    ["경쟁요인2", 3, 4, 2],
    ["경쟁요인3", 5, 3, 3],
    ["경쟁요인4", 2, 4, 4],
    ["경쟁요인5", 4, 2, 3],
    ["경쟁요인6", 5, 1, 2]
  ],
  "insight": "가치곡선 인사이트 (자사의 차별화 기회)"
}`,
})

export const valueChain: PromptTemplate = ({ businessItem, context }: PromptContext): PromptResult => ({
  system: COMMON_SYSTEM,
  user: `사업 아이템: "${businessItem}"
${buildContext(context)}

Porter의 가치사슬 분석을 수행하세요.

JSON 형식:
{
  "primary": {
    "inboundLogistics": "물류 입고 분석",
    "operations": "운영/생산 분석",
    "outboundLogistics": "물류 출고 분석",
    "marketing": "마케팅/판매 분석",
    "service": "서비스 분석"
  },
  "support": {
    "infrastructure": "기업 인프라 분석",
    "hrm": "인적자원관리 분석",
    "technology": "기술개발 분석",
    "procurement": "조달 분석"
  },
  "advantage": "경쟁우위 원천 종합"
}`,
})

export const sevenS: PromptTemplate = ({ businessItem, context }: PromptContext): PromptResult => ({
  system: COMMON_SYSTEM,
  user: `사업 아이템: "${businessItem}"
${buildContext(context)}

McKinsey 7S 분석을 수행하세요.

JSON 형식:
{
  "strategy": "전략 분석",
  "structure": "구조 분석",
  "systems": "시스템 분석",
  "sharedValues": "공유가치 분석",
  "skills": "기술/역량 분석",
  "staff": "인력 분석",
  "style": "경영스타일 분석",
  "alignment": "7개 요소 간 정합성 평가"
}`,
})

export const vrio: PromptTemplate = ({ businessItem, context }: PromptContext): PromptResult => ({
  system: COMMON_SYSTEM,
  user: `사업 아이템: "${businessItem}"
${buildContext(context)}

VRIO 분석을 수행하세요.

JSON 형식:
{
  "resources": [
    ["자원/역량명", "O", "O", "O", "O", "지속적 경쟁우위"],
    ["자원/역량명2", "O", "O", "X", "O", "일시적 경쟁우위"],
    ["자원/역량명3", "O", "X", "-", "-", "경쟁 동등"]
  ],
  "coreCompetence": "VRIO 모두 충족하는 핵심역량 설명"
}`,
})
