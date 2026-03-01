# 현재 작업: PPTX 템플릿 커스터마이징 시스템 — 완료

## DONE

- [x] **PptxTemplate 타입 정의** — 디자인 토큰(colors, fonts, layout) 인터페이스 + 기본/내장 템플릿 상수
- [x] **템플릿 저장소** — localStorage CRUD + PPTX 테마 XML 추출 (JSZip + DOMParser)
- [x] **TemplateSelector UI** — 드롭다운 선택 + 업로드 + 삭제 컴포넌트
- [x] **exportPptx 리팩토링** — 하드코딩 색상/폰트/레이아웃 → 템플릿 파라미터 기반
- [x] **PreviewPage 통합** — TemplateSelector + PPTX 버튼 연동
- [x] 검증: typecheck + test(173개) + build 모두 통과

## DONE (이전 작업)

- [x] Skywork 제거, 프리미엄 해제, FAW 배너, 재분석 버튼, PPTX 슬라이드 템플릿 3종
