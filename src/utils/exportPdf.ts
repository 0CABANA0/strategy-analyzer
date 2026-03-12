/**
 * PDF 내보내기
 * html2pdf.js (html2canvas + jsPDF)를 사용하여 브라우저에서 직접 PDF 생성
 * 동적 import로 번들 크기 최적화 (사용 시에만 로드)
 */
import type { StrategyDocument } from '../types/document'

export type PdfTheme = 'light' | 'dark'

export async function exportPdf(state: StrategyDocument, theme: PdfTheme = 'light'): Promise<void> {
  const element = document.getElementById('document-preview')
  if (!element) throw new Error('미리보기 요소를 찾을 수 없습니다.')

  const html2pdf = (await import('html2pdf.js')).default
  const date = new Date().toISOString().split('T')[0]

  const isDark = document.documentElement.classList.contains('dark')

  // 테마에 맞게 다크 모드 클래스 임시 조정
  if (theme === 'light' && isDark) {
    document.documentElement.classList.remove('dark')
  } else if (theme === 'dark' && !isDark) {
    document.documentElement.classList.add('dark')
  }

  // pdf-exporting 클래스 추가 — A4 보고서 타이포그래피 활성화
  document.documentElement.classList.add('pdf-exporting')

  try {
    // A4 세로 기준: 210×297mm, 보고서 적정 마진 상20/하25/좌우15mm
    await html2pdf().from(element).set({
      margin: [20, 15, 25, 15],
      filename: `${state.businessItem}_전략PRD_${date}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        scrollY: 0,
        windowWidth: 794, // A4 가로 210mm ≈ 794px (96dpi)
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      // pagebreak: 페이지 분할 제어 — 제목·표·카드가 페이지 경계에서 끊기지 않도록
      ...({ pagebreak: {
        mode: ['avoid-all', 'css', 'legacy'],
        before: [],
        after: [],
        avoid: ['tr', 'h2', 'h3', 'h4', 'table', '[id^="framework-"]'],
      } }),
    }).save()
  } finally {
    // pdf-exporting 클래스 제거
    document.documentElement.classList.remove('pdf-exporting')

    // 원래 다크 모드 상태 복원 (에러 발생 시에도 보장)
    if (isDark && !document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.add('dark')
    } else if (!isDark && document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark')
    }
  }
}
