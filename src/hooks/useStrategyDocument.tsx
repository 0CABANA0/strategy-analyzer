import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { FRAMEWORKS } from '../data/frameworkDefinitions'
import { SECTIONS } from '../data/sectionDefinitions'
import type { StrategyDocument, FrameworkState, StepProgress, RecommendationResult } from '../types'

const STORAGE_PREFIX = 'strategy-analyzer:'

// --- Document Action Discriminated Union ---
type DocumentAction =
  | { type: 'INIT_DOCUMENT'; payload: string }
  | { type: 'LOAD_DOCUMENT'; payload: StrategyDocument }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_FRAMEWORK_GENERATING'; payload: string }
  | { type: 'SET_FRAMEWORK_DATA'; payload: { id: string; data: Record<string, unknown> } }
  | { type: 'SET_FRAMEWORK_ERROR'; payload: { id: string; error: string } }
  | { type: 'CLEAR_FRAMEWORK'; payload: string }
  | { type: 'UPDATE_FRAMEWORK_FIELD'; payload: { id: string; field: string; value: unknown } }
  | { type: 'SET_RECOMMENDATION'; payload: RecommendationResult }

// --- Context Value Interface ---
interface StrategyContextValue {
  state: StrategyDocument
  dispatch: React.Dispatch<DocumentAction>
  initDocument: (businessItem: string) => void
  loadDocument: (doc: StrategyDocument) => void
  setStep: (step: number) => void
  setFrameworkGenerating: (id: string) => void
  setFrameworkData: (id: string, data: Record<string, unknown>) => void
  setFrameworkError: (id: string, error: string) => void
  clearFramework: (id: string) => void
  updateFrameworkField: (id: string, field: string, value: unknown) => void
  getStepProgress: (stepNumber: number) => StepProgress
  getTotalProgress: () => StepProgress
  getFrameworkContext: (frameworkId: string) => Record<string, { name: string; data: unknown }>
  setRecommendation: (result: RecommendationResult) => void
}

// --- Initial State ---
function createEmptyDocument(businessItem: string = ''): StrategyDocument {
  const frameworks: Record<string, FrameworkState> = {}
  for (const key of Object.keys(FRAMEWORKS)) {
    frameworks[key] = { status: 'empty', data: null, updatedAt: null }
  }
  return {
    id: uuidv4(),
    businessItem,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currentStep: 1,
    frameworks,
  }
}

// --- Reducer ---
function documentReducer(state: StrategyDocument, action: DocumentAction): StrategyDocument {
  switch (action.type) {
    case 'INIT_DOCUMENT':
      return createEmptyDocument(action.payload)

    case 'LOAD_DOCUMENT':
      return action.payload

    case 'SET_STEP':
      return { ...state, currentStep: action.payload, updatedAt: new Date().toISOString() }

    case 'SET_FRAMEWORK_GENERATING':
      return {
        ...state,
        frameworks: {
          ...state.frameworks,
          [action.payload]: { ...state.frameworks[action.payload], status: 'generating' },
        },
      }

    case 'SET_FRAMEWORK_DATA':
      return {
        ...state,
        updatedAt: new Date().toISOString(),
        frameworks: {
          ...state.frameworks,
          [action.payload.id]: {
            status: 'completed' as const,
            data: action.payload.data as unknown as FrameworkState['data'],
            updatedAt: new Date().toISOString(),
          },
        },
      }

    case 'SET_FRAMEWORK_ERROR':
      return {
        ...state,
        frameworks: {
          ...state.frameworks,
          [action.payload.id]: {
            ...state.frameworks[action.payload.id],
            status: 'error',
            error: action.payload.error,
          },
        },
      }

    case 'CLEAR_FRAMEWORK':
      return {
        ...state,
        updatedAt: new Date().toISOString(),
        frameworks: {
          ...state.frameworks,
          [action.payload]: { status: 'empty', data: null, updatedAt: null },
        },
      }

    case 'UPDATE_FRAMEWORK_FIELD':
      return {
        ...state,
        updatedAt: new Date().toISOString(),
        frameworks: {
          ...state.frameworks,
          [action.payload.id]: {
            ...state.frameworks[action.payload.id],
            status: 'completed' as const,
            data: {
              ...(state.frameworks[action.payload.id]?.data as unknown as Record<string, unknown>),
              [action.payload.field]: action.payload.value,
            } as unknown as FrameworkState['data'],
            updatedAt: new Date().toISOString(),
          },
        },
      }

    case 'SET_RECOMMENDATION':
      return { ...state, recommendation: action.payload, updatedAt: new Date().toISOString() }

    default:
      return state
  }
}

// --- Context ---
const StrategyContext = createContext<StrategyContextValue | null>(null)

export function StrategyProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(documentReducer, null, (): StrategyDocument => {
    // 마지막 작업 문서 복원 시도
    try {
      const lastId = localStorage.getItem(STORAGE_PREFIX + 'lastDocId')
      if (lastId) {
        const stored = localStorage.getItem(STORAGE_PREFIX + 'doc:' + lastId)
        if (stored) return JSON.parse(stored) as StrategyDocument
      }
    } catch { /* ignore */ }
    return createEmptyDocument()
  })

  // 자동 저장
  useEffect(() => {
    if (!state?.id) return
    try {
      localStorage.setItem(STORAGE_PREFIX + 'doc:' + state.id, JSON.stringify(state))
      localStorage.setItem(STORAGE_PREFIX + 'lastDocId', state.id)
    } catch (e) {
      console.warn('자동 저장 실패:', e)
    }
  }, [state])

  // --- Actions ---
  const initDocument = useCallback((businessItem: string) => {
    dispatch({ type: 'INIT_DOCUMENT', payload: businessItem })
  }, [])

  const loadDocument = useCallback((doc: StrategyDocument) => {
    dispatch({ type: 'LOAD_DOCUMENT', payload: doc })
  }, [])

  const setStep = useCallback((step: number) => {
    dispatch({ type: 'SET_STEP', payload: step })
  }, [])

  const setFrameworkGenerating = useCallback((id: string) => {
    dispatch({ type: 'SET_FRAMEWORK_GENERATING', payload: id })
  }, [])

  const setFrameworkData = useCallback((id: string, data: Record<string, unknown>) => {
    dispatch({ type: 'SET_FRAMEWORK_DATA', payload: { id, data } })
  }, [])

  const setFrameworkError = useCallback((id: string, error: string) => {
    dispatch({ type: 'SET_FRAMEWORK_ERROR', payload: { id, error } })
  }, [])

  const clearFramework = useCallback((id: string) => {
    dispatch({ type: 'CLEAR_FRAMEWORK', payload: id })
  }, [])

  const updateFrameworkField = useCallback((id: string, field: string, value: unknown) => {
    dispatch({ type: 'UPDATE_FRAMEWORK_FIELD', payload: { id, field, value } })
  }, [])

  const setRecommendation = useCallback((result: RecommendationResult) => {
    dispatch({ type: 'SET_RECOMMENDATION', payload: result })
  }, [])

  // --- Computed ---
  const getStepProgress = useCallback((stepNumber: number): StepProgress => {
    const section = SECTIONS.find((s) => s.number === stepNumber)
    if (!section || !state) return { total: 0, completed: 0, percent: 0 }
    const total = section.frameworks.length
    const completed = section.frameworks.filter(
      (fId: string) => state.frameworks[fId]?.status === 'completed'
    ).length
    return { total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 }
  }, [state])

  const getTotalProgress = useCallback((): StepProgress => {
    if (!state) return { total: 0, completed: 0, percent: 0 }
    const ids = Object.keys(FRAMEWORKS)
    const total = ids.length
    const completed = ids.filter((id) => state.frameworks[id]?.status === 'completed').length
    return { total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 }
  }, [state])

  const getFrameworkContext = useCallback((frameworkId: string): Record<string, { name: string; data: unknown }> => {
    if (!state) return {}
    const context: Record<string, { name: string; data: unknown }> = {}
    const fw = FRAMEWORKS[frameworkId as keyof typeof FRAMEWORKS]
    if (!fw) return context
    // 이전 섹션의 완료된 프레임워크 결과를 컨텍스트로 수집
    for (const [id, fState] of Object.entries(state.frameworks)) {
      if (id === frameworkId) continue
      if (fState.status === 'completed' && fState.data) {
        const def = FRAMEWORKS[id as keyof typeof FRAMEWORKS]
        if (def && def.section <= fw.section) {
          context[id] = { name: def.name, data: fState.data }
        }
      }
    }
    return context
  }, [state])

  const value: StrategyContextValue = {
    state,
    dispatch,
    initDocument,
    loadDocument,
    setStep,
    setFrameworkGenerating,
    setFrameworkData,
    setFrameworkError,
    clearFramework,
    updateFrameworkField,
    setRecommendation,
    getStepProgress,
    getTotalProgress,
    getFrameworkContext,
  }

  return (
    <StrategyContext.Provider value={value}>
      {children}
    </StrategyContext.Provider>
  )
}

export function useStrategy(): StrategyContextValue {
  const ctx = useContext(StrategyContext)
  if (!ctx) throw new Error('useStrategy must be used within StrategyProvider')
  return ctx
}
