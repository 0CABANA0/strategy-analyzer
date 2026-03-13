# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 사용자 선호사항
- 설명 및 응답은 **한글**로 작성할 것

## 프로젝트 개요

사업 아이템을 입력하면 20개 전략 프레임워크 기반 전략 PRD를 AI가 자동 생성하는 실전 전략수립 웹 앱.
MBA 전략 프레임워크 기반. 5단계 위저드 → 미리보기 → HTML/Markdown/PDF/PPTX 내보내기.

### 주요 기능

- 20개 프레임워크 AI 자동 생성 (SSE 스트리밍 지원)
- 4대 고급 분석: 전략검증, 경영진 요약, 시나리오 분기, 재무 시뮬레이션
- 모델 A/B 비교 — 2개 모델 병렬 생성 → 결과 비교 → 선택
- AI 코칭 — 프레임워크별 점수/강점/개선제안/누락관점
- 문서 비교 — 2개 PRD diff 하이라이트
- 커스텀 프레임워크 — 사용자 정의 이름/필드/프롬프트
- 팀 워크스페이스 — 팀 생성/초대/공동 문서
- 공유 링크 — 읽기 전용 퍼블릭 URL
- 업종별 템플릿 — 6개 업종 × 4개 예시
- 온보딩 투어 — 첫 방문 4단계 가이드
- 프레임워크 드래그 정렬 / 검색
- 프레임워크 상관관계 매트릭스 — 20×20 SVG 히트맵 (정적 45개 관계 + 동적 텍스트 유사도)
- 키보드 단축키 (Ctrl+Enter, Alt+1~5, Ctrl+E)
- Supabase 인증 + 관리자 대시보드

## 명령어

```bash
npm run dev          # Vite 개발 서버 (localhost:5173)
npm run build        # tsc --noEmit + Vite 프로덕션 빌드
npm run typecheck    # TypeScript strict 타입 검증만
npm run test         # Vitest watch 모드
npm run test:run     # Vitest 일회 실행 (CI)
npm run lint         # ESLint
npx vercel --prod    # Vercel 프로덕션 배포
```

단일 테스트 파일: `npx vitest run src/utils/__tests__/retry.test.ts`

## 기술 스택

- React 19 + Vite 7 + Tailwind CSS 4 + **TypeScript strict**
- AI: OpenRouter (Claude, GPT, Gemini, DeepSeek 등 멀티모델)
- 저장: LocalStorage (즉시) + Supabase (디바운스 2초 동기화)
- 인증: Supabase Auth (이메일/비밀번호)
- 내보내기: HTML + Obsidian 호환 Markdown + PDF (html2pdf.js, A4 보고서) + PPTX (pptxgenjs)
- 테스트: Vitest + React Testing Library + jest-dom
- UI: 다크모드 지원, 반응형 (모바일 사이드바), 프레임워크 lazy loading

## 환경변수 (.env)

```
VITE_OPENROUTER_API_KEY=sk-or-v1-xxx    # .env > 브라우저 입력 (우선순위)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx
VITE_SITE_URL=https://strategy-analyzer-one.vercel.app
```

API 키 없으면 자동으로 샘플 데이터 사용 (sampleData.ts).

## 아키텍처

### 데이터 흐름

```
사용자 입력(businessItem)
  → useStrategy Context (useReducer)
  → useAiGeneration (callAI + withRetry)
  → OpenRouter API (JSON 모드)
  → parseJsonResponse (3단계 JSON 복구: think태그 → 코드블록 → 중괄호 추출)
  → setFrameworkData → LocalStorage 즉시 + Supabase 디바운스 저장
  → DocumentPreview (텍스트 내 마크다운 테이블 자동 파싱 → HTML 테이블)
```

### 상태관리

`useStrategyDocument.tsx` — Context + useReducer, discriminated union 액션.
자동 저장: LocalStorage 즉시 + Supabase upsert (2초 디바운스). `saveStatus` 상태 머신 (`idle→saving→saved→idle`, 에러 시 `error`).
초기 로드: localStorage `strategy-analyzer:lastDocId` → `strategy-analyzer:doc:{id}` 복원.

### AI 서비스 계층

- `openrouterProvider.ts`: fetch → 에러 분류 (401→AuthError, 429→RateLimitError, 5xx→재시도)
- `openrouterStream.ts`: SSE 스트리밍 호출 + 청크 수집 (실시간 타이핑 효과)
- `aiService.ts`: `parseJsonResponse()` — DeepSeek `<think>` 태그 제거, 코드블록 제거, 중괄호 추출+복구
- `sourceAnalyzer.ts`: 소스 자료 AI 요약 → 프레임워크 프롬프트에 구조화 주입 (RAG 강화)
- `services/prompts/`: 20개 프레임워크별 프롬프트 + 추천 + 코칭 + 커스텀 프롬프트
- **컨텍스트 체인**: 이전 프레임워크 결과가 다음 프롬프트에 자동 주입됨 (일관성 사전 유지, 1000자)

### 에러 처리

`ApiError` → `NetworkError`(재시도O) / `RateLimitError`(retryAfterMs) / `AuthError`(재시도X).
`withRetry()`: 지수 백오프 (2^attempt × baseDelay), RateLimitError는 retryAfterMs 대기.
`getUserFriendlyMessage()`: 에러 → 한글 메시지 변환.

### 프레임워크 시스템

`data/frameworkDefinitions.ts`: 20개 프레임워크 메타데이터 (id, name, fields, section).
`data/sectionDefinitions.ts`: 5개 섹션 (기획배경→환경분석→시사점→추진전략→기대효과).
필드 타입: `text | list | select | object | table` — FieldRenderer가 타입별 자동 렌더링.
프레임워크 상태: `empty | generating | completed | error`.

### 내보내기

- **HTML** (`exportHtml.ts`): 페이지 CSS 전체 인라인 + `#document-preview` outerHTML 저장. Ctrl+P로 벡터 PDF 변환 가능.
- **Markdown** (`exportMarkdown.ts`): Obsidian 호환. 셀 `|` 이스케이프, 줄바꿈→공백, 빈 셀→`-`. 멀티라인 텍스트(임베디드 테이블)는 블록 형태로 출력.
- **PDF** (`exportPdf.ts`): html2pdf.js 기반. Skywork A4 보고서 스타일 (orphans/widows, 20/15/25/15mm 마진, 794px 뷰포트). `pdf-exporting` CSS 클래스 토글.
- **PPTX** (`exportPptx.ts`): pptxgenjs 기반. 3종 슬라이드 템플릿. 다크모드 테마 선택 가능.
- **DocumentPreview**: `RichText` 컴포넌트가 텍스트 필드 내 마크다운 테이블 패턴을 자동 감지하여 HTML `<table>`로 렌더링.

### 인증 & 관리자

`useAuth.tsx`: Supabase Auth 래퍼. Profile 자동 동기화, suspended 사용자 자동 로그아웃.
관리자: `AdminPage` — 전역 모델 설정 (app_settings 테이블), 사용자 관리, 활동 로그.
인증 가드: `AuthGuard`, `AdminGuard` 컴포넌트.

### Vite 프록시

개발 환경에서 `/api/openrouter/*` → `https://openrouter.ai/*` 프록시 (CORS 우회).
프로덕션에서는 OpenRouter 직접 호출.

## 테스트

`src/test/helpers.tsx`: `renderWithProviders()` — 모든 Provider(Auth, Settings, Strategy, Toast 등) 래핑.
테스트 파일: `__tests__/` 디렉토리 (hooks, pages, components, services, utils 각각).
248개 테스트, 37개 파일.

### 주요 훅 (19개)

| 훅 | 역할 |
|-----|------|
| `useStrategy` | 문서 상태 관리 (Context + useReducer) |
| `useAiGeneration` | AI 생성 (스트리밍/일괄), 진행 상태, 경과 시간 |
| `useAiCoaching` | 프레임워크별 AI 코칭 (점수/강점/개선/누락관점) |
| `useSettings` | API 키, 모델, 언어 등 설정 |
| `useAuth` | Supabase 인증 래퍼 |
| `useTeam` | 팀 생성/초대/문서 공유 |
| `useConsistencyCheck` | 전략 일관성 검증 (이력 추적 + 되돌리기) |
| `useFrameworkOrder` | 프레임워크 드래그 정렬 (localStorage) |
| `useKeyboardShortcuts` | 전역 키보드 단축키 |
| `useRecommendation` | 전략 검증 |
| `useExecutiveSummary` | 경영진 요약 |
| `useScenario` | 시나리오 분기 |
| `useFinancialSimulation` | 재무 시뮬레이션 |

## 주요 타입

- `FrameworkId`: 20개 프레임워크 리터럴 유니온
- `StrategyDocument`: 전체 문서 상태 (id, businessItem, frameworks, recommendation)
- `FrameworkData`: 20개 프레임워크 데이터 유니온
- `FrameworkState`: { status, data, updatedAt, error }
- `RecommendationResult`: { essential, recommended, optional } 분류

## Supabase 테이블

| 테이블 | 용도 |
|--------|------|
| `strategy_documents` | 문서 저장 (user_id, frameworks JSON) |
| `profiles` | 사용자 프로필 (display_name) |
| `app_settings` | 전역 설정 (모델 등) |
| `shared_documents` | 공유 링크 (shareId → documentId) |
| `teams` | 팀 메타데이터 |
| `team_members` | 팀 구성원 (role: owner/admin/member) |
| `team_documents` | 팀 문서 연결 |

모든 테이블에 RLS 정책 적용.

## 배포

Vercel (strategy-analyzer-one.vercel.app). `npx vercel --prod`로 배포.
SEO: index.html에 OG태그, JSON-LD, robots.txt, sitemap.xml 포함.
