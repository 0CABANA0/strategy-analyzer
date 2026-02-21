import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { StrategyProvider } from './hooks/useStrategyDocument'
import { SettingsProvider } from './hooks/useSettings'
import { AuthProvider } from './hooks/useAuth'
import { useTheme } from './hooks/useTheme'
import { ToastProvider } from './hooks/useToast'
import { MobileSidebarProvider } from './hooks/useMobileSidebar'
import Header from './components/layout/Header'
import AuthGuard from './components/auth/AuthGuard'
import AdminGuard from './components/auth/AdminGuard'
import ToastContainer from './components/common/ToastContainer'
import ErrorBoundary from './components/common/ErrorBoundary'
import { Loader2 } from 'lucide-react'

const HomePage = lazy(() => import('./pages/HomePage'))
const AnalyzerPage = lazy(() => import('./pages/AnalyzerPage'))
const PreviewPage = lazy(() => import('./pages/PreviewPage'))
const HistoryPage = lazy(() => import('./pages/HistoryPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const SignupPage = lazy(() => import('./pages/SignupPage'))
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'))
const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage'))
const AuthConfirmPage = lazy(() => import('./pages/AuthConfirmPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
    </div>
  )
}

/** Header 포함 보호 레이아웃 */
function ProtectedLayout() {
  return (
    <AuthGuard>
      <Header />
      <Outlet />
    </AuthGuard>
  )
}

/** Header 포함 관리자 레이아웃 */
function AdminLayout() {
  return (
    <AdminGuard>
      <Header />
      <Outlet />
    </AdminGuard>
  )
}

export default function App() {
  useTheme()

  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <SettingsProvider>
            <StrategyProvider>
              <MobileSidebarProvider>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <a
                  href="#main-content"
                  className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg"
                >
                  본문으로 건너뛰기
                </a>
                <ErrorBoundary>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      {/* 공개 라우트 (Header 없음) */}
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/signup" element={<SignupPage />} />
                      <Route path="/verify-email" element={<VerifyEmailPage />} />
                      <Route path="/auth/callback" element={<AuthCallbackPage />} />
                      <Route path="/auth/confirm" element={<AuthConfirmPage />} />
                      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

                      {/* 보호 라우트 (Header 포함) */}
                      <Route element={<ProtectedLayout />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/analyzer" element={<AnalyzerPage />} />
                        <Route path="/preview" element={<PreviewPage />} />
                        <Route path="/history" element={<HistoryPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                      </Route>

                      {/* 관리자 라우트 */}
                      <Route element={<AdminLayout />}>
                        <Route path="/admin" element={<AdminPage />} />
                      </Route>
                    </Routes>
                  </Suspense>
                </ErrorBoundary>
                <ToastContainer />
              </div>
              </MobileSidebarProvider>
            </StrategyProvider>
          </SettingsProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
