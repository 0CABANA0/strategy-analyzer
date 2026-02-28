/**
 * 20개 전략 프레임워크 메타데이터 정의
 * MBA 전략 프레임워크 기반 실전 전략수립 분석기
 */

import type { FrameworkDefinition, FrameworkId } from '../types'

export const FRAMEWORKS: Record<string, FrameworkDefinition> = {
  // === Step 1: 기획배경 ===
  faw: {
    id: 'faw',
    name: 'FAW 분석',
    fullName: 'Fact → Assumption → What-if',
    section: 1,
    description: '시장 팩트에서 가정을 도출하고, What-if 시나리오로 사업 기회를 발견합니다.',
    icon: 'Lightbulb',
    color: 'amber',
    fields: {
      facts: { label: '팩트 (Fact)', type: 'list', hint: '시장/산업에서 관찰되는 객관적 사실' },
      assumptions: { label: '가정 (Assumption)', type: 'list', hint: '팩트에서 도출한 가정/추론' },
      whatIfs: { label: 'What-if', type: 'list', hint: '가정 기반 사업 기회 시나리오' },
    },
  },
  threeC: {
    id: 'threeC',
    name: '3C 분석',
    fullName: 'Company · Customer · Competitor',
    section: 1,
    description: '자사·고객·경쟁사 3요소로 시장 포지션을 파악합니다.',
    icon: 'Triangle',
    color: 'blue',
    fields: {
      company: { label: '자사 (Company)', type: 'list', hint: '핵심 역량, 자원, 강점/약점' },
      customer: { label: '고객 (Customer)', type: 'list', hint: '타겟 고객, 니즈, 행동 패턴' },
      competitor: { label: '경쟁사 (Competitor)', type: 'list', hint: '주요 경쟁사, 전략, 차별점' },
    },
  },
  ansoff: {
    id: 'ansoff',
    name: 'Ansoff 매트릭스',
    fullName: 'Ansoff Growth Matrix',
    section: 1,
    description: '시장-제품 축으로 성장 전략 방향을 설정합니다.',
    icon: 'Grid2x2',
    color: 'violet',
    fields: {
      marketPenetration: { label: '시장 침투', type: 'text', hint: '기존 시장 × 기존 제품' },
      marketDevelopment: { label: '시장 개발', type: 'text', hint: '신규 시장 × 기존 제품' },
      productDevelopment: { label: '제품 개발', type: 'text', hint: '기존 시장 × 신규 제품' },
      diversification: { label: '다각화', type: 'text', hint: '신규 시장 × 신규 제품' },
      selectedStrategy: { label: '선택 전략', type: 'select', options: ['시장 침투', '시장 개발', '제품 개발', '다각화'] },
    },
  },

  // === Step 2: 환경분석 ===
  pest: {
    id: 'pest',
    name: 'PEST 분석',
    fullName: 'Political · Economic · Social · Technological',
    section: 2,
    description: '거시환경 4요인을 분석하여 외부 환경 변화를 파악합니다.',
    icon: 'Globe',
    color: 'green',
    fields: {
      political: { label: '정치적 (Political)', type: 'list', hint: '규제, 정책, 법률 변화' },
      economic: { label: '경제적 (Economic)', type: 'list', hint: '경기, 환율, 금리, 소비 트렌드' },
      social: { label: '사회적 (Social)', type: 'list', hint: '인구구조, 문화, 라이프스타일' },
      technological: { label: '기술적 (Technological)', type: 'list', hint: 'AI, 디지털전환, 신기술 동향' },
    },
  },
  fiveForces: {
    id: 'fiveForces',
    name: '5 Forces',
    fullName: "Porter's Five Forces",
    section: 2,
    description: '산업 내 5가지 경쟁 세력으로 산업 매력도를 평가합니다.',
    icon: 'Shield',
    color: 'red',
    fields: {
      rivalry: { label: '기존 경쟁자 간 경쟁', type: 'object', subfields: { level: '강도 (1-5)', factors: '요인' } },
      newEntrants: { label: '신규 진입자 위협', type: 'object', subfields: { level: '강도 (1-5)', factors: '요인' } },
      substitutes: { label: '대체재 위협', type: 'object', subfields: { level: '강도 (1-5)', factors: '요인' } },
      buyerPower: { label: '구매자 교섭력', type: 'object', subfields: { level: '강도 (1-5)', factors: '요인' } },
      supplierPower: { label: '공급자 교섭력', type: 'object', subfields: { level: '강도 (1-5)', factors: '요인' } },
      overall: { label: '종합 매력도', type: 'text' },
    },
  },
  ilc: {
    id: 'ilc',
    name: 'ILC 분석',
    fullName: 'Industry Life Cycle',
    section: 2,
    description: '산업 수명주기 단계를 판단하여 적합한 전략을 수립합니다.',
    icon: 'TrendingUp',
    color: 'teal',
    fields: {
      stage: { label: '현재 단계', type: 'select', options: ['도입기', '성장기', '성숙기', '쇠퇴기'] },
      evidence: { label: '판단 근거', type: 'list', hint: '시장 성장률, 경쟁 강도, 기술 성숙도 등' },
      implication: { label: '전략적 시사점', type: 'text', hint: '해당 단계에서 적합한 전략 방향' },
    },
  },
  marketAnalysis: {
    id: 'marketAnalysis',
    name: '시장 분석',
    fullName: 'Market Size & Trend',
    section: 2,
    description: 'TAM/SAM/SOM과 시장 트렌드를 분석합니다.',
    icon: 'BarChart3',
    color: 'indigo',
    fields: {
      tam: { label: 'TAM (전체 시장)', type: 'text', hint: '전체 시장 규모' },
      sam: { label: 'SAM (유효 시장)', type: 'text', hint: '목표 시장 규모' },
      som: { label: 'SOM (수익 시장)', type: 'text', hint: '실제 목표 점유 규모' },
      trends: { label: '시장 트렌드', type: 'list' },
      growthRate: { label: '성장률', type: 'text' },
    },
  },
  customerAnalysis: {
    id: 'customerAnalysis',
    name: '고객 분석',
    fullName: 'Customer Segmentation & Persona',
    section: 2,
    description: '고객 세그먼트와 페르소나를 정의합니다.',
    icon: 'Users',
    color: 'pink',
    fields: {
      segments: { label: '고객 세그먼트', type: 'list', hint: '인구통계, 행동, 니즈 기반 분류' },
      primaryPersona: { label: '핵심 페르소나', type: 'text', hint: '이름, 연령, 직업, 목표, 페인포인트' },
      needs: { label: '핵심 니즈', type: 'list' },
      painPoints: { label: '페인포인트', type: 'list' },
    },
  },
  competitorAnalysis: {
    id: 'competitorAnalysis',
    name: '경쟁사 분석',
    fullName: 'Competitor Profiling',
    section: 2,
    description: '주요 경쟁사를 프로파일링하고 차별점을 파악합니다.',
    icon: 'Swords',
    color: 'orange',
    fields: {
      competitors: { label: '주요 경쟁사', type: 'table', columns: ['경쟁사명', '강점', '약점', '시장점유율', '전략'] },
      differentiators: { label: '차별화 포인트', type: 'list' },
      gaps: { label: '시장 갭', type: 'list', hint: '경쟁사가 놓치고 있는 기회' },
    },
  },
  strategyCanvas: {
    id: 'strategyCanvas',
    name: '전략 캔버스',
    fullName: 'Strategy Canvas (Blue Ocean)',
    section: 2,
    description: '경쟁 요인별 가치곡선을 시각화하여 블루오션 기회를 발견합니다.',
    icon: 'LineChart',
    color: 'cyan',
    fields: {
      factors: { label: '경쟁 요인', type: 'list', hint: '업계의 주요 경쟁 기준' },
      competitors: { label: '경쟁사 점수', type: 'table', columns: ['요인', '자사', '경쟁사A', '경쟁사B'] },
      insight: { label: '인사이트', type: 'text', hint: '가치곡선에서 발견한 차별화 기회' },
    },
  },
  valueChain: {
    id: 'valueChain',
    name: '가치사슬 분석',
    fullName: "Porter's Value Chain",
    section: 2,
    description: '주활동과 지원활동을 분석하여 경쟁우위 원천을 파악합니다.',
    icon: 'Link',
    color: 'emerald',
    fields: {
      primary: {
        label: '주활동',
        type: 'object',
        subfields: {
          inboundLogistics: '물류 입고',
          operations: '운영/생산',
          outboundLogistics: '물류 출고',
          marketing: '마케팅/판매',
          service: '서비스',
        },
      },
      support: {
        label: '지원활동',
        type: 'object',
        subfields: {
          infrastructure: '기업 인프라',
          hrm: '인적자원관리',
          technology: '기술개발',
          procurement: '조달',
        },
      },
      advantage: { label: '경쟁우위 원천', type: 'text' },
    },
  },
  sevenS: {
    id: 'sevenS',
    name: '7S 분석',
    fullName: "McKinsey 7S Framework",
    section: 2,
    description: '조직 내부 7요소의 정합성을 진단합니다.',
    icon: 'Hexagon',
    color: 'purple',
    fields: {
      strategy: { label: '전략 (Strategy)', type: 'text' },
      structure: { label: '구조 (Structure)', type: 'text' },
      systems: { label: '시스템 (Systems)', type: 'text' },
      sharedValues: { label: '공유가치 (Shared Values)', type: 'text' },
      skills: { label: '기술 (Skills)', type: 'text' },
      staff: { label: '인력 (Staff)', type: 'text' },
      style: { label: '스타일 (Style)', type: 'text' },
      alignment: { label: '정합성 평가', type: 'text' },
    },
  },
  vrio: {
    id: 'vrio',
    name: 'VRIO 분석',
    fullName: 'Value · Rarity · Imitability · Organization',
    section: 2,
    description: '핵심 자원/역량의 지속 가능한 경쟁우위를 평가합니다.',
    icon: 'Diamond',
    color: 'yellow',
    fields: {
      resources: {
        label: '자원/역량 평가',
        type: 'table',
        columns: ['자원/역량', '가치(V)', '희소성(R)', '모방불가(I)', '조직화(O)', '경쟁우위'],
      },
      coreCompetence: { label: '핵심역량', type: 'text', hint: 'VRIO 모두 충족하는 역량' },
    },
  },

  // === Step 3: 시사점 ===
  swot: {
    id: 'swot',
    name: 'SWOT 분석',
    fullName: 'SWOT Cross Analysis',
    section: 3,
    description: 'SW/OT 크로스분석으로 4가지 전략 방향을 도출합니다.',
    icon: 'LayoutGrid',
    color: 'blue',
    fields: {
      strengths: { label: '강점 (S)', type: 'list' },
      weaknesses: { label: '약점 (W)', type: 'list' },
      opportunities: { label: '기회 (O)', type: 'list' },
      threats: { label: '위협 (T)', type: 'list' },
      so: { label: 'SO 전략', type: 'list', hint: '강점으로 기회 활용' },
      wo: { label: 'WO 전략', type: 'list', hint: '약점 보완하여 기회 활용' },
      st: { label: 'ST 전략', type: 'list', hint: '강점으로 위협 대응' },
      wt: { label: 'WT 전략', type: 'list', hint: '약점·위협 최소화' },
      selectedStrategies: { label: '선택 전략', type: 'list' },
    },
  },

  // === Step 4: 추진전략 ===
  genericStrategy: {
    id: 'genericStrategy',
    name: '본원적 전략',
    fullName: "Porter's Generic Strategy",
    section: 4,
    description: '원가우위/차별화/집중 중 경쟁전략을 선택합니다.',
    icon: 'Target',
    color: 'red',
    fields: {
      strategy: { label: '선택 전략', type: 'select', options: ['원가우위', '차별화', '집중(원가)', '집중(차별화)'] },
      rationale: { label: '선택 근거', type: 'text' },
      actions: { label: '실행 방안', type: 'list' },
    },
  },
  stp: {
    id: 'stp',
    name: 'STP',
    fullName: 'Segmentation · Targeting · Positioning',
    section: 4,
    description: '시장 세분화 → 타겟 선정 → 포지셔닝 전략을 수립합니다.',
    icon: 'Crosshair',
    color: 'sky',
    fields: {
      segmentation: { label: '세분화 (S)', type: 'list', hint: '시장 세그먼트 기준과 결과' },
      targeting: { label: '타겟팅 (T)', type: 'text', hint: '선택한 타겟 세그먼트와 근거' },
      positioning: { label: '포지셔닝 (P)', type: 'text', hint: '포지셔닝 맵, 태그라인' },
    },
  },
  errc: {
    id: 'errc',
    name: 'ERRC',
    fullName: 'Eliminate · Reduce · Raise · Create',
    section: 4,
    description: '기존 경쟁 요인을 재구성하여 새로운 가치를 창출합니다.',
    icon: 'Shuffle',
    color: 'teal',
    fields: {
      eliminate: { label: '제거 (Eliminate)', type: 'list', hint: '업계 당연시하지만 제거할 요소' },
      reduce: { label: '감소 (Reduce)', type: 'list', hint: '업계 수준 이하로 줄일 요소' },
      raise: { label: '증가 (Raise)', type: 'list', hint: '업계 수준 이상으로 높일 요소' },
      create: { label: '창조 (Create)', type: 'list', hint: '업계에 없는 새로 만들 요소' },
    },
  },
  fourP: {
    id: 'fourP',
    name: '4P 전략',
    fullName: 'Marketing Mix 4P',
    section: 4,
    description: 'Product·Price·Place·Promotion 마케팅 믹스를 설계합니다.',
    icon: 'Package',
    color: 'orange',
    fields: {
      product: { label: '제품 (Product)', type: 'text', hint: '핵심 기능, 디자인, 브랜드' },
      price: { label: '가격 (Price)', type: 'text', hint: '가격 전략, 수익 모델' },
      place: { label: '유통 (Place)', type: 'text', hint: '유통 채널, 접근성' },
      promotion: { label: '판촉 (Promotion)', type: 'text', hint: '마케팅 커뮤니케이션 전략' },
    },
  },
  wbs: {
    id: 'wbs',
    name: 'WBS 일정',
    fullName: 'Work Breakdown Structure',
    section: 4,
    description: '추진 일정과 마일스톤을 정의합니다.',
    icon: 'CalendarDays',
    color: 'slate',
    fields: {
      phases: {
        label: '추진 단계',
        type: 'table',
        columns: ['단계', '주요 활동', '산출물', '기간', '담당'],
      },
      milestones: { label: '마일스톤', type: 'list' },
    },
  },

  // === Step 5: 기대효과 ===
  kpi: {
    id: 'kpi',
    name: 'KPI 대시보드',
    fullName: 'Key Performance Indicators',
    section: 5,
    description: 'Input→Throughput→Output→Outcome 체계로 KPI를 설계합니다.',
    icon: 'Gauge',
    color: 'emerald',
    fields: {
      quantitative: { label: '정량적 기대효과', type: 'list' },
      qualitative: { label: '정성적 기대효과', type: 'list' },
      input: { label: 'Input KPI', type: 'list', hint: '투입 지표 (예: 투자금, 인원)' },
      throughput: { label: 'Throughput KPI', type: 'list', hint: '과정 지표 (예: 개발 속도, 품질)' },
      output: { label: 'Output KPI', type: 'list', hint: '산출 지표 (예: MAU, 거래량)' },
      outcome: { label: 'Outcome KPI', type: 'list', hint: '성과 지표 (예: 매출, 시장점유율)' },
    },
  },
}

/** 프레임워크 ID 목록 (순서대로) */
export const FRAMEWORK_IDS: string[] = Object.keys(FRAMEWORKS)

/** 섹션별 프레임워크 그룹 */
export function getFrameworksBySection(sectionNumber: number): FrameworkDefinition[] {
  return Object.values(FRAMEWORKS).filter((f) => f.section === sectionNumber)
}
