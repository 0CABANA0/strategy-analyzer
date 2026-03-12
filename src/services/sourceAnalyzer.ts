/**
 * 소스 자료 AI 요약 서비스
 * 업로드된 텍스트/URL 내용을 AI로 분석하여 구조화된 요약 생성
 * → 프레임워크 프롬프트에 주입 시 더 정확한 분석 가능
 */
import { callAI, parseJsonResponse } from './aiService'
import type { SourceMaterial } from '../types/source'

export interface SourceSummary {
  /** 핵심 요약 (2~3문장) */
  summary: string
  /** 핵심 키워드 */
  keywords: string[]
  /** 전략 분석에 활용 가능한 포인트 */
  strategicPoints: string[]
}

const SYSTEM_PROMPT = `당신은 전략 분석을 위한 문서 요약 전문가입니다.
제공된 자료를 분석하여 다음 JSON 형식으로 요약하세요:
{
  "summary": "핵심 내용을 2~3문장으로 요약",
  "keywords": ["키워드1", "키워드2", ...],
  "strategicPoints": ["전략 분석에 활용 가능한 포인트1", "포인트2", ...]
}
반드시 순수 JSON만 반환하세요.`

/**
 * 소스 자료를 AI로 분석하여 구조화된 요약 생성
 */
export async function analyzeSource(
  source: SourceMaterial,
  apiKey: string,
  model: string,
): Promise<SourceSummary> {
  let userPrompt: string

  if (source.type === 'text') {
    userPrompt = `다음 텍스트 자료를 분석하세요:\n\n제목: ${source.name}\n\n${source.content.slice(0, 5000)}`
  } else if (source.type === 'url') {
    userPrompt = `다음 URL의 웹 페이지 내용을 분석하세요:\n\nURL: ${source.content}\n설명: ${source.description || '없음'}`
  } else {
    throw new Error('이미지 소스는 텍스트 분석을 지원하지 않습니다.')
  }

  const responseText = await callAI({
    apiKey,
    model,
    system: SYSTEM_PROMPT,
    user: userPrompt,
    temperature: 0.3,
    maxTokens: 2048,
  })

  const data = parseJsonResponse(responseText)
  return data as unknown as SourceSummary
}

/**
 * 분석된 소스 요약을 프롬프트 컨텍스트 형식으로 변환
 */
export function formatSourceSummaries(summaries: Map<string, SourceSummary>): string {
  if (summaries.size === 0) return ''

  let str = '\n\n[AI 분석된 참고 자료 요약 — 분석에 핵심 근거로 활용하세요]\n'
  for (const [name, s] of summaries) {
    str += `\n### ${name}\n`
    str += `- 요약: ${s.summary}\n`
    str += `- 키워드: ${s.keywords.join(', ')}\n`
    str += `- 전략 포인트:\n`
    for (const point of s.strategicPoints) {
      str += `  · ${point}\n`
    }
  }
  return str
}
