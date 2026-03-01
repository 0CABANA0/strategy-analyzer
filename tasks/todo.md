# 현재 작업: 5가지 개선 — 완료

## DONE

- [x] **Skywork 제거** — skyworkProvider 삭제, ModelSelector/useSettings/useFinancialSimulation/테스트/.env.example에서 Skywork 코드 제거, OpenRouter 통일
- [x] **프리미엄 제한 제거** — useAuth에서 isPremium=!!user, useFinancialSimulation/FinancialPanel/PreviewPage/exportPptx/UserTable에서 프리미엄 잠금 제거
- [x] **FAW 추천 배너 개선** — SectionContainer에서 FAW 미완료 시 배너 표시 (기존: 추천 결과 없을 때만)
- [x] **전략검증→재분석** — ConsistencyPanel IssueCard에 "재분석" 버튼 추가, useAiGeneration.generateAll로 관련 프레임워크 재생성
- [x] **PPTX 슬라이드 템플릿** — 3종 템플릿(bullets, key-value, table) 시스템으로 교체. 필드 타입별 자동 분류→최적 템플릿 렌더링
- [x] 검증: typecheck + test(173개) + build 모두 통과
