/**
 * Obsidian 호환 Markdown 내보내기
 */
import type { StrategyDocument, FrameworkDefinition } from '../types'
import { FRAMEWORKS } from '../data/frameworkDefinitions'
import { SECTIONS } from '../data/sectionDefinitions'

function listToMd(items: string[]): string {
  if (!items?.length) return '_데이터 없음_\n'
  return items.map((item) => `- ${item}`).join('\n') + '\n'
}

function escapeCell(value: unknown): string {
  const s = String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ').trim()
  return s || '-'
}

function tableToMd(columns: string[], rows: unknown[]): string {
  if (!rows?.length) return '_데이터 없음_\n'
  const header = '| ' + columns.map(escapeCell).join(' | ') + ' |'
  const separator = '| ' + columns.map(() => '---').join(' | ') + ' |'
  const body = rows
    .map((row) => {
      const cells = Array.isArray(row) ? row : Object.values(row as Record<string, unknown>)
      return '| ' + cells.map(escapeCell).join(' | ') + ' |'
    })
    .join('\n')
  return header + '\n' + separator + '\n' + body + '\n'
}

function frameworkToMd(id: string, data: Record<string, unknown>): string {
  const fw: FrameworkDefinition | undefined = FRAMEWORKS[id]
  if (!fw || !data) return ''

  let md = `### ${fw.name}\n`
  md += `> [!info] ${fw.fullName}\n> ${fw.description}\n\n`

  for (const [key, fieldDef] of Object.entries(fw.fields)) {
    const value = data[key]
    if (value === undefined || value === null) continue

    if (fieldDef.type === 'list') {
      md += `**${fieldDef.label}**\n\n${listToMd(value as string[])}\n`
    } else if (fieldDef.type === 'text' || fieldDef.type === 'select') {
      const strVal = String(value)
      if (strVal.includes('\n')) {
        // 멀티라인 텍스트 (임베디드 테이블 등) → 블록 형태로 출력
        md += `**${fieldDef.label}**\n\n${strVal}\n\n`
      } else {
        md += `**${fieldDef.label}**: ${strVal}\n\n`
      }
    } else if (fieldDef.type === 'table') {
      md += `**${fieldDef.label}**\n\n${tableToMd(fieldDef.columns, value as unknown[])}\n`
    } else if (fieldDef.type === 'object') {
      md += `**${fieldDef.label}**\n\n`
      if (typeof value === 'object' && value !== null) {
        for (const [subKey, subVal] of Object.entries(value as Record<string, unknown>)) {
          const subLabel = fieldDef.subfields?.[subKey] || subKey
          md += `- **${subLabel}**: ${typeof subVal === 'object' ? JSON.stringify(subVal) : subVal}\n`
        }
      }
      md += '\n'
    }
  }

  return md
}

function executiveSummaryToMd(state: StrategyDocument): string {
  const es = state.executiveSummary
  if (!es) return ''

  const recLabels = { go: 'GO', conditional_go: 'CONDITIONAL GO', no_go: 'NO-GO' }
  let md = `## Executive Summary\n\n`
  md += `### ${es.title}\n\n`
  md += `**시장 기회**: ${es.opportunity}\n\n`
  md += `**핵심 전략**: ${es.strategy}\n\n`
  md += `**경쟁 우위**: ${es.competitiveAdvantage}\n\n`

  if (es.keyMetrics?.length) {
    md += `#### 핵심 수치\n\n`
    md += '| 지표 | 값 |\n| --- | --- |\n'
    for (const m of es.keyMetrics) {
      md += `| ${escapeCell(m.label)} | ${escapeCell(m.value)} |\n`
    }
    md += '\n'
  }

  if (es.risks?.length) {
    md += `#### 주요 리스크\n\n`
    md += es.risks.map((r) => `- ${r}`).join('\n') + '\n\n'
  }

  md += `#### 의사결정 권고: **${recLabels[es.recommendation]}**\n\n`
  md += `${es.recommendationReason}\n\n---\n\n`
  return md
}

function scenarioToMd(state: StrategyDocument): string {
  const sr = state.scenarioResult
  if (!sr) return ''

  const recLabels = { aggressive: '공격적 확장', conservative: '안정적 성장', pivot: '전략적 피벗' }
  let md = `## 시나리오 분석\n\n`

  for (const s of sr.scenarios) {
    const isRec = s.type === sr.recommendation
    md += `### ${s.label}${isRec ? ' ⭐ (AI 추천)' : ''}\n\n`
    md += `${s.overview}\n\n`

    if (s.keyDifferences?.length) {
      md += `**기본 전략 대비 차이점**\n\n`
      md += s.keyDifferences.map((d) => `- ${d}`).join('\n') + '\n\n'
    }

    md += `**경쟁 전략**: ${s.genericStrategy.strategy}\n`
    md += `- 근거: ${s.genericStrategy.rationale}\n`
    md += `- 실행: ${s.genericStrategy.actions}\n\n`

    md += `**STP**\n`
    md += `- 세분화: ${s.stp.segmentation}\n`
    md += `- 타겟팅: ${s.stp.targeting}\n`
    md += `- 포지셔닝: ${s.stp.positioning}\n\n`

    md += `**4P**\n`
    md += `- 제품: ${s.fourP.product}\n`
    md += `- 가격: ${s.fourP.price}\n`
    md += `- 유통: ${s.fourP.place}\n`
    md += `- 프로모션: ${s.fourP.promotion}\n\n`

    if (s.kpiTargets?.length) {
      md += '| KPI | 목표 |\n| --- | --- |\n'
      for (const k of s.kpiTargets) {
        md += `| ${escapeCell(k.label)} | ${escapeCell(k.target)} |\n`
      }
      md += '\n'
    }

    md += `- 리스크 수준: ${s.riskLevel}\n`
    md += `- 예상 ROI: ${s.expectedROI}\n`
    md += `- 타임라인: ${s.timeline}\n\n---\n\n`
  }

  md += `### 시나리오 비교 요약\n\n${sr.comparison}\n\n`
  md += `**AI 추천**: ${recLabels[sr.recommendation]} — ${sr.recommendationReason}\n\n---\n\n`
  return md
}

function financialToMd(state: StrategyDocument): string {
  const fr = state.financialResult
  if (!fr) return ''

  let md = `## 재무 시뮬레이션\n\n`

  // 시장 규모
  md += `### 시장 규모 (TAM/SAM/SOM)\n\n`
  md += `| 구분 | 규모 | 설명 |\n| --- | --- | --- |\n`
  md += `| TAM | ${fr.marketSizing.tam.value}${fr.marketSizing.tam.unit} | ${escapeCell(fr.marketSizing.tam.description)} |\n`
  md += `| SAM | ${fr.marketSizing.sam.value}${fr.marketSizing.sam.unit} | ${escapeCell(fr.marketSizing.sam.description)} |\n`
  md += `| SOM | ${fr.marketSizing.som.value}${fr.marketSizing.som.unit} | ${escapeCell(fr.marketSizing.som.description)} |\n\n`

  // 매출 예측
  if (fr.revenueProjections?.length) {
    md += `### 5년 매출 예측\n\n`
    md += '| 연도 | 매출 | 비용 | 이익 | 누적이익 |\n| --- | --- | --- | --- | --- |\n'
    for (const r of fr.revenueProjections) {
      md += `| ${r.year}년 | ${r.revenue.toLocaleString()} | ${r.cost.toLocaleString()} | ${r.profit.toLocaleString()} | ${r.cumulativeProfit.toLocaleString()} |\n`
    }
    md += '\n'
  }

  md += `- **초기 투자**: ${fr.initialInvestment.toLocaleString()}\n`
  md += `- **BEP**: ${fr.breakEvenMonth}개월\n`
  md += `- **3년 ROI**: ${fr.roi3Year}%\n`
  md += `- **5년 ROI**: ${fr.roi5Year}%\n\n`

  if (fr.keyAssumptions?.length) {
    md += `### 전제 조건\n\n`
    md += fr.keyAssumptions.map((a) => `- ${a}`).join('\n') + '\n\n'
  }

  md += `### 재무 요약\n\n${fr.summary}\n\n---\n\n`
  return md
}

function buildMarkdown(state: StrategyDocument): string {
  const date = new Date(state.createdAt).toISOString().split('T')[0]

  let md = `---
title: "${state.businessItem} - 전략 PRD"
date: ${date}
tags: [전략분석, PRD, ${state.businessItem}]
---

# ${state.businessItem} — 전략 PRD

> [!abstract] 자동 생성 전략 문서
> 전략분석기(Strategy Analyzer)로 생성됨 | ${date}

---

`

  // 경영진 요약 (문서 최상단)
  md += executiveSummaryToMd(state)

  for (const section of SECTIONS) {
    md += `## ${section.number}. ${section.title}\n`
    md += `*${section.subtitle} — ${section.description}*\n\n`

    for (const fId of section.frameworks) {
      const fState = state.frameworks[fId]
      if (fState?.status === 'completed' && fState.data) {
        md += frameworkToMd(fId, fState.data as unknown as Record<string, unknown>)
        md += '---\n\n'
      }
    }
  }

  // 시나리오 분석
  md += scenarioToMd(state)

  // 재무 시뮬레이션
  md += financialToMd(state)

  md += `\n---\n*Generated by Strategy Analyzer*\n`
  return md
}

export function exportMarkdown(state: StrategyDocument): void {
  const md = buildMarkdown(state)
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${state.businessItem}_전략PRD_${new Date().toISOString().split('T')[0]}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** 마크다운 문자열 생성 (미리보기용) */
export { buildMarkdown }
