import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { Brain, Loader2, LogIn } from 'lucide-react'

export default function LoginPage() {
  const { user, isLoading: authLoading, signIn } = useAuth()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
      </div>
    )
  }

  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.warning('이메일과 비밀번호를 입력해 주세요.')
      return
    }
    setIsSubmitting(true)
    const { error } = await signIn(email, password)
    setIsSubmitting(false)
    if (error) {
      toast.error(error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Brain className="w-10 h-10 text-primary-600 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">전략분석기</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">로그인하여 시작하세요</p>
        </div>

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

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
              placeholder="비밀번호"
              autoComplete="current-password"
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            로그인
          </button>
        </form>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4 space-y-1">
          <p>
            계정이 없으신가요?{' '}
            <Link to="/signup" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">
              회원가입
            </Link>
          </p>
          <p>
            <Link to="/forgot-password" className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 text-xs">
              비밀번호를 잊으셨나요?
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
