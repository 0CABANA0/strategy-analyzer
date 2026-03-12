vi.mock('./common', () => ({
  COMMON_SYSTEM: 'SYSTEM_BASE',
  buildContext: vi.fn(() => ''),
}))

import { describe, it, expect, vi } from 'vitest'
import { buildCoachingPrompt } from '../coachingPrompt'

describe('buildCoachingPrompt', () => {
  const baseParams = {
    businessItem: 'AI 기반 예지보전 플랫폼',
    frameworkId: 'swot',
    frameworkData: { strengths: ['강점1'], weaknesses: ['약점1'] },
    context: {},
  }

  it('system 프롬프트에 프레임워크 이름이 포함된다', () => {
    const { system } = buildCoachingPrompt(baseParams)
    expect(system).toContain('SWOT')
  })

  it('user 프롬프트에 businessItem이 포함된다', () => {
    const { user } = buildCoachingPrompt(baseParams)
    expect(user).toContain('AI 기반 예지보전 플랫폼')
  })

  it('user 프롬프트에 frameworkData가 JSON으로 포함된다', () => {
    const { user } = buildCoachingPrompt(baseParams)
    expect(user).toContain('강점1')
    expect(user).toContain('약점1')
  })
})
