import { describe, it, expect, vi } from 'vitest'
import { withRetry } from '../../utils/retry'
import { ApiError, RateLimitError } from '../../utils/errors'

describe('withRetry', () => {
  it('첫 번째 시도에서 성공하면 fn을 1번만 호출한다', async () => {
    const fn = vi.fn().mockResolvedValue('성공')

    const result = await withRetry(fn)

    expect(result).toBe('성공')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('retryable 에러 후 재시도하여 성공한다', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new ApiError('일시적 오류', 503, true))
      .mockResolvedValue('복구 성공')

    const result = await withRetry(fn, { baseDelayMs: 1, maxDelayMs: 1 })

    expect(result).toBe('복구 성공')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('retryable이 아닌 에러는 즉시 throw한다', async () => {
    const fn = vi
      .fn()
      .mockRejectedValue(new ApiError('인증 실패', 401, false))

    await expect(withRetry(fn, { baseDelayMs: 1 })).rejects.toThrow('인증 실패')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('최대 재시도 횟수 초과 시 마지막 에러를 throw한다', async () => {
    const fn = vi.fn().mockRejectedValue(new ApiError('서버 오류', 500, true))

    await expect(
      withRetry(fn, { maxRetries: 2, baseDelayMs: 1, maxDelayMs: 1 })
    ).rejects.toThrow('서버 오류')
    // 첫 시도(0) + 재시도 2번 = 총 3번 호출
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('RateLimitError일 때 retryAfterMs만큼 대기 후 재시도한다', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new RateLimitError(10))
      .mockResolvedValue('성공')

    const result = await withRetry(fn, { baseDelayMs: 1, maxDelayMs: 1 })

    expect(result).toBe('성공')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('일반 Error (ApiError 아닌)는 재시도하지 않는다', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('일반 오류'))

    await expect(withRetry(fn, { baseDelayMs: 1 })).rejects.toThrow('일반 오류')
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
