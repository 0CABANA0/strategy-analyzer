import { test as setup, expect } from '@playwright/test'

const E2E_EMAIL = process.env.E2E_EMAIL || ''
const E2E_PASSWORD = process.env.E2E_PASSWORD || ''

/**
 * 인증 setup — 로그인 후 storageState를 저장하여 다른 테스트에서 재사용.
 * 환경변수 E2E_EMAIL, E2E_PASSWORD가 없으면 스킵.
 */
setup('로그인 인증', async ({ page }) => {
  setup.skip(!E2E_EMAIL || !E2E_PASSWORD, 'E2E_EMAIL/E2E_PASSWORD 환경변수 필요')

  await page.goto('/login')
  await page.getByPlaceholder('you@example.com').fill(E2E_EMAIL)
  await page.getByRole('textbox', { name: '비밀번호' }).fill(E2E_PASSWORD)
  await page.getByRole('button', { name: '로그인' }).click()

  // 홈페이지로 이동할 때까지 대기 (인증 성공)
  await expect(page).toHaveURL('/', { timeout: 15_000 })
  await expect(page.getByRole('heading', { name: '전략분석기' })).toBeVisible()

  // 인증 상태 저장
  await page.context().storageState({ path: 'e2e/.auth/user.json' })
})
