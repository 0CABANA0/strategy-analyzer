import { X } from 'lucide-react'
import { SidebarContent } from './Sidebar'

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* 오버레이 */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60"
        onClick={onClose}
      />

      {/* 드로어 */}
      <div className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-800 shadow-2xl animate-slide-in-left">
        <div className="flex items-center justify-between px-4 h-14 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            목차
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-3 overflow-y-auto max-h-[calc(100vh-3.5rem)]">
          <SidebarContent onNavigate={onClose} />
        </div>
      </div>
    </div>
  )
}
