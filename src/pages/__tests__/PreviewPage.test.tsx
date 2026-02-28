import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../test/helpers'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
        in: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
      upsert: vi.fn().mockReturnValue({ then: vi.fn() }),
      insert: vi.fn().mockReturnValue({ then: vi.fn() }),
    }),
  },
}))

describe('PreviewPage', () => {
  it('can be imported without errors', async () => {
    const mod = await import('../PreviewPage')
    expect(mod.default).toBeDefined()
  }, 15000)
})
