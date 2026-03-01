/**
 * PPTX 슬라이드 내보내기
 * pptxgenjs를 사용하여 브라우저에서 직접 .pptx 생성
 * 동적 import로 번들 크기 최적화 (사용 시에만 로드)
 * 템플릿 시스템: 색상/폰트/레이아웃을 PptxTemplate에서 주입
 */
import type PptxGenJS from 'pptxgenjs'
import type { StrategyDocument } from '../types/document'
import type { FrameworkDefinition } from '../types/framework'
import type { ExecutiveSummary } from '../types/validation'
import type { ScenarioResult, ScenarioStrategy } from '../types/scenario'
import type { FinancialResult } from '../types/financial'
import type { PptxTemplate, PptxTemplateColors } from '../types/pptxTemplate'
import { DEFAULT_TEMPLATE } from '../types/pptxTemplate'
import { FRAMEWORKS } from '../data/frameworkDefinitions'
import { SECTIONS } from '../data/sectionDefinitions'

// ── 시맨틱 컬러 (템플릿 무관) ──

const SEM = {
  green: '27AE60',
  red: 'E74C3C',
  yellow: 'F39C12',
} as const

// ── 내보내기 컨텍스트 (exportPptx 호출 시 초기화) ──

let C: PptxTemplateColors  // 템플릿 색상
let FT: string              // 제목 폰트
let FB: string              // 본문 폰트
let MX: number              // 좌우 마진
let CW: number              // 콘텐츠 폭
let SW: number              // 슬라이드 전체 폭

/** Tailwind 색상명 → hex 매핑 (섹션 디바이더용, 템플릿 무관) */
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
  return COLOR_MAP[colorName] || C.tableHeader
}

/** 열 폭 비율을 총 폭에 맞게 스케일링 */
function scaleColW(original: number[], targetW: number): number[] {
  const sum = original.reduce((a, b) => a + b, 0)
  return original.map((w) => (w / sum) * targetW)
}

// ── 슬라이드 빌더 헬퍼 ──

function addTitleSlide(pptx: PptxGenJS, state: StrategyDocument): void {
  const slide = pptx.addSlide()
  slide.background = { color: C.primaryDark }

  slide.addText('전략 PRD', {
    x: MX, y: 1.2, w: CW, h: 0.6,
    fontSize: 16, fontFace: FB, color: 'A0AEC0',
    align: 'center',
  })
  slide.addText(state.businessItem, {
    x: MX, y: 1.8, w: CW, h: 1.4,
    fontSize: 32, fontFace: FT, color: C.white, bold: true,
    align: 'center', valign: 'middle',
  })

  const date = new Date(state.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  slide.addText(date, {
    x: MX, y: 3.6, w: CW, h: 0.5,
    fontSize: 14, fontFace: FB, color: 'A0AEC0',
    align: 'center',
  })
  slide.addText('Strategy Analyzer로 생성', {
    x: MX, y: 4.8, w: CW, h: 0.4,
    fontSize: 10, fontFace: FB, color: '718096',
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
    go: SEM.green,
    conditional_go: SEM.yellow,
    no_go: SEM.red,
  }

  // 의사결정 배지
  slide1.addText(recLabels[es.recommendation] || es.recommendation, {
    x: MX + CW - 2.8, y: 0.2, w: 2.8, h: 0.4,
    fontSize: 14, fontFace: FB, bold: true,
    color: C.white,
    fill: { color: recColors[es.recommendation] || C.secondary },
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
      { text: `${item.label}\n`, options: { fontSize: 11, bold: true, color: C.tableHeader } },
      { text: item.value, options: { fontSize: 11, color: C.text } },
    ], {
      x: MX, y, w: CW, h: 0.9,
      fontFace: FB, valign: 'top', paraSpaceAfter: 4,
    })
    y += 0.95
  }

  // 의사결정 근거
  slide1.addText([
    { text: '의사결정 근거\n', options: { fontSize: 11, bold: true, color: C.tableHeader } },
    { text: es.recommendationReason, options: { fontSize: 11, color: C.text } },
  ], {
    x: MX, y, w: CW, h: 0.8,
    fontFace: FB, valign: 'top',
  })

  // 슬라이드 2: 핵심 수치 + 리스크 (데이터 있을 경우만)
  if ((es.keyMetrics?.length || 0) > 0 || (es.risks?.length || 0) > 0) {
    const slide2 = pptx.addSlide()
    addSlideHeader(slide2, 'Executive Summary', '핵심 수치 & 리스크')

    let y2 = 1.2
    if (es.keyMetrics?.length) {
      const rows: PptxGenJS.TableRow[] = [
        [
          { text: '지표', options: { bold: true, color: C.white, fill: { color: C.tableHeader }, fontSize: 11, fontFace: FB } },
          { text: '값', options: { bold: true, color: C.white, fill: { color: C.tableHeader }, fontSize: 11, fontFace: FB } },
        ],
        ...es.keyMetrics.map((m, i): PptxGenJS.TableRow => [
          { text: m.label, options: { fontSize: 11, fontFace: FB, fill: { color: i % 2 ? C.tableStripe : C.white } } },
          { text: m.value, options: { fontSize: 11, fontFace: FB, bold: true, fill: { color: i % 2 ? C.tableStripe : C.white } } },
        ]),
      ]
      slide2.addTable(rows, {
        x: MX, y: y2, w: CW,
        border: { type: 'solid', pt: 0.5, color: C.border },
        colW: scaleColW([5, 3.8], CW),
      })
      y2 += 0.35 * (es.keyMetrics.length + 1) + 0.3
    }

    if (es.risks?.length) {
      slide2.addText('주요 리스크', {
        x: MX, y: y2, w: CW, h: 0.4,
        fontSize: 13, fontFace: FB, bold: true, color: SEM.red,
      })
      y2 += 0.4
      const bullets = es.risks.map((r) => ({
        text: r,
        options: { fontSize: 11, fontFace: FB, color: C.text, bullet: { type: 'bullet' as const } },
      }))
      slide2.addText(bullets, {
        x: MX, y: y2, w: CW, h: 3.0,
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
    x: MX, y: 1.8, w: CW, h: 0.5,
    fontSize: 14, fontFace: FT, color: C.white, bold: true,
    align: 'left',
  })
  slide.addText(title, {
    x: MX, y: 2.3, w: CW, h: 1.0,
    fontSize: 32, fontFace: FT, color: C.white, bold: true,
    align: 'left',
  })
  slide.addText(subtitle, {
    x: MX, y: 3.3, w: CW, h: 0.5,
    fontSize: 14, fontFace: FB, color: C.white,
    align: 'left',
  })
}

function addSlideHeader(slide: PptxGenJS.Slide, section: string, title: string): void {
  // 상단 구분선 (템플릿 primary 컬러)
  slide.addShape('rect' as PptxGenJS.SHAPE_NAME, {
    x: 0, y: 0, w: SW, h: 0.06,
    fill: { color: C.tableHeader },
  })
  slide.addText(section, {
    x: MX, y: 0.15, w: CW, h: 0.35,
    fontSize: 10, fontFace: FB, color: C.textLight,
  })
  slide.addText(title, {
    x: MX, y: 0.45, w: CW, h: 0.55,
    fontSize: 20, fontFace: FT, bold: true, color: C.primaryDark,
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
      x: MX, y, w: CW, h: 0.3,
      fontSize: 12, fontFace: FB, bold: true, color: C.tableHeader,
    })
    y += 0.35
    itemCount++

    // 불릿 아이템
    const bullets = group.items.map((item) => ({
      text: item,
      options: { fontSize: 11, fontFace: FB, color: C.text, bullet: { type: 'bullet' as const } },
    }))
    const listH = Math.min(group.items.length * 0.24 + 0.05, 3.2)
    slide.addText(bullets, {
      x: MX + 0.3, y, w: CW - 0.3, h: listH,
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
          bold: true, fontSize: 11, fontFace: FB, color: C.tableHeader,
          fill: { color: idx % 2 ? C.tableStripe : C.white },
          valign: 'top' as const,
        },
      },
      {
        text: pair.value,
        options: {
          fontSize: 11, fontFace: FB, color: C.text,
          fill: { color: idx % 2 ? C.tableStripe : C.white },
          valign: 'top' as const,
        },
      },
    ])

    slide.addTable(rows, {
      x: MX, y: 1.1, w: CW,
      colW: scaleColW([2.5, 6.3], CW),
      border: { type: 'solid', pt: 0.5, color: C.border },
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
    x: MX, y: 1.05, w: CW, h: 0.3,
    fontSize: 12, fontFace: FB, bold: true, color: C.tableHeader,
  })

  const tableRows = buildTableRows(content.columns, content.rows)

  slide.addTable(tableRows, {
    x: MX, y: 1.4, w: CW,
    colW: distributeColumnWidths(content.columns.length, CW),
    border: { type: 'solid', pt: 0.5, color: C.border },
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
      bold: true, color: C.white, fontSize: 10, fontFace: FB,
      fill: { color: C.tableHeader },
      valign: 'middle' as const,
      align: 'center' as const,
    },
  }))

  const dataRows: PptxGenJS.TableRow[] = rows.map((row, i) => {
    const cells = Array.isArray(row) ? row : Object.values(row as Record<string, unknown>)
    return cells.map((cell) => ({
      text: String(cell ?? ''),
      options: {
        fontSize: 10, fontFace: FB, color: C.text,
        fill: { color: i % 2 ? C.tableStripe : C.white },
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
    addScenarioDetailSlide(pptx, scenario, scenario.type === sr.recommendation)
  }

  // 비교 요약 슬라이드
  const summarySlide = pptx.addSlide()
  addSlideHeader(summarySlide, '시나리오 분석', '비교 요약')

  // 비교 테이블
  const compRows: PptxGenJS.TableRow[] = [
    ['시나리오', '리스크', '예상 ROI', '타임라인'].map((h) => ({
      text: h,
      options: { bold: true, color: C.white, fontSize: 10, fontFace: FB, fill: { color: C.tableHeader }, align: 'center' as const },
    })),
    ...sr.scenarios.map((s, i): PptxGenJS.TableRow => {
      const isRec = s.type === sr.recommendation
      return [s.label + (isRec ? ' ⭐' : ''), s.riskLevel, s.expectedROI, s.timeline].map((val) => ({
        text: val,
        options: {
          fontSize: 10, fontFace: FB, color: C.text,
          fill: { color: i % 2 ? C.tableStripe : C.white },
          align: 'center' as const,
        },
      }))
    }),
  ]
  summarySlide.addTable(compRows, {
    x: MX, y: 1.2, w: CW,
    colW: scaleColW([3, 2, 2, 1.8], CW),
    border: { type: 'solid', pt: 0.5, color: C.border },
  })

  // 비교 텍스트
  summarySlide.addText(sr.comparison, {
    x: MX, y: 2.8, w: CW, h: 1.2,
    fontSize: 11, fontFace: FB, color: C.text, valign: 'top',
  })

  // AI 추천
  summarySlide.addText([
    { text: 'AI 추천: ', options: { bold: true, fontSize: 12, color: C.tableHeader } },
    { text: `${typeLabels[sr.recommendation] || sr.recommendation} — ${sr.recommendationReason}`, options: { fontSize: 11, color: C.text } },
  ], {
    x: MX, y: 4.2, w: CW, h: 0.8,
    fontFace: FB, valign: 'top',
  })
}

function addScenarioDetailSlide(
  pptx: PptxGenJS,
  s: ScenarioStrategy,
  isRecommended: boolean,
): void {
  const slide = pptx.addSlide()
  const title = `${s.label}${isRecommended ? ' ⭐ AI 추천' : ''}`
  addSlideHeader(slide, '시나리오 분석', title)

  let y = 1.1
  // 개요
  slide.addText(s.overview, {
    x: MX, y, w: CW, h: 0.6,
    fontSize: 11, fontFace: FB, color: C.text, valign: 'top',
  })
  y += 0.65

  // 전략 요약 테이블
  const stratRows: PptxGenJS.TableRow[] = [
    ['항목', '내용'].map((h) => ({
      text: h,
      options: { bold: true, color: C.white, fontSize: 10, fontFace: FB, fill: { color: C.tableHeader }, align: 'center' as const },
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
      { text: label, options: { bold: true, fontSize: 10, fontFace: FB, fill: { color: i % 2 ? C.tableStripe : C.white } } },
      { text: val, options: { fontSize: 10, fontFace: FB, color: C.text, fill: { color: i % 2 ? C.tableStripe : C.white } } },
    ]),
  ]
  slide.addTable(stratRows, {
    x: MX, y, w: CW,
    colW: scaleColW([2, 6.8], CW),
    border: { type: 'solid', pt: 0.5, color: C.border },
    autoPage: true,
  })
  y += stratRows.length * 0.28 + 0.2

  // 하단 지표
  const riskColors = { high: SEM.red, medium: SEM.yellow, low: SEM.green }
  slide.addText([
    { text: `리스크: ${s.riskLevel}`, options: { fontSize: 10, bold: true, color: riskColors[s.riskLevel] || C.text } },
    { text: `  |  예상 ROI: ${s.expectedROI}  |  타임라인: ${s.timeline}`, options: { fontSize: 10, color: C.textLight } },
  ], {
    x: MX, y: Math.min(y, 4.8), w: CW, h: 0.4,
    fontFace: FB,
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

  const chartW = CW * 0.55
  chartSlide.addChart('bar' as PptxGenJS.CHART_NAME, [
    {
      name: '시장 규모',
      labels: marketData.map((d) => d.name),
      values: marketData.map((d) => d.value),
    },
  ], {
    x: MX, y: 1.2, w: chartW, h: 3.5,
    showTitle: false,
    showValue: true,
    dataLabelFontSize: 10,
    catAxisLabelFontSize: 12,
    valAxisLabelFontSize: 9,
    chartColors: [C.tableHeader],
    valAxisLabelFormatCode: '#,##0',
  })

  // 오른쪽에 설명 텍스트
  const descTexts = marketData.map((d) => ({
    text: `${d.name}: ${d.value.toLocaleString()}${d.unit}\n${d.desc}\n\n`,
    options: { fontSize: 10, fontFace: FB, color: C.text },
  }))
  chartSlide.addText(descTexts, {
    x: MX + chartW + 0.2, y: 1.2, w: CW - chartW - 0.2, h: 3.5,
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
      x: MX, y: 1.2, w: CW, h: 3.0,
      showTitle: false,
      showValue: false,
      showLegend: true,
      legendPos: 'b',
      legendFontSize: 9,
      catAxisLabelFontSize: 11,
      valAxisLabelFontSize: 9,
      chartColors: [C.tableHeader, C.secondary, SEM.green],
      valAxisLabelFormatCode: '#,##0',
    })

    // 핵심 지표 테이블
    const metricRows: PptxGenJS.TableRow[] = [
      ['초기 투자', 'BEP', '3년 ROI', '5년 ROI'].map((h) => ({
        text: h,
        options: { bold: true, color: C.white, fontSize: 10, fontFace: FB, fill: { color: C.tableHeader }, align: 'center' as const },
      })),
      [
        `${fr.initialInvestment.toLocaleString()}만원`,
        `${fr.breakEvenMonth}개월`,
        `${fr.roi3Year}%`,
        `${fr.roi5Year}%`,
      ].map((val) => ({
        text: val,
        options: { fontSize: 11, fontFace: FB, color: C.text, bold: true, align: 'center' as const },
      })),
    ]
    revSlide.addTable(metricRows, {
      x: MX, y: 4.4, w: CW,
      colW: scaleColW([2.2, 2.2, 2.2, 2.2], CW),
      border: { type: 'solid', pt: 0.5, color: C.border },
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
        options: { fontSize: 11, fontFace: FB, color: C.text, bullet: { type: 'bullet' as const } },
      }))
      assumSlide.addText(bullets, {
        x: MX, y, w: CW, h: 2.5,
        valign: 'top', paraSpaceAfter: 4,
      })
      y += 2.6
    }

    if (fr.summary) {
      assumSlide.addText([
        { text: '재무 요약\n', options: { fontSize: 13, bold: true, color: C.tableHeader } },
        { text: fr.summary, options: { fontSize: 11, color: C.text } },
      ], {
        x: MX, y, w: CW, h: 2.0,
        fontFace: FB, valign: 'top',
      })
    }
  }
}

function addEndSlide(pptx: PptxGenJS): void {
  const slide = pptx.addSlide()
  slide.background = { color: C.primaryDark }

  slide.addText('Thank You', {
    x: MX, y: 1.5, w: CW, h: 1.0,
    fontSize: 36, fontFace: FT, color: C.white, bold: true,
    align: 'center',
  })
  slide.addText('Generated by Strategy Analyzer', {
    x: MX, y: 2.8, w: CW, h: 0.5,
    fontSize: 14, fontFace: FB, color: 'A0AEC0',
    align: 'center',
  })
  slide.addText('strategy-analyzer-one.vercel.app', {
    x: MX, y: 3.5, w: CW, h: 0.4,
    fontSize: 11, fontFace: FB, color: '718096',
    align: 'center',
  })
}

// ── 메인 내보내기 함수 ──

export async function exportPptx(state: StrategyDocument, template?: PptxTemplate): Promise<void> {
  // 템플릿 컨텍스트 초기화
  const t = template || DEFAULT_TEMPLATE
  C = t.colors
  FT = t.fonts.title
  FB = t.fonts.body
  MX = 0.6

  // 레이아웃에 따른 슬라이드 폭 계산
  const layoutWidths: Record<string, number> = {
    LAYOUT_16x9: 10,
    LAYOUT_4x3: 10,
    CUSTOM: t.layout.width || 10,
  }
  SW = layoutWidths[t.layout.type] || 10
  CW = SW - 2 * MX

  const { default: PptxGenJSLib } = await import('pptxgenjs')
  const pptx = new PptxGenJSLib()

  // 레이아웃 설정
  if (t.layout.type === 'CUSTOM' && t.layout.width && t.layout.height) {
    pptx.defineLayout({ name: 'CUSTOM', width: t.layout.width, height: t.layout.height })
    pptx.layout = 'CUSTOM'
  } else {
    pptx.layout = t.layout.type
  }

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
