/**
 * PDF 내보내기 (html2pdf.js)
 * Tailwind CSS 4의 oklch() 색상을 html2canvas가 지원하지 않으므로
 * Canvas API로 oklch → hex 강제 변환 후 PDF 생성
 */
import html2pdf from 'html2pdf.js'
import type { StrategyDocument } from '../types'

/** Canvas API로 CSS 색상을 hex로 변환 (oklch 포함 모든 색상 지원) */
const colorCanvas = document.createElement('canvas')
colorCanvas.width = colorCanvas.height = 1
const colorCtx = colorCanvas.getContext('2d')!

function cssColorToHex(cssColor: string): string {
  if (!cssColor || cssColor === 'transparent' || cssColor === 'none') return cssColor
  if (!cssColor.includes('oklch')) return cssColor
  colorCtx.clearRect(0, 0, 1, 1)
  colorCtx.fillStyle = '#000000'
  colorCtx.fillStyle = cssColor
  colorCtx.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = colorCtx.getImageData(0, 0, 1, 1).data
  if (a === 0) return 'transparent'
  if (a < 255) return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(2)})`
  return `rgb(${r}, ${g}, ${b})`
}

export async function exportPdf(state: StrategyDocument): Promise<void> {
  const element = document.getElementById('document-preview')
  if (!element) {
    alert('미리보기 요소를 찾을 수 없습니다.')
    return
  }

  const opt = {
    margin: [10, 10, 10, 10] as [number, number, number, number],
    filename: `${state.businessItem}_전략PRD_${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      onclone(clonedDoc: Document) {
        // 클론된 문서에서 모든 oklch 색상을 rgb로 강제 변환
        const clonedEl = clonedDoc.getElementById('document-preview')
        if (!clonedEl) return

        const COLOR_PROPS = [
          'color', 'background-color', 'border-color',
          'border-top-color', 'border-right-color',
          'border-bottom-color', 'border-left-color',
          'outline-color', 'text-decoration-color',
        ]

        const allEls = [clonedEl, ...clonedEl.querySelectorAll('*')]
        for (const el of allEls) {
          const cs = clonedDoc.defaultView!.getComputedStyle(el)
          for (const prop of COLOR_PROPS) {
            const val = cs.getPropertyValue(prop)
            if (val && val.includes('oklch')) {
              ;(el as HTMLElement).style.setProperty(prop, cssColorToHex(val), 'important')
            }
          }
          // box-shadow에 포함된 oklch도 처리
          const shadow = cs.getPropertyValue('box-shadow')
          if (shadow && shadow.includes('oklch')) {
            const fixed = shadow.replace(/oklch\([^)]*\)/g, (m: string) => cssColorToHex(m))
            ;(el as HTMLElement).style.setProperty('box-shadow', fixed, 'important')
          }
        }

        // oklch를 사용하는 CSS 변수도 인라인 오버라이드
        const overrideStyle = clonedDoc.createElement('style')
        overrideStyle.textContent = `
          *, *::before, *::after {
            --tw-ring-color: rgb(59, 130, 246) !important;
            --tw-ring-offset-color: rgb(255, 255, 255) !important;
            --tw-shadow-color: transparent !important;
          }
        `
        clonedDoc.head.appendChild(overrideStyle)
      },
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait' as const,
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
  }

  try {
    await html2pdf().set(opt).from(element).save()
  } catch (err) {
    console.error('PDF 생성 실패:', err)
    alert('PDF 생성 중 오류가 발생했습니다: ' + (err as Error).message)
  }
}
