/** 소스 자료 파일 처리 — 텍스트 읽기, 이미지 리사이즈+Base64 */
import { v4 as uuidv4 } from 'uuid'
import type { SourceMaterial, SourceType } from '../types/source'
import { IMAGE_MAX_SIZE, TEXT_MAX_LENGTH } from '../types/source'

const TEXT_EXTENSIONS = ['.txt', '.md', '.csv', '.json', '.xml', '.html']
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif']

/** 파일 확장자로 소스 타입 판별 */
export function detectSourceType(file: File): SourceType | null {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()
  if (TEXT_EXTENSIONS.includes(ext)) return 'text'
  if (IMAGE_EXTENSIONS.includes(ext)) return 'image'
  if (file.type.startsWith('text/')) return 'text'
  if (file.type.startsWith('image/')) return 'image'
  return null
}

/** 이미지를 최대 크기로 리사이즈하고 JPEG Base64 data URL 반환 */
function resizeImage(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('이미지를 읽을 수 없습니다.'))
    }
    img.src = url
  })
}

/** 파일 → SourceMaterial 변환 */
export async function processFile(file: File): Promise<SourceMaterial> {
  const type = detectSourceType(file)
  if (!type) {
    throw new Error(`지원하지 않는 파일 형식입니다: ${file.name}\n지원 형식: 텍스트(.txt, .md, .csv), 이미지(.png, .jpg, .webp)`)
  }

  if (type === 'text') {
    const text = await file.text()
    if (text.length > TEXT_MAX_LENGTH) {
      throw new Error(`텍스트가 너무 깁니다 (${(text.length / 1000).toFixed(0)}K자). 최대 ${TEXT_MAX_LENGTH / 1000}K자까지 지원합니다.`)
    }
    return {
      id: uuidv4(),
      type: 'text',
      name: file.name,
      content: text,
      mimeType: file.type || 'text/plain',
      size: file.size,
      uploadedAt: new Date().toISOString(),
    }
  }

  // 이미지: 리사이즈 + JPEG Base64
  const dataUrl = await resizeImage(file, IMAGE_MAX_SIZE)
  return {
    id: uuidv4(),
    type: 'image',
    name: file.name,
    content: dataUrl,
    mimeType: 'image/jpeg',
    size: file.size,
    uploadedAt: new Date().toISOString(),
  }
}

/** URL → SourceMaterial 변환 */
export function createUrlSource(url: string, description?: string): SourceMaterial {
  return {
    id: uuidv4(),
    type: 'url',
    name: new URL(url).hostname,
    content: url,
    description: description || '',
    uploadedAt: new Date().toISOString(),
  }
}

/** 파일 크기를 읽기 좋은 문자열로 변환 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}
