import React, { createContext, useContext, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { DEFAULT_MODEL } from '../data/modelDefinitions'
import type { Settings } from '../types'

interface SettingsContextValue {
  settings: Settings
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  apiKey: string
  browserApiKey: string
  setBrowserApiKey: (value: string | ((prev: string) => string)) => void
  hasApiKey: () => boolean
  envKeyExists: boolean
}

const DEFAULT_SETTINGS: Settings = {
  model: DEFAULT_MODEL,
  language: 'ko',
  temperature: 0.7,
  maxTokens: 8192,
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

/** .env 에서 API 키 읽기 (VITE_ 접두사 필수) */
function getEnvApiKey(): string {
  return import.meta.env.VITE_OPENROUTER_API_KEY || ''
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [rawSettings, setSettings] = useLocalStorage<Settings>('settings', DEFAULT_SETTINGS)
  // 기존 저장 데이터에 새 필드가 없을 수 있으므로 기본값과 병합
  const settings = useMemo(() => ({ ...DEFAULT_SETTINGS, ...rawSettings }), [rawSettings])
  // 브라우저 LocalStorage에 저장된 키 (fallback)
  const [browserApiKey, setBrowserApiKey] = useLocalStorage<string>('openrouter-api-key', '')

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const apiKey = useMemo(() => {
    // 우선순위: .env > LocalStorage
    return getEnvApiKey() || browserApiKey
  }, [browserApiKey])

  const hasApiKey = () => !!apiKey

  const value: SettingsContextValue = {
    settings,
    updateSetting,
    apiKey,
    browserApiKey,
    setBrowserApiKey,
    hasApiKey,
    envKeyExists: !!getEnvApiKey(),
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
