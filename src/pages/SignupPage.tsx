import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { Loader2, UserPlus, ArrowRight, ArrowLeft, User, Mail, Lock } from 'lucide-react'
import AppIcon from '../components/common/AppIcon'

const STEPS = [
  { label: '이름', icon: User },
  { label: '이메일', icon: Mail },
  { label: '비밀번호', icon: Lock },
] as const

const INPUT_CLASS =
  'w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors'

export default function SignupPage() {
  const { user, isLoading: authLoading, signUp } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
      </div>
    )
  }

  if (user) return <Navigate to="/" replace />

  const goNext = () => {
    if (step === 0) {
      // 이름은 선택이므로 바로 다음
      setStep(1)
    } else if (step === 1) {
      if (!email) {
        toast.warning('이메일을 입력해 주세요.')
        return
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast.warning('올바른 이메일 형식을 입력해 주세요.')
        return
      }
      setStep(2)
    }
  }

  const goBack = () => {
    if (step > 0) setStep(step - 1)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (step < 2) {
      goNext()
      return
    }

    if (!password) {
      toast.warning('비밀번호를 입력해 주세요.')
      return
    }
    if (password.length < 6) {
      toast.warning('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }
    if (password !== confirmPassword) {
      toast.warning('비밀번호가 일치하지 않습니다.')
      return
    }

    setIsSubmitting(true)
    const { error, needsVerification, confirmed } = await signUp(email, password, displayName.trim() || undefined)
    setIsSubmitting(false)

    if (error) {
      toast.error(error)
      return
    }
    if (confirmed) {
      toast.success('회원가입이 완료되었습니다!')
      navigate('/', { replace: true })
    } else if (needsVerification) {
      navigate('/verify-email')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <AppIcon className="w-10 h-10 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">회원가입</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">전략분석기를 시작하세요</p>
        </div>

        {/* 스텝 인디케이터 */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            const isActive = i === step
            const isDone = i < step
            return (
              <div key={s.label} className="flex items-center gap-2">
                {i > 0 && (
                  <div className={`w-8 h-px ${isDone ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                )}
                <button
                  type="button"
                  onClick={() => i < step && setStep(i)}
                  disabled={i > step}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                      : isDone
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 cursor-pointer'
                        : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-default'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {s.label}
                </button>
              </div>
            )
          })}
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          {/* Step 0: 이름 */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="display-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  이름
                </label>
                <input
                  id="display-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="홍길동"
                  autoComplete="name"
                  autoFocus
                />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">선택사항 — 관리자 대시보드에 표시됩니다.</p>
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
              >
                다음
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 1: 이메일 */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  이메일
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="you@example.com"
                  autoComplete="email"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={goBack}
                  className="flex items-center justify-center gap-1 py-2.5 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  이전
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                >
                  다음
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: 비밀번호 */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  비밀번호
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="최소 6자"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  비밀번호 확인
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="비밀번호 재입력"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-1 py-2.5 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  이전
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  회원가입
                </button>
              </div>
            </div>
          )}
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
