import { supabase } from '../lib/supabase'

interface ErrorLogEntry {
  level: 'error' | 'warn'
  message: string
  stack?: string
  context?: Record<string, unknown>
  url: string
  user_agent: string
}

/** 에러 로그 큐 — 네트워크 실패 시 유실 방지 */
let queue: ErrorLogEntry[] = []
let flushTimer: ReturnType<typeof setTimeout> | null = null

const MAX_QUEUE = 20
const FLUSH_INTERVAL = 5_000 // 5초

/**
 * 에러를 Supabase error_logs 테이블에 기록.
 * 즉시 전송하지 않고 큐에 모아 배치 전송 (네트워크 부하 최소화).
 */
export function logError(
  error: Error | string,
  context?: Record<string, unknown>,
) {
  const entry: ErrorLogEntry = {
    level: 'error',
    message: typeof error === 'string' ? error : error.message,
    stack: typeof error === 'string' ? undefined : error.stack?.slice(0, 2000),
    context,
    url: window.location.href,
    user_agent: navigator.userAgent,
  }

  queue.push(entry)

  // 큐가 가득 차면 즉시 플러시
  if (queue.length >= MAX_QUEUE) {
    flush()
    return
  }

  // 타이머 설정 (중복 방지)
  if (!flushTimer) {
    flushTimer = setTimeout(flush, FLUSH_INTERVAL)
  }
}

/** 큐의 모든 에러를 Supabase에 전송 */
async function flush() {
  if (flushTimer) {
    clearTimeout(flushTimer)
    flushTimer = null
  }

  if (queue.length === 0) return

  const entries = queue.splice(0)

  try {
    const { data: { user } } = await supabase.auth.getUser()

    const rows = entries.map((e) => ({
      level: e.level,
      message: e.message,
      stack: e.stack,
      context: e.context,
      url: e.url,
      user_agent: e.user_agent,
      user_id: user?.id,
    }))

    const { error } = await supabase.from('error_logs').insert(rows)

    if (error) {
      // Supabase 전송 실패 시 콘솔에만 출력 (무한 루프 방지)
      console.warn('[errorLogger] Supabase 전송 실패:', error.message)
    }
  } catch {
    // 네트워크 오류 등 — 조용히 실패
    console.warn('[errorLogger] 에러 로그 전송 실패')
  }
}

/**
 * 전역 에러 핸들러 등록.
 * main.tsx에서 한 번만 호출.
 */
export function installGlobalErrorHandlers() {
  // 처리되지 않은 예외
  window.addEventListener('error', (event) => {
    logError(event.error ?? event.message, {
      source: 'window.onerror',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
  })

  // 처리되지 않은 Promise 거부
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error
      ? event.reason
      : String(event.reason)
    logError(error, { source: 'unhandledrejection' })
  })
}
