import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  recordMetric,
  getEstimatedDuration,
  getEstimatedTotalDuration,
  clearMetrics,
  STORAGE_KEY,
  DEFAULT_DURATION_MS,
} from '../generationMetrics'

describe('generationMetrics', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('recordMetric', () => {
    it('새 메트릭을 저장한다', () => {
      recordMetric({ frameworkId: 'pest', model: 'gpt-4', durationMs: 12000 })

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      expect(stored['pest:gpt-4']).toHaveLength(1)
      expect(stored['pest:gpt-4'][0].durationMs).toBe(12000)
    })

    it('같은 키에 여러 메트릭을 누적한다', () => {
      recordMetric({ frameworkId: 'pest', model: 'gpt-4', durationMs: 10000 })
      recordMetric({ frameworkId: 'pest', model: 'gpt-4', durationMs: 14000 })
      recordMetric({ frameworkId: 'pest', model: 'gpt-4', durationMs: 12000 })

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      expect(stored['pest:gpt-4']).toHaveLength(3)
    })

    it('최근 5회만 유지한다 (오래된 것부터 제거)', () => {
      for (let i = 1; i <= 7; i++) {
        recordMetric({ frameworkId: 'swot', model: 'gpt-4', durationMs: i * 1000 })
      }

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      expect(stored['swot:gpt-4']).toHaveLength(5)
      // 가장 오래된 1000, 2000이 제거되고 3000~7000이 남아야 함
      expect(stored['swot:gpt-4'][0].durationMs).toBe(3000)
      expect(stored['swot:gpt-4'][4].durationMs).toBe(7000)
    })

    it('다른 프레임워크/모델은 독립적으로 관리한다', () => {
      recordMetric({ frameworkId: 'pest', model: 'gpt-4', durationMs: 10000 })
      recordMetric({ frameworkId: 'swot', model: 'gpt-4', durationMs: 20000 })
      recordMetric({ frameworkId: 'pest', model: 'claude', durationMs: 15000 })

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      expect(Object.keys(stored)).toHaveLength(3)
      expect(stored['pest:gpt-4']).toHaveLength(1)
      expect(stored['swot:gpt-4']).toHaveLength(1)
      expect(stored['pest:claude']).toHaveLength(1)
    })

    it('localStorage 쓰기 실패 시 에러를 던지지 않는다', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceeded')
      })

      expect(() => {
        recordMetric({ frameworkId: 'pest', model: 'gpt-4', durationMs: 10000 })
      }).not.toThrow()
    })
  })

  describe('getEstimatedDuration', () => {
    it('데이터가 없으면 기본값을 반환한다', () => {
      const duration = getEstimatedDuration('pest', 'gpt-4')
      expect(duration).toBe(DEFAULT_DURATION_MS)
    })

    it('저장된 메트릭의 평균을 반환한다', () => {
      recordMetric({ frameworkId: 'pest', model: 'gpt-4', durationMs: 10000 })
      recordMetric({ frameworkId: 'pest', model: 'gpt-4', durationMs: 20000 })

      const duration = getEstimatedDuration('pest', 'gpt-4')
      expect(duration).toBe(15000) // (10000 + 20000) / 2
    })

    it('단일 메트릭도 정상 동작한다', () => {
      recordMetric({ frameworkId: 'faw', model: 'claude', durationMs: 8500 })

      const duration = getEstimatedDuration('faw', 'claude')
      expect(duration).toBe(8500)
    })

    it('다른 모델의 데이터는 영향을 주지 않는다', () => {
      recordMetric({ frameworkId: 'pest', model: 'gpt-4', durationMs: 10000 })
      recordMetric({ frameworkId: 'pest', model: 'claude', durationMs: 30000 })

      expect(getEstimatedDuration('pest', 'gpt-4')).toBe(10000)
      expect(getEstimatedDuration('pest', 'claude')).toBe(30000)
    })
  })

  describe('getEstimatedTotalDuration', () => {
    it('여러 프레임워크의 예상 시간을 합산한다', () => {
      recordMetric({ frameworkId: 'pest', model: 'gpt-4', durationMs: 10000 })
      recordMetric({ frameworkId: 'swot', model: 'gpt-4', durationMs: 20000 })

      const total = getEstimatedTotalDuration(['pest', 'swot'], 'gpt-4')
      expect(total).toBe(30000) // 10000 + 20000
    })

    it('데이터가 없는 프레임워크는 기본값으로 합산한다', () => {
      recordMetric({ frameworkId: 'pest', model: 'gpt-4', durationMs: 10000 })

      const total = getEstimatedTotalDuration(['pest', 'faw'], 'gpt-4')
      expect(total).toBe(10000 + DEFAULT_DURATION_MS)
    })

    it('빈 배열이면 0을 반환한다', () => {
      expect(getEstimatedTotalDuration([], 'gpt-4')).toBe(0)
    })
  })

  describe('clearMetrics', () => {
    it('모든 메트릭을 제거한다', () => {
      recordMetric({ frameworkId: 'pest', model: 'gpt-4', durationMs: 10000 })
      recordMetric({ frameworkId: 'swot', model: 'claude', durationMs: 20000 })

      clearMetrics()

      expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
      // 클리어 후 기본값 반환 확인
      expect(getEstimatedDuration('pest', 'gpt-4')).toBe(DEFAULT_DURATION_MS)
    })
  })
})
