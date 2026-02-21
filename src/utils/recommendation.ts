import type { RecommendationResult, FrameworkRecommendation } from '../types'

export function getRecommendationInfo(
  frameworkId: string,
  recommendation?: RecommendationResult
): { level: 'essential' | 'recommended' | 'optional'; item: FrameworkRecommendation } | null {
  if (!recommendation) return null
  const essential = recommendation.essential.find((r) => r.id === frameworkId)
  if (essential) return { level: 'essential', item: essential }
  const recommended = recommendation.recommended.find((r) => r.id === frameworkId)
  if (recommended) return { level: 'recommended', item: recommended }
  const optional = recommendation.optional.find((r) => r.id === frameworkId)
  if (optional) return { level: 'optional', item: optional }
  return null
}
