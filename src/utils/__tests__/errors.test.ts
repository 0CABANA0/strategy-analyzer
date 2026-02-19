import { describe, it, expect } from 'vitest'
import {
  ApiError,
  NetworkError,
  RateLimitError,
  AuthError,
  JsonParseError,
  getUserFriendlyMessage,
} from '../../utils/errors'

describe('ApiError', () => {
  it('statusCode와 retryable 속성을 갖는다', () => {
    const error = new ApiError('서버 오류', 500, true)
    expect(error.message).toBe('서버 오류')
    expect(error.statusCode).toBe(500)
    expect(error.retryable).toBe(true)
    expect(error.name).toBe('ApiError')
  })

  it('retryable 기본값은 false이다', () => {
    const error = new ApiError('오류 발생')
    expect(error.retryable).toBe(false)
  })

  it('Error를 상속한다', () => {
    const error = new ApiError('테스트')
    expect(error).toBeInstanceOf(Error)
  })
})

describe('NetworkError', () => {
  it('retryable이 true이다', () => {
    const error = new NetworkError()
    expect(error.retryable).toBe(true)
  })

  it('기본 메시지가 설정된다', () => {
    const error = new NetworkError()
    expect(error.message).toBe('네트워크 연결을 확인해 주세요.')
  })

  it('name이 NetworkError이다', () => {
    const error = new NetworkError()
    expect(error.name).toBe('NetworkError')
  })

  it('ApiError를 상속한다', () => {
    const error = new NetworkError()
    expect(error).toBeInstanceOf(ApiError)
  })
})

describe('RateLimitError', () => {
  it('retryable이 true이다', () => {
    const error = new RateLimitError()
    expect(error.retryable).toBe(true)
  })

  it('statusCode가 429이다', () => {
    const error = new RateLimitError()
    expect(error.statusCode).toBe(429)
  })

  it('기본 retryAfterMs가 5000이다', () => {
    const error = new RateLimitError()
    expect(error.retryAfterMs).toBe(5000)
  })

  it('커스텀 retryAfterMs를 설정할 수 있다', () => {
    const error = new RateLimitError(10000)
    expect(error.retryAfterMs).toBe(10000)
  })

  it('name이 RateLimitError이다', () => {
    const error = new RateLimitError()
    expect(error.name).toBe('RateLimitError')
  })
})

describe('AuthError', () => {
  it('retryable이 false이다', () => {
    const error = new AuthError()
    expect(error.retryable).toBe(false)
  })

  it('statusCode가 401이다', () => {
    const error = new AuthError()
    expect(error.statusCode).toBe(401)
  })

  it('name이 AuthError이다', () => {
    const error = new AuthError()
    expect(error.name).toBe('AuthError')
  })
})

describe('JsonParseError', () => {
  it('rawResponse를 저장한다', () => {
    const error = new JsonParseError('파싱 실패', '잘못된 JSON 텍스트')
    expect(error.rawResponse).toBe('잘못된 JSON 텍스트')
    expect(error.message).toBe('파싱 실패')
    expect(error.name).toBe('JsonParseError')
  })

  it('Error를 상속한다', () => {
    const error = new JsonParseError('테스트', 'raw')
    expect(error).toBeInstanceOf(Error)
  })
})

describe('getUserFriendlyMessage', () => {
  it('AuthError에 대해 올바른 한글 메시지를 반환한다', () => {
    const error = new AuthError()
    const message = getUserFriendlyMessage(error)
    expect(message).toBe('API 키가 유효하지 않습니다. 설정에서 확인해 주세요.')
  })

  it('RateLimitError에 대해 올바른 한글 메시지를 반환한다', () => {
    const error = new RateLimitError()
    const message = getUserFriendlyMessage(error)
    expect(message).toBe('API 요청 한도를 초과했습니다. 잠시 후 다시 시도됩니다.')
  })

  it('NetworkError에 대해 올바른 한글 메시지를 반환한다', () => {
    const error = new NetworkError()
    const message = getUserFriendlyMessage(error)
    expect(message).toBe('네트워크 연결을 확인해 주세요.')
  })

  it('JsonParseError에 대해 올바른 한글 메시지를 반환한다', () => {
    const error = new JsonParseError('파싱 오류', '원본')
    const message = getUserFriendlyMessage(error)
    expect(message).toBe('AI 응답을 처리하는 중 오류가 발생했습니다. 다시 시도해 주세요.')
  })

  it('일반 ApiError에 대해 "API 오류:" 접두사 메시지를 반환한다', () => {
    const error = new ApiError('서버 응답 없음', 500)
    const message = getUserFriendlyMessage(error)
    expect(message).toBe('API 오류: 서버 응답 없음')
  })

  it('일반 Error에 대해 error.message를 반환한다', () => {
    const error = new Error('일반 오류')
    const message = getUserFriendlyMessage(error)
    expect(message).toBe('일반 오류')
  })

  it('알 수 없는 타입에 대해 기본 메시지를 반환한다', () => {
    const message = getUserFriendlyMessage('문자열 에러')
    expect(message).toBe('알 수 없는 오류가 발생했습니다.')
  })
})
