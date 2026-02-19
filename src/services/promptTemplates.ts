/**
 * 프레임워크별 AI 프롬프트 템플릿
 * 각 함수는 { businessItem, context } 를 받아 시스템 프롬프트와 유저 프롬프트를 반환
 */

import type { PromptContext, PromptResult, PromptTemplate } from '../types'
import { FRAMEWORKS } from '../data/frameworkDefinitions'

const COMMON_SYSTEM = `당신은 MBA 수준의 전략 컨설턴트입니다. 한국어로 답변하세요.
반드시 지정된 JSON 형식만 출력하세요. 설명이나 마크다운 코드블록 없이 순수 JSON만 반환하세요.`

function buildContext(context: PromptContext['context']): string {
  if (!context || Object.keys(context).length === 0) return ''
  let str = '\n\n[이전 분석 결과 참고]\n'
  for (const [_id, { name, data }] of Object.entries(context)) {
    str += `- ${name}: ${JSON.stringify(data, null, 0).slice(0, 500)}\n`
  }
  return str
}

/** 사업 아이템에 적합한 분석 프레임워크를 추천하는 프롬프트 */
export function recommendationPrompt(businessItem: string): PromptResult {
  const frameworkList = Object.values(FRAMEWORKS)
    .map((f) => `- ${f.id}: ${f.name} (${f.fullName}) \u2014 ${f.description}`)
    .join('\n')

  return {
    system: `당신은 MBA 수준의 전략 컨설턴트입니다. 한국어로 답변하세요.
반드시 지정된 JSON 형식만 출력하세요. 설명이나 마크다운 코드블록 없이 순수 JSON만 반환하세요.`,
    user: `사업 아이템: "${businessItem}"

아래 전략 분석 프레임워크 목록에서 이 사업 아이템에 가장 적합한 프레임워크를 추천해 주세요.
각 프레임워크를 "필수(essential)", "권장(recommended)", "선택(optional)" 3단계로 분류하세요.

[프레임워크 목록]
${frameworkList}

분류 기준:
- essential: 이 사업 아이템 분석에 반드시 필요한 핵심 프레임워크 (3~5개, score=100)
- recommended: 더 깊이 있는 분석을 위해 권장하는 프레임워크 (3~5개, score=60~90)
- optional: 필요 시 추가로 활용할 수 있는 프레임워크 (나머지, score=20~55)

각 프레임워크에 대해 다음을 작성하세요:
1. description: 이 프레임워크가 무엇이고, 어떤 분석을 수행하는지 2~3문장으로 상세히 설명
2. reason: 이 사업 아이템에 왜 이 프레임워크가 필요한지 구체적 사유 (사업 아이템과 연결하여 설명)
3. score: 추천도 (0~100 정수). essential은 100, recommended는 60~90, optional은 20~55

JSON 형식:
{
  "essential": [{"id": "프레임워크ID", "description": "프레임워크 특징 상세 설명", "reason": "이 사업에 필요한 구체적 사유", "score": 100}],
  "recommended": [{"id": "프레임워크ID", "description": "프레임워크 특징 상세 설명", "reason": "이 사업에 필요한 구체적 사유", "score": 75}],
  "optional": [{"id": "프레임워크ID", "description": "프레임워크 특징 상세 설명", "reason": "이 사업에 필요한 구체적 사유", "score": 40}]
}`,
  }
}

export const promptTemplates: Record<string, PromptTemplate> = {
  faw: ({ businessItem, context }: PromptContext): PromptResult => ({
    system: COMMON_SYSTEM,
    user: `사업 아이템: "${businessItem}"
${buildContext(context)}

FAW(Fact-Assumption-What if) 분석을 수행하세요.

JSON 형식:
{
  "facts": ["팩트1", "팩트2", "팩트3", "팩트4", "팩트5"],
  "assumptions": ["가정1", "가정2", "가정3", "가정4"],
  "whatIfs": ["What-if 시나리오1", "What-if 시나리오2", "What-if 시나리오3"]
}`,
  }),

  threeC: ({ businessItem, context }: PromptContext): PromptResult => ({
    system: COMMON_SYSTEM,
    user: `사업 아이템: "${businessItem}"
${buildContext(context)}

3C 분석 (Company, Customer, Competitor)을 수행하세요.

JSON 형식:
{
  "company": ["자사 역량/강점 1", "자사 역량/강점 2", "자사 역량/강점 3"],
  "customer": ["고객 특성/니즈 1", "고객 특성/니즈 2", "고객 특성/니즈 3"],
  "competitor": ["경쟁사 분석 1", "경쟁사 분석 2", "경쟁사 분석 3"]
}`,
  }),

  ansoff: ({ businessItem, context }: PromptContext): PromptResult => ({
    system: COMMON_SYSTEM,
    user: `사업 아이템: "${businessItem}"
${buildContext(context)}

Ansoff 성장 매트릭스 분석을 수행하세요.

JSON 형식:
{
  "marketPenetration": "기존 시장 × 기존 제품 전략 설명",
  "marketDevelopment": "신규 시장 × 기존 제품 전략 설명",
  "productDevelopment": "기존 시장 × 신규 제품 전략 설명",
  "diversification": "신규 시장 × 신규 제품 전략 설명",
  "selectedStrategy": "가장 적합한 전략 (시장 침투/시장 개발/제품 개발/다각화 중 하나)"
}`,
  }),

  pest: ({ businessItem, context }: PromptContext): PromptResult => ({
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
  }),

  fiveForces: ({ businessItem, context }: PromptContext): PromptResult => ({
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
  }),

  ilc: ({ businessItem, context }: PromptContext): PromptResult => ({
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
  }),

  marketAnalysis: ({ businessItem, context }: PromptContext): PromptResult => ({
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
  }),

  customerAnalysis: ({ businessItem, context }: PromptContext): PromptResult => ({
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
  }),

  competitorAnalysis: ({ businessItem, context }: PromptContext): PromptResult => ({
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
  }),

  strategyCanvas: ({ businessItem, context }: PromptContext): PromptResult => ({
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
  }),

  valueChain: ({ businessItem, context }: PromptContext): PromptResult => ({
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
  }),

  sevenS: ({ businessItem, context }: PromptContext): PromptResult => ({
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
  }),

  vrio: ({ businessItem, context }: PromptContext): PromptResult => ({
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
  }),

  swot: ({ businessItem, context }: PromptContext): PromptResult => ({
    system: COMMON_SYSTEM,
    user: `사업 아이템: "${businessItem}"
${buildContext(context)}

SWOT 크로스분석을 수행하세요. 이전 분석(PEST, 3C, 5Forces 등) 결과를 반영하세요.

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
  }),

  genericStrategy: ({ businessItem, context }: PromptContext): PromptResult => ({
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
  }),

  stp: ({ businessItem, context }: PromptContext): PromptResult => ({
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
  }),

  errc: ({ businessItem, context }: PromptContext): PromptResult => ({
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
  }),

  fourP: ({ businessItem, context }: PromptContext): PromptResult => ({
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
  }),

  wbs: ({ businessItem, context }: PromptContext): PromptResult => ({
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
  }),

  kpi: ({ businessItem, context }: PromptContext): PromptResult => ({
    system: COMMON_SYSTEM,
    user: `사업 아이템: "${businessItem}"
${buildContext(context)}

기대효과와 KPI 체계(Input→Throughput→Output→Outcome)를 설계하세요.

JSON 형식:
{
  "quantitative": ["정량적 기대효과 1 (구체적 수치 포함)", "정량적 기대효과 2", "정량적 기대효과 3"],
  "qualitative": ["정성적 기대효과 1", "정성적 기대효과 2", "정성적 기대효과 3"],
  "input": ["Input KPI 1 (예: 초기 투자금 X억원)", "Input KPI 2"],
  "throughput": ["Throughput KPI 1 (예: 월 스프린트 완료율)", "Throughput KPI 2"],
  "output": ["Output KPI 1 (예: MAU X만명)", "Output KPI 2"],
  "outcome": ["Outcome KPI 1 (예: 연 매출 X억원)", "Outcome KPI 2"]
}`,
  }),
}
