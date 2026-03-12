import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStrategy } from '../hooks/useStrategyDocument'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import DocumentPreview from '../components/preview/DocumentPreview'
import ConsistencyPanel from '../components/validation/ConsistencyPanel'
import ExecutiveSummaryPanel from '../components/executive/ExecutiveSummaryPanel'
import ScenarioPanel from '../components/scenario/ScenarioPanel'
import FinancialPanel from '../components/financial/FinancialPanel'
import TemplateSelector from '../components/pptx/TemplateSelector'
import FrameworkDAG from '../components/visualization/FrameworkDAG'
import AnalysisDashboard from '../components/dashboard/AnalysisDashboard'
import { ArrowLeft, FileText, FileDown, Globe, ShieldCheck, Briefcase, GitBranch, Calculator, Presentation, Network, BarChart3, Link2 } from 'lucide-react'
import { exportHtml } from '../utils/exportHtml'
import { exportMarkdown } from '../utils/exportMarkdown'
import { exportPdf, type PdfTheme } from '../utils/exportPdf'
import { createShareLink } from '../utils/shareDocument'
import { exportPptx } from '../utils/exportPptx'
import { useToast } from '../hooks/useToast'
import { getSelectedTemplate, getSelectedTemplateId } from '../utils/pptxTemplateStore'
import type { PptxTemplate } from '../types/pptxTemplate'

type AnalysisPanel = 'dashboard' | 'dependency' | 'validation' | 'executive' | 'scenario' | 'financial'

const PANEL_CONFIG: { key: AnalysisPanel; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'dashboard', label: '대시보드', icon: <BarChart3 className="w-4 h-4" />, color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-400' },
  { key: 'dependency', label: '의존성 맵', icon: <Network className="w-4 h-4" />, color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400' },
  { key: 'validation', label: '전략검증', icon: <ShieldCheck className="w-4 h-4" />, color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400' },
  { key: 'executive', label: '요약', icon: <Briefcase className="w-4 h-4" />, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' },
  { key: 'scenario', label: '시나리오', icon: <GitBranch className="w-4 h-4" />, color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400' },
  { key: 'financial', label: '재무', icon: <Calculator className="w-4 h-4" />, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' },
]

export default function PreviewPage() {
  const { state } = useStrategy()
  const navigate = useNavigate()
  const toast = useToast()
  useKeyboardShortcuts()
  const [activePanels, setActivePanels] = useState<Set<AnalysisPanel>>(new Set())
  const [highlightedFrameworks, setHighlightedFrameworks] = useState<Set<string>>(new Set())
  const [isPdfExporting, setIsPdfExporting] = useState(false)
  const [pdfTheme, setPdfTheme] = useState<PdfTheme>('light')
  const [isPptxExporting, setIsPptxExporting] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
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

  const handlePdf = async () => {
    setIsPdfExporting(true)
    try {
      await exportPdf(state, pdfTheme)
      toast.success('PDF 파일이 다운로드되었습니다.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'PDF 생성 중 오류가 발생했습니다.')
    } finally {
      setIsPdfExporting(false)
    }
  }

  const handleShare = async () => {
    setIsSharing(true)
    try {
      const result = await createShareLink(state)
      await navigator.clipboard.writeText(result.url)
      toast.success('공유 링크가 클립보드에 복사되었습니다.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '공유 링크 생성 중 오류가 발생했습니다.')
    } finally {
      setIsSharing(false)
    }
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

          {/* 공유 */}
          <button
            onClick={handleShare}
            disabled={isSharing}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
            title="공유 링크 생성"
          >
            {isSharing ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Link2 className="w-4 h-4" />
            )}
            공유
          </button>

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
          <div className="flex items-center">
            <button
              onClick={handlePdf}
              disabled={isPdfExporting}
              className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-l-lg transition-colors bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              title="PDF 내보내기"
            >
              {isPdfExporting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FileDown className="w-4 h-4" />
              )}
              PDF
            </button>
            <select
              value={pdfTheme}
              onChange={(e) => setPdfTheme(e.target.value as PdfTheme)}
              className="h-[34px] px-1.5 text-xs bg-red-700 text-white border-l border-red-500 rounded-r-lg cursor-pointer focus:outline-none hover:bg-red-800"
              title="PDF 테마"
            >
              <option value="light">☀️</option>
              <option value="dark">🌙</option>
            </select>
          </div>
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
        {activePanels.has('dashboard') && <AnalysisDashboard />}
        {activePanels.has('dependency') && <FrameworkDAG />}
        {activePanels.has('executive') && <ExecutiveSummaryPanel />}
        {activePanels.has('validation') && <ConsistencyPanel onHighlightChange={setHighlightedFrameworks} />}
        {activePanels.has('scenario') && <ScenarioPanel />}
        {activePanels.has('financial') && <FinancialPanel />}
      </div>

      {/* 문서 미리보기 */}
      <DocumentPreview state={state} highlightedFrameworks={highlightedFrameworks} />
    </div>
  )
}
