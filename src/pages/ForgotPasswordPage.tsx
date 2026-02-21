import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useToast } from '../hooks/useToast'
import { Brain, Loader2, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.warning('이메일을 입력해 주세요.')
      return
    }
    setIsSubmitting(true)
    const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/reset-password`,
    })
    setIsSubmitting(false)
    if (error) {
      toast.error(error.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Brain className="w-10 h-10 text-primary-600 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">비밀번호 재설정</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">가입한 이메일로 재설정 링크를 보내드립니다</p>
        </div>

        {sent ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
            <Mail className="w-10 h-10 text-primary-500 mx-auto mb-3" />
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">재설정 링크를 발송했습니다.</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              <strong>{email}</strong> 의 받은편지함을 확인해 주세요.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                placeholder="you@example.com"
                autoComplete="email"
                disabled={isSubmitting}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              재설정 링크 발송
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          <Link to="/login" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">
            로그인으로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  )
}
