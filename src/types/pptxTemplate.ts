/** PPTX 내보내기 템플릿 — 디자인 토큰 기반 */

export interface PptxTemplateColors {
  primary: string
  primaryDark: string
  secondary: string
  accent: string
  text: string
  textLight: string
  tableHeader: string
  tableStripe: string
  white: string
  border: string
}

export interface PptxTemplate {
  id: string
  name: string
  isDefault: boolean
  createdAt: string
  colors: PptxTemplateColors
  fonts: {
    title: string
    body: string
  }
  layout: {
    type: 'LAYOUT_16x9' | 'LAYOUT_4x3' | 'CUSTOM'
    width?: number
    height?: number
  }
}

/** 기본 템플릿: Purple (A4) — Template-A4-2026.pptx 테마 기반 */
export const DEFAULT_TEMPLATE: PptxTemplate = {
  id: 'purple-a4',
  name: 'Purple (A4)',
  isDefault: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  colors: {
    primary: '2E008B',
    primaryDark: '2D0189',
    secondary: 'FFBE19',
    accent: '6428E6',
    text: '333333',
    textLight: '9999D3',
    tableHeader: '3D00B8',
    tableStripe: 'EAEAF6',
    white: 'FFFFFF',
    border: 'C4C4E6',
  },
  fonts: {
    title: 'Pretendard ExtraBold',
    body: 'Pretendard Medium',
  },
  layout: {
    type: 'CUSTOM',
    width: 10.83,
    height: 7.5,
  },
}

/** 내장 템플릿: 기본 (16:9) — 이전 기본값 */
export const BUILTIN_TEMPLATE: PptxTemplate = {
  id: 'builtin-16x9',
  name: '기본 (16:9)',
  isDefault: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  colors: {
    primary: '2B579A',
    primaryDark: '1A365D',
    secondary: 'E67E22',
    accent: 'E67E22',
    text: '333333',
    textLight: '666666',
    tableHeader: '2B579A',
    tableStripe: 'F0F4FA',
    white: 'FFFFFF',
    border: 'D1D5DB',
  },
  fonts: {
    title: '맑은 고딕',
    body: '맑은 고딕',
  },
  layout: {
    type: 'LAYOUT_16x9',
  },
}
