import { Link, useLocation } from 'react-router-dom'
import { Brain, History, Settings, FileText, Sun, Moon, Menu, LucideIcon } from 'lucide-react'
import { useStrategy } from '../../hooks/useStrategyDocument'
import { useTheme } from '../../hooks/useTheme'
import { useMobileSidebar } from '../../hooks/useMobileSidebar'

interface NavItem {
  to: string
  icon: LucideIcon
  label: string
}

export default function Header() {
  const location = useLocation()
  const { getTotalProgress } = useStrategy()
  const progress = getTotalProgress()
  const { isDark, setTheme } = useTheme()
  const { toggle } = useMobileSidebar()

  const navItems: NavItem[] = [
    { to: '/', icon: Brain, label: '홈' },
    { to: '/history', icon: History, label: '히스토리' },
    { to: '/settings', icon: Settings, label: '설정' },
  ]

  const isAnalyzer = location.pathname === '/analyzer'

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isAnalyzer && (
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors lg:hidden"
              title="목차"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <Link to="/" className="flex items-center gap-2 text-gray-900 dark:text-gray-100 no-underline">
            <Brain className="w-6 h-6 text-primary-600" />
            <span className="font-bold text-lg">전략분석기</span>
          </Link>
        </div>

        {isAnalyzer && (
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <FileText className="w-4 h-4" />
            <span>{progress.completed}/{progress.total} 완료</span>
            <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all duration-500"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        )}

        <nav className="flex items-center gap-1">
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2 rounded-lg transition-colors text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            title={isDark ? '라이트 모드' : '다크 모드'}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                className={`p-2 rounded-lg transition-colors no-underline ${
                  active
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300'
                }`}
                title={label}
              >
                <Icon className="w-5 h-5" />
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
