import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStrategy } from '../hooks/useStrategyDocument'
import DocumentPreview from '../components/preview/DocumentPreview'
import ConsistencyPanel from '../components/validation/ConsistencyPanel'
import ExecutiveSummaryPanel from '../components/executive/ExecutiveSummaryPanel'
import ScenarioPanel from '../components/scenario/ScenarioPanel'
import FinancialPanel from '../components/financial/FinancialPanel'
import TemplateSelector from '../components/pptx/TemplateSelector'
import { ArrowLeft, FileText, Globe, ShieldCheck, Briefcase, GitBranch, Calculator, Presentation } from 'lucide-react'
import { exportHtml } from '../utils/exportHtml'
import { exportMarkdown } from '../utils/exportMarkdown'
import { exportPptx } from '../utils/exportPptx'
import { useToast } from '../hooks/useToast'
import { getSelectedTemplate, getSelectedTemplateId } from '../utils/pptxTemplateStore'
import type { PptxTemplate } from '../types/pptxTemplate'

type AnalysisPanel = 'validation' | 'executive' | 'scenario' | 'financial'

const PANEL_CONFIG: { key: AnalysisPanel; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'validation', label: '전략검증', icon: <ShieldCheck className="w-4 h-4" />, color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400' },
  { key: 'executive', label: '요약', icon: <Briefcase className="w-4 h-4" />, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' },
  { key: 'scenario', label: '시나리오', icon: <GitBranch className="w-4 h-4" />, color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400' },
  { key: 'financial', label: '재무', icon: <Calculator className="w-4 h-4" />, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' },
]

export default function PreviewPage() {
  const { state } = useStrategy()
  const navigate = useNavigate()
  const toast = useToast()
  const [activePanels, setActivePanels] = useState<Set<AnalysisPanel>>(new Set())
  const [isPptxExporting, setIsPptxExporting] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState(() => getSelectedTemplateId())
  const [pptxTemplate, setPptxTemplate] = useState<PptxTemplate>(() => getSelectedTemplate())

  if (!state?.businessItem) {
    navigate('/', { replace: true })
    return null
  }

  const togglePanel = (panel: AnalysisPanel) => {
    setActivePanels((prev) => {
      const next = new Set(prev)
      if (next.has(panel)) next.delete(panel)
      else next.add(panel)
      return next
    })
  }

  const handleHtml = () => exportHtml(state)
  const handleMarkdown = () => exportMarkdown(state)
  const handleTemplateSelect = (id: string, template: PptxTemplate) => {
    setSelectedTemplateId(id)
    setPptxTemplate(template)
  }

  const handlePptx = async () => {
    setIsPptxExporting(true)
    try {
      await exportPptx(state, pptxTemplate)
      toast.success('PPTX 파일이 다운로드되었습니다.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'PPTX 생성 중 오류가 발생했습니다.')
    } finally {
      setIsPptxExporting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-in">
      {/* 상단 네비게이션 */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 no-print">
        <button
          onClick={() => navigate('/analyzer')}
          className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <ArrowLeft className="w-4 h-4" />
          분석으로 돌아가기
        </button>
        <div className="flex flex-wrap gap-2">
          {/* 분석 패널 토글 버튼 */}
          {PANEL_CONFIG.map(({ key, label, icon, color }) => (
            <button
              key={key}
              onClick={() => togglePanel(key)}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                activePanels.has(key)
                  ? `${color} border-transparent font-medium`
                  : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}

          {/* 구분선 */}
          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 self-center" />

          {/* 내보내기 버튼 */}
          <button
            onClick={handleHtml}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Globe className="w-4 h-4" />
            HTML
          </button>
          <button
            onClick={handleMarkdown}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Markdown
          </button>
          <TemplateSelector selectedId={selectedTemplateId} onSelect={handleTemplateSelect} />
          <button
            onClick={handlePptx}
            disabled={isPptxExporting}
            className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg transition-colors bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
            title="PowerPoint 내보내기"
          >
            {isPptxExporting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Presentation className="w-4 h-4" />
            )}
            PPTX
          </button>
        </div>
      </div>

      {/* 분석 패널 (조건부 렌더링) */}
      <div className="no-print">
        {activePanels.has('executive') && <ExecutiveSummaryPanel />}
        {activePanels.has('validation') && <ConsistencyPanel />}
        {activePanels.has('scenario') && <ScenarioPanel />}
        {activePanels.has('financial') && <FinancialPanel />}
      </div>

      {/* 문서 미리보기 */}
      <DocumentPreview state={state} />
    </div>
  )
}
