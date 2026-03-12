import type { PromptTemplate } from '../../types'
import { getCustomFrameworks } from '../../utils/customFrameworks'
import { createCustomPrompt } from './customPrompt'
import { faw, threeC, ansoff } from './step1'
import { pest, fiveForces, ilc, marketAnalysis, customerAnalysis, competitorAnalysis, strategyCanvas, valueChain, sevenS, vrio } from './step2'
import { swot } from './step3'
import { genericStrategy, stp, errc, fourP, wbs } from './step4'
import { kpi } from './step5'

export { recommendationPrompt } from './recommendation'
export { consistencyCheckPrompt } from './validation'
export { executiveSummaryPrompt } from './executive'
export { scenarioPrompt } from './scenario'
export { financialPrompt } from './financial'

export const promptTemplates: Record<string, PromptTemplate> = {
  faw,
  threeC,
  ansoff,
  pest,
  fiveForces,
  ilc,
  marketAnalysis,
  customerAnalysis,
  competitorAnalysis,
  strategyCanvas,
  valueChain,
  sevenS,
  vrio,
  swot,
  genericStrategy,
  stp,
  errc,
  fourP,
  wbs,
  kpi,
}

/** 커스텀 프레임워크 프롬프트를 동적으로 등록 */
export function ensureCustomPrompts(): void {
  for (const cf of getCustomFrameworks()) {
    if (!promptTemplates[cf.id]) {
      promptTemplates[cf.id] = createCustomPrompt(cf)
    }
  }
}
