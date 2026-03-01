/**
 * PDF 내보내기
 * html2pdf.js (html2canvas + jsPDF)를 사용하여 브라우저에서 직접 PDF 생성
 * 동적 import로 번들 크기 최적화 (사용 시에만 로드)
 */
import type { StrategyDocument } from '../types/document'

export async function exportPdf(state: StrategyDocument): Promise<void> {
  const element = document.getElementById('document-preview')
  if (!element) throw new Error('미리보기 요소를 찾을 수 없습니다.')

  const html2pdf = (await import('html2pdf.js')).default
  const date = new Date().toISOString().split('T')[0]

  // 다크 모드 임시 비활성화 (PDF는 항상 라이트 모드로 출력)
  const isDark = document.documentElement.classList.contains('dark')
  if (isDark) document.documentElement.classList.remove('dark')

  try {
    await html2pdf().from(element).set({
      margin: [10, 10, 10, 10],
      filename: `${state.businessItem}_전략PRD_${date}.pdf`,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      // pagebreak: 패키지 타입에 누락되어 있으나 공식 API에 존재
      ...({ pagebreak: { mode: ['avoid-all', 'css', 'legacy'] } }),
    }).save()
  } finally {
    // 다크 모드 복원 (에러 발생 시에도 보장)
    if (isDark) document.documentElement.classList.add('dark')
  }
}
