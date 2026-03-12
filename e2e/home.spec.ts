import { test, expect } from '@playwright/test'

// 이 테스트는 인증된 상태에서 실행됨 (storageState 사용)
// E2E_EMAIL/E2E_PASSWORD가 없으면 setup이 스킵되어 이 테스트도 실행되지 않음

test.describe('홈페이지 (인증 후)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('앱 타이틀과 입력 필드가 표시된다', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '전략분석기' })).toBeVisible()
    await expect(page.getByPlaceholder('예: AI 기반 예지보전 플랫폼')).toBeVisible()
  })

  test('예제 버튼 클릭 시 입력 필드에 값이 채워진다', async ({ page }) => {
    const input = page.getByPlaceholder('예: AI 기반 예지보전 플랫폼')
    const exampleButton = page.getByRole('button', { name: 'AI 기반 예지보전 플랫폼' })
    await exampleButton.click()
    await expect(input).toHaveValue('AI 기반 예지보전 플랫폼')
  })

  test('입력 후 "전체 분석 시작" 클릭 시 분석 페이지로 이동한다', async ({ page }) => {
    const input = page.getByPlaceholder('예: AI 기반 예지보전 플랫폼')
    await input.fill('테스트 전략 아이템')
    await page.getByRole('button', { name: '전체 분석 시작' }).click()
    await expect(page).toHaveURL(/\/analyzer/)
  })

  test('빈 입력 시 "전체 분석 시작" 버튼이 비활성화된다', async ({ page }) => {
    const startButton = page.getByRole('button', { name: '전체 분석 시작' })
    await expect(startButton).toBeDisabled()
  })

  test('업종별 템플릿 토글이 동작한다', async ({ page }) => {
    await page.getByText('업종별 템플릿에서 선택').click()
    await expect(page.locator('.grid')).toBeVisible()
  })

  test('입력 필드의 maxLength가 200이다', async ({ page }) => {
    const input = page.getByPlaceholder('예: AI 기반 예지보전 플랫폼')
    await expect(input).toHaveAttribute('maxlength', '200')
  })
})
