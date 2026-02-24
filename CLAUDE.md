# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 사용자 선호사항
- 설명 및 응답은 **한글**로 작성할 것

## 프로젝트 개요

사업 아이템을 입력하면 20개 전략 프레임워크 기반 전략 PRD를 AI가 자동 생성하는 웹 앱.
효성인력개발원 전략수립 교육 자료 기반. 5단계 위저드 → 미리보기 → HTML/Markdown 내보내기.

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
- 내보내기: HTML (미리보기 그대로) + Obsidian 호환 Markdown
- 테스트: Vitest + React Testing Library + jest-dom

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
자동 저장: LocalStorage 즉시 + Supabase upsert (2초 디바운스). 저장 실패 시 콘솔 경고만.
초기 로드: localStorage `strategy-analyzer:lastDocId` → `strategy-analyzer:doc:{id}` 복원.

### AI 서비스 계층

- `openrouterProvider.ts`: fetch → 에러 분류 (401→AuthError, 429→RateLimitError, 5xx→재시도)
- `aiService.ts`: `parseJsonResponse()` — DeepSeek `<think>` 태그 제거, 코드블록 제거, 중괄호 추출+복구
- `services/prompts/`: 20개 프레임워크별 프롬프트 템플릿 + 추천 프롬프트
- **컨텍스트 체인**: 이전 프레임워크 결과가 다음 프롬프트에 자동 주입됨

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
133개 테스트, 18개 파일.

## 주요 타입

- `FrameworkId`: 20개 프레임워크 리터럴 유니온
- `StrategyDocument`: 전체 문서 상태 (id, businessItem, frameworks, recommendation)
- `FrameworkData`: 20개 프레임워크 데이터 유니온
- `FrameworkState`: { status, data, updatedAt, error }
- `RecommendationResult`: { essential, recommended, optional } 분류

## 배포

Vercel (strategy-analyzer-one.vercel.app). `npx vercel --prod`로 배포.
SEO: index.html에 OG태그, JSON-LD, robots.txt, sitemap.xml 포함.
