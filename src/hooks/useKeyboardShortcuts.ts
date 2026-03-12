import { useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useWizard } from './useWizard'
import { useAiGeneration } from './useAiGeneration'
import { SECTIONS } from '../data/sectionDefinitions'
import { useStrategy } from './useStrategyDocument'

/**
 * 전역 키보드 단축키 훅
 *
 * | 단축키               | 동작                        |
 * |---------------------|-----------------------------|
 * | Ctrl+Enter          | 포커스된 프레임워크 AI 생성     |
 * | Ctrl+Shift+Enter    | 현재 섹션 전체 AI 생성         |
 * | Alt+1~5             | 섹션 탭 전환                  |
 * | Ctrl+E              | 미리보기 페이지 이동            |
 */
export function useKeyboardShortcuts() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentStep, goToStep } = useWizard()
  const { generate, generateAll, isGeneratingAny } = useAiGeneration()
  const { state } = useStrategy()

  /** 포커스된 요소에서 가장 가까운 FrameworkCard의 data-framework-id 반환 */
  const getFocusedFrameworkId = useCallback((): string | null => {
    const el = document.activeElement
    if (!el) return null
    const card = el.closest('[data-framework-id]')
    return card?.getAttribute('data-framework-id') ?? null
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // input/textarea/contenteditable에서는 단축키 비활성화
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      // Ctrl+E → 미리보기 페이지
      if (e.ctrlKey && !e.shiftKey && !e.altKey && e.key === 'e') {
        e.preventDefault()
        if (location.pathname === '/preview') {
          navigate('/analyzer')
        } else {
          navigate('/preview')
        }
        return
      }

      // Alt+1~5 → 섹션 탭 전환 (분석기 페이지에서만)
      if (e.altKey && !e.ctrlKey && !e.shiftKey && /^[1-5]$/.test(e.key)) {
        if (location.pathname === '/analyzer') {
          e.preventDefault()
          goToStep(parseInt(e.key, 10))
        }
        return
      }

      // Ctrl+Shift+Enter → 현재 섹션 전체 AI 생성
      if (e.ctrlKey && e.shiftKey && e.key === 'Enter') {
        if (location.pathname === '/analyzer' && !isGeneratingAny) {
          e.preventDefault()
          const section = SECTIONS.find((s) => s.number === currentStep)
          if (section) {
            generateAll(section.frameworks)
          }
        }
        return
      }

      // Ctrl+Enter → 포커스된 프레임워크 AI 생성
      if (e.ctrlKey && !e.shiftKey && e.key === 'Enter') {
        if (location.pathname === '/analyzer' && !isGeneratingAny) {
          e.preventDefault()
          const frameworkId = getFocusedFrameworkId()
          if (frameworkId) {
            // 이미 완료된 프레임워크는 재생성
            generate(frameworkId)
          } else {
            // 포커스된 카드가 없으면 현재 섹션의 첫 번째 미완료 프레임워크 생성
            const section = SECTIONS.find((s) => s.number === currentStep)
            if (section) {
              const firstEmpty = section.frameworks.find(
                (id) => state?.frameworks[id]?.status !== 'completed'
              )
              if (firstEmpty) generate(firstEmpty)
            }
          }
        }
        return
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [
    navigate, location.pathname, goToStep, currentStep,
    generate, generateAll, isGeneratingAny,
    getFocusedFrameworkId, state,
  ])
}
