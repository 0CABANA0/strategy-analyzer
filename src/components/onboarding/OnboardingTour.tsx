import { useState, useEffect, useCallback, useRef } from 'react'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'

const STORAGE_KEY = 'strategy-analyzer:onboarding-done'

interface TourStep {
  target: string      // CSS selector
  title: string
  description: string
  position: 'top' | 'bottom' | 'left' | 'right'
}

const STEPS: TourStep[] = [
  {
    target: '[data-tour="business-item"]',
    title: '사업 아이템',
    description: '분석 중인 사업 아이템이 여기에 표시됩니다. 홈에서 입력한 내용이 모든 프레임워크에 반영됩니다.',
    position: 'bottom',
  },
  {
    target: '[data-tour="section-tabs"]',
    title: '5단계 섹션 탭',
    description: '기획배경 → 환경분석 → 시사점 → 추진전략 → 기대효과, 5단계를 순서대로 진행하세요. Alt+1~5로 빠르게 이동할 수 있습니다.',
    position: 'bottom',
  },
  {
    target: '[data-tour="generate-all"]',
    title: 'AI 전체 생성',
    description: '이 버튼을 클릭하면 현재 섹션의 모든 프레임워크를 AI가 자동으로 분석합니다. Ctrl+Shift+Enter 단축키도 사용 가능합니다.',
    position: 'bottom',
  },
  {
    target: '[data-tour="preview-link"]',
    title: '미리보기 & 내보내기',
    description: '분석이 완료되면 미리보기 페이지에서 전체 PRD를 확인하고, PDF/HTML/PPTX로 내보낼 수 있습니다. Ctrl+E로 이동합니다.',
    position: 'bottom',
  },
]

export default function OnboardingTour() {
  const [active, setActive] = useState(false)
  const [step, setStep] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  // 첫 방문 확인
  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY)
    if (!done) {
      // 약간의 딜레이 후 시작 (페이지 렌더링 완료 대기)
      const timer = setTimeout(() => setActive(true), 800)
      return () => clearTimeout(timer)
    }
  }, [])

  // 현재 스텝의 타겟 요소 위치 추적
  const updateRect = useCallback(() => {
    if (!active) return
    const el = document.querySelector(STEPS[step].target)
    if (el) {
      setRect(el.getBoundingClientRect())
    } else {
      setRect(null)
    }
  }, [active, step])

  useEffect(() => {
    updateRect()
    window.addEventListener('resize', updateRect)
    window.addEventListener('scroll', updateRect, true)
    return () => {
      window.removeEventListener('resize', updateRect)
      window.removeEventListener('scroll', updateRect, true)
    }
  }, [updateRect])

  const finish = useCallback(() => {
    setActive(false)
    localStorage.setItem(STORAGE_KEY, 'true')
  }, [])

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1)
    else finish()
  }
  const prev = () => {
    if (step > 0) setStep(step - 1)
  }

  if (!active) return null

  const current = STEPS[step]

  // 툴팁 위치 계산
  const tooltipStyle: React.CSSProperties = {}
  if (rect) {
    const gap = 12
    switch (current.position) {
      case 'bottom':
        tooltipStyle.top = rect.bottom + gap
        tooltipStyle.left = Math.max(16, rect.left + rect.width / 2 - 160)
        break
      case 'top':
        tooltipStyle.bottom = window.innerHeight - rect.top + gap
        tooltipStyle.left = Math.max(16, rect.left + rect.width / 2 - 160)
        break
      case 'right':
        tooltipStyle.top = rect.top + rect.height / 2 - 60
        tooltipStyle.left = rect.right + gap
        break
      case 'left':
        tooltipStyle.top = rect.top + rect.height / 2 - 60
        tooltipStyle.right = window.innerWidth - rect.left + gap
        break
    }
  } else {
    // 타겟 요소가 없으면 화면 중앙
    tooltipStyle.top = '50%'
    tooltipStyle.left = '50%'
    tooltipStyle.transform = 'translate(-50%, -50%)'
  }

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[9999]">
      {/* 반투명 오버레이 */}
      <div className="absolute inset-0 bg-black/40" onClick={finish} />

      {/* 하이라이트 영역 (타겟 요소 주변) */}
      {rect && (
        <div
          className="absolute border-2 border-primary-400 rounded-lg pointer-events-none"
          style={{
            top: rect.top - 4,
            left: rect.left - 4,
            width: rect.width + 8,
            height: rect.height + 8,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)',
            zIndex: 1,
          }}
        />
      )}

      {/* 툴팁 */}
      <div
        className="absolute z-10 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 animate-fade-in"
        style={tooltipStyle}
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">{current.title}</h3>
          <button
            onClick={finish}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
          {current.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {step + 1} / {STEPS.length}
          </span>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={prev}
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-3 h-3" />
                이전
              </button>
            )}
            <button
              onClick={next}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              {step < STEPS.length - 1 ? (
                <>
                  다음
                  <ChevronRight className="w-3 h-3" />
                </>
              ) : '시작하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
