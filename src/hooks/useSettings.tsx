import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { DEFAULT_MODEL } from '../data/modelDefinitions'
import { supabase } from '../lib/supabase'
import type { Settings } from '../types'

interface SettingsContextValue {
  settings: Settings
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  updateGlobalModel: (model: string) => Promise<{ error: string | null }>
  isModelLoading: boolean
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
  const [globalModel, setGlobalModel] = useState<string>(DEFAULT_MODEL)
  const [isModelLoading, setIsModelLoading] = useState(true)

  // Supabase에서 전역 모델 설정 가져오기
  useEffect(() => {
    let cancelled = false
    async function fetchGlobalModel() {
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', 'ai_model')
          .single()
        if (!cancelled && !error && data) {
          const model = typeof data.value === 'string' ? data.value : String(data.value)
          setGlobalModel(model)
        }
      } catch {
        // fetch 실패 시 DEFAULT_MODEL 폴백 유지
      } finally {
        if (!cancelled) setIsModelLoading(false)
      }
    }
    fetchGlobalModel()
    return () => { cancelled = true }
  }, [])

  // 기존 저장 데이터에 새 필드가 없을 수 있으므로 기본값과 병합
  // model은 항상 전역 설정 값을 사용
  const settings = useMemo(
    () => ({ ...DEFAULT_SETTINGS, ...rawSettings, model: globalModel }),
    [rawSettings, globalModel],
  )

  // 브라우저 LocalStorage에 저장된 키 (fallback)
  const [browserApiKey, setBrowserApiKey] = useLocalStorage<string>('openrouter-api-key', '')

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    // model 변경은 localStorage에 저장하지 않음 (전역 설정으로 관리)
    if (key === 'model') return
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  // 관리자 전용: Supabase에 전역 모델 upsert
  const updateGlobalModel = useCallback(async (model: string): Promise<{ error: string | null }> => {
    const { error } = await supabase
      .from('app_settings')
      .upsert(
        { key: 'ai_model', value: model, updated_at: new Date().toISOString() },
        { onConflict: 'key' },
      )
    if (error) return { error: error.message }
    setGlobalModel(model)
    return { error: null }
  }, [])

  const apiKey = useMemo(() => {
    // 우선순위: .env > LocalStorage
    return getEnvApiKey() || browserApiKey
  }, [browserApiKey])

  const hasApiKey = () => !!apiKey

  const value: SettingsContextValue = {
    settings,
    updateSetting,
    updateGlobalModel,
    isModelLoading,
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
