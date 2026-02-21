import React from 'react'
import { Users, Activity, UserPlus } from 'lucide-react'

interface Stats {
  totalUsers: number
  activeToday: number
  newThisWeek: number
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  color: 'primary' | 'green' | 'blue'
}) {
  const colors = {
    primary: 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  }
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4">
      <div className={`p-2.5 rounded-lg ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      </div>
    </div>
  )
}

export default function StatsCards({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard icon={Users} label="총 사용자" value={stats.totalUsers} color="primary" />
      <StatCard icon={Activity} label="오늘 활성" value={stats.activeToday} color="green" />
      <StatCard icon={UserPlus} label="이번 주 신규" value={stats.newThisWeek} color="blue" />
    </div>
  )
}
