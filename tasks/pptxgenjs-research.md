# pptxgenjs 라이브러리 조사 결과

## 조사일시
2026-02-28

## 라이브러리 기본 정보

| 항목 | 내용 |
|------|------|
| **공식명칭** | PptxGenJS |
| **Context7 ID** | /gitbrent/pptxgenjs |
| **출처평판** | High (Benchmark: 89.5/100) |
| **코드 스니펫** | 47개 |
| **라이센스** | Open Source (MIT) |
| **GitHub** | https://github.com/gitbrent/pptxgenjs |
| **공식 문서** | https://gitbrent.github.io/PptxGenJS |

---

## 1. 기본 프레젠테이션 생성 + 슬라이드 추가

### 최소 코드 (TypeScript/ES6)

```typescript
import pptxgen from "pptxgenjs";

// 1. 프레젠테이션 생성
let pres = new pptxgen();

// 2. 슬라이드 추가
let slide = pres.addSlide();

// 3. 콘텐츠 추가 (텍스트, 테이블, 이미지, 차트 등)
slide.addText("Hello World from PptxGenJS!", {
  x: 1,
  y: 1,
  color: "363636"
});

// 4. 저장
pres.writeFile();
```

### 레이아웃 설정

```typescript
let pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';  // 기본값
// pres.layout = 'LAYOUT_4x3';
// pres.layout = 'LAYOUT_16x10';
// pres.layout = 'LAYOUT_WIDE';
```

### 메타데이터 설정

```typescript
pres.author = 'John Smith';
pres.company = 'Acme Corporation';
pres.title = 'Q4 Financial Results';
pres.subject = 'Quarterly Business Review';
pres.revision = '2';

// 테마 폰트 설정
pres.theme = {
  headFontFace: 'Arial Narrow',
  bodyFontFace: 'Arial'
};

// RTL 모드 (아랍어, 헤브라이어 등)
pres.rtlMode = true;
```

---

## 2. 텍스트 추가 (addText) — 포매팅 옵션

### 기본 텍스트

```typescript
slide.addText('Basic text', { 
  x: 0.5, 
  y: 0.5, 
  fontSize: 18 
});
```

### 고급 포매팅 옵션

```typescript
slide.addText('Styled Text Box', {
  // 위치 및 크기
  x: 1,
  y: 1.5,
  w: 8,              // 너비 (인치)
  h: 1,              // 높이 (인치)

  // 폰트 스타일
  fontFace: 'Arial',
  fontSize: 20,
  bold: true,
  italic: false,
  underline: true,
  strikethrough: false,

  // 색상
  color: '0088CC',   // 16진수 (RGB)

  // 정렬
  align: 'center',   // 'left', 'center', 'right', 'justify'
  valign: 'middle',  // 'top', 'middle', 'bottom'

  // 배경 & 테두리
  fill: { 
    color: 'F1F1F1'  // 배경색
  },
  line: { 
    color: '0088CC', 
    width: 2         // 테두리 너비 (포인트)
  }
});
```

### 혼합 포매팅 (단일 텍스트 박스 내 여러 스타일)

```typescript
slide.addText([
  { text: 'This is ', options: { fontSize: 14 } },
  { text: 'bold', options: { fontSize: 14, bold: true } },
  { text: ' and this is ', options: { fontSize: 14 } },
  { text: 'italic', options: { fontSize: 14, italic: true, color: 'FF0000' } }
], { x: 6.5, y: 3, w: 3, h: 1 });
```

---

## 3. 테이블 추가 (addTable)

### 데이터 형식 — 단순 2D 배열

```typescript
let rows = [
  ['Header 1', 'Header 2', 'Header 3'],
  ['Row 1, Cell 1', 'Row 1, Cell 2', 'Row 1, Cell 3'],
  ['Row 2, Cell 1', 'Row 2, Cell 2', 'Row 2, Cell 3']
];

slide.addTable(rows, {
  x: 1,
  y: 1,
  w: 8,
  colW: [2.5, 2.5, 3],  // 각 열의 너비
  border: { type: 'solid', pt: 1, color: '000000' }
});
```

### 고급 셀 포매팅

```typescript
let advancedRows = [
  [
    { text: 'Product', options: { bold: true, fill: { color: '4472C4' }, color: 'FFFFFF' } },
    { text: 'Q1 Sales', options: { bold: true, fill: { color: '4472C4' }, color: 'FFFFFF' } },
    { text: 'Q2 Sales', options: { bold: true, fill: { color: '4472C4' }, color: 'FFFFFF' } }
  ],
  [
    { text: 'Widget A', options: { fill: { color: 'E7E6E6' } } },
    { text: '$12,500', options: { align: 'right' } },
    { text: '$15,750', options: { align: 'right', color: '00AA00', bold: true } }
  ]
];

slide.addTable(advancedRows, {
  x: 0.5,
  y: 3.5,
  w: 9,
  colW: [3, 3, 3],
  rowH: 0.5,
  fontSize: 12,
  border: { type: 'solid', pt: 1, color: '366092' },
  align: 'left',
  valign: 'middle'
});
```

### 셀 병합 (colspan)

```typescript
let mergedRows = [
  [
    { text: 'Merged Header', 
      options: { colspan: 2, bold: true, align: 'center', fill: { color: 'FFD966' } } 
    }
  ],
  ['Cell 1', 'Cell 2']
];

slide.addTable(mergedRows, { x: 2, y: 2, w: 6, colW: [3, 3] });
```

### 자동 페이징 (autoPage) — 대용량 테이블

```typescript
let largeTableData = [/* 100+ 행 */];

let slide = pptx.addSlide();
slide.addText('Employee Directory', {
  x: 0.5, y: 0.3, w: 9, fontSize: 20, bold: true
});

slide.addTable(largeTableData, {
  x: 0.5,
  y: 1,
  w: 9,
  colW: [0.8, 2.5, 2.5, 1.5],
  fontSize: 11,
  
  // 자동 페이징 설정
  autoPage: true,                    // 자동 슬라이드 생성
  autoPageRepeatHeader: true,        // 각 슬라이드에 헤더 반복
  autoPageHeaderRows: 1,             // 반복할 헤더 행 수
  autoPageSlideStartY: 0.5,          // 다음 슬라이드의 Y 위치
  
  valign: 'middle'
});

// 생성된 슬라이드에 페이지 번호 추가
if (slide.newAutoPagedSlides && slide.newAutoPagedSlides.length > 0) {
  slide.newAutoPagedSlides.forEach((autoSlide, idx) => {
    autoSlide.addText(`Page ${idx + 2}`, {
      x: 9, y: 7, w: 0.5, h: 0.3, fontSize: 10, color: '666666'
    });
  });
}
```

### HTML 테이블 변환 (브라우저 환경)

```typescript
// HTML: <table id="dataTable">...</table>
let pptx = new PptxGenJS();
pptx.tableToSlides('dataTable', {
  x: 0.5, y: 0.5, w: 9,
  autoPage: true,
  autoPageRepeatHeader: true,
  autoPageHeaderRows: 1,
  colW: [2, 3, 2],
  border: { type: 'solid', pt: 1, color: '000000' }
});

pptx.writeFile({ fileName: 'HTML-Table-Export.pptx' });
```

---

## 4. 리스트/불릿 포인트

### 불릿 리스트

```typescript
slide.addText([
  { text: 'First bullet point', options: { bullet: true } },
  { text: 'Second bullet point', options: { bullet: true } },
  { text: 'Third bullet point', options: { bullet: true } }
], { x: 1, y: 3, w: 5, h: 2, fontSize: 14 });
```

### 번호 매기기 리스트

```typescript
slide.addText([
  { text: 'Step one', options: { bullet: { type: 'number' } } },
  { text: 'Step two', options: { bullet: { type: 'number' } } },
  { text: 'Step three', options: { bullet: { type: 'number' } } }
], { x: 1, y: 5.5, w: 5, h: 1.5, fontSize: 14 });
```

---

## 5. 슬라이드 마스터 (Slide Master)

### 기본 마스터 정의

```typescript
pptx.defineSlideMaster({
  title: 'CORPORATE_MASTER',
  background: { color: 'FFFFFF' },
  margin: [0.5, 0.5, 0.5, 0.5],
  
  objects: [
    // 로고
    { image: { path: 'logo.png', x: 0.5, y: 0.3, w: 1.5, h: 0.5 } },
    
    // 제목 플레이스홀더
    {
      placeholder: {
        options: {
          name: 'title', type: 'title', x: 0.5, y: 1.2, w: 9, h: 0.75,
          fontSize: 28, bold: true, color: '0088CC'
        },
        text: 'Click to add title'
      }
    },
    
    // 본문 플레이스홀더
    {
      placeholder: {
        options: {
          name: 'body', type: 'body', x: 0.5, y: 2.2, w: 9, h: 4,
          fontSize: 14
        },
        text: 'Click to add content'
      }
    },
    
    // 풋터
    { text: { text: 'Confidential © 2024', options: { x: 0.5, y: 7, fontSize: 10 } } }
  ],
  
  slideNumber: { x: 9, y: 7, fontSize: 10 }
});

// 마스터 사용
let slide1 = pptx.addSlide({ masterName: 'CORPORATE_MASTER' });
```

### 배경 커스터마이징

```typescript
let slide = pptx.addSlide();
slide.background = { color: 'E8F4FF' };                    // 단색
slide.background = { path: 'background.jpg' };             // URL
slide.background = { path: './assets/bg.png' };            // 로컬
slide.background = { path: './bg.png', transparency: 50 }; // 투명
```

---

## 6. 차트 추가 (addChart)

### 지원 차트 타입

- ✅ **Bar Chart** (막대형)
- ✅ **Pie Chart** (원형)
- ✅ **Doughnut Chart** (도넛형)
- ✅ **Line Chart** (선형)
- ✅ Area, Scatter, Bubble, Stock 등

### 막대 차트 예제

```typescript
let barChartData = [
  { name: 'Product A', labels: ['Q1', 'Q2', 'Q3', 'Q4'], values: [12000, 15000, 18000, 21000] },
  { name: 'Product B', labels: ['Q1', 'Q2', 'Q3', 'Q4'], values: [8000, 9500, 11000, 13000] }
];

slide.addChart(pptx.ChartType.bar, barChartData, {
  x: 1, y: 1.5, w: 8, h: 4,
  showTitle: true,
  title: 'Sales by Quarter',
  showLegend: true,
  legendPos: 'r',
  showValue: true,
  chartColors: ['4472C4', 'ED7D31']
});
```

### 원형 차트 (도넛 포함)

```typescript
let pieChartData = [
  { name: 'Market Share', labels: ['A', 'B', 'C', 'D'], values: [35, 28, 18, 12] }
];

slide.addChart(pptx.ChartType.pie, pieChartData, {
  x: 2, y: 1.5, w: 6, h: 4.5,
  showPercent: true,
  showLegend: true,
  chartColors: ['4472C4', 'ED7D31', 'A5A5A5', 'FFC000']
});

// 도넛 차트 (구조는 동일, 타입만 변경)
slide.addChart(pptx.ChartType.doughnut, pieChartData, { /* 옵션 */ });
```

---

## 7. writeFile로 다운로드 (브라우저 환경)

### 기본 사용법

```typescript
pptx.writeFile({ fileName: 'Presentation.pptx' })
  .then(fileName => console.log(`Created: ${fileName}`))
  .catch(err => console.error('Error:', err));
```

### 출력 형식

```typescript
// 파일 저장 (브라우저에서 다운로드, Node.js에서 디스크 저장)
pptx.writeFile({ fileName: 'my-presentation.pptx' });

// Base64 문자열 (API 전송, DB 저장)
pptx.write({ outputType: 'base64' }).then(data => { /* ... */ });

// 스트림 (Node.js — Buffer)
pptx.stream().then(data => { /* ... */ });
```

---

## 8. TypeScript 타입 지원

### 완전 지원 ✅

```typescript
import pptxgen from "pptxgenjs";

let pres: pptxgen = new pptxgen();
let slide = pres.addSlide();

// 모든 옵션이 타입 체크됨
slide.addText('Text', {
  x: 1, y: 1, fontSize: 24, color: '000000'
});
```

### 주요 인터페이스

- `PptxGenJS` — 프레젠테이션 메인 클래스
- `ISlide` — 슬라이드 인터페이스
- `ITextOptions` — 텍스트 옵션
- `ITableOptions` — 테이블 옵션
- `IChartOptions` — 차트 옵션

**강점**: IDE 자동완성, 컴파일 타임 오류 감지, 완전 타입 안정성

---

## 9. 한글 폰트 지원

### 한글 폰트 설정

```typescript
let pptx = new pptxgen();
let slide = pptx.addSlide();

// 기본 방법
slide.addText('한글 텍스트 테스트', {
  x: 1, y: 1,
  fontFace: 'Noto Sans KR',  // Google Fonts (무료)
  fontSize: 20
});

// 테마 전역 설정
pptx.theme = {
  headFontFace: 'Noto Sans KR',
  bodyFontFace: 'Noto Sans KR'
};
```

### 추천 한글 폰트

| 폰트명 | 플랫폼 | 무료 | 비고 |
|--------|--------|------|------|
| **Noto Sans KR** | 모두 | ✅ | Google Fonts, 권장 |
| **Noto Sans CJK KR** | 모두 | ✅ | 한중일 통합 |
| **Segoe UI** | Windows | ✅ | 기본 탑재 |
| **Apple SD Gothic Neo** | macOS | ✅ | 맥 기본 |

### 폰트 임베딩 (고급)

pptxgenjs는 기본적으로 폰트를 임베딩하지 않음. 완벽한 호환성을 위해 **pptx-embed-fonts** 사용:

```typescript
import { embedFonts } from 'pptx-embed-fonts';

let pptx = new pptxgen();
let slide = pptx.addSlide();
slide.addText('한글 텍스트', { fontFace: 'Noto Sans KR', fontSize: 20 });

// 폰트 임베딩
embedFonts(pptx, ['./fonts/NotoSansKR-Regular.ttf']);

pptx.writeFile({ fileName: 'with-embedded-fonts.pptx' });
```

⚠️ **주의**: 임베딩 미시 다른 기기에서 폰트 대체됨 → 한글 호환성 확인 필수

---

## 10. 추가 기능

### 이미지 추가

```typescript
slide.addImage({ path: 'https://example.com/logo.png', x: 1, y: 1, w: 3, h: 2 });
slide.addImage({ path: './images/photo.jpg', x: 5, y: 1, w: 4, h: 3 });
slide.addImage({ data: 'image/png;base64,...', x: 1, y: 4, w: 2, h: 1.5 });
```

### 도형 및 선

```typescript
slide.addShape(pptx.ShapeType.line, { x: 1, y: 1, w: 4, h: 0, line: { color: '0088CC', width: 2 } });
slide.addShape(pptx.ShapeType.rect, { x: 1, y: 2, w: 3, h: 1, fill: { color: 'E8F4FF' } });
```

### 하이퍼링크

```typescript
slide.addText('Click here', { x: 1, y: 1, hyperlink: { url: 'https://example.com' } });
```

---

## 11. 라이브러리 강점 & 제한사항

### 강점 ✅

1. **브라우저 + Node.js** — 동일한 API로 모든 환경 지원
2. **완전 TypeScript** — 전체 타입 정의
3. **의존성 최소** — JSZip만 포함
4. **고수준 API** — OOXML 복잡도 추상화
5. **풍부한 기능** — 차트, 테이블, 마스터, HTML 변환
6. **활발한 유지보수** — 47개 스니펫, 높은 평판
7. **오픈소스** — MIT 라이센스

### 제한사항 ⚠️

1. **폰트 임베딩** — 기본 미지원 (별도 라이브러리 필요)
2. **애니메이션** — 정적 파일만 생성
3. **그룹화** — 도형/이미지 그룹화 불가
4. **중첩 테이블** — 미지원 (평탄화됨)
5. **슬라이드 노트** — 추가 불가

---

## 12. strategy-analyzer 프로젝트 적용성

**적용성: 매우 높음**

현재 HTML/Markdown 내보내기에 **PPTX 내보내기 추가 가능**:

```typescript
export async function exportStrategyToPptx(document: StrategyDocument) {
  let pptx = new PptxGenJS();
  
  // 제목 슬라이드
  let titleSlide = pptx.addSlide();
  titleSlide.background = { color: '0088CC' };
  titleSlide.addText(document.businessItem, {
    x: 1, y: 2.5, w: 8, fontSize: 32, bold: true, color: 'FFFFFF'
  });
  
  // 각 프레임워크별 슬라이드
  Object.entries(document.frameworks).forEach(([key, fw]) => {
    let slide = pptx.addSlide();
    slide.addText(fw.name, { x: 0.5, y: 0.5, fontSize: 24, bold: true });
    
    // 테이블 추가
    let rows = formatFrameworkData(fw);
    slide.addTable(rows, { x: 0.5, y: 1.2, w: 9, autoPage: true });
  });
  
  return pptx.writeFile({ fileName: `strategy-${document.id}.pptx` });
}
```

**기대 효과**:
- PowerPoint 네이티브 포맷 (높은 호환성)
- 회사 프레젠테이션에 직접 사용 가능
- HTML/Markdown과 병행 운영 가능
