import { Loader2 } from 'lucide-react'
import { useAdminData } from '../hooks/useAdminData'
import StatsCards from '../components/admin/StatsCards'
import ModelSelector from '../components/admin/ModelSelector'
import UserTable from '../components/admin/UserTable'
import ActivityLog from '../components/admin/ActivityLog'

export default function AdminPage() {
  const { stats, profiles, activities, isLoading, updateProfileRole, suspendUser, togglePremium } = useAdminData()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <main id="main-content" className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">관리자 대시보드</h1>
      <StatsCards stats={stats} />
      <ModelSelector />
      <UserTable profiles={profiles} onUpdate={updateProfileRole} onSuspend={suspendUser} onTogglePremium={togglePremium} />
      <ActivityLog activities={activities} />
    </main>
  )
}
