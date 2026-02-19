import { ApiError, RateLimitError } from './errors'

interface RetryOptions {
  maxRetries: number
  baseDelayMs: number
  maxDelayMs: number
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxRetries: 2,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const { maxRetries, baseDelayMs, maxDelayMs } = { ...DEFAULT_OPTIONS, ...options }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      const isRetryable = error instanceof ApiError && error.retryable
      const isLastAttempt = attempt === maxRetries

      if (!isRetryable || isLastAttempt) throw error

      if (error instanceof RateLimitError) {
        await sleep(error.retryAfterMs)
      } else {
        const delay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs)
        await sleep(delay)
      }
    }
  }
  throw new Error('재시도 횟수 초과')
}
