import FrameworkCard from './FrameworkCard'
import { ListField, TextField, DataTable } from './FieldRenderer'
import { useStrategy } from '../../hooks/useStrategyDocument'
import type { StrategyCanvasData } from '../../types'

export default function StrategyCanvas() {
  const { state } = useStrategy()
  const data = state?.frameworks.strategyCanvas?.data as StrategyCanvasData | undefined

  // 간단한 바차트 시각화
  const compData = data?.competitors || []

  return (
    <FrameworkCard frameworkId="strategyCanvas">
      {compData.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">가치곡선</div>
          <div className="space-y-1.5">
            {compData.map((row, i: number) => {
              const values = Array.isArray(row) ? row : Object.values(row)
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 dark:text-gray-400 w-16 truncate">{String(values[0])}</span>
                  <div className="flex-1 flex gap-1">
                    {values.slice(1).map((v, j: number) => {
                      const num = parseInt(String(v)) || 0
                      const colors = ['bg-primary-500', 'bg-red-400', 'bg-amber-400']
                      return (
                        <div
                          key={j}
                          className={`h-3 rounded ${colors[j % colors.length]} transition-all`}
                          style={{ width: `${(num / 5) * 100}%`, minWidth: num > 0 ? '4px' : '0' }}
                          title={`${['자사', '경쟁사A', '경쟁사B'][j]}: ${v}`}
                        />
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex gap-3 mt-2">
            {['자사', '경쟁사A', '경쟁사B'].map((name: string, i: number) => {
              const colors = ['bg-primary-500', 'bg-red-400', 'bg-amber-400']
              return (
                <div key={name} className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                  <span className={`w-2 h-2 rounded ${colors[i]}`} />
                  {name}
                </div>
              )
            })}
          </div>
        </div>
      )}
      <DataTable
        label="경쟁 요인별 점수"
        columns={['요인', '자사', '경쟁사A', '경쟁사B']}
        rows={data?.competitors}
      />
      <ListField frameworkId="strategyCanvas" fieldKey="factors" label="경쟁 요인" items={data?.factors} />
      <TextField frameworkId="strategyCanvas" fieldKey="insight" label="인사이트" value={data?.insight} multiline />
    </FrameworkCard>
  )
}
