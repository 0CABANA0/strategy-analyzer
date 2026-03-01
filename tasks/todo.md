# 현재 작업: 소스 자료 업로드 기능 (NotebookLM 스타일)

## TODO

- [ ] **타입 정의** — SourceMaterial 인터페이스 + StrategyDocument 확장 + API 멀티모달 지원
- [ ] **소스 처리 유틸** — 텍스트 읽기, 이미지 리사이즈+Base64, URL 저장
- [ ] **상태관리 확장** — ADD_SOURCE, REMOVE_SOURCE 리듀서 액션
- [ ] **소스 업로드 UI** — 드래그앤드롭 + 파일선택 + URL 입력 + 소스 목록
- [ ] **프롬프트 통합** — buildSourceContext() + 이미지 멀티모달 content block
- [ ] **OpenRouter 멀티모달** — user 필드를 string | ContentBlock[] 지원
- [ ] **HomePage 통합** — SourceUploadZone 배치
- [ ] 검증: typecheck + test + build

## DONE (이전 작업)

- [x] 일관성 검증 피드백 재분석 + 코드 품질 개선

## DONE

- [x] **피드백 재분석** — generate(id, feedback?) + generateAll(ids, feedback?) 피드백 주입
- [x] **자동 재검증** — 재분석 후 runCheck() 자동 실행
- [x] **코드 품질 개선** — PPTX 템플릿명 변경, 미사용 파라미터/import 제거, 접근성 개선
- [x] 검증: typecheck + test(173개) + build 모두 통과

## DONE (이전 작업)

- [x] PPTX 템플릿 커스터마이징 시스템 (타입, 저장소, UI, exportPptx 리팩토링)
- [x] Skywork 제거, 프리미엄 해제, FAW 배너, 재분석 버튼, PPTX 슬라이드 템플릿 3종
