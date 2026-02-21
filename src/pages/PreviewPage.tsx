import { useNavigate } from 'react-router-dom'
import { useStrategy } from '../hooks/useStrategyDocument'
import DocumentPreview from '../components/preview/DocumentPreview'
import { ArrowLeft, FileText, Globe } from 'lucide-react'
import { exportHtml } from '../utils/exportHtml'
import { exportMarkdown } from '../utils/exportMarkdown'

export default function PreviewPage() {
  const { state } = useStrategy()
  const navigate = useNavigate()

  if (!state?.businessItem) {
    navigate('/', { replace: true })
    return null
  }

  const handleHtml = () => {
    exportHtml(state)
  }

  const handleMarkdown = () => {
    exportMarkdown(state)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6 no-print">
        <button
          onClick={() => navigate('/analyzer')}
          className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <ArrowLeft className="w-4 h-4" />
          분석으로 돌아가기
        </button>
        <div className="flex gap-2">
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
        </div>
      </div>

      <DocumentPreview state={state} />
    </div>
  )
}
