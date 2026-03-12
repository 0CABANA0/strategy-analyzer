/** 업종별 사전 정의 템플릿 — 사업 아이템 + 맥락 정보 */

export interface IndustryTemplate {
  id: string
  name: string
  icon: string
  description: string
  businessItem: string
  examples: string[]
}

export const INDUSTRY_TEMPLATES: IndustryTemplate[] = [
  {
    id: 'it_sw',
    name: 'IT / 소프트웨어',
    icon: '💻',
    description: 'SaaS, 플랫폼, AI/ML, 클라우드, 모바일 앱 등',
    businessItem: '',
    examples: [
      'AI 기반 고객 서비스 챗봇 SaaS',
      'B2B 데이터 분석 플랫폼',
      '클라우드 보안 솔루션',
      '노코드 업무 자동화 플랫폼',
    ],
  },
  {
    id: 'manufacturing',
    name: '제조 / 스마트팩토리',
    icon: '🏭',
    description: '생산설비, 품질관리, IoT, 예지보전 등',
    businessItem: '',
    examples: [
      '스마트팩토리 IoT 모니터링 시스템',
      'AI 기반 예지보전 플랫폼',
      '자동화 로봇 도입 전략',
      '디지털 트윈 기반 공정 최적화',
    ],
  },
  {
    id: 'energy',
    name: '에너지 / 환경',
    icon: '⚡',
    description: '신재생에너지, 전력설비, ESG, 탄소중립 등',
    businessItem: '',
    examples: [
      '태양광 발전 사업 확대 전략',
      'ESG 경영 체계 구축',
      'EV 충전 인프라 사업',
      '탄소 배출권 거래 플랫폼',
    ],
  },
  {
    id: 'service',
    name: '서비스 / 컨설팅',
    icon: '🤝',
    description: '교육, 헬스케어, 금융, 컨설팅 등',
    businessItem: '',
    examples: [
      'AI 맞춤형 교육 플랫폼',
      '원격 진료 서비스 확대',
      '핀테크 결제 솔루션',
      'HR 컨설팅 디지털 전환',
    ],
  },
  {
    id: 'retail',
    name: '유통 / 물류',
    icon: '🛒',
    description: '이커머스, 풀필먼트, 라스트마일, O2O 등',
    businessItem: '',
    examples: [
      'D2C 브랜드 이커머스 전략',
      '라스트마일 배송 로봇 도입',
      'AI 수요 예측 기반 재고 최적화',
      'O2O 옴니채널 전략',
    ],
  },
  {
    id: 'global',
    name: '해외 진출',
    icon: '🌏',
    description: '동남아, 미국, 유럽, 중동 등 해외 시장 전략',
    businessItem: '',
    examples: [
      '동남아 시장 진출 전략',
      '미국 B2B SaaS 시장 진출',
      '중동 인프라 수출 전략',
      '일본 시장 현지화 전략',
    ],
  },
]
