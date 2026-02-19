import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StrategyProvider } from './hooks/useStrategyDocument'
import { SettingsProvider } from './hooks/useSettings'
import { useTheme } from './hooks/useTheme'
import { ToastProvider } from './hooks/useToast'
import { MobileSidebarProvider } from './hooks/useMobileSidebar'
import Header from './components/layout/Header'
import ToastContainer from './components/common/ToastContainer'
import { Loader2 } from 'lucide-react'

const HomePage = lazy(() => import('./pages/HomePage'))
const AnalyzerPage = lazy(() => import('./pages/AnalyzerPage'))
const PreviewPage = lazy(() => import('./pages/PreviewPage'))
const HistoryPage = lazy(() => import('./pages/HistoryPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
    </div>
  )
}

export default function App() {
  useTheme()

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <SettingsProvider>
        <StrategyProvider>
          <ToastProvider>
            <MobileSidebarProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Header />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/analyzer" element={<AnalyzerPage />} />
                  <Route path="/preview" element={<PreviewPage />} />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </Suspense>
              <ToastContainer />
            </div>
            </MobileSidebarProvider>
          </ToastProvider>
        </StrategyProvider>
      </SettingsProvider>
    </BrowserRouter>
  )
}
