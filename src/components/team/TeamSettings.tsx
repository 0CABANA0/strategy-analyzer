import { useState } from 'react'
import { UserPlus, X, Crown, User } from 'lucide-react'
import type { TeamMember } from '../../hooks/useTeam'

interface TeamSettingsProps {
  members: TeamMember[]
  onInvite: (email: string) => Promise<void>
  onRemove: (userId: string) => Promise<void>
}

export default function TeamSettings({ members, onInvite, onRemove }: TeamSettingsProps) {
  const [email, setEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInvite = async () => {
    if (!email.trim()) return
    setInviting(true)
    setError(null)
    try {
      await onInvite(email.trim())
      setEmail('')
    } catch (err) {
      setError(err instanceof Error ? err.message : '초대 실패')
    } finally {
      setInviting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* 멤버 초대 */}
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">멤버 초대</label>
        <div className="flex gap-2 mt-1">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일 주소"
            className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
            onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
          />
          <button
            onClick={handleInvite}
            disabled={inviting || !email.trim()}
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            초대
          </button>
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>

      {/* 멤버 목록 */}
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">멤버 ({members.length}명)</label>
        <div className="mt-2 space-y-1">
          {members.map((m) => (
            <div key={m.userId} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-2">
                {m.role === 'owner' ? (
                  <Crown className="w-4 h-4 text-amber-500" />
                ) : (
                  <User className="w-4 h-4 text-gray-400" />
                )}
                <div>
                  <div className="text-sm text-gray-800 dark:text-gray-200">{m.displayName || m.email}</div>
                  {m.displayName && (
                    <div className="text-xs text-gray-400">{m.email}</div>
                  )}
                </div>
              </div>
              {m.role !== 'owner' && (
                <button
                  onClick={() => onRemove(m.userId)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  title="멤버 제거"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
