#!/usr/bin/env node
/**
 * 번들 사이즈 모니터링 스크립트
 * - dist/ 디렉토리의 JS/CSS 파일 크기를 측정
 * - 이전 기록과 비교하여 변화량 표시
 * - bundle-size.json에 기록 저장
 *
 * 사용: node scripts/bundle-size.mjs [--save] [--ci]
 *   --save: bundle-size.json에 현재 결과 저장
 *   --ci: 임계값 초과 시 exit code 1 반환
 */
import { readdirSync, statSync, readFileSync, writeFileSync, existsSync } from 'fs'
import { join, extname } from 'path'
import { gzipSync } from 'zlib'

const DIST_DIR = join(process.cwd(), 'dist', 'assets')
const RECORD_FILE = join(process.cwd(), 'bundle-size.json')
const WARN_THRESHOLD_KB = 500 // gzip 기준 총 크기 경고 임계값 (KB)

function getFiles(dir) {
  if (!existsSync(dir)) {
    console.error(`❌ dist/assets/ 디렉토리가 없습니다. 먼저 npm run build를 실행하세요.`)
    process.exit(1)
  }
  return readdirSync(dir)
    .filter(f => ['.js', '.css'].includes(extname(f)))
    .map(name => {
      const filePath = join(dir, name)
      const content = readFileSync(filePath)
      const raw = content.length
      const gzip = gzipSync(content).length
      return { name, raw, gzip }
    })
    .sort((a, b) => b.gzip - a.gzip)
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} kB`
}

function formatDelta(current, previous) {
  if (!previous) return '(신규)'
  const delta = current - previous
  if (delta === 0) return '─'
  const sign = delta > 0 ? '+' : ''
  const pct = previous > 0 ? ` (${sign}${((delta / previous) * 100).toFixed(1)}%)` : ''
  return `${sign}${formatSize(delta)}${pct}`
}

// 메인
const args = process.argv.slice(2)
const shouldSave = args.includes('--save')
const isCI = args.includes('--ci')

const files = getFiles(DIST_DIR)

// 이전 기록 로드
let previous = {}
if (existsSync(RECORD_FILE)) {
  try {
    previous = JSON.parse(readFileSync(RECORD_FILE, 'utf-8'))
  } catch { /* ignore */ }
}

// 카테고리별 분류
const categories = {
  'vendor': f => f.name.startsWith('vendor-') || f.name.includes('.min-'),
  'page': f => /Page-/.test(f.name),
  'app': f => f.name.startsWith('index-'),
  'other': () => true,
}

const totalGzip = files.reduce((sum, f) => sum + f.gzip, 0)
const prevTotalGzip = previous.totalGzip || 0

console.log('\n📦 번들 사이즈 리포트')
console.log('═'.repeat(72))
console.log(
  '파일'.padEnd(45),
  'Raw'.padStart(10),
  'Gzip'.padStart(10),
  '변화'.padStart(15),
)
console.log('─'.repeat(72))

for (const file of files) {
  const prevGzip = previous.files?.[file.name]?.gzip
  console.log(
    file.name.padEnd(45),
    formatSize(file.raw).padStart(10),
    formatSize(file.gzip).padStart(10),
    formatDelta(file.gzip, prevGzip).padStart(15),
  )
}

console.log('─'.repeat(72))
console.log(
  '총계'.padEnd(45),
  formatSize(files.reduce((s, f) => s + f.raw, 0)).padStart(10),
  formatSize(totalGzip).padStart(10),
  formatDelta(totalGzip, prevTotalGzip).padStart(15),
)
console.log('═'.repeat(72))

// 임계값 검사
const totalGzipKB = totalGzip / 1024
if (totalGzipKB > WARN_THRESHOLD_KB) {
  console.log(`\n⚠️  총 gzip 크기 (${totalGzipKB.toFixed(0)} kB)가 임계값 (${WARN_THRESHOLD_KB} kB)을 초과합니다.`)
  if (isCI) {
    process.exit(1)
  }
}

// 저장
if (shouldSave) {
  const record = {
    timestamp: new Date().toISOString(),
    totalGzip,
    totalRaw: files.reduce((s, f) => s + f.raw, 0),
    files: Object.fromEntries(files.map(f => [f.name, { raw: f.raw, gzip: f.gzip }])),
  }
  writeFileSync(RECORD_FILE, JSON.stringify(record, null, 2))
  console.log(`\n✅ bundle-size.json에 저장되었습니다.`)
}

console.log('')
