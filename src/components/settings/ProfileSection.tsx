import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { supabase } from '../../lib/supabase'
import { User, CheckCircle2, Loader2 } from 'lucide-react'

export default function ProfileSection() {
  const toast = useToast()
  const { user, refreshProfile } = useAuth()
  const [displayName, setDisplayName] = useState(user?.display_name ?? '')
  const [savingProfile, setSavingProfile] = useState(false)

  const handleSaveProfile = async () => {
    if (!user) return
    if (!displayName.trim()) {
      toast.warning('표시명을 입력해 주세요.')
      return
    }
    setSavingProfile(true)
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName.trim() })
      .eq('id', user.id)
    setSavingProfile(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('프로필이 저장되었습니다.')
      await refreshProfile()
    }
  }

  return (
    <div className="p-5">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        <User className="w-4 h-4" />
        프로필
      </label>
      {user && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
          이메일: <strong className="text-gray-600 dark:text-gray-300">{user.email}</strong>
          {user.role === 'admin' && (
            <span className="ml-2 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">관리자</span>
          )}
        </p>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="표시명"
          disabled={savingProfile}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
        />
        <button
          onClick={handleSaveProfile}
          disabled={savingProfile || displayName.trim() === (user?.display_name ?? '')}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          저장
        </button>
      </div>
    </div>
  )
}
