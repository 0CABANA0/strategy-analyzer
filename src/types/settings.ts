export interface ModelDefinition {
  id: string
  name: string
  provider: string
  category: 'best-value' | 'premium' | 'budget'
  context: string
  inputPrice: number
  outputPrice: number
  badge?: string
  description: string
}

export interface ModelCategory {
  id: 'best-value' | 'premium' | 'budget'
  label: string
  description: string
}

export interface Settings {
  model: string
  language: string
  temperature: number
  maxTokens: number
}
