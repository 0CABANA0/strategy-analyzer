import { useTheme } from '../../hooks/useTheme'
import type { ThemeMode } from '../../hooks/useTheme'
import { Sun, Moon, Monitor } from 'lucide-react'

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: '라이트', icon: Sun },
  { value: 'dark', label: '다크', icon: Moon },
  { value: 'system', label: '시스템', icon: Monitor },
]

export default function ThemeSection() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="p-5">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        <Sun className="w-4 h-4" />
        테마
      </label>
      <div className="flex gap-2">
        {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
              theme === value
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
