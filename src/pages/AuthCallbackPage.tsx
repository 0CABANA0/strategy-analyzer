import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      // PKCE 흐름: URL 쿼리에서 code 파라미터 추출
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          console.error('세션 교환 실패:', error.message)
          setError(error.message)
          setTimeout(() => navigate('/login', { replace: true }), 3000)
          return
        }
        navigate('/', { replace: true })
        return
      }

      // hash fragment 흐름 (레거시): onAuthStateChange가 자동 처리
      // 약간의 대기 후 세션 확인
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        navigate('/', { replace: true })
      } else {
        // hash에 토큰이 있을 수 있으므로 잠시 대기
        setTimeout(async () => {
          const { data: { session: retrySession } } = await supabase.auth.getSession()
          navigate(retrySession ? '/' : '/login', { replace: true })
        }, 1000)
      }
    }

    handleCallback()
  }, [navigate])

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
            <p className="text-sm text-gray-500 dark:text-gray-400">인증 확인 중...</p>
          </>
        )}
      </div>
    </div>
  )
}
