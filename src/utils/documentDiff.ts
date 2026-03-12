/**
 * 문서 레벨 diff 계산
 * 두 StrategyDocument의 프레임워크 데이터를 비교하여 차이점 추출
 */
import type { StrategyDocument } from '../types/document'
import { FRAMEWORKS } from '../data/frameworkDefinitions'

export interface FieldDiff {
  fieldKey: string
  fieldLabel: string
  valueA: string
  valueB: string
  changed: boolean
}

export interface FrameworkDiff {
  frameworkId: string
  frameworkName: string
  statusA: string
  statusB: string
  fields: FieldDiff[]
}

/** 두 문서의 모든 프레임워크를 비교 */
export function computeDocumentDiff(docA: StrategyDocument, docB: StrategyDocument): FrameworkDiff[] {
  const diffs: FrameworkDiff[] = []

  for (const [fId, fw] of Object.entries(FRAMEWORKS)) {
    const stateA = docA.frameworks[fId]
    const stateB = docB.frameworks[fId]
    const statusA = stateA?.status || 'empty'
    const statusB = stateB?.status || 'empty'

    const fields: FieldDiff[] = []
    const dataA = (stateA?.data ?? {}) as Record<string, unknown>
    const dataB = (stateB?.data ?? {}) as Record<string, unknown>

    for (const [key, fieldDef] of Object.entries(fw.fields)) {
      const valA = stringify(dataA[key])
      const valB = stringify(dataB[key])
      fields.push({
        fieldKey: key,
        fieldLabel: fieldDef.label,
        valueA: valA,
        valueB: valB,
        changed: valA !== valB,
      })
    }

    // 변경사항이 있거나 상태가 다른 경우만 포함
    const hasChanges = statusA !== statusB || fields.some((f) => f.changed)
    if (hasChanges) {
      diffs.push({
        frameworkId: fId,
        frameworkName: fw.name,
        statusA,
        statusB,
        fields,
      })
    }
  }

  return diffs
}

/** 값을 비교 가능한 문자열로 변환 */
function stringify(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return JSON.stringify(value)
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
