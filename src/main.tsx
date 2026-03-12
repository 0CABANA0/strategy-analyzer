import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { installGlobalErrorHandlers } from './services/errorLogger'

// 필수 환경변수 검증
const requiredEnvVars = [
  ['VITE_SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL],
  ['VITE_SUPABASE_ANON_KEY', import.meta.env.VITE_SUPABASE_ANON_KEY],
] as const
for (const [name, value] of requiredEnvVars) {
  if (!value) {
    console.warn(`⚠️ 환경변수 ${name}이(가) 설정되지 않았습니다. 일부 기능이 동작하지 않을 수 있습니다.`)
  }
}

// 전역 에러 핸들러 등록 (unhandled error/rejection → Supabase error_logs)
installGlobalErrorHandlers()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
