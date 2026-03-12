# 교훈 (Lessons Learned)

## 2026-02-28: pptxgenjs 동적 import 필수

- **증상**: pptxgenjs를 정적 import하면 PreviewPage 테스트가 5초 타임아웃에 걸림
- **원인**: pptxgenjs (~500KB)가 import 체인에 포함되어 jsdom 모듈 해석 시간 증가
- **해결**: `import type PptxGenJS` (타입만) + `await import('pptxgenjs')` (런타임 동적 로드)
- **효과**: 테스트 통과 + Vite 코드 스플리팅으로 별도 청크 분리 (초기 로딩 최적화)

## 2026-02-28: pptxgenjs 타입 이름 주의

- `SHAPE_NAME`은 string 리터럴 유니온 → `'rect' as PptxGenJS.SHAPE_NAME` 캐스팅 필요
- 차트 옵션: `valueFontSize` 없음 → `dataLabelFontSize`, `valAxisNumFmt` 없음 → `valAxisLabelFormatCode`
- 타입 정의 파일 직접 확인이 가장 확실: `node_modules/pptxgenjs/types/index.d.ts`

## 2026-03-12: Lucide React 아이콘에 title prop 불가

- **증상**: `<CheckCircle2 title="분석 완료" />` → TS2322 타입 에러
- **원인**: Lucide React 컴포넌트가 `title` prop을 지원하지 않음
- **해결**: `<span title="분석 완료"><CheckCircle2 /></span>`으로 래핑

## 2026-03-12: useAuth 훅 인터페이스 확인 필수

- **증상**: `const { authState } = useAuth()` → TS2339 (authState 없음)
- **원인**: useAuth는 `user` 객체를 직접 노출, `authState` 래퍼 없음
- **해결**: `const { user } = useAuth()` + `user?.id` 접근

## 2026-03-12: 커스텀 프레임워크 런타임 등록

- FRAMEWORKS 객체와 promptTemplates 양쪽 모두에 등록해야 AI 생성이 동작
- `registerCustomFramework()` + `ensureCustomPrompts()` 두 함수를 분리하여 관리
- `ensureCustomPrompts()`는 generate 호출 직전에 실행 (lazy initialization)

## 2026-03-12: callAI는 AiCallParams 객체 1개를 받음

- **증상**: `callAI(system, user, apiKey, model)` → TS2554 인수 개수 에러
- **원인**: callAI 시그니처는 `callAI(params: AiCallParams)` — 객체 1개
- **해결**: `callAI({ apiKey, model, system, user })` 형태로 호출

## 2026-03-12: Settings vs SettingsContextValue 구분

- `Settings` 타입: `{ model, language, temperature, maxTokens }` — apiKey 없음
- `SettingsContextValue`에 `apiKey`, `browserApiKey`, `hasApiKey()` 존재
- 훅 사용: `const { settings, apiKey } = useSettings()` — settings.apiKey 아님

## 2026-03-12: Supabase insert 시 NOT NULL 컬럼 누락

- **증상**: `null value in column "document_id" violates not-null constraint`
- **원인**: `shared_documents.insert()`에서 `document_id` 필드를 전달하지 않음
- **해결**: `document_id: state.id` 추가
- **교훈**: 마이그레이션 SQL의 NOT NULL 컬럼과 클라이언트 insert 코드를 반드시 대조할 것

## 2026-03-12: 환경변수 trailing newline 주의

- **증상**: 공유 링크 URL에 `\n`이 포함되어 접근 불가
- **원인**: Vercel 환경변수 `VITE_SITE_URL`에 줄바꿈 문자 포함
- **해결**: `.trim()` 방어 코드 추가
- **교훈**: 환경변수에서 가져온 문자열은 항상 `.trim()` 처리할 것

## 2026-03-12: CSS box-shadow 오버레이 트릭

- 하이라이트 영역 외 전체를 어둡게: `box-shadow: 0 0 0 9999px rgba(0,0,0,0.4)`
- 별도 오버레이 DOM 불필요, 하이라이트 요소 하나에 적용
- 온보딩 투어, 스포트라이트 등에 활용
