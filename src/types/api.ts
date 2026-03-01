/** 멀티모달 콘텐츠 블록 (텍스트 + 이미지) */
export type ContentBlock =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } }

/** user 필드: 문자열 또는 멀티모달 콘텐츠 블록 배열 */
export type UserContent = string | ContentBlock[]

export interface AiCallParams {
  apiKey: string
  model: string
  system: string
  user: UserContent
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
