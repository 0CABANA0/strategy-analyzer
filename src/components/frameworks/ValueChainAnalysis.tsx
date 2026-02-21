import React from 'react'
import FrameworkCard from './FrameworkCard'
import { TextField } from './FieldRenderer'
import { useStrategy } from '../../hooks/useStrategyDocument'
import type { ValueChainData } from '../../types'

interface ActivityDef {
  key: string
  label: string
}

const PRIMARY: ActivityDef[] = [
  { key: 'inboundLogistics', label: '물류 입고' },
  { key: 'operations', label: '운영/생산' },
  { key: 'outboundLogistics', label: '물류 출고' },
  { key: 'marketing', label: '마케팅/판매' },
  { key: 'service', label: '서비스' },
]

const SUPPORT: ActivityDef[] = [
  { key: 'infrastructure', label: '기업 인프라' },
  { key: 'hrm', label: '인적자원관리' },
  { key: 'technology', label: '기술개발' },
  { key: 'procurement', label: '조달' },
]

function ValueChainAnalysis() {
  const { state, updateFrameworkField } = useStrategy()
  const data = state?.frameworks.valueChain?.data as ValueChainData | undefined

  const updateSub = (group: 'primary' | 'support', key: string, value: string) => {
    updateFrameworkField('valueChain', group, {
      ...data?.[group],
      [key]: value,
    })
  }

  return (
    <FrameworkCard frameworkId="valueChain">
      {/* 지원활동 */}
      <div className="mb-3">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">지원활동</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {SUPPORT.map(({ key, label }) => (
            <div key={key} className="bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 rounded-lg p-2">
              <div className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 mb-1">{label}</div>
              <textarea
                value={(data?.support as Record<string, string> | undefined)?.[key] || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateSub('support', key, e.target.value)}
                rows={2}
                className="w-full text-xs bg-transparent border-0 focus:outline-none resize-none"
                placeholder="..."
              />
            </div>
          ))}
        </div>
      </div>

      {/* 주활동 - 화살표 형태 */}
      <div className="mb-3">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">주활동</label>
        <div className="flex gap-0.5">
          {PRIMARY.map(({ key, label }, i: number) => (
            <div
              key={key}
              className="flex-1 bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 rounded-lg p-2 relative"
            >
              <div className="text-[10px] font-medium text-blue-700 dark:text-blue-400 mb-1">{label}</div>
              <textarea
                value={(data?.primary as Record<string, string> | undefined)?.[key] || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateSub('primary', key, e.target.value)}
                rows={2}
                className="w-full text-xs bg-transparent border-0 focus:outline-none resize-none"
                placeholder="..."
              />
              {i < PRIMARY.length - 1 && (
                <span className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 text-blue-300 dark:text-blue-600 text-lg z-10">
                  →
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <TextField frameworkId="valueChain" fieldKey="advantage" label="경쟁우위 원천" value={data?.advantage} multiline />
    </FrameworkCard>
  )
}

export default React.memo(ValueChainAnalysis)
