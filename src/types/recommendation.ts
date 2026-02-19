import type { FrameworkId } from './framework'

export interface FrameworkRecommendation {
  id: FrameworkId
  reason: string
  description: string
  score: number
}

export interface RecommendationResult {
  essential: FrameworkRecommendation[]
  recommended: FrameworkRecommendation[]
  optional: FrameworkRecommendation[]
}
