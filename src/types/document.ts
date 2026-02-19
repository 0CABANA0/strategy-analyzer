import type { FrameworkData } from './framework'
import type { RecommendationResult } from './recommendation'

export type FrameworkStatus = 'empty' | 'generating' | 'completed' | 'error'

export interface FrameworkState {
  status: FrameworkStatus
  data: FrameworkData | null
  updatedAt: string | null
  error?: string
}

export interface StrategyDocument {
  id: string
  businessItem: string
  createdAt: string
  updatedAt: string
  currentStep: number
  frameworks: Record<string, FrameworkState>
  recommendation?: RecommendationResult
}

export interface DocumentMeta {
  id: string
  businessItem: string
  createdAt: string
  updatedAt: string
}

export interface StepProgress {
  total: number
  completed: number
  percent: number
}
