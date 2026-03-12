/**
 * 문서 공유 링크 생성/조회
 *
 * Supabase shared_documents 테이블 사용:
 * - share_id (TEXT PK) — 짧은 랜덤 ID
 * - document_snapshot (JSONB) — 문서 전체 스냅샷 (원본 변경 영향 없음)
 * - created_by (UUID FK) — 공유한 사용자
 * - created_at (TIMESTAMPTZ)
 * - expires_at (TIMESTAMPTZ, nullable) — 만료일
 */
import { supabase } from '../lib/supabase'
import type { StrategyDocument } from '../types/document'

/** 6자 랜덤 공유 ID 생성 */
function generateShareId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

export interface ShareResult {
  shareId: string
  url: string
}

/** 문서를 공유 가능한 스냅샷으로 생성 */
export async function createShareLink(state: StrategyDocument): Promise<ShareResult> {
  const shareId = generateShareId()
  const siteUrl = (import.meta.env.VITE_SITE_URL || window.location.origin).trim()

  const { error } = await supabase.from('shared_documents').insert({
    share_id: shareId,
    document_id: state.id,
    document_snapshot: state,
    created_by: (await supabase.auth.getUser()).data.user?.id,
  })

  if (error) {
    throw new Error(`공유 링크 생성 실패: ${error.message}`)
  }

  return {
    shareId,
    url: `${siteUrl}/shared/${shareId}`,
  }
}

/** 공유 ID로 문서 스냅샷 조회 */
export async function getSharedDocument(shareId: string): Promise<StrategyDocument | null> {
  const { data, error } = await supabase
    .from('shared_documents')
    .select('document_snapshot, expires_at')
    .eq('share_id', shareId)
    .single()

  if (error || !data) return null

  // 만료 확인
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return null
  }

  return data.document_snapshot as StrategyDocument
}
