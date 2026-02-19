// 프레임워크 필드 정의 타입

export type FieldType = 'text' | 'list' | 'select' | 'object' | 'table'

export interface TextFieldDef {
  label: string
  type: 'text'
  hint?: string
}

export interface ListFieldDef {
  label: string
  type: 'list'
  hint?: string
}

export interface SelectFieldDef {
  label: string
  type: 'select'
  options: string[]
  hint?: string
}

export interface ObjectFieldDef {
  label: string
  type: 'object'
  subfields: Record<string, string>
  hint?: string
}

export interface TableFieldDef {
  label: string
  type: 'table'
  columns: string[]
  hint?: string
}

export type FieldDef = TextFieldDef | ListFieldDef | SelectFieldDef | ObjectFieldDef | TableFieldDef

// 프레임워크 ID

export type FrameworkId =
  | 'faw' | 'threeC' | 'ansoff'
  | 'pest' | 'fiveForces' | 'ilc' | 'marketAnalysis' | 'customerAnalysis'
  | 'competitorAnalysis' | 'strategyCanvas' | 'valueChain' | 'sevenS' | 'vrio'
  | 'swot'
  | 'genericStrategy' | 'stp' | 'errc' | 'fourP' | 'wbs'
  | 'kpi'

export interface FrameworkDefinition {
  id: FrameworkId
  name: string
  fullName: string
  section: number
  description: string
  icon: string
  color: string
  fields: Record<string, FieldDef>
}

// 프레임워크별 데이터 타입 (AI 응답)

export interface FawData {
  facts: string[]
  assumptions: string[]
  whatIfs: string[]
}

export interface ThreeCData {
  company: string[]
  customer: string[]
  competitor: string[]
}

export interface AnsoffData {
  marketPenetration: string
  marketDevelopment: string
  productDevelopment: string
  diversification: string
  selectedStrategy: string
}

export interface PestData {
  political: string[]
  economic: string[]
  social: string[]
  technological: string[]
}

export interface ForceDetail {
  level: number
  factors: string
}

export interface FiveForcesData {
  rivalry: ForceDetail
  newEntrants: ForceDetail
  substitutes: ForceDetail
  buyerPower: ForceDetail
  supplierPower: ForceDetail
  overall: string
}

export interface IlcData {
  stage: string
  evidence: string[]
  implication: string
}

export interface MarketData {
  tam: string
  sam: string
  som: string
  growthRate: string
  trends: string[]
}

export interface CustomerData {
  segments: string[]
  primaryPersona: string
  needs: string[]
  painPoints: string[]
}

export interface CompetitorData {
  competitors: (string | number)[][]
  differentiators: string[]
  gaps: string[]
}

export interface StrategyCanvasData {
  factors: string[]
  competitors: (string | number)[][]
  insight: string
}

export interface ValueChainData {
  primary: {
    inboundLogistics: string
    operations: string
    outboundLogistics: string
    marketing: string
    service: string
  }
  support: {
    infrastructure: string
    hrm: string
    technology: string
    procurement: string
  }
  advantage: string
}

export interface SevenSData {
  strategy: string
  structure: string
  systems: string
  sharedValues: string
  skills: string
  staff: string
  style: string
  alignment: string
}

export interface VrioData {
  resources: (string | number)[][]
  coreCompetence: string
}

export interface SwotData {
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
  so: string[]
  wo: string[]
  st: string[]
  wt: string[]
  selectedStrategies: string[]
}

export interface GenericStrategyData {
  strategy: string
  rationale: string
  actions: string[]
}

export interface StpData {
  segmentation: string[]
  targeting: string
  positioning: string
}

export interface ErrcData {
  eliminate: string[]
  reduce: string[]
  raise: string[]
  create: string[]
}

export interface FourPData {
  product: string
  price: string
  place: string
  promotion: string
}

export interface WbsData {
  phases: string[][]
  milestones: string[]
}

export interface KpiData {
  quantitative: string[]
  qualitative: string[]
  input: string[]
  throughput: string[]
  output: string[]
  outcome: string[]
}

// 프레임워크 데이터 유니온 타입
export type FrameworkData =
  | FawData | ThreeCData | AnsoffData | PestData | FiveForcesData
  | IlcData | MarketData | CustomerData | CompetitorData | StrategyCanvasData
  | ValueChainData | SevenSData | VrioData | SwotData
  | GenericStrategyData | StpData | ErrcData | FourPData | WbsData | KpiData
