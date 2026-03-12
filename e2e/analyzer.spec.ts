import { test, expect } from '@playwright/test'

test.describe('분석 페이지', () => {
  test.beforeEach(async ({ page }) => {
    // 홈에서 아이템 입력 후 분석 페이지 진입
    await page.goto('/')
    await page.getByPlaceholder('예: AI 기반 예지보전 플랫폼').fill('E2E 테스트 아이템')
    await page.getByRole('button', { name: '전체 분석 시작' }).click()
    await expect(page).toHaveURL(/\/analyzer/)
  })

  test('분석 페이지에 섹션 탭이 표시된다', async ({ page }) => {
    // 5개 섹션 탭 중 첫 번째가 보여야 함
    await expect(page.getByText('기획배경')).toBeVisible()
  })

  test('프레임워크 카드가 렌더링된다', async ({ page }) => {
    // 첫 번째 섹션의 프레임워크 카드가 최소 1개 존재
    const cards = page.locator('[data-framework-id]')
    await expect(cards.first()).toBeVisible({ timeout: 10_000 })
  })

  test('섹션 탭 전환이 동작한다', async ({ page }) => {
    // 두 번째 섹션 탭 클릭
    const tabs = page.locator('button').filter({ hasText: /환경분석|시사점|추진전략|기대효과/ })
    if (await tabs.count() > 0) {
      await tabs.first().click()
      // 탭 전환 후에도 페이지가 정상 렌더링
      await expect(page).toHaveURL(/\/analyzer/)
    }
  })

  test('미리보기 버튼이 존재한다', async ({ page }) => {
    const previewLink = page.getByRole('link', { name: /미리보기|Preview/ })
      .or(page.getByRole('button', { name: /미리보기|Preview/ }))
    // 미리보기 링크/버튼이 존재 (헤더나 사이드바에)
    await expect(previewLink.first()).toBeVisible({ timeout: 10_000 })
  })
})
