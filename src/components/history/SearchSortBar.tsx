import { Search, ArrowUpDown } from 'lucide-react'

interface SearchSortBarProps {
  search: string
  onSearchChange: (value: string) => void
  sortLabel: string
  onToggleSort: () => void
}

export default function SearchSortBar({ search, onSearchChange, sortLabel, onToggleSort }: SearchSortBarProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="문서 검색..."
          aria-label="문서 검색"
          className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>
      <button
        onClick={onToggleSort}
        className="flex items-center gap-1 px-3 py-2 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors shrink-0"
        title="정렬"
      >
        <ArrowUpDown className="w-3.5 h-3.5" />
        {sortLabel}
      </button>
    </div>
  )
}
