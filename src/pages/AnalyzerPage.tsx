import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStrategy } from '../hooks/useStrategyDocument'
import { useWizard } from '../hooks/useWizard'
import WizardShell from '../components/wizard/WizardShell'
import SectionContainer from '../components/frameworks/SectionContainer'
import { useDocumentList } from '../hooks/useLocalStorage'

export default function AnalyzerPage() {
  const { state } = useStrategy()
  const { currentStep } = useWizard()
  const { addDocument, docs } = useDocumentList()
  const navigate = useNavigate()

  // 사업 아이템이 없으면 홈으로
  useEffect(() => {
    if (!state?.businessItem) {
      navigate('/', { replace: true })
    }
  }, [state?.businessItem, navigate])

  // 히스토리에 자동 등록
  useEffect(() => {
    if (!state?.id || !state?.businessItem) return
    const exists = docs.some((d) => d.id === state.id)
    if (!exists) {
      addDocument({
        id: state.id,
        businessItem: state.businessItem,
        createdAt: state.createdAt,
        updatedAt: state.updatedAt,
      })
    }
  }, [state?.id])

  if (!state?.businessItem) return null

  return (
    <WizardShell>
      <div className="mb-3 inline-flex items-center gap-2 px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-sm">
        <span className="font-medium">{state.businessItem}</span>
      </div>
      <SectionContainer stepNumber={currentStep} />
    </WizardShell>
  )
}
