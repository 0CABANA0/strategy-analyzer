import { renderHook } from '@testing-library/react'
import React from 'react'
import { AuthProvider, useAuth } from '../useAuth'

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      updateUser: vi.fn(),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
      insert: vi.fn().mockReturnValue({ then: vi.fn() }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    }),
  },
}))

function Wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

describe('useAuth', () => {
  it('starts with null user and loading', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper })
    expect(result.current.user).toBeNull()
  })

  it('provides isAdmin as false when no user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper })
    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.isAdmin).toBe(false)
  })

  it('provides signUp function', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper })
    expect(typeof result.current.signUp).toBe('function')
  })

  it('provides signIn function', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper })
    expect(typeof result.current.signIn).toBe('function')
  })

  it('provides signOut function', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper })
    expect(typeof result.current.signOut).toBe('function')
  })

  it('provides logActivity function', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper })
    expect(typeof result.current.logActivity).toBe('function')
  })

  it('provides refreshProfile function', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper })
    expect(typeof result.current.refreshProfile).toBe('function')
  })
})
