/**
 * AI 생성 시간 메트릭 저장/조회 유틸리티
 * 프레임워크별 × 모델별 최근 5회 이동 평균 기반 예상 시간 제공
 */

export const STORAGE_KEY = 'strategy-analyzer:gen-metrics'

/** 최대 보관 횟수 (이동 평균 윈도우) */
const MAX_ENTRIES = 5

/** 기본 예상 시간 (측정 데이터 없을 때) — 20초 */
export const DEFAULT_DURATION_MS = 20_000

interface MetricEntry {
  durationMs: number
  timestamp: string
}

/** frameworkId:model → MetricEntry[] */
type MetricsStore = Record<string, MetricEntry[]>

interface RecordMetricParams {
  frameworkId: string
  model: string
  durationMs: number
}

function loadStore(): MetricsStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveStore(store: MetricsStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    // localStorage 용량 초과 등 — 무시
  }
}

function makeKey(frameworkId: string, model: string): string {
  return `${frameworkId}:${model}`
}

/** 메트릭 기록 */
export function recordMetric({ frameworkId, model, durationMs }: RecordMetricParams): void {
  const store = loadStore()
  const key = makeKey(frameworkId, model)

  if (!store[key]) {
    store[key] = []
  }

  store[key].push({
    durationMs,
    timestamp: new Date().toISOString(),
  })

  // 최근 MAX_ENTRIES만 유지
  if (store[key].length > MAX_ENTRIES) {
    store[key] = store[key].slice(-MAX_ENTRIES)
  }

  saveStore(store)
}

/** 예상 시간 조회 (이동 평균) — 데이터 없으면 기본값 */
export function getEstimatedDuration(frameworkId: string, model: string): number {
  const store = loadStore()
  const key = makeKey(frameworkId, model)
  const entries = store[key]

  if (!entries || entries.length === 0) {
    return DEFAULT_DURATION_MS
  }

  const sum = entries.reduce((acc, e) => acc + e.durationMs, 0)
  return Math.round(sum / entries.length)
}

/** 프레임워크 목록의 예상 총시간 */
export function getEstimatedTotalDuration(frameworkIds: string[], model: string): number {
  return frameworkIds.reduce((acc, id) => acc + getEstimatedDuration(id, model), 0)
}

/** 전체 메트릭 초기화 */
export function clearMetrics(): void {
  localStorage.removeItem(STORAGE_KEY)
}
