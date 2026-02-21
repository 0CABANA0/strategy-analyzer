import type { ReactNode } from 'react'

export interface QuadrantItem {
  key: string
  label: string
  color: string
  icon?: string
}

interface QuadrantGridProps {
  items: QuadrantItem[]
  renderContent: (item: QuadrantItem) => ReactNode
}

export default function QuadrantGrid({ items, renderContent }: QuadrantGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((item) => (
        <div key={item.key} className={`rounded-lg border p-3 ${item.color}`}>
          <div className="flex items-center gap-1.5 mb-2">
            {item.icon && <span className="text-base">{item.icon}</span>}
            <span className="text-xs font-bold">{item.label}</span>
          </div>
          {renderContent(item)}
        </div>
      ))}
    </div>
  )
}
