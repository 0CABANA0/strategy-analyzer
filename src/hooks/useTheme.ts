import { useEffect, useCallback, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'

export type ThemeMode = 'light' | 'dark' | 'system'

interface UseThemeReturn {
  theme: ThemeMode
  setTheme: (mode: ThemeMode) => void
  isDark: boolean
}

export function useTheme(): UseThemeReturn {
  const [theme, setTheme] = useLocalStorage<ThemeMode>('theme', 'system')

  const isDark = useMemo(() => {
    if (theme === 'dark') return true
    if (theme === 'light') return false
    // system
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  }, [theme])

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [isDark])

  // system 모드일 때 OS 설정 변경 감시
  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('dark', e.matches)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const handleSetTheme = useCallback((mode: ThemeMode) => {
    setTheme(mode)
  }, [setTheme])

  return { theme, setTheme: handleSetTheme, isDark }
}
