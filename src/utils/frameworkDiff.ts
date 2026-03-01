/** 프레임워크 데이터 diff + 이슈 변경 추적 유틸리티 */
import type { FieldChange, TrackedIssue } from '../types'
import type { ConsistencyIssue } from '../types'

interface FieldMeta {
  label: string
  type: string
}

/**
 * 프레임워크 필드별 변경 사항 비교
 * JSON.stringify 기반 깊은 비교. 변경된 필드만 반환.
 */
export function diffFrameworkData(
  _frameworkId: string,
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null,
  fieldDefs: Record<string, FieldMeta>,
): FieldChange[] {
  const changes: FieldChange[] = []
  const allKeys = new Set([
    ...Object.keys(fieldDefs),
  ])

  for (const key of allKeys) {
    const def = fieldDefs[key]
    if (!def) continue

    const bVal = before?.[key] ?? null
    const aVal = after?.[key] ?? null

    if (JSON.stringify(bVal) !== JSON.stringify(aVal)) {
      changes.push({
        field: key,
        fieldLabel: def.label,
        before: bVal,
        after: aVal,
      })
    }
  }

  return changes
}

/**
 * 이슈 매칭 키 생성 — type + sorted frameworks
 * 동일한 문제가 다른 문구로 표현되어도 추적 가능
 */
function issueKey(issue: ConsistencyIssue): string {
  return `${issue.type}:${[...issue.frameworks].sort().join(',')}`
}

/**
 * 이전 이슈 vs 새 이슈 비교 → resolved / maintained / new 분류
 */
export function trackIssueChanges(
  before: ConsistencyIssue[],
  after: ConsistencyIssue[],
): TrackedIssue[] {
  const beforeKeys = new Set(before.map(issueKey))
  const afterKeys = new Map(after.map((i) => [issueKey(i), i]))
  const result: TrackedIssue[] = []

  // 이전에 있었던 이슈: 유지 or 해결
  for (const issue of before) {
    const key = issueKey(issue)
    if (afterKeys.has(key)) {
      result.push({ issue: afterKeys.get(key)!, status: 'maintained' })
      afterKeys.delete(key)
    } else {
      result.push({ issue, status: 'resolved' })
    }
  }

  // 새로 생긴 이슈
  for (const [, issue] of afterKeys) {
    result.push({ issue, status: 'new' })
  }

  return result
}
