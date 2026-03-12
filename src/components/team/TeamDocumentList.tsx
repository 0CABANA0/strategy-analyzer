import { FileText, Clock } from 'lucide-react'
import type { TeamDocument } from '../../hooks/useTeam'

interface TeamDocumentListProps {
  documents: TeamDocument[]
}

export default function TeamDocumentList({ documents }: TeamDocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-gray-400 dark:text-gray-500">
        공유된 문서가 없습니다.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary-500" />
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {doc.businessItem}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                {doc.ownerName}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
            <Clock className="w-3 h-3" />
            {new Date(doc.updatedAt).toLocaleDateString('ko-KR')}
          </div>
        </div>
      ))}
    </div>
  )
}
