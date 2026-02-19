export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly retryable: boolean = false
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class NetworkError extends ApiError {
  constructor(message: string = '네트워크 연결을 확인해 주세요.') {
    super(message, undefined, true)
    this.name = 'NetworkError'
  }
}

export class RateLimitError extends ApiError {
  constructor(public readonly retryAfterMs: number = 5000) {
    super('API 요청 한도를 초과했습니다. 잠시 후 다시 시도됩니다.', 429, true)
    this.name = 'RateLimitError'
  }
}

export class AuthError extends ApiError {
  constructor() {
    super('API 키가 유효하지 않습니다. 설정에서 확인해 주세요.', 401, false)
    this.name = 'AuthError'
  }
}

export class JsonParseError extends Error {
  constructor(message: string, public readonly rawResponse: string) {
    super(message)
    this.name = 'JsonParseError'
  }
}

export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof AuthError) return error.message
  if (error instanceof RateLimitError) return error.message
  if (error instanceof NetworkError) return error.message
  if (error instanceof JsonParseError) return 'AI 응답을 처리하는 중 오류가 발생했습니다. 다시 시도해 주세요.'
  if (error instanceof ApiError) return `API 오류: ${error.message}`
  if (error instanceof Error) return error.message
  return '알 수 없는 오류가 발생했습니다.'
}
