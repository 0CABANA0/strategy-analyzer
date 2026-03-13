/**
 * 프레임워크 상관관계 분석기
 * - 정적 관계: MBA 전략론 기반 프레임워크 간 논리적 연결
 * - 동적 관계: 실제 생성된 데이터의 텍스트 교차 분석
 */
import { FRAMEWORKS } from '../data/frameworkDefinitions'
import type { FrameworkId } from '../types'
import type { StrategyDocument } from '../types/document'

/** 관계 강도 (0~1) */
export interface CorrelationEntry {
  from: FrameworkId
  to: FrameworkId
  static: number   // 정적(이론적) 관계 강도
  dynamic: number  // 동적(데이터 기반) 관계 강도
  combined: number // 가중 합산
  label: string    // 관계 설명
}

/** 전체 매트릭스 결과 */
export interface CorrelationResult {
  frameworks: FrameworkId[]
  matrix: number[][]          // [i][j] = combined 강도
  entries: CorrelationEntry[] // 상세 엔트리
  clusters: FrameworkCluster[]
}

export interface FrameworkCluster {
  name: string
  frameworks: FrameworkId[]
  description: string
}

// ─── 정적 관계 정의 (MBA 전략 프레임워크 논리적 연결) ───

type RelationDef = {
  strength: number // 0.0 ~ 1.0
  label: string
}

/**
 * 프레임워크 쌍별 정적 관계 맵.
 * 키 형식: "frameworkA:frameworkB" (알파벳 순)
 */
const STATIC_RELATIONS: Record<string, RelationDef> = {
  // 기획배경 내부
  'faw:threeC':           { strength: 0.6, label: 'FAW 가정이 3C 분석의 출발점' },
  'ansoff:threeC':        { strength: 0.5, label: '3C 시장분석 → Ansoff 성장방향' },
  'ansoff:faw':           { strength: 0.4, label: 'What-if → 성장 시나리오 연결' },

  // 기획배경 → 환경분석
  'faw:pest':             { strength: 0.5, label: '거시환경 팩트 → PEST 체계화' },
  'threeC:customerAnalysis': { strength: 0.8, label: '3C 고객 → 고객 심층 분석' },
  'threeC:competitorAnalysis': { strength: 0.8, label: '3C 경쟁사 → 경쟁사 심층 분석' },
  'threeC:marketAnalysis': { strength: 0.7, label: '3C 시장 → 시장규모 분석' },

  // 환경분석 내부
  'fiveForces:competitorAnalysis': { strength: 0.7, label: '5 Forces 경쟁강도 ↔ 경쟁사 분석' },
  'fiveForces:marketAnalysis': { strength: 0.6, label: '산업구조 ↔ 시장규모' },
  'fiveForces:ilc':       { strength: 0.5, label: '산업 경쟁 강도는 수명주기 단계에 따라 변화' },
  'ilc:marketAnalysis':   { strength: 0.6, label: '수명주기 단계 → 시장 성장률' },
  'customerAnalysis:marketAnalysis': { strength: 0.7, label: '고객 세분화 ↔ 시장 크기' },
  'customerAnalysis:competitorAnalysis': { strength: 0.5, label: '고객 요구 ↔ 경쟁 포지션' },
  'pest:fiveForces':      { strength: 0.6, label: 'PEST 거시환경 → 산업구조 영향' },
  'pest:ilc':             { strength: 0.4, label: '거시 트렌드 → 수명주기 단계 판단' },
  'pest:marketAnalysis':  { strength: 0.5, label: '거시환경 → 시장 성장 동인' },
  'sevenS:valueChain':    { strength: 0.6, label: '조직 역량 ↔ 가치사슬 활동' },
  'sevenS:vrio':          { strength: 0.7, label: '7S 자원/역량 → VRIO 경쟁우위 평가' },
  'strategyCanvas:competitorAnalysis': { strength: 0.7, label: '전략 캔버스 경쟁요인 ↔ 경쟁사 비교' },
  'strategyCanvas:customerAnalysis': { strength: 0.5, label: '고객 가치 요소 → 캔버스 축' },
  'valueChain:vrio':      { strength: 0.6, label: '가치활동 → 핵심 자원/역량' },

  // 환경분석 → 시사점 (SWOT)
  'competitorAnalysis:swot': { strength: 0.8, label: '경쟁 분석 → SWOT 위협/기회' },
  'customerAnalysis:swot': { strength: 0.7, label: '고객 니즈 → SWOT 기회/강점' },
  'fiveForces:swot':      { strength: 0.7, label: '5 Forces → SWOT 위협' },
  'ilc:swot':             { strength: 0.5, label: '수명주기 → SWOT 기회/위협' },
  'marketAnalysis:swot':  { strength: 0.6, label: '시장규모 → SWOT 기회' },
  'pest:swot':            { strength: 0.7, label: 'PEST 외부환경 → SWOT O/T' },
  'sevenS:swot':          { strength: 0.5, label: '조직 역량 → SWOT S/W' },
  'strategyCanvas:swot':  { strength: 0.5, label: '차별화 요소 → SWOT 강점' },
  'valueChain:swot':      { strength: 0.5, label: '가치활동 강약점 → SWOT S/W' },
  'vrio:swot':            { strength: 0.6, label: 'VRIO 경쟁우위 → SWOT 강점' },

  // 시사점 → 추진전략
  'swot:genericStrategy': { strength: 0.8, label: 'SWOT 교차전략 → 본원적 전략 선택' },
  'swot:stp':             { strength: 0.7, label: 'SWOT → 세분화·타겟·포지셔닝' },
  'swot:errc':            { strength: 0.6, label: 'SWOT → ERRC 제거·감소·증가·창조' },
  'swot:fourP':           { strength: 0.5, label: 'SWOT 전략방향 → 4P 실행' },
  'swot:wbs':             { strength: 0.4, label: 'SWOT 전략 → WBS 실행계획' },

  // 추진전략 내부
  'errc:strategyCanvas':  { strength: 0.9, label: 'ERRC ↔ 전략 캔버스 (블루오션 쌍)' },
  'genericStrategy:stp':  { strength: 0.7, label: '본원적 전략 → STP 포지셔닝' },
  'stp:fourP':            { strength: 0.8, label: 'STP 타겟/포지션 → 4P 마케팅 믹스' },
  'fourP:wbs':            { strength: 0.5, label: '4P 전략 → WBS 실행 과제' },
  'genericStrategy:fourP': { strength: 0.5, label: '원가/차별화 전략 → 가격/제품 전략' },
  'errc:fourP':           { strength: 0.5, label: 'ERRC 행동 → 4P 반영' },

  // 추진전략 → 기대효과
  'fourP:kpi':            { strength: 0.6, label: '4P 실행 → KPI 성과 측정' },
  'wbs:kpi':              { strength: 0.7, label: 'WBS 마일스톤 → KPI 목표' },
  'genericStrategy:kpi':  { strength: 0.5, label: '전략 목표 → KPI 지표' },
  'stp:kpi':              { strength: 0.4, label: '타겟 시장 → 시장 KPI' },

  // 기획배경 → 기대효과 (장거리)
  'ansoff:kpi':           { strength: 0.4, label: '성장전략 방향 → 성장 KPI' },
}

/** 정적 관계 조회 (대칭) */
function getStaticRelation(a: FrameworkId, b: FrameworkId): RelationDef | undefined {
  const key1 = `${a}:${b}`
  const key2 = `${b}:${a}`
  return STATIC_RELATIONS[key1] || STATIC_RELATIONS[key2]
}

// ─── 동적 관계 계산 ───

/** 프레임워크 데이터에서 텍스트를 추출 */
function extractText(data: unknown): string {
  if (!data) return ''
  if (typeof data === 'string') return data
  if (Array.isArray(data)) return data.map(extractText).join(' ')
  if (typeof data === 'object') {
    return Object.values(data as Record<string, unknown>).map(extractText).join(' ')
  }
  return String(data)
}

/** 두 텍스트의 유사도 계산 (공통 키워드 비율) */
function textSimilarity(textA: string, textB: string): number {
  if (!textA || !textB) return 0

  // 2글자 이상 단어만 추출 (한글+영어)
  const tokenize = (t: string) => {
    const words = t.toLowerCase().match(/[가-힣]{2,}|[a-z]{3,}/g) || []
    return new Set(words)
  }

  const setA = tokenize(textA)
  const setB = tokenize(textB)
  if (setA.size === 0 || setB.size === 0) return 0

  let intersection = 0
  for (const word of setA) {
    if (setB.has(word)) intersection++
  }

  // Jaccard 유사도
  const union = setA.size + setB.size - intersection
  return union > 0 ? intersection / union : 0
}

// ─── 클러스터 정의 ───

const CLUSTERS: FrameworkCluster[] = [
  {
    name: '시장 이해',
    frameworks: ['faw', 'threeC', 'pest', 'marketAnalysis', 'customerAnalysis', 'competitorAnalysis'],
    description: '사업 환경과 시장을 이해하는 프레임워크 그룹',
  },
  {
    name: '내부 역량',
    frameworks: ['sevenS', 'valueChain', 'vrio'],
    description: '조직 내부 역량과 자원을 분석하는 그룹',
  },
  {
    name: '경쟁 전략',
    frameworks: ['fiveForces', 'strategyCanvas', 'errc', 'genericStrategy'],
    description: '경쟁 구도와 차별화 전략을 수립하는 그룹',
  },
  {
    name: '전략 실행',
    frameworks: ['swot', 'stp', 'fourP', 'wbs', 'kpi'],
    description: '전략을 구체적 행동과 성과 지표로 전환하는 그룹',
  },
  {
    name: '성장 방향',
    frameworks: ['ansoff', 'ilc'],
    description: '성장 전략 방향과 시장 성숙도를 판단하는 그룹',
  },
]

// ─── 메인 분석 함수 ───

const STATIC_WEIGHT = 0.6
const DYNAMIC_WEIGHT = 0.4

export function analyzeCorrelations(state: StrategyDocument): CorrelationResult {
  const frameworkIds = Object.keys(FRAMEWORKS) as FrameworkId[]
  const n = frameworkIds.length
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0))
  const entries: CorrelationEntry[] = []

  // 각 프레임워크의 텍스트 캐시
  const textCache = new Map<string, string>()
  for (const id of frameworkIds) {
    const fw = state.frameworks[id]
    textCache.set(id, fw?.data ? extractText(fw.data) : '')
  }

  // 모든 쌍에 대해 상관관계 계산
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const a = frameworkIds[i]
      const b = frameworkIds[j]

      const staticRel = getStaticRelation(a, b)
      const staticScore = staticRel?.strength ?? 0

      // 동적 유사도 (두 프레임워크 모두 데이터가 있을 때만)
      const textA = textCache.get(a)!
      const textB = textCache.get(b)!
      const dynamicScore = (textA && textB) ? textSimilarity(textA, textB) : 0

      // 가중 합산 (정적 60%, 동적 40%)
      const combined = staticScore * STATIC_WEIGHT + dynamicScore * DYNAMIC_WEIGHT

      if (combined > 0.01) {
        matrix[i][j] = combined
        matrix[j][i] = combined

        entries.push({
          from: a,
          to: b,
          static: staticScore,
          dynamic: dynamicScore,
          combined,
          label: staticRel?.label ?? '데이터 유사성',
        })
      }
    }
  }

  // combined 기준 내림차순 정렬
  entries.sort((a, b) => b.combined - a.combined)

  return {
    frameworks: frameworkIds,
    matrix,
    entries,
    clusters: CLUSTERS,
  }
}

/** 프레임워크 약칭 (히트맵 라벨용) */
export function getShortName(id: FrameworkId): string {
  const SHORT: Record<string, string> = {
    faw: 'FAW',
    threeC: '3C',
    ansoff: 'Ansoff',
    pest: 'PEST',
    fiveForces: '5F',
    ilc: 'ILC',
    marketAnalysis: '시장',
    customerAnalysis: '고객',
    competitorAnalysis: '경쟁사',
    strategyCanvas: '캔버스',
    valueChain: 'VC',
    sevenS: '7S',
    vrio: 'VRIO',
    swot: 'SWOT',
    genericStrategy: '본원',
    stp: 'STP',
    errc: 'ERRC',
    fourP: '4P',
    wbs: 'WBS',
    kpi: 'KPI',
  }
  return SHORT[id] || id
}
