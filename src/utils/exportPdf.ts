/**
 * PDF 내보내기 (html2pdf.js)
 *
 * 해결된 문제:
 * - Tailwind CSS 4 oklch() → html2canvas 호환 rgb 변환 (스타일시트 전체 치환)
 * - 다크 모드 텍스트가 PDF 흰 배경에서 흐려지는 문제 → 강제 라이트 모드
 * - iOS Safari canvas 크기 제한 (16M pixels) → 모바일 scale 자동 축소
 * - iOS Safari Blob 다운로드 실패 → window.open() 폴백
 * - 모듈 스코프 document 접근 → lazy 초기화
 */
import html2pdf from 'html2pdf.js'
import type { StrategyDocument } from '../types'

// --- oklch 색상 변환 (lazy 초기화 + 캐시) ---

let _colorCanvas: HTMLCanvasElement | null = null
let _colorCtx: CanvasRenderingContext2D | null = null
const _oklchCache = new Map<string, string>()

function getColorCtx(): CanvasRenderingContext2D {
  if (!_colorCtx) {
    _colorCanvas = document.createElement('canvas')
    _colorCanvas.width = _colorCanvas.height = 1
    _colorCtx = _colorCanvas.getContext('2d')!
  }
  return _colorCtx
}

function cssColorToRgb(cssColor: string): string {
  if (!cssColor || cssColor === 'transparent' || cssColor === 'none') return cssColor
  if (!cssColor.includes('oklch')) return cssColor

  const cached = _oklchCache.get(cssColor)
  if (cached) return cached

  const ctx = getColorCtx()
  ctx.clearRect(0, 0, 1, 1)
  ctx.fillStyle = '#000000'
  ctx.fillStyle = cssColor
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data

  let result: string
  if (a === 0) result = 'transparent'
  else if (a < 255) result = `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(2)})`
  else result = `rgb(${r}, ${g}, ${b})`

  _oklchCache.set(cssColor, result)
  return result
}

/** oklch()가 포함된 모든 CSS 값을 rgb로 변환 (gradient, box-shadow 등) */
function replaceOklchInValue(value: string): string {
  if (!value || !value.includes('oklch')) return value
  return value.replace(/oklch\([^)]*\)/g, (match) => cssColorToRgb(match))
}

// --- 모바일/iOS 감지 ---

function isMobile(): boolean {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
}

function isIOS(): boolean {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

// --- CSSRuleList 재귀 oklch 변환 ---

function convertOklchInRules(rules: CSSRuleList) {
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i]

    // @media, @layer, @supports 등 중첩 규칙 재귀 처리
    if ('cssRules' in rule) {
      try {
        convertOklchInRules((rule as CSSGroupingRule).cssRules)
      } catch { /* ignore */ }
    }

    // oklch가 포함된 스타일 속성 변환
    if ('style' in rule && rule.cssText.includes('oklch')) {
      const style = (rule as CSSStyleRule).style
      for (let j = 0; j < style.length; j++) {
        const prop = style[j]
        const val = style.getPropertyValue(prop)
        if (val.includes('oklch')) {
          style.setProperty(prop, replaceOklchInValue(val))
        }
      }
    }
  }
}

// --- oklch 색상 일괄 변환 + 라이트 모드 강제 (onclone 콜백) ---

function convertOklchInClone(clonedDoc: Document) {
  // ① PDF는 항상 라이트 모드로 렌더링
  //    다크 모드에서 text-gray-300 등이 흰 배경 위에 흐리게 나오는 문제 해결
  clonedDoc.documentElement.classList.remove('dark')

  // ② <style> 요소의 텍스트에서 oklch() → rgb() 일괄 치환
  //    html2canvas가 스타일시트 텍스트를 직접 파싱할 때 oklch 에러 방지
  for (const styleEl of clonedDoc.querySelectorAll('style')) {
    if (styleEl.textContent?.includes('oklch')) {
      styleEl.textContent = styleEl.textContent.replace(
        /oklch\([^)]*\)/g,
        (match) => cssColorToRgb(match)
      )
    }
  }

  // ③ 외부 스타일시트(<link>)의 CSSOM 규칙에서 oklch 변환
  for (const sheet of clonedDoc.styleSheets) {
    try {
      if (sheet.cssRules) convertOklchInRules(sheet.cssRules)
    } catch {
      // CORS 제한 시 무시
    }
  }

  // ④ 인라인 style 속성에서 oklch 변환
  const clonedEl = clonedDoc.getElementById('document-preview')
  if (!clonedEl) return

  for (const el of [clonedEl, ...clonedEl.querySelectorAll('*')]) {
    const htmlEl = el as HTMLElement
    if (htmlEl.style?.cssText?.includes('oklch')) {
      for (let i = 0; i < htmlEl.style.length; i++) {
        const prop = htmlEl.style[i]
        const val = htmlEl.style.getPropertyValue(prop)
        if (val.includes('oklch')) {
          htmlEl.style.setProperty(prop, replaceOklchInValue(val))
        }
      }
    }
  }

  // ⑤ Tailwind CSS 변수 오버라이드 (안전망)
  const overrideStyle = clonedDoc.createElement('style')
  overrideStyle.textContent = `
    *, *::before, *::after {
      --tw-ring-color: rgb(59, 130, 246) !important;
      --tw-ring-offset-color: rgb(255, 255, 255) !important;
      --tw-shadow-color: transparent !important;
    }
  `
  clonedDoc.head.appendChild(overrideStyle)
}

// --- 메인 export ---

export async function exportPdf(state: StrategyDocument): Promise<void> {
  const element = document.getElementById('document-preview')
  if (!element) {
    alert('미리보기 요소를 찾을 수 없습니다.')
    return
  }

  // oklch 변환 캐시 초기화
  _oklchCache.clear()

  // 모바일: scale 축소로 canvas 크기 제한 대응
  const mobile = isMobile()
  const scale = mobile ? 1 : 2

  const filename = `${state.businessItem}_전략PRD_${new Date().toISOString().split('T')[0]}.pdf`

  const opt = {
    margin: [10, 10, 10, 10] as [number, number, number, number],
    filename,
    image: { type: 'jpeg' as const, quality: mobile ? 0.92 : 0.98 },
    html2canvas: {
      scale,
      useCORS: true,
      letterRendering: true,
      windowWidth: element.scrollWidth,
      onclone: convertOklchInClone,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait' as const,
    },
    pagebreak: { mode: ['css', 'legacy'] as string[] },
  }

  try {
    const worker = html2pdf().set(opt).from(element)

    if (isIOS()) {
      // iOS Safari: Blob → window.open 으로 PDF 뷰어에서 표시
      const blob: Blob = await worker.outputPdf('blob')
      const url = URL.createObjectURL(blob)
      const pdfWindow = window.open(url, '_blank')
      if (pdfWindow) {
        // 새 창이 로드되면 URL 해제
        pdfWindow.addEventListener('load', () => URL.revokeObjectURL(url))
        // 안전망: 30초 후 해제
        setTimeout(() => URL.revokeObjectURL(url), 30000)
      } else {
        // 팝업 차단 시 현재 탭에서 이동
        window.location.href = url
        setTimeout(() => URL.revokeObjectURL(url), 30000)
      }
    } else {
      // Desktop & Android: 일반 다운로드
      await worker.save(filename)
    }
  } catch (err) {
    console.error('PDF 생성 실패:', err)
    const message = err instanceof Error ? err.message : String(err)

    if (message.includes('canvas') || message.includes('memory') || message.includes('exceeded')) {
      alert('문서가 너무 커서 PDF 변환에 실패했습니다. 일부 프레임워크만 완료한 상태에서 다시 시도해주세요.')
    } else {
      alert('PDF 생성 중 오류가 발생했습니다: ' + message)
    }
  }
}
