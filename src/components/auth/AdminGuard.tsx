import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { Loader2 } from 'lucide-react'
import { useEffect, useRef } from 'react'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAdmin } = useAuth()
  const toast = useToast()
  const warned = useRef(false)

  useEffect(() => {
    if (!isLoading && user && !isAdmin && !warned.current) {
      warned.current = true
      toast.warning('관리자 권한이 필요합니다.')
    }
  }, [isLoading, user, isAdmin, toast])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
