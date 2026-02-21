export interface AiCallParams {
  apiKey: string
  model: string
  system: string
  user: string
  temperature?: number
  maxTokens?: number
  signal?: AbortSignal
}

export interface PromptResult {
  system: string
  user: string
}

export interface PromptContext {
  businessItem: string
  context: Record<string, { name: string; data: unknown }>
}

export type PromptTemplate = (params: PromptContext) => PromptResult

export interface OpenRouterChoice {
  message: {
    content: string
  }
}

export interface OpenRouterResponse {
  choices: OpenRouterChoice[]
}

export interface OpenRouterErrorBody {
  error?: {
    message?: string
    code?: string
  }
}
