/** 개선 이력 추적 타입 */
import type { ConsistencyIssue } from './validation'

/** 프레임워크 필드 단위 변경 */
export interface FieldChange {
  field: string
  fieldLabel: string
  before: unknown
  after: unknown
}

/** 프레임워크 단위 변경 */
export interface FrameworkChange {
  frameworkId: string
  frameworkName: string
  fields: FieldChange[]
}

/** 점수 스냅샷 */
export interface ScoreSnapshot {
  overallScore: number
  logicFlowScore: number
  completenessScore: number
  alignmentScore: number
}

/** 이슈 변경 상태 */
export type IssueChangeStatus = 'resolved' | 'maintained' | 'new'

/** 추적 가능한 이슈 */
export interface TrackedIssue {
  issue: ConsistencyIssue
  status: IssueChangeStatus
}

/** 개선 이력 레코드 */
export interface ImprovementRecord {
  id: string
  timestamp: string
  trigger: ConsistencyIssue
  frameworkChanges: FrameworkChange[]
  scoreBefore: ScoreSnapshot
  scoreAfter: ScoreSnapshot
  trackedIssues: TrackedIssue[]
}
