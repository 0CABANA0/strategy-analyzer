import { test, expect } from '@playwright/test'

test.describe('공개 페이지 (인증 불필요)', () => {
  test('로그인 페이지가 정상 렌더링된다', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: '전략분석기' })).toBeVisible()
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible()
    await expect(page.getByRole('button', { name: '로그인' })).toBeVisible()
  })

  test('회원가입 페이지로 이동할 수 있다', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: '회원가입' }).click()
    await expect(page).toHaveURL(/\/signup/)
  })

  test('비밀번호 찾기 페이지로 이동할 수 있다', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: '비밀번호를 잊으셨나요?' }).click()
    await expect(page).toHaveURL(/\/forgot-password/)
  })

  test('비인증 사용자는 보호 페이지에서 로그인 화면이 표시된다', async ({ page }) => {
    await page.goto('/')
    // AuthGuard가 로그인 UI를 표시 (Supabase 세션 확인 후)
    await expect(page.getByRole('button', { name: '로그인' })).toBeVisible({ timeout: 15_000 })
  })

  test('공유 문서 페이지에 접근할 수 있다 (존재하지 않는 ID)', async ({ page }) => {
    await page.goto('/shared/nonexistent-id')
    // 에러 메시지 또는 로딩이 표시되어야 함
    await expect(
      page.getByText(/찾을 수 없|오류|error/i).or(page.locator('.animate-spin'))
    ).toBeVisible({ timeout: 10_000 })
  })
})
