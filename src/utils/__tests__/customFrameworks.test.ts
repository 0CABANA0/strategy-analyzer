import { describe, it, expect, beforeEach } from 'vitest';
import {
  getCustomFrameworks,
  addCustomFramework,
  updateCustomFramework,
  deleteCustomFramework,
  generateCustomId,
} from '../customFrameworks';

const STORAGE_KEY = 'strategy-analyzer:custom-frameworks';

function createTestFramework(overrides = {}) {
  return {
    id: 'custom_test1',
    name: '테스트 프레임워크',
    fullName: 'Test Framework',
    section: 2,
    description: '테스트용 프레임워크입니다',
    fields: {
      analysis: { type: 'text' as const, label: '분석' },
    },
    prompt: '분석해주세요',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('customFrameworks', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('빈 상태에서 getCustomFrameworks → 빈 배열 반환', () => {
    const result = getCustomFrameworks();
    expect(result).toEqual([]);
  });

  it('addCustomFramework 후 getCustomFrameworks에 포함', () => {
    const fw = createTestFramework();
    addCustomFramework(fw);

    const result = getCustomFrameworks();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('custom_test1');
    expect(result[0].name).toBe('테스트 프레임워크');
  });

  it('updateCustomFramework로 name 변경', () => {
    const fw = createTestFramework();
    addCustomFramework(fw);

    updateCustomFramework('custom_test1', { name: '수정된 프레임워크' });

    const result = getCustomFrameworks();
    expect(result[0].name).toBe('수정된 프레임워크');
  });

  it('deleteCustomFramework로 삭제', () => {
    const fw1 = createTestFramework({ id: 'custom_a' });
    const fw2 = createTestFramework({ id: 'custom_b', name: '두번째' });
    addCustomFramework(fw1);
    addCustomFramework(fw2);

    deleteCustomFramework('custom_a');

    const result = getCustomFrameworks();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('custom_b');
  });

  it('generateCustomId → "custom_" 접두사 + 고유 ID', () => {
    const id1 = generateCustomId();
    const id2 = generateCustomId();

    expect(id1).toMatch(/^custom_/);
    expect(id2).toMatch(/^custom_/);
    expect(id1).not.toBe(id2);
  });

  it('localStorage 손상 시 빈 배열 반환', () => {
    localStorage.setItem(STORAGE_KEY, '잘못된 JSON{{{');

    const result = getCustomFrameworks();
    expect(result).toEqual([]);
  });
});
