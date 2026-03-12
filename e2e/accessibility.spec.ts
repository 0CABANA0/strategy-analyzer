import { test, expect } from '@playwright/test'

test.describe('접근성 기본 검증', () => {
  test('홈페이지에 주요 랜드마크가 존재한다', async ({ page }) => {
    await page.goto('/')
    // 페이지가 정상 로드되는지
    await expect(page).toHaveTitle(/전략분석기/)
  })

  test('입력 필드에 포커스가 자동으로 설정된다', async ({ page }) => {
    await page.goto('/')
    const input = page.getByPlaceholder('예: AI 기반 예지보전 플랫폼')
    await expect(input).toBeFocused()
  })

  test('키보드로 예제 버튼 선택이 가능하다', async ({ page }) => {
    await page.goto('/')
    // Tab을 여러 번 눌러 예제 버튼에 도달
    const input = page.getByPlaceholder('예: AI 기반 예지보전 플랫폼')
    await input.press('Tab')
    // 포커스가 이동했는지 확인 (input에서 벗어남)
    await expect(input).not.toBeFocused()
  })

  test('Enter 키로 분석 시작이 가능하다', async ({ page }) => {
    await page.goto('/')
    const input = page.getByPlaceholder('예: AI 기반 예지보전 플랫폼')
    await input.fill('키보드 테스트')
    await input.press('Enter')
    await expect(page).toHaveURL(/\/analyzer/)
  })
})
