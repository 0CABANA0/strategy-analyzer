import React from 'react'
import FrameworkCard from './FrameworkCard'
import { useStrategy } from '../../hooks/useStrategyDocument'
import { TextField } from './FieldRenderer'
import type { FiveForcesData, ForceDetail } from '../../types'

interface ForceDef {
  key: keyof Pick<FiveForcesData, 'rivalry' | 'newEntrants' | 'substitutes' | 'buyerPower' | 'supplierPower'>
  label: string
  color: string
}

const FORCES: ForceDef[] = [
  { key: 'rivalry', label: '기존 경쟁자 간 경쟁', color: 'bg-red-500' },
  { key: 'newEntrants', label: '신규 진입자 위협', color: 'bg-orange-500' },
  { key: 'substitutes', label: '대체재 위협', color: 'bg-yellow-500' },
  { key: 'buyerPower', label: '구매자 교섭력', color: 'bg-blue-500' },
  { key: 'supplierPower', label: '공급자 교섭력', color: 'bg-green-500' },
]

function FiveForcesAnalysis() {
  const { state, updateFrameworkField } = useStrategy()
  const data = state?.frameworks.fiveForces?.data as FiveForcesData | undefined

  return (
    <FrameworkCard frameworkId="fiveForces">
      <div className="space-y-3">
        {FORCES.map(({ key, label, color }) => {
          const force = data?.[key] as ForceDetail | undefined
          return (
            <div key={key} className="rounded-lg border border-gray-100 dark:border-gray-700 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${color}`} />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n: number) => (
                    <button
                      key={n}
                      onClick={() =>
                        updateFrameworkField('fiveForces', key, {
                          ...force,
                          level: n,
                        })
                      }
                      aria-pressed={n <= (force?.level || 0)}
                      aria-label={`${label} 위협 수준 ${n}`}
                      className={`w-5 h-5 rounded text-[10px] font-medium transition-colors focus:ring-2 focus:ring-primary-400 focus:ring-offset-1 ${
                        n <= (force?.level || 0)
                          ? `${color} text-white`
                          : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={force?.factors || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  updateFrameworkField('fiveForces', key, {
                    ...force,
                    factors: e.target.value,
                  })
                }
                placeholder="요인 분석..."
                rows={2}
                className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-400 resize-y"
              />
            </div>
          )
        })}
        <TextField frameworkId="fiveForces" fieldKey="overall" label="종합 매력도" value={data?.overall} />
      </div>
    </FrameworkCard>
  )
}

export default React.memo(FiveForcesAnalysis)
