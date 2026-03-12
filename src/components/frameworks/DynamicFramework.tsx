/**
 * 커스텀 프레임워크 동적 렌더링 컴포넌트
 * FieldRenderer 기반으로 fields 정의에 맞춰 자동 렌더링
 */
import FrameworkCard from './FrameworkCard'
import { ListField, TextField, DataTable } from './FieldRenderer'
import { useStrategy } from '../../hooks/useStrategyDocument'
import type { CustomFramework } from '../../utils/customFrameworks'

interface DynamicFrameworkProps {
  framework: CustomFramework
}

export default function DynamicFramework({ framework }: DynamicFrameworkProps) {
  const { state } = useStrategy()
  const data = (state?.frameworks[framework.id]?.data ?? {}) as Record<string, unknown>

  return (
    <FrameworkCard frameworkId={framework.id}>
      {Object.entries(framework.fields).map(([key, fieldDef]) => {
        const value = data[key]

        if (fieldDef.type === 'text') {
          return (
            <TextField
              key={key}
              frameworkId={framework.id}
              fieldKey={key}
              label={fieldDef.label}
              value={value as string | undefined}
              multiline
            />
          )
        }

        if (fieldDef.type === 'list') {
          return (
            <ListField
              key={key}
              frameworkId={framework.id}
              fieldKey={key}
              label={fieldDef.label}
              items={value as string[] | undefined}
            />
          )
        }

        if (fieldDef.type === 'table') {
          const tableDef = fieldDef as { columns: string[] }
          return (
            <DataTable
              key={key}
              label={fieldDef.label}
              columns={tableDef.columns || []}
              rows={value as (string | number)[][] | undefined}
            />
          )
        }

        // select, object 등은 텍스트로 fallback
        return (
          <TextField
            key={key}
            frameworkId={framework.id}
            fieldKey={key}
            label={fieldDef.label}
            value={typeof value === 'object' ? JSON.stringify(value) : String(value ?? '')}
            multiline
          />
        )
      })}
    </FrameworkCard>
  )
}
