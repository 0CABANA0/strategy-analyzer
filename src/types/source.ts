/** 소스 자료 — NotebookLM 스타일 참고 자료 */

export type SourceType = 'text' | 'image' | 'url'

export interface SourceMaterial {
  id: string
  type: SourceType
  name: string
  /** 텍스트: 원문 내용, 이미지: Base64 data URL, URL: 웹 주소 */
  content: string
  /** URL 타입의 경우 사용자 설명 */
  description?: string
  mimeType?: string
  /** 바이트 단위 (표시용) */
  size?: number
  uploadedAt: string
}

/** 이미지 리사이즈 최대 크기 (px) — AI 분석에 충분하면서 localStorage 절약 */
export const IMAGE_MAX_SIZE = 800
/** 텍스트 소스 최대 길이 (문자) */
export const TEXT_MAX_LENGTH = 50000
/** 소스 자료 최대 개수 */
export const MAX_SOURCES = 10
