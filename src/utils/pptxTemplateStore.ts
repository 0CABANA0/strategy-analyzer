/** PPTX 템플릿 저장/관리 + PPTX 테마 자동 추출 */
import { DEFAULT_TEMPLATE, BUILTIN_TEMPLATE } from '../types/pptxTemplate'
import type { PptxTemplate } from '../types/pptxTemplate'

const STORAGE_KEY = 'strategy-analyzer:pptx-templates'
const SELECTED_KEY = 'strategy-analyzer:pptx-template-selected'

const BUILTIN_TEMPLATES: PptxTemplate[] = [DEFAULT_TEMPLATE, BUILTIN_TEMPLATE]

// ── 저장소 CRUD ──

function loadCustomTemplates(): PptxTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveCustomTemplates(templates: PptxTemplate[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
}

/** 모든 템플릿 (내장 + 커스텀) */
export function getTemplates(): PptxTemplate[] {
  return [...BUILTIN_TEMPLATES, ...loadCustomTemplates()]
}

/** 선택된 템플릿 ID */
export function getSelectedTemplateId(): string {
  return localStorage.getItem(SELECTED_KEY) || DEFAULT_TEMPLATE.id
}

/** 템플릿 선택 저장 */
export function setSelectedTemplateId(id: string): void {
  localStorage.setItem(SELECTED_KEY, id)
}

/** 선택된 템플릿 객체 */
export function getSelectedTemplate(): PptxTemplate {
  const id = getSelectedTemplateId()
  const all = getTemplates()
  return all.find((t) => t.id === id) || all[0]
}

/** 내장 템플릿 여부 */
export function isBuiltInTemplate(id: string): boolean {
  return BUILTIN_TEMPLATES.some((t) => t.id === id)
}

/** 커스텀 템플릿 추가 */
export function addTemplate(template: PptxTemplate): void {
  const customs = loadCustomTemplates()
  customs.push(template)
  saveCustomTemplates(customs)
}

/** 커스텀 템플릿 삭제 */
export function deleteTemplate(id: string): void {
  if (isBuiltInTemplate(id)) return
  const customs = loadCustomTemplates().filter((t) => t.id !== id)
  saveCustomTemplates(customs)
  if (getSelectedTemplateId() === id) {
    setSelectedTemplateId(DEFAULT_TEMPLATE.id)
  }
}

// ── PPTX 테마 추출 ──

const A_NS = 'http://schemas.openxmlformats.org/drawingml/2006/main'
const P_NS = 'http://schemas.openxmlformats.org/presentationml/2006/main'

/** XML 요소에서 색상값 추출 (srgbClr 또는 sysClr) */
function getThemeColor(parent: Element, tagName: string): string {
  const elem = parent.getElementsByTagNameNS(A_NS, tagName)[0]
  if (!elem) return ''
  const srgb = elem.getElementsByTagNameNS(A_NS, 'srgbClr')[0]
  if (srgb) return srgb.getAttribute('val') || ''
  const sys = elem.getElementsByTagNameNS(A_NS, 'sysClr')[0]
  if (sys) return sys.getAttribute('lastClr') || ''
  return ''
}

/** HEX 색상을 밝게 (factor: 0~1, 1에 가까울수록 흰색) */
function lightenColor(hex: string, factor: number): string {
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  const lr = Math.round(r + (255 - r) * factor)
  const lg = Math.round(g + (255 - g) * factor)
  const lb = Math.round(b + (255 - b) * factor)
  return [lr, lg, lb].map((v) => v.toString(16).padStart(2, '0')).join('')
}

/** PPTX 파일에서 테마를 추출하여 PptxTemplate 생성 */
export async function extractTemplateFromPptx(file: File): Promise<PptxTemplate> {
  const JSZip = (await import('jszip')).default
  const zip = await JSZip.loadAsync(file)

  // 테마 XML 파싱
  const themeFile = zip.file('ppt/theme/theme1.xml')
  if (!themeFile) throw new Error('PPTX에서 테마 파일을 찾을 수 없습니다.')
  const themeXml = await themeFile.async('string')
  const parser = new DOMParser()
  const themeDoc = parser.parseFromString(themeXml, 'text/xml')

  // 색상 스키마
  const clrScheme = themeDoc.getElementsByTagNameNS(A_NS, 'clrScheme')[0]
  if (!clrScheme) throw new Error('테마에서 색상 스키마를 찾을 수 없습니다.')

  const accent1 = getThemeColor(clrScheme, 'accent1') || '2B579A'
  const accent2 = getThemeColor(clrScheme, 'accent2') || 'E67E22'
  const dk2 = getThemeColor(clrScheme, 'dk2') || accent1
  const accent4 = getThemeColor(clrScheme, 'accent4') || accent1
  const accent6 = getThemeColor(clrScheme, 'accent6') || ''
  const lt2 = getThemeColor(clrScheme, 'lt2') || '666666'

  // 폰트 스키마
  const fontScheme = themeDoc.getElementsByTagNameNS(A_NS, 'fontScheme')[0]
  const majorFont = fontScheme?.getElementsByTagNameNS(A_NS, 'majorFont')[0]
  const majorEa = majorFont?.getElementsByTagNameNS(A_NS, 'ea')[0]?.getAttribute('typeface') || ''
  const minorFont = fontScheme?.getElementsByTagNameNS(A_NS, 'minorFont')[0]
  const minorEa = minorFont?.getElementsByTagNameNS(A_NS, 'ea')[0]?.getAttribute('typeface') || ''

  // 슬라이드 크기
  let layoutConfig: PptxTemplate['layout'] = { type: 'LAYOUT_16x9' }
  const presFile = zip.file('ppt/presentation.xml')
  if (presFile) {
    const presXml = await presFile.async('string')
    const presDoc = parser.parseFromString(presXml, 'text/xml')
    const sldSz = presDoc.getElementsByTagNameNS(P_NS, 'sldSz')[0]
    if (sldSz) {
      const cx = parseInt(sldSz.getAttribute('cx') || '0')
      const cy = parseInt(sldSz.getAttribute('cy') || '0')
      const is16x9 = cx === 12192000 && cy === 6858000
      const is4x3 = cx === 9144000 && cy === 6858000
      if (is4x3) {
        layoutConfig = { type: 'LAYOUT_4x3' }
      } else if (!is16x9 && cx > 0 && cy > 0) {
        layoutConfig = {
          type: 'CUSTOM',
          width: Math.round((cx / 914400) * 100) / 100,
          height: Math.round((cy / 914400) * 100) / 100,
        }
      }
    }
  }

  // 테마 이름
  const themeName = themeDoc.getElementsByTagNameNS(A_NS, 'theme')[0]?.getAttribute('name') || ''
  const displayName = themeName || file.name.replace(/\.pptx$/i, '')

  return {
    id: `custom-${Date.now()}`,
    name: displayName,
    isDefault: false,
    createdAt: new Date().toISOString(),
    colors: {
      primary: accent1,
      primaryDark: accent1,
      secondary: accent2,
      accent: accent4,
      text: '333333',
      textLight: lt2,
      tableHeader: dk2,
      tableStripe: accent6 ? lightenColor(accent6, 0.5) : lightenColor(accent1, 0.92),
      white: 'FFFFFF',
      border: accent6 || lightenColor(accent1, 0.7),
    },
    fonts: {
      title: majorEa || '맑은 고딕',
      body: minorEa || '맑은 고딕',
    },
    layout: layoutConfig,
  }
}
