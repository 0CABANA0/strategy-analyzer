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
  skyworkApiKey: string
  updateSkyworkApiKey: (key: string) => Promise<{ error: string | null }>
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

/** .env 에서 Skywork API 키 읽기 */
function getEnvSkyworkApiKey(): string {
  return import.meta.env.VITE_SKYWORK_API_KEY || ''
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [rawSettings, setSettings] = useLocalStorage<Settings>('settings', DEFAULT_SETTINGS)
  const [globalModel, setGlobalModel] = useState<string>(DEFAULT_MODEL)
  const [isModelLoading, setIsModelLoading] = useState(true)
  const [dbSkyworkApiKey, setDbSkyworkApiKey] = useState<string>('')

  // Supabase에서 전역 모델 설정 가져오기
  useEffect(() => {
    let cancelled = false
    async function fetchGlobalSettings() {
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('key, value')
          .in('key', ['ai_model', 'skywork_api_key'])
        if (!cancelled && !error && data) {
          for (const row of data) {
            if (row.key === 'ai_model') {
              const model = typeof row.value === 'string' ? row.value : String(row.value)
              setGlobalModel(model)
            } else if (row.key === 'skywork_api_key') {
              const key = typeof row.value === 'string' ? row.value : String(row.value)
              setDbSkyworkApiKey(key)
            }
          }
        }
      } catch {
        // fetch 실패 시 폴백 유지
      } finally {
        if (!cancelled) setIsModelLoading(false)
      }
    }
    fetchGlobalSettings()
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

  // Skywork API 키: 환경변수 > Supabase app_settings
  const skyworkApiKey = useMemo(() => getEnvSkyworkApiKey() || dbSkyworkApiKey, [dbSkyworkApiKey])

  const apiKey = useMemo(() => {
    // 우선순위: .env > LocalStorage
    return getEnvApiKey() || browserApiKey
  }, [browserApiKey])

  const hasApiKey = () => !!apiKey

  // 관리자 전용: Skywork API 키 upsert
  const updateSkyworkApiKey = useCallback(async (key: string): Promise<{ error: string | null }> => {
    const { error } = await supabase
      .from('app_settings')
      .upsert(
        { key: 'skywork_api_key', value: key, updated_at: new Date().toISOString() },
        { onConflict: 'key' },
      )
    if (error) return { error: error.message }
    setDbSkyworkApiKey(key)
    return { error: null }
  }, [])

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
    skyworkApiKey,
    updateSkyworkApiKey,
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
