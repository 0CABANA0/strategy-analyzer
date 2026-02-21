import { memo } from 'react'
import FrameworkCard from './FrameworkCard'
import { TextField } from './FieldRenderer'
import { useStrategy } from '../../hooks/useStrategyDocument'
import type { SevenSData } from '../../types'

interface SevenSField {
  key: keyof SevenSData
  label: string
}

const HARD_S: SevenSField[] = [
  { key: 'strategy', label: '전략 (Strategy)' },
  { key: 'structure', label: '구조 (Structure)' },
  { key: 'systems', label: '시스템 (Systems)' },
]

const SOFT_S: SevenSField[] = [
  { key: 'sharedValues', label: '공유가치 (Shared Values)' },
  { key: 'skills', label: '기술 (Skills)' },
  { key: 'staff', label: '인력 (Staff)' },
  { key: 'style', label: '스타일 (Style)' },
]

function SevenSAnalysis() {
  const { state } = useStrategy()
  const data = state?.frameworks.sevenS?.data as SevenSData | undefined

  return (
    <FrameworkCard frameworkId="sevenS">
      {/* 중심: Shared Values */}
      <div className="flex justify-center mb-3">
        <div className="bg-purple-50 border-2 border-purple-300 dark:bg-purple-900/20 dark:border-purple-800 rounded-xl p-3 w-48 text-center">
          <div className="text-xs font-bold text-purple-700 dark:text-purple-400 mb-1">공유가치</div>
          <textarea
            value={data?.sharedValues || ''}
            onChange={() => {}}
            readOnly
            rows={2}
            className="w-full text-xs text-center bg-transparent border-0 focus:outline-none resize-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Hard S</div>
          {HARD_S.map(({ key, label }) => (
            <TextField key={key} frameworkId="sevenS" fieldKey={key} label={label} value={data?.[key]} />
          ))}
        </div>
        <div>
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Soft S</div>
          {SOFT_S.map(({ key, label }) => (
            <TextField key={key} frameworkId="sevenS" fieldKey={key} label={label} value={data?.[key]} />
          ))}
        </div>
      </div>
      <TextField frameworkId="sevenS" fieldKey="alignment" label="정합성 평가" value={data?.alignment} multiline />
    </FrameworkCard>
  )
}

export default memo(SevenSAnalysis)
