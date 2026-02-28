import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'
import type { User } from '@supabase/supabase-js'

interface AuthContextValue {
  user: Profile | null
  isLoading: boolean
  isAdmin: boolean
  isPremium: boolean
  signUp: (email: string, password: string) => Promise<{ error: string | null; needsVerification: boolean; confirmed: boolean }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  logActivity: (action: string, metadata?: Record<string, unknown>) => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function fetchProfile(userId: string, retries = 3): Promise<Profile | null> {
  for (let i = 0; i < retries; i++) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single<Profile>()
    if (!error && data) return data
    // 트리거가 프로필을 아직 생성하지 못했을 수 있으므로 재시도
    if (i < retries - 1) await new Promise(r => setTimeout(r, 500))
  }
  console.error('프로필 조회 실패: retries exhausted for', userId)
  return null
}

async function updateLastSignIn(userId: string) {
  const { error } = await supabase
    .from('profiles')
    .update({ last_sign_in_at: new Date().toISOString() })
    .eq('id', userId)
  if (error) {
    console.error('last_sign_in_at 업데이트 실패:', error.message, error.code)
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const handleAuthUser = useCallback(async (authUser: User | null) => {
    if (!authUser) {
      setUser(null)
      setIsLoading(false)
      return
    }
    const profile = await fetchProfile(authUser.id)
    // suspended 사용자는 즉시 로그아웃
    if (profile?.status === 'suspended') {
      await supabase.auth.signOut()
      setUser(null)
      setIsLoading(false)
      return
    }
    setUser(profile)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthUser(session?.user ?? null)
    })

    // 인증 상태 변경 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuthUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [handleAuthUser])

  const logActivity = useCallback(async (action: string, metadata: Record<string, unknown> = {}) => {
    if (!user) return
    await supabase.from('activity_log').insert({
      user_id: user.id,
      action,
      metadata,
    })
  }, [user])

  const signUp = useCallback(async (email: string, password: string) => {
    const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/confirm`,
      },
    })
    if (error) return { error: error.message, needsVerification: false, confirmed: false }
    // autoconfirm이 켜져 있으면 session이 바로 반환됨
    const confirmed = !!data.session
    return { error: null, needsVerification: !confirmed, confirmed }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { error: error.message }

      if (data.user) {
        // 로그인 후 프로필 status 체크
        const profile = await fetchProfile(data.user.id, 1)
        if (profile?.status === 'suspended') {
          await supabase.auth.signOut()
          return { error: '계정이 정지되었습니다. 관리자에게 문의하세요.' }
        }
        // 비차단: 실패해도 로그인 흐름에 영향 없음
        updateLastSignIn(data.user.id).catch(() => {})
        supabase.from('activity_log').insert({
          user_id: data.user.id,
          action: 'sign_in',
          metadata: {},
        }).then()
      }
      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다.' }
    }
  }, [])

  const signOut = useCallback(async () => {
    if (user) {
      await logActivity('sign_out')
    }
    await supabase.auth.signOut()
    setUser(null)
  }, [user, logActivity])

  const refreshProfile = useCallback(async () => {
    if (!user) return
    const profile = await fetchProfile(user.id, 1)
    if (profile) setUser(profile)
  }, [user])

  const isAdmin = user?.role === 'admin'
  const isPremium = user?.is_premium === true || isAdmin

  return (
    <AuthContext.Provider value={{ user, isLoading, isAdmin, isPremium, signUp, signIn, signOut, logActivity, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
