import { describe, it, expect, vi } from 'vitest';

vi.mock('../common', () => ({
  COMMON_SYSTEM: 'SYSTEM_BASE',
  buildContext: vi.fn(() => ''),
}));

import { createCustomPrompt } from '../customPrompt';

function createTestFramework(overrides = {}) {
  return {
    id: 'custom_test',
    name: '커스텀 분석',
    fullName: 'Custom Analysis Framework',
    section: 2,
    description: '사용자 정의 분석 프레임워크',
    fields: {},
    prompt: '이 사업을 분석해주세요',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('createCustomPrompt', () => {
  it('system 프롬프트에 프레임워크 이름 포함', () => {
    const fw = createTestFramework();
    const promptFn = createCustomPrompt(fw);
    const result = promptFn({ businessItem: '테스트 사업', context: {} });

    expect(result.system).toContain('커스텀 분석');
    expect(result.system).toContain('Custom Analysis Framework');
  });

  it('user 프롬프트에 businessItem 포함', () => {
    const fw = createTestFramework();
    const promptFn = createCustomPrompt(fw);
    const result = promptFn({ businessItem: 'AI 교육 플랫폼', context: {} });

    expect(result.user).toContain('AI 교육 플랫폼');
  });

  it('text 필드 → JSON 스키마에 "string" 포함', () => {
    const fw = createTestFramework({
      fields: {
        overview: { type: 'text', label: '개요' },
      },
    });
    const promptFn = createCustomPrompt(fw);
    const result = promptFn({ businessItem: '테스트', context: {} });

    expect(result.system).toContain('"overview"');
    expect(result.system).toContain('"string"');
  });

  it('list 필드 → JSON 스키마에 배열 형태 포함', () => {
    const fw = createTestFramework({
      fields: {
        items: { type: 'list', label: '항목' },
      },
    });
    const promptFn = createCustomPrompt(fw);
    const result = promptFn({ businessItem: '테스트', context: {} });

    expect(result.system).toContain('"items"');
    expect(result.system).toMatch(/\["string".*\.\.\.\]/);
  });

  it('table 필드 → columns 반영', () => {
    const fw = createTestFramework({
      fields: {
        matrix: {
          type: 'table',
          label: '매트릭스',
          columns: ['항목', '점수', '비고'],
        },
      },
    });
    const promptFn = createCustomPrompt(fw);
    const result = promptFn({ businessItem: '테스트', context: {} });

    expect(result.system).toContain('"matrix"');
    expect(result.system).toContain('항목');
    expect(result.system).toContain('점수');
  });
});
