/**
 * HTML 내보내기 — 미리보기와 100% 동일한 품질
 *
 * 장점:
 * - 벡터 텍스트 (선택/검색 가능)
 * - 미리보기 화면 그대로 렌더링
 * - 브라우저 Ctrl+P로 고품질 PDF 변환 가능
 * - 오프라인에서도 열림 (스타일 인라인)
 */
import type { StrategyDocument } from '../types'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** 현재 페이지의 모든 CSS 규칙을 수집 */
function collectPageCss(): string {
  let css = ''
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        css += rule.cssText + '\n'
      }
    } catch {
      // CORS 제한 스타일시트 무시
    }
  }
  return css
}

export function exportHtml(state: StrategyDocument): void {
  const previewEl = document.getElementById('document-preview')
  if (!previewEl) {
    alert('미리보기 요소를 찾을 수 없습니다.')
    return
  }

  const date = new Date().toISOString().split('T')[0]
  const title = `${state.businessItem} - 전략 PRD`
  const pageCss = collectPageCss()

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet">
  <style>
${pageCss}

/* ── Export overrides ── */
html, body {
  background: #fff !important;
  color: #1e293b !important;
  margin: 0 !important;
  padding: 0 !important;
}
body {
  display: flex;
  justify-content: center;
  padding: 2rem !important;
  font-family: 'Noto Sans KR', system-ui, -apple-system, sans-serif;
}
#document-preview {
  max-width: 900px;
  width: 100%;
  border: none !important;
  box-shadow: none !important;
  border-radius: 0 !important;
}
/* 다크 모드 비활성화 */
.dark { color-scheme: light; }

/* 테이블 강화 */
#document-preview table {
  border-collapse: collapse;
  border: 2px solid #d1d5db;
}
#document-preview thead tr {
  background-color: #e5e7eb !important;
}
#document-preview tbody tr:nth-child(even) {
  background-color: #f9fafb !important;
}
#document-preview th {
  font-weight: 700;
  border-bottom: 2px solid #d1d5db;
}
#document-preview th,
#document-preview td {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
}
#document-preview td:first-child {
  font-weight: 500;
}

/* 인쇄 최적화 (Ctrl+P → PDF) */
@media print {
  body { padding: 0 !important; }
  #document-preview { max-width: 100%; }
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  h2 { break-after: avoid; }
  h3, h4, table, tr { break-inside: avoid; }
  thead { display: table-header-group; }
}
  </style>
</head>
<body>
  ${previewEl.outerHTML}
  <script>
    // 다크 모드 클래스 제거
    document.documentElement.classList.remove('dark');
  </script>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${state.businessItem}_전략PRD_${date}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
