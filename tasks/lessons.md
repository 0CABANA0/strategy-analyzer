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
