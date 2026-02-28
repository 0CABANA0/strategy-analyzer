# PPTX 슬라이드 내보내기 (프리미엄 전용)

## 완료

- [x] pptxgenjs 패키지 설치 (19 packages, ~500KB)
- [x] `src/utils/exportPptx.ts` 구현 (표지, Executive Summary, 섹션별 프레임워크, 시나리오, 재무 차트, 마지막 슬라이드)
- [x] `src/pages/PreviewPage.tsx` — PPTX 버튼 추가 (프리미엄 체크, Lock 아이콘, 로딩 스피너)
- [x] TypeScript 타입 검증 통과
- [x] 174개 테스트 전부 통과
- [x] Vite 빌드 성공 (pptxgenjs 별도 청크 분리)

- [x] 수동 검증: Playwright로 pptxgenjs 브라우저 내 PPTX 생성 확인 (6슬라이드, 107KB)
  - 표지, 섹션 디바이더, 불릿 리스트, 테이블, 바 차트, 마지막 슬라이드 모두 정상
