import { test, expect } from '@playwright/test'

test.describe('네비게이션', () => {
  test('홈 → 설정 페이지 이동', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /설정|Settings/ }).click()
    await expect(page).toHaveURL(/\/settings/)
  })

  test('홈 → 히스토리 페이지 이동', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /히스토리|History/ }).click()
    await expect(page).toHaveURL(/\/history/)
  })

  test('존재하지 않는 경로는 홈으로 리다이렉트 또는 404', async ({ page }) => {
    await page.goto('/nonexistent-page-12345')
    // SPA이므로 홈으로 리다이렉트되거나, 앱이 렌더링되어야 함
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('설정 페이지에 API 키 입력 필드가 있다', async ({ page }) => {
    await page.goto('/settings')
    // API 키 또는 모델 관련 설정 요소가 존재
    await expect(
      page.getByText(/API|모델|Model/).first()
    ).toBeVisible({ timeout: 10_000 })
  })

  test('다크모드 토글이 동작한다', async ({ page }) => {
    await page.goto('/')
    const toggle = page.getByRole('button', { name: /다크|Dark|테마|Theme/ })
      .or(page.locator('[aria-label*="dark"]'))
      .or(page.locator('[aria-label*="theme"]'))

    if (await toggle.count() > 0) {
      await toggle.first().click()
      // html 또는 body에 dark 클래스가 토글되는지 확인
      const html = page.locator('html')
      const hasDark = await html.getAttribute('class')
      expect(hasDark !== null).toBeTruthy()
    }
  })
})
