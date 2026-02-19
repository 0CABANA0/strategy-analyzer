# Strategy Analyzer (전략분석기)

## 프로젝트 개요
사업 아이템을 입력하면 16개 전략 프레임워크 기반 전략 PRD를 AI로 자동 생성하는 웹 앱.
효성인력개발원 전략수립 교육 자료 기반.

## 기술 스택
- **프론트엔드**: React 19 + Vite 7 + Tailwind CSS 4 + **TypeScript (strict)**
- **AI API**: OpenRouter (하나의 키로 Claude, GPT, Gemini, DeepSeek 등 사용)
- **저장**: LocalStorage
- **내보내기**: Obsidian 마크다운 + PDF (html2pdf.js)
- **테스트**: Vitest + React Testing Library + jest-dom
- **에러 처리**: 커스텀 에러 클래스 계층 + 지수 백오프 재시도

## 명령어

```bash
npm run dev        # 개발 서버 (localhost:5173)
npm run build      # tsc --noEmit + Vite 프로덕션 빌드
npm run preview    # 빌드 결과 미리보기
npm run test       # Vitest watch 모드
npm run test:run   # Vitest 일회 실행
npm run typecheck  # TypeScript 타입 체크
npm run lint       # ESLint
```

## API 키 설정

`.env` 파일에 OpenRouter API 키를 설정하세요 (`.env.example` 참고):

```env
VITE_OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxx
```

또는 설정 페이지에서 브라우저에 직접 입력 가능 (LocalStorage 저장).
우선순위: `.env` > 브라우저 입력

## 지원 모델

| 카테고리 | 모델 | ID | 입력/출력 ($/M) |
|---------|------|-----|----------------|
| **가성비 추천** | Gemini 2.5 Flash | `google/gemini-2.5-flash` | $0.30 / $2.50 |
| 가성비 | GPT-4.1 Mini | `openai/gpt-4.1-mini` | $0.40 / $1.60 |
| 가성비 | DeepSeek V3 | `deepseek/deepseek-chat` | $0.30 / $1.20 |
| 프리미엄 | Gemini 2.5 Pro | `google/gemini-2.5-pro` | $1.25 / $10.00 |
| 프리미엄 | Claude Sonnet 4 | `anthropic/claude-sonnet-4` | $3.00 / $15.00 |
| 프리미엄 | GPT-4o | `openai/gpt-4o` | $2.50 / $10.00 |
| **최저가** | DeepSeek V3.2 | `deepseek/deepseek-v3.2` | $0.25 / $0.38 |
| 저비용 | DeepSeek R1 | `deepseek/deepseek-r1` | $0.70 / $2.50 |

## 디렉토리 구조

```
src/
├── types/                         # TypeScript 타입 정의
│   ├── framework.ts               #   FrameworkId, FieldDef, 20개 데이터 인터페이스
│   ├── document.ts                #   StrategyDocument, FrameworkState
│   ├── settings.ts                #   ModelDefinition, Settings
│   ├── section.ts                 #   SectionDefinition
│   ├── api.ts                     #   AiCallParams, OpenRouterResponse
│   ├── recommendation.ts          #   RecommendationResult
│   └── index.ts                   #   배럴 re-export
├── data/
│   ├── frameworkDefinitions.ts    # 16개 프레임워크 메타데이터
│   ├── sectionDefinitions.ts      # 5개 섹션
│   ├── modelDefinitions.ts        # OpenRouter 모델 정의
│   └── sampleData.ts              # 샘플 데이터 (API 키 없이 테스트용)
├── hooks/
│   ├── useStrategyDocument.tsx    # Context + useReducer 상태관리 (핵심)
│   ├── useSettings.tsx            # 모델 선택 + API 키 (.env / 브라우저)
│   ├── useWizard.ts               # 위저드 스텝 관리
│   ├── useAiGeneration.ts         # AI 생성 로직 (withRetry 통합)
│   ├── useRecommendation.ts       # AI 분석전략 추천 로직
│   └── useLocalStorage.ts         # 자동 저장/복원 (제네릭)
├── services/
│   ├── aiService.ts               # API 추상화 + JSON 파싱 복구
│   ├── openrouterProvider.ts      # OpenRouter API 호출 (에러 분류)
│   └── promptTemplates.ts         # 프레임워크별 프롬프트 + 추천 프롬프트
├── utils/
│   ├── errors.ts                  # 에러 클래스 계층 (ApiError, RateLimitError 등)
│   ├── retry.ts                   # 지수 백오프 재시도 (withRetry)
│   ├── exportMarkdown.ts          # Obsidian 호환 마크다운
│   └── exportPdf.ts               # PDF 내보내기
├── components/
│   ├── layout/                    # Header, Sidebar (추천 뱃지 표시)
│   ├── wizard/                    # StepIndicator, StepNavigation, WizardShell
│   ├── frameworks/                # 16개 프레임워크 카드 + FrameworkCard 래퍼
│   ├── recommendation/            # RecommendationPanel (추천 결과 UI)
│   └── preview/                   # DocumentPreview
├── pages/
│   ├── HomePage.tsx               # 사업 아이템 입력 + 분석전략 추천
│   ├── AnalyzerPage.tsx           # 위저드 (5단계)
│   ├── PreviewPage.tsx            # 문서 미리보기 + 내보내기
│   ├── HistoryPage.tsx            # 저장된 문서 목록
│   └── SettingsPage.tsx           # OpenRouter API 키 + 모델 선택
└── test/
    ├── setup.ts                   # jest-dom 매처 설정
    └── helpers.tsx                # renderWithProviders 테스트 헬퍼
```

## 핵심 설계

- **TypeScript strict**: 모든 파일이 .ts/.tsx, noEmit 모드로 타입 검증
- **OpenRouter 통합**: 하나의 API 키로 8개+ 모델 교체 사용. Vite 프록시(`/api/openrouter`) 경유
- **API 키 우선순위**: `.env` 파일 > 브라우저 LocalStorage 입력
- **상태관리**: `useStrategyDocument` — Context + useReducer, 자동 LocalStorage 저장
- **AI 컨텍스트 체인**: 이전 프레임워크 결과가 다음 프레임워크 프롬프트에 자동 주입됨
- **JSON 모드**: OpenRouter `response_format: { type: "json_object" }` 사용
- **샘플 데이터**: API 키 없으면 자동으로 샘플 데이터 사용 (식단관리 앱 예시)
- **에러 처리**: ApiError/NetworkError/RateLimitError/AuthError 분류, 지수 백오프 재시도, 한글 사용자 메시지
- **AI 분석전략 추천**: 사업 아이템 입력 시 AI가 16개 프레임워크를 필수/권장/선택으로 분류하고 사유를 제시
