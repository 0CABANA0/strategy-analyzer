import type { ActivityLog as ActivityLogType } from '../../types'

const ACTION_LABEL: Record<string, string> = {
  sign_in: '로그인',
  sign_out: '로그아웃',
  ai_generate: 'AI 생성',
  document_save: '문서 저장',
}

function formatDate(d: string | null) {
  if (!d) return '-'
  return new Date(d).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })
}

interface ActivityLogProps {
  activities: (ActivityLogType & { email?: string })[]
}

export default function ActivityLog({ activities }: ActivityLogProps) {
  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">최근 활동</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700/50 text-left">
            <tr>
              <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300">시간</th>
              <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300">사용자</th>
              <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300">활동</th>
              <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300">상세</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {activities.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td className="px-4 py-2 text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(a.created_at)}</td>
                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{a.email}</td>
                <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{ACTION_LABEL[a.action] ?? a.action}</td>
                <td className="px-4 py-2 text-gray-400 text-xs font-mono">
                  {Object.keys(a.metadata).length > 0 ? JSON.stringify(a.metadata) : '-'}
                </td>
              </tr>
            ))}
            {activities.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                  활동 기록이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
