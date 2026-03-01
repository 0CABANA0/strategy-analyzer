/**
 * PPTX 슬라이드 내보내기
 * pptxgenjs를 사용하여 브라우저에서 직접 .pptx 생성
 * 동적 import로 번들 크기 최적화 (사용 시에만 로드)
 */
import type PptxGenJS from 'pptxgenjs'
import type { StrategyDocument } from '../types/document'
import type { FrameworkDefinition } from '../types/framework'
import type { ExecutiveSummary } from '../types/validation'
import type { ScenarioResult, ScenarioStrategy } from '../types/scenario'
import type { FinancialResult } from '../types/financial'
import { FRAMEWORKS } from '../data/frameworkDefinitions'
import { SECTIONS } from '../data/sectionDefinitions'

// ── 디자인 상수 ──

const COLORS = {
  titleBg: '1A365D',
  white: 'FFFFFF',
  text: '333333',
  textLight: '666666',
  tableHeader: '2B579A',
  tableStripe: 'F0F4FA',
  accent: 'E67E22',
  green: '27AE60',
  red: 'E74C3C',
  yellow: 'F39C12',
  border: 'D1D5DB',
} as const

const FONT = '맑은 고딕'
const MARGIN_X = 0.6
const CONTENT_W = 8.8

/** Tailwind 색상명 → hex 매핑 */
const COLOR_MAP: Record<string, string> = {
  amber: 'D97706',
  blue: '2563EB',
  violet: '7C3AED',
  green: '16A34A',
  red: 'DC2626',
  teal: '0D9488',
  indigo: '4F46E5',
  pink: 'DB2777',
  orange: 'EA580C',
  cyan: '0891B2',
  emerald: '059669',
  purple: '9333EA',
  yellow: 'CA8A04',
  sky: '0284C7',
  slate: '475569',
}

function getColorHex(colorName: string): string {
  return COLOR_MAP[colorName] || COLORS.tableHeader
}

// ── 슬라이드 빌더 헬퍼 ──

function addTitleSlide(pptx: PptxGenJS, state: StrategyDocument): void {
  const slide = pptx.addSlide()
  slide.background = { color: COLORS.titleBg }

  slide.addText('전략 PRD', {
    x: MARGIN_X, y: 1.2, w: CONTENT_W, h: 0.6,
    fontSize: 16, fontFace: FONT, color: 'A0AEC0',
    align: 'center',
  })
  slide.addText(state.businessItem, {
    x: MARGIN_X, y: 1.8, w: CONTENT_W, h: 1.4,
    fontSize: 32, fontFace: FONT, color: COLORS.white, bold: true,
    align: 'center', valign: 'middle',
  })

  const date = new Date(state.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  slide.addText(date, {
    x: MARGIN_X, y: 3.6, w: CONTENT_W, h: 0.5,
    fontSize: 14, fontFace: FONT, color: 'A0AEC0',
    align: 'center',
  })
  slide.addText('Strategy Analyzer로 생성', {
    x: MARGIN_X, y: 4.8, w: CONTENT_W, h: 0.4,
    fontSize: 10, fontFace: FONT, color: '718096',
    align: 'center',
  })
}

function addExecutiveSummarySlides(pptx: PptxGenJS, es: ExecutiveSummary): void {
  // 슬라이드 1: 기회/전략/경쟁우위
  const slide1 = pptx.addSlide()
  addSlideHeader(slide1, 'Executive Summary', es.title)

  const recLabels: Record<string, string> = {
    go: '✅ GO',
    conditional_go: '⚠️ CONDITIONAL GO',
    no_go: '❌ NO-GO',
  }
  const recColors: Record<string, string> = {
    go: COLORS.green,
    conditional_go: COLORS.yellow,
    no_go: COLORS.red,
  }

  // 의사결정 배지
  slide1.addText(recLabels[es.recommendation] || es.recommendation, {
    x: 6.6, y: 0.2, w: 2.8, h: 0.4,
    fontSize: 14, fontFace: FONT, bold: true,
    color: COLORS.white,
    fill: { color: recColors[es.recommendation] || COLORS.accent },
    align: 'center', valign: 'middle',
    rectRadius: 0.1,
  })

  let y = 1.4
  const items = [
    { label: '시장 기회', value: es.opportunity },
    { label: '핵심 전략', value: es.strategy },
    { label: '경쟁 우위', value: es.competitiveAdvantage },
  ]
  for (const item of items) {
    slide1.addText([
      { text: `${item.label}\n`, options: { fontSize: 11, bold: true, color: COLORS.tableHeader } },
      { text: item.value, options: { fontSize: 11, color: COLORS.text } },
    ], {
      x: MARGIN_X, y, w: CONTENT_W, h: 0.9,
      fontFace: FONT, valign: 'top', paraSpaceAfter: 4,
    })
    y += 0.95
  }

  // 의사결정 근거
  slide1.addText([
    { text: '의사결정 근거\n', options: { fontSize: 11, bold: true, color: COLORS.tableHeader } },
    { text: es.recommendationReason, options: { fontSize: 11, color: COLORS.text } },
  ], {
    x: MARGIN_X, y, w: CONTENT_W, h: 0.8,
    fontFace: FONT, valign: 'top',
  })

  // 슬라이드 2: 핵심 수치 + 리스크 (데이터 있을 경우만)
  if ((es.keyMetrics?.length || 0) > 0 || (es.risks?.length || 0) > 0) {
    const slide2 = pptx.addSlide()
    addSlideHeader(slide2, 'Executive Summary', '핵심 수치 & 리스크')

    let y2 = 1.2
    if (es.keyMetrics?.length) {
      const rows: PptxGenJS.TableRow[] = [
        [
          { text: '지표', options: { bold: true, color: COLORS.white, fill: { color: COLORS.tableHeader }, fontSize: 11, fontFace: FONT } },
          { text: '값', options: { bold: true, color: COLORS.white, fill: { color: COLORS.tableHeader }, fontSize: 11, fontFace: FONT } },
        ],
        ...es.keyMetrics.map((m, i): PptxGenJS.TableRow => [
          { text: m.label, options: { fontSize: 11, fontFace: FONT, fill: { color: i % 2 ? COLORS.tableStripe : COLORS.white } } },
          { text: m.value, options: { fontSize: 11, fontFace: FONT, bold: true, fill: { color: i % 2 ? COLORS.tableStripe : COLORS.white } } },
        ]),
      ]
      slide2.addTable(rows, {
        x: MARGIN_X, y: y2, w: CONTENT_W,
        border: { type: 'solid', pt: 0.5, color: COLORS.border },
        colW: [5, 3.8],
      })
      y2 += 0.35 * (es.keyMetrics.length + 1) + 0.3
    }

    if (es.risks?.length) {
      slide2.addText('주요 리스크', {
        x: MARGIN_X, y: y2, w: CONTENT_W, h: 0.4,
        fontSize: 13, fontFace: FONT, bold: true, color: COLORS.red,
      })
      y2 += 0.4
      const bullets = es.risks.map((r) => ({
        text: r,
        options: { fontSize: 11, fontFace: FONT, color: COLORS.text, bullet: { type: 'bullet' as const } },
      }))
      slide2.addText(bullets, {
        x: MARGIN_X, y: y2, w: CONTENT_W, h: 3.0,
        valign: 'top', paraSpaceAfter: 4,
      })
    }
  }
}

function addSectionDivider(pptx: PptxGenJS, number: number, title: string, subtitle: string, colorName: string): void {
  const slide = pptx.addSlide()
  const hex = getColorHex(colorName)
  slide.background = { color: hex }

  slide.addText(`SECTION ${number}`, {
    x: MARGIN_X, y: 1.8, w: CONTENT_W, h: 0.5,
    fontSize: 14, fontFace: FONT, color: COLORS.white, bold: true,
    align: 'left',
  })
  slide.addText(title, {
    x: MARGIN_X, y: 2.3, w: CONTENT_W, h: 1.0,
    fontSize: 32, fontFace: FONT, color: COLORS.white, bold: true,
    align: 'left',
  })
  slide.addText(subtitle, {
    x: MARGIN_X, y: 3.3, w: CONTENT_W, h: 0.5,
    fontSize: 14, fontFace: FONT, color: COLORS.white,
    align: 'left',
  })
}

function addSlideHeader(slide: PptxGenJS.Slide, section: string, title: string): void {
  // 상단 구분선 (얇은 파란색 직사각형)
  slide.addShape('rect' as PptxGenJS.SHAPE_NAME, {
    x: 0, y: 0, w: 10, h: 0.06,
    fill: { color: COLORS.tableHeader },
  })
  slide.addText(section, {
    x: MARGIN_X, y: 0.15, w: CONTENT_W, h: 0.35,
    fontSize: 10, fontFace: FONT, color: COLORS.textLight,
  })
  slide.addText(title, {
    x: MARGIN_X, y: 0.45, w: CONTENT_W, h: 0.55,
    fontSize: 20, fontFace: FONT, bold: true, color: COLORS.titleBg,
  })
}

// ── 3종 슬라이드 템플릿 ──

interface BulletGroup {
  label: string
  items: string[]
}

interface KeyValuePair {
  key: string
  value: string
}

interface TableContent {
  label: string
  columns: string[]
  rows: unknown[][]
}

/** 템플릿 1: 불릿 리스트 — 라벨+불릿 그룹을 자동 페이징 */
function templateBullets(
  pptx: PptxGenJS,
  sectionTitle: string,
  fwTitle: string,
  groups: BulletGroup[],
): void {
  const MAX_ITEMS = 14
  let itemCount = 0
  let slide = pptx.addSlide()
  addSlideHeader(slide, sectionTitle, fwTitle)
  let y = 1.1
  let page = 0

  for (const group of groups) {
    if (!group.items.length) continue

    // 페이지 넘침 시 새 슬라이드
    const needed = group.items.length + 1
    if (itemCount > 0 && itemCount + needed > MAX_ITEMS) {
      page++
      slide = pptx.addSlide()
      addSlideHeader(slide, sectionTitle, `${fwTitle} (${page + 1})`)
      y = 1.1
      itemCount = 0
    }

    // 그룹 라벨
    slide.addText(group.label, {
      x: MARGIN_X, y, w: CONTENT_W, h: 0.3,
      fontSize: 12, fontFace: FONT, bold: true, color: COLORS.tableHeader,
    })
    y += 0.35
    itemCount++

    // 불릿 아이템
    const bullets = group.items.map((item) => ({
      text: item,
      options: { fontSize: 11, fontFace: FONT, color: COLORS.text, bullet: { type: 'bullet' as const } },
    }))
    const listH = Math.min(group.items.length * 0.24 + 0.05, 3.2)
    slide.addText(bullets, {
      x: MARGIN_X + 0.3, y, w: CONTENT_W - 0.3, h: listH,
      valign: 'top', paraSpaceAfter: 3,
    })
    y += listH + 0.15
    itemCount += group.items.length
  }
}

/** 템플릿 2: 키-값 테이블 — 2열 스타일 테이블로 자동 페이징 */
function templateKeyValue(
  pptx: PptxGenJS,
  sectionTitle: string,
  fwTitle: string,
  pairs: KeyValuePair[],
): void {
  const MAX_PAIRS = 7

  for (let i = 0; i < pairs.length; i += MAX_PAIRS) {
    const chunk = pairs.slice(i, i + MAX_PAIRS)
    const slide = pptx.addSlide()
    const title = i === 0 ? fwTitle : `${fwTitle} (${Math.floor(i / MAX_PAIRS) + 1})`
    addSlideHeader(slide, sectionTitle, title)

    const rows: PptxGenJS.TableRow[] = chunk.map((pair, idx) => [
      {
        text: pair.key,
        options: {
          bold: true, fontSize: 11, fontFace: FONT, color: COLORS.tableHeader,
          fill: { color: idx % 2 ? COLORS.tableStripe : COLORS.white },
          valign: 'top' as const,
        },
      },
      {
        text: pair.value,
        options: {
          fontSize: 11, fontFace: FONT, color: COLORS.text,
          fill: { color: idx % 2 ? COLORS.tableStripe : COLORS.white },
          valign: 'top' as const,
        },
      },
    ])

    slide.addTable(rows, {
      x: MARGIN_X, y: 1.1, w: CONTENT_W,
      colW: [2.5, 6.3],
      border: { type: 'solid', pt: 0.5, color: COLORS.border },
      rowH: chunk.map((pair) => Math.max(0.45, Math.ceil(pair.value.length / 55) * 0.32)),
    })
  }
}

/** 템플릿 3: 전폭 테이블 — autoPage로 자동 분할 */
function templateTable(
  pptx: PptxGenJS,
  sectionTitle: string,
  fwTitle: string,
  content: TableContent,
): void {
  const slide = pptx.addSlide()
  addSlideHeader(slide, sectionTitle, fwTitle)

  slide.addText(content.label, {
    x: MARGIN_X, y: 1.05, w: CONTENT_W, h: 0.3,
    fontSize: 12, fontFace: FONT, bold: true, color: COLORS.tableHeader,
  })

  const tableRows = buildTableRows(content.columns, content.rows)

  slide.addTable(tableRows, {
    x: MARGIN_X, y: 1.4, w: CONTENT_W,
    colW: distributeColumnWidths(content.columns.length, CONTENT_W),
    border: { type: 'solid', pt: 0.5, color: COLORS.border },
    autoPage: true,
    autoPageRepeatHeader: true,
    autoPageHeaderRows: 1,
  })
}

/** 열 수에 따라 열 폭 자동 분배 (첫 열 넓게) */
function distributeColumnWidths(colCount: number, totalW: number): number[] {
  if (colCount <= 2) return Array(colCount).fill(totalW / colCount)
  const firstW = Math.min(totalW * 0.28, 2.5)
  const restW = (totalW - firstW) / (colCount - 1)
  return [firstW, ...Array(colCount - 1).fill(restW)]
}

// ── 프레임워크 필드 → 템플릿 자동 분배 ──

function addFrameworkSlides(
  pptx: PptxGenJS,
  frameworkId: string,
  data: Record<string, unknown>,
  sectionTitle: string,
): void {
  const fw: FrameworkDefinition | undefined = FRAMEWORKS[frameworkId]
  if (!fw || !data) return

  const fwTitle = `${fw.name} (${fw.fullName})`

  // 필드를 타입별로 분류
  const kvPairs: KeyValuePair[] = []
  const bulletGroups: BulletGroup[] = []
  const tables: TableContent[] = []

  for (const [key, fieldDef] of Object.entries(fw.fields)) {
    const value = data[key]
    if (value === undefined || value === null) continue

    if (fieldDef.type === 'text' || fieldDef.type === 'select') {
      const strVal = String(value || '')
      if (strVal) kvPairs.push({ key: fieldDef.label, value: strVal })
    } else if (fieldDef.type === 'list') {
      const items = value as string[]
      if (items?.length) bulletGroups.push({ label: fieldDef.label, items })
    } else if (fieldDef.type === 'table') {
      const rows = value as unknown[][]
      if (rows?.length) {
        tables.push({ label: fieldDef.label, columns: (fieldDef as { columns: string[] }).columns, rows })
      }
    } else if (fieldDef.type === 'object') {
      if (typeof value === 'object' && value !== null) {
        const subfields = (fieldDef as { subfields: Record<string, string> }).subfields ?? {}
        for (const [subKey, subVal] of Object.entries(value as Record<string, unknown>)) {
          const subLabel = subfields[subKey] || subKey
          const subText = typeof subVal === 'object' ? JSON.stringify(subVal) : String(subVal ?? '')
          kvPairs.push({ key: `${fieldDef.label} — ${subLabel}`, value: subText })
        }
      }
    }
  }

  // 렌더링 순서: 키-값 → 테이블 → 불릿
  if (kvPairs.length) {
    templateKeyValue(pptx, sectionTitle, fwTitle, kvPairs)
  }
  for (const table of tables) {
    templateTable(pptx, sectionTitle, fwTitle, table)
  }
  if (bulletGroups.length) {
    templateBullets(pptx, sectionTitle, fwTitle, bulletGroups)
  }
}

function buildTableRows(columns: string[], rows: unknown[]): PptxGenJS.TableRow[] {
  const headerRow: PptxGenJS.TableRow = columns.map((col) => ({
    text: col,
    options: {
      bold: true, color: COLORS.white, fontSize: 10, fontFace: FONT,
      fill: { color: COLORS.tableHeader },
      valign: 'middle' as const,
      align: 'center' as const,
    },
  }))

  const dataRows: PptxGenJS.TableRow[] = rows.map((row, i) => {
    const cells = Array.isArray(row) ? row : Object.values(row as Record<string, unknown>)
    return cells.map((cell) => ({
      text: String(cell ?? ''),
      options: {
        fontSize: 10, fontFace: FONT, color: COLORS.text,
        fill: { color: i % 2 ? COLORS.tableStripe : COLORS.white },
        valign: 'middle' as const,
      },
    }))
  })

  return [headerRow, ...dataRows]
}

// ── 시나리오 슬라이드 ──

function addScenarioSlides(pptx: PptxGenJS, sr: ScenarioResult): void {
  // 각 시나리오별 슬라이드
  const typeLabels: Record<string, string> = {
    aggressive: '공격적 확장',
    conservative: '안정적 성장',
    pivot: '전략적 피벗',
  }

  for (const scenario of sr.scenarios) {
    addScenarioDetailSlide(pptx, scenario, scenario.type === sr.recommendation, typeLabels)
  }

  // 비교 요약 슬라이드
  const summarySlide = pptx.addSlide()
  addSlideHeader(summarySlide, '시나리오 분석', '비교 요약')

  // 비교 테이블
  const compRows: PptxGenJS.TableRow[] = [
    ['시나리오', '리스크', '예상 ROI', '타임라인'].map((h) => ({
      text: h,
      options: { bold: true, color: COLORS.white, fontSize: 10, fontFace: FONT, fill: { color: COLORS.tableHeader }, align: 'center' as const },
    })),
    ...sr.scenarios.map((s, i): PptxGenJS.TableRow => {
      const isRec = s.type === sr.recommendation
      return [s.label + (isRec ? ' ⭐' : ''), s.riskLevel, s.expectedROI, s.timeline].map((val) => ({
        text: val,
        options: {
          fontSize: 10, fontFace: FONT, color: COLORS.text,
          fill: { color: i % 2 ? COLORS.tableStripe : COLORS.white },
          align: 'center' as const,
        },
      }))
    }),
  ]
  summarySlide.addTable(compRows, {
    x: MARGIN_X, y: 1.2, w: CONTENT_W,
    colW: [3, 2, 2, 1.8],
    border: { type: 'solid', pt: 0.5, color: COLORS.border },
  })

  // 비교 텍스트
  summarySlide.addText(sr.comparison, {
    x: MARGIN_X, y: 2.8, w: CONTENT_W, h: 1.2,
    fontSize: 11, fontFace: FONT, color: COLORS.text, valign: 'top',
  })

  // AI 추천
  summarySlide.addText([
    { text: 'AI 추천: ', options: { bold: true, fontSize: 12, color: COLORS.tableHeader } },
    { text: `${typeLabels[sr.recommendation] || sr.recommendation} — ${sr.recommendationReason}`, options: { fontSize: 11, color: COLORS.text } },
  ], {
    x: MARGIN_X, y: 4.2, w: CONTENT_W, h: 0.8,
    fontFace: FONT, valign: 'top',
  })
}

function addScenarioDetailSlide(
  pptx: PptxGenJS,
  s: ScenarioStrategy,
  isRecommended: boolean,
  typeLabels: Record<string, string>,
): void {
  const slide = pptx.addSlide()
  const title = `${s.label}${isRecommended ? ' ⭐ AI 추천' : ''}`
  addSlideHeader(slide, '시나리오 분석', title)

  let y = 1.1
  // 개요
  slide.addText(s.overview, {
    x: MARGIN_X, y, w: CONTENT_W, h: 0.6,
    fontSize: 11, fontFace: FONT, color: COLORS.text, valign: 'top',
  })
  y += 0.65

  // 전략 요약 테이블
  const stratRows: PptxGenJS.TableRow[] = [
    ['항목', '내용'].map((h) => ({
      text: h,
      options: { bold: true, color: COLORS.white, fontSize: 10, fontFace: FONT, fill: { color: COLORS.tableHeader }, align: 'center' as const },
    })),
    ...([
      ['경쟁전략', s.genericStrategy.strategy],
      ['세분화', s.stp.segmentation],
      ['타겟팅', s.stp.targeting],
      ['포지셔닝', s.stp.positioning],
      ['제품', s.fourP.product],
      ['가격', s.fourP.price],
      ['유통', s.fourP.place],
      ['프로모션', s.fourP.promotion],
    ] as [string, string][]).map(([label, val], i): PptxGenJS.TableRow => [
      { text: label, options: { bold: true, fontSize: 10, fontFace: FONT, fill: { color: i % 2 ? COLORS.tableStripe : COLORS.white } } },
      { text: val, options: { fontSize: 10, fontFace: FONT, color: COLORS.text, fill: { color: i % 2 ? COLORS.tableStripe : COLORS.white } } },
    ]),
  ]
  slide.addTable(stratRows, {
    x: MARGIN_X, y, w: CONTENT_W,
    colW: [2, 6.8],
    border: { type: 'solid', pt: 0.5, color: COLORS.border },
    autoPage: true,
  })
  y += stratRows.length * 0.28 + 0.2

  // 하단 지표
  const riskColors = { high: COLORS.red, medium: COLORS.yellow, low: COLORS.green }
  slide.addText([
    { text: `리스크: ${s.riskLevel}`, options: { fontSize: 10, bold: true, color: riskColors[s.riskLevel] || COLORS.text } },
    { text: `  |  예상 ROI: ${s.expectedROI}  |  타임라인: ${s.timeline}`, options: { fontSize: 10, color: COLORS.textLight } },
  ], {
    x: MARGIN_X, y: Math.min(y, 4.8), w: CONTENT_W, h: 0.4,
    fontFace: FONT,
  })
}

// ── 재무 슬라이드 ──

function addFinancialSlides(pptx: PptxGenJS, fr: FinancialResult): void {
  // 슬라이드 1: TAM/SAM/SOM 바 차트
  const chartSlide = pptx.addSlide()
  addSlideHeader(chartSlide, '재무 시뮬레이션', '시장 규모 (TAM / SAM / SOM)')

  const marketData = [
    { name: 'TAM', value: fr.marketSizing.tam.value, desc: fr.marketSizing.tam.description, unit: fr.marketSizing.tam.unit },
    { name: 'SAM', value: fr.marketSizing.sam.value, desc: fr.marketSizing.sam.description, unit: fr.marketSizing.sam.unit },
    { name: 'SOM', value: fr.marketSizing.som.value, desc: fr.marketSizing.som.description, unit: fr.marketSizing.som.unit },
  ]

  chartSlide.addChart('bar' as PptxGenJS.CHART_NAME, [
    {
      name: '시장 규모',
      labels: marketData.map((d) => d.name),
      values: marketData.map((d) => d.value),
    },
  ], {
    x: MARGIN_X, y: 1.2, w: 5.0, h: 3.5,
    showTitle: false,
    showValue: true,
    dataLabelFontSize: 10,
    catAxisLabelFontSize: 12,
    valAxisLabelFontSize: 9,
    chartColors: ['2B579A'],
    valAxisLabelFormatCode: '#,##0',
  })

  // 오른쪽에 설명 텍스트
  const descTexts = marketData.map((d) => ({
    text: `${d.name}: ${d.value.toLocaleString()}${d.unit}\n${d.desc}\n\n`,
    options: { fontSize: 10, fontFace: FONT, color: COLORS.text },
  }))
  chartSlide.addText(descTexts, {
    x: 5.8, y: 1.2, w: 3.6, h: 3.5,
    valign: 'top',
  })

  // 슬라이드 2: 5년 매출 바 차트
  if (fr.revenueProjections?.length) {
    const revSlide = pptx.addSlide()
    addSlideHeader(revSlide, '재무 시뮬레이션', '5년 매출 예측')

    revSlide.addChart('bar' as PptxGenJS.CHART_NAME, [
      {
        name: '매출',
        labels: fr.revenueProjections.map((r) => `${r.year}년`),
        values: fr.revenueProjections.map((r) => r.revenue),
      },
      {
        name: '비용',
        labels: fr.revenueProjections.map((r) => `${r.year}년`),
        values: fr.revenueProjections.map((r) => r.cost),
      },
      {
        name: '이익',
        labels: fr.revenueProjections.map((r) => `${r.year}년`),
        values: fr.revenueProjections.map((r) => r.profit),
      },
    ], {
      x: MARGIN_X, y: 1.2, w: CONTENT_W, h: 3.0,
      showTitle: false,
      showValue: false,
      showLegend: true,
      legendPos: 'b',
      legendFontSize: 9,
      catAxisLabelFontSize: 11,
      valAxisLabelFontSize: 9,
      chartColors: ['2B579A', 'E67E22', '27AE60'],
      valAxisLabelFormatCode: '#,##0',
    })

    // 핵심 지표 테이블
    const metricRows: PptxGenJS.TableRow[] = [
      ['초기 투자', 'BEP', '3년 ROI', '5년 ROI'].map((h) => ({
        text: h,
        options: { bold: true, color: COLORS.white, fontSize: 10, fontFace: FONT, fill: { color: COLORS.tableHeader }, align: 'center' as const },
      })),
      [
        `${fr.initialInvestment.toLocaleString()}만원`,
        `${fr.breakEvenMonth}개월`,
        `${fr.roi3Year}%`,
        `${fr.roi5Year}%`,
      ].map((val) => ({
        text: val,
        options: { fontSize: 11, fontFace: FONT, color: COLORS.text, bold: true, align: 'center' as const },
      })),
    ]
    revSlide.addTable(metricRows, {
      x: MARGIN_X, y: 4.4, w: CONTENT_W,
      colW: [2.2, 2.2, 2.2, 2.2],
      border: { type: 'solid', pt: 0.5, color: COLORS.border },
    })
  }

  // 슬라이드 3: 전제조건 + 요약
  if (fr.keyAssumptions?.length || fr.summary) {
    const assumSlide = pptx.addSlide()
    addSlideHeader(assumSlide, '재무 시뮬레이션', '전제 조건 & 요약')

    let y = 1.2
    if (fr.keyAssumptions?.length) {
      const bullets = fr.keyAssumptions.map((a) => ({
        text: a,
        options: { fontSize: 11, fontFace: FONT, color: COLORS.text, bullet: { type: 'bullet' as const } },
      }))
      assumSlide.addText(bullets, {
        x: MARGIN_X, y, w: CONTENT_W, h: 2.5,
        valign: 'top', paraSpaceAfter: 4,
      })
      y += 2.6
    }

    if (fr.summary) {
      assumSlide.addText([
        { text: '재무 요약\n', options: { fontSize: 13, bold: true, color: COLORS.tableHeader } },
        { text: fr.summary, options: { fontSize: 11, color: COLORS.text } },
      ], {
        x: MARGIN_X, y, w: CONTENT_W, h: 2.0,
        fontFace: FONT, valign: 'top',
      })
    }
  }
}

function addEndSlide(pptx: PptxGenJS): void {
  const slide = pptx.addSlide()
  slide.background = { color: COLORS.titleBg }

  slide.addText('Thank You', {
    x: MARGIN_X, y: 1.5, w: CONTENT_W, h: 1.0,
    fontSize: 36, fontFace: FONT, color: COLORS.white, bold: true,
    align: 'center',
  })
  slide.addText('Generated by Strategy Analyzer', {
    x: MARGIN_X, y: 2.8, w: CONTENT_W, h: 0.5,
    fontSize: 14, fontFace: FONT, color: 'A0AEC0',
    align: 'center',
  })
  slide.addText('strategy-analyzer-one.vercel.app', {
    x: MARGIN_X, y: 3.5, w: CONTENT_W, h: 0.4,
    fontSize: 11, fontFace: FONT, color: '718096',
    align: 'center',
  })
}

// ── 메인 내보내기 함수 ──

export async function exportPptx(state: StrategyDocument): Promise<void> {
  const { default: PptxGenJSLib } = await import('pptxgenjs')
  const pptx = new PptxGenJSLib()
  pptx.layout = 'LAYOUT_16x9'
  pptx.title = `${state.businessItem} - 전략 PRD`
  pptx.author = 'Strategy Analyzer'
  pptx.subject = '전략 PRD'

  // 1. 표지
  addTitleSlide(pptx, state)

  // 2. Executive Summary
  if (state.executiveSummary) {
    addExecutiveSummarySlides(pptx, state.executiveSummary)
  }

  // 3. 섹션별 프레임워크
  for (const section of SECTIONS) {
    const completedFrameworks = section.frameworks.filter((fId) => {
      const fs = state.frameworks[fId]
      return fs?.status === 'completed' && fs.data
    })

    if (completedFrameworks.length === 0) continue

    addSectionDivider(pptx, section.number, section.title, section.subtitle, section.color)

    for (const fId of completedFrameworks) {
      const fs = state.frameworks[fId]
      addFrameworkSlides(pptx, fId, fs.data as unknown as Record<string, unknown>, `${section.number}. ${section.title}`)
    }
  }

  // 4. 시나리오 분석
  if (state.scenarioResult) {
    addScenarioSlides(pptx, state.scenarioResult)
  }

  // 5. 재무 시뮬레이션
  if (state.financialResult) {
    addFinancialSlides(pptx, state.financialResult)
  }

  // 6. 마지막 슬라이드
  addEndSlide(pptx)

  // 파일 다운로드
  const fileName = `${state.businessItem}_전략PRD_${new Date().toISOString().split('T')[0]}`
  await pptx.writeFile({ fileName })
}
