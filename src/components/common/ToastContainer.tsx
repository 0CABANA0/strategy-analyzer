import { useToast } from '../../hooks/useToast'
import type { ToastType } from '../../hooks/useToast'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'

const TOAST_CONFIG: Record<ToastType, { icon: typeof CheckCircle2; className: string }> = {
  success: { icon: CheckCircle2, className: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300' },
  error: { icon: XCircle, className: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300' },
  info: { icon: Info, className: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300' },
  warning: { icon: AlertTriangle, className: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300' },
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 w-80">
      {toasts.map((toast) => {
        const config = TOAST_CONFIG[toast.type]
        const Icon = config.icon
        return (
          <div
            key={toast.id}
            className={`flex items-start gap-2 px-4 py-3 rounded-xl border shadow-lg animate-slide-in ${config.className}`}
          >
            <Icon className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="text-sm flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-0.5 opacity-60 hover:opacity-100 transition-opacity shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
