import { useState } from 'react'
import { useToast } from '../../hooks/useToast'
import { supabase } from '../../lib/supabase'
import { Lock, Loader2 } from 'lucide-react'

export default function PasswordSection() {
  const toast = useToast()
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  const handleChangePassword = async () => {
    if (!newPassword) {
      toast.warning('새 비밀번호를 입력해 주세요.')
      return
    }
    if (newPassword.length < 6) {
      toast.warning('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }
    if (newPassword !== confirmNewPassword) {
      toast.warning('비밀번호가 일치하지 않습니다.')
      return
    }
    setChangingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setChangingPassword(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('비밀번호가 변경되었습니다.')
      setNewPassword('')
      setConfirmNewPassword('')
    }
  }

  return (
    <div className="p-5">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        <Lock className="w-4 h-4" />
        비밀번호 변경
      </label>
      <div className="space-y-3">
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="새 비밀번호 (최소 6자)"
          autoComplete="new-password"
          disabled={changingPassword}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
        />
        <input
          type="password"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          placeholder="새 비밀번호 확인"
          autoComplete="new-password"
          disabled={changingPassword}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
        />
        <button
          onClick={handleChangePassword}
          disabled={changingPassword}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
          비밀번호 변경
        </button>
      </div>
    </div>
  )
}
