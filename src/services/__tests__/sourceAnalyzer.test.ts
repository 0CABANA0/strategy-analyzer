import { describe, it, expect, vi } from 'vitest';

vi.mock('../aiService', () => ({
  callAI: vi.fn().mockResolvedValue('{}'),
  parseJsonResponse: vi.fn().mockReturnValue({
    summary: '요약',
    keywords: ['k1'],
    strategicPoints: ['p1'],
  }),
}));

import { formatSourceSummaries, analyzeSource } from '../sourceAnalyzer';
import { callAI } from '../aiService';
import type { SourceSummary } from '../sourceAnalyzer';

describe('formatSourceSummaries', () => {
  it('빈 Map → 빈 문자열 반환', () => {
    const summaries = new Map<string, SourceSummary>();
    const result = formatSourceSummaries(summaries);
    expect(result).toBe('');
  });

  it('1개 항목 → 이름, 요약, 키워드, 전략 포인트 포함', () => {
    const summaries = new Map<string, SourceSummary>();
    summaries.set('보고서A', {
      summary: '시장 분석 요약입니다',
      keywords: ['AI', '시장확대'],
      strategicPoints: ['선점 전략 필요'],
    });

    const result = formatSourceSummaries(summaries);
    expect(result).toContain('보고서A');
    expect(result).toContain('시장 분석 요약입니다');
    expect(result).toContain('AI');
    expect(result).toContain('시장확대');
    expect(result).toContain('선점 전략 필요');
  });

  it('여러 항목 → 모든 소스 정보 포함', () => {
    const summaries = new Map<string, SourceSummary>();
    summaries.set('소스1', {
      summary: '첫번째 요약',
      keywords: ['keyword1'],
      strategicPoints: ['point1'],
    });
    summaries.set('소스2', {
      summary: '두번째 요약',
      keywords: ['keyword2'],
      strategicPoints: ['point2'],
    });

    const result = formatSourceSummaries(summaries);
    expect(result).toContain('소스1');
    expect(result).toContain('첫번째 요약');
    expect(result).toContain('소스2');
    expect(result).toContain('두번째 요약');
  });
});

describe('analyzeSource', () => {
  it('text 소스 → callAI 호출됨', async () => {
    await analyzeSource(
      { type: 'text', content: '테스트 텍스트 내용', name: '테스트' } as any,
      'test-api-key',
      'test-model',
    );

    expect(callAI).toHaveBeenCalled();
  });

  it('image 소스 → 에러 throw', async () => {
    await expect(
      analyzeSource(
        { type: 'image', content: 'data:image/png;base64,...', name: '이미지' } as any,
        'test-api-key',
        'test-model',
      )
    ).rejects.toThrow();
  });
});
