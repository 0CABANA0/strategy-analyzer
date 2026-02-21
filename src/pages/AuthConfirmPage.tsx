import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Loader2 } from 'lucide-react'

/**
 * 이메일 인증 확인 페이지 (token_hash 방식)
 * 이메일 템플릿에서 {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email 로 링크
 * SafeLinks 등 이메일 스캐너가 토큰을 선점 소비하는 문제를 방지
 */
export default function AuthConfirmPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const tokenHash = searchParams.get('token_hash')
    const type = searchParams.get('type') as 'email' | 'recovery' | 'invite' | undefined

    if (!tokenHash || !type) {
      setError('잘못된 인증 링크입니다.')
      setTimeout(() => navigate('/login', { replace: true }), 3000)
      return
    }

    supabase.auth.verifyOtp({ token_hash: tokenHash, type }).then(({ error }) => {
      if (error) {
        console.error('이메일 인증 실패:', error.message)
        setError(error.message)
        setTimeout(() => navigate('/login', { replace: true }), 3000)
      } else {
        navigate('/', { replace: true })
      }
    })
  }, [navigate, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        {error ? (
          <>
            <p className="text-sm text-red-500 mb-2">인증 오류: {error}</p>
            <p className="text-xs text-gray-400">로그인 페이지로 이동합니다...</p>
          </>
        ) : (
          <>
            <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">이메일 인증 확인 중...</p>
          </>
        )}
      </div>
    </div>
  )
}
