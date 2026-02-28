# Strategy Analyzer (전략분석기)

사업 아이템을 입력하면 **20개 전략 프레임워크** 기반 전략 PRD를 AI로 자동 생성하는 실전 전략수립 도구입니다.

> MBA 전략 프레임워크 기반 — 기획배경부터 KPI까지 전 과정을 AI가 분석

## 주요 기능

- **AI 분석전략 추천** — 사업 아이템에 맞는 프레임워크를 필수/권장/선택으로 분류, 추천도(%)와 사유 제시
- **16개 프레임워크 자동 분석** — FAW, 3C, PEST, 5-Forces, SWOT, STP, 4P 등
- **AI 컨텍스트 체인** — 이전 프레임워크 결과가 다음 프롬프트에 자동 주입
- **멀티 모델 지원** — OpenRouter 하나의 키로 Claude, GPT, Gemini, DeepSeek 등 8개+ 모델
- **내보내기** — Obsidian 마크다운 + PDF
- **다크 모드** — 시스템/라이트/다크 3-way 자동 전환
- **모바일 반응형** — 햄버거 메뉴 + 사이드바 드로어
- **토스트 알림** — 성공/에러/경고/정보 4종
- **히스토리** — 검색, 정렬, 벌크 삭제
- **AI 파라미터 조절** — Temperature, Max Tokens 슬라이더

## 기술 스택

| 카테고리 | 기술 |
|---------|------|
| 프론트엔드 | React 19, TypeScript (strict), Vite 7 |
| 스타일링 | Tailwind CSS 4 (다크 모드) |
| AI API | OpenRouter (멀티 모델) |
| 저장 | LocalStorage (자동 저장/복원) |
| 내보내기 | html2pdf.js, Obsidian Markdown |
| 테스트 | Vitest, React Testing Library |
| 에러 처리 | 커스텀 에러 계층 + 지수 백오프 재시도 |

## 빠른 시작

```bash
# 의존성 설치
npm install

# 개발 서버 (localhost:5173)
npm run dev
```

### API 키 설정

`.env` 파일에 OpenRouter API 키를 추가하세요:

```env
VITE_OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxx
```

또는 앱 내 설정 페이지에서 브라우저에 직접 입력 가능합니다.
API 키가 없으면 샘플 데이터로 체험할 수 있습니다.

> API 키 발급: [openrouter.ai/keys](https://openrouter.ai/keys)

## 명령어

```bash
npm run dev        # 개발 서버
npm run build      # tsc --noEmit + Vite 프로덕션 빌드
npm run preview    # 빌드 결과 미리보기
npm run test       # Vitest watch 모드
npm run test:run   # Vitest 일회 실행 (99개 테스트)
npm run typecheck  # TypeScript 타입 체크
npm run lint       # ESLint
```

## 지원 AI 모델

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

## 16개 전략 프레임워크

5단계 위저드로 순차 분석합니다:

| 단계 | 프레임워크 |
|------|-----------|
| 1. 외부환경 분석 | FAW, 3C, Ansoff Matrix, PEST |
| 2. 산업구조 분석 | 5-Forces, ILC, 시장분석, 고객분석 |
| 3. 내부역량 분석 | 경쟁사분석, Strategy Canvas, Value Chain, 7S |
| 4. 전략수립 | VRIO, SWOT, Generic Strategy, STP |
| 5. 실행계획 | ERRC, 4P, WBS, KPI |

## 프로젝트 구조

```
src/
├── types/              # TypeScript 타입 정의 (7개)
├── data/               # 프레임워크/모델/섹션/샘플 데이터
├── hooks/              # 상태관리, AI 생성, 설정, 테마, 토스트
├── services/           # OpenRouter API, 프롬프트 템플릿
├── utils/              # 에러 처리, 재시도, 내보내기
├── components/
│   ├── common/         # Skeleton, Toast, ConfirmModal, Progress
│   ├── layout/         # Header, Sidebar, MobileSidebar
│   ├── wizard/         # StepIndicator, StepNavigation, WizardShell
│   ├── frameworks/     # 16개 프레임워크 카드 + FieldRenderer
│   ├── recommendation/ # AI 추천 패널
│   └── preview/        # 문서 미리보기
├── pages/              # Home, Analyzer, Preview, History, Settings
└── test/               # 테스트 헬퍼 + setup
```

## 핵심 설계

- **코드 스플리팅** — React.lazy + Suspense, manualChunks (메인 번들 211KB)
- **AI 컨텍스트 체인** — 이전 분석 결과가 다음 프롬프트에 자동 주입
- **JSON 모드** — `response_format: { type: "json_object" }` + 3단계 파싱 복구
- **에러 처리** — ApiError/NetworkError/RateLimitError/AuthError 분류, 재시도 버튼
- **자동 저장** — useReducer 상태가 LocalStorage에 실시간 동기화

## 라이선스

MIT
