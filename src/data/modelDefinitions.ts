/**
 * OpenRouter 추천 모델 정의
 * 한국어 전략분석 + JSON 출력에 적합한 모델 선정
 */

import type { ModelDefinition, ModelCategory } from '../types'

export const MODEL_CATEGORIES: ModelCategory[] = [
  {
    id: 'best-value',
    label: '가성비 추천',
    description: '비용 대비 최고의 성능',
  },
  {
    id: 'premium',
    label: '프리미엄',
    description: '최고 품질의 분석',
  },
  {
    id: 'budget',
    label: '저비용',
    description: '대량 분석에 적합',
  },
]

export const MODELS: ModelDefinition[] = [
  // === 가성비 추천 ===
  {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    category: 'best-value',
    context: '1M',
    inputPrice: 0.30,
    outputPrice: 2.50,
    badge: '추천',
    description: '추론(thinking) 내장, 한국어 우수, 100만 토큰 컨텍스트. 최고 가성비',
  },
  {
    id: 'openai/gpt-4.1-mini',
    name: 'GPT-4.1 Mini',
    provider: 'OpenAI',
    category: 'best-value',
    context: '1M',
    inputPrice: 0.40,
    outputPrice: 1.60,
    description: 'GPT-4o급 성능의 경량판. 안정적 JSON 출력, 100만 토큰',
  },
  {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek V3',
    provider: 'DeepSeek',
    category: 'best-value',
    context: '164K',
    inputPrice: 0.30,
    outputPrice: 1.20,
    description: '지시사항 준수력 우수, 한국어 양호, 안정적 범용 모델',
  },

  // === 프리미엄 ===
  {
    id: 'google/gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro',
    provider: 'Google',
    category: 'premium',
    context: '1M',
    inputPrice: 1.25,
    outputPrice: 10.00,
    badge: '최신',
    description: '최신 Gemini 3.1 Pro. Thinking 기능, 최상위 벤치마크. 복잡한 전략 분석에 탁월',
  },
  {
    id: 'google/gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    category: 'premium',
    context: '1M',
    inputPrice: 1.25,
    outputPrice: 10.00,
    description: 'Thinking 기능, 최상위 벤치마크. 복잡한 전략 분석에 탁월',
  },
  {
    id: 'anthropic/claude-sonnet-4',
    name: 'Claude Sonnet 4',
    provider: 'Anthropic',
    category: 'premium',
    context: '1M',
    inputPrice: 3.00,
    outputPrice: 15.00,
    description: '정밀한 지시사항 준수, 한국어 자연스러움 최상급',
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    category: 'premium',
    context: '128K',
    inputPrice: 2.50,
    outputPrice: 10.00,
    description: '안정적 다국어 성능, JSON 구조화 출력 가장 성숙',
  },

  // === 저비용 ===
  {
    id: 'deepseek/deepseek-v3.2',
    name: 'DeepSeek V3.2',
    provider: 'DeepSeek',
    category: 'budget',
    context: '164K',
    inputPrice: 0.25,
    outputPrice: 0.38,
    badge: '최저가',
    description: '추론 기능 내장, 구조화 출력 지원. 대량 처리에 최적',
  },
  {
    id: 'deepseek/deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    category: 'budget',
    context: '64K',
    inputPrice: 0.70,
    outputPrice: 2.50,
    description: 'Chain-of-thought 추론 특화. 복잡한 논리 분석에 적합',
  },
]

export const DEFAULT_MODEL: string = 'google/gemini-3.1-pro-preview'

export function getModelById(id: string): ModelDefinition | undefined {
  return MODELS.find((m) => m.id === id)
}

export function getModelsByCategory(category: string): ModelDefinition[] {
  return MODELS.filter((m) => m.category === category)
}
