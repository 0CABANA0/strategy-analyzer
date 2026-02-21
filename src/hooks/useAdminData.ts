import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Profile, ActivityLog } from '../types'

interface Stats {
  totalUsers: number
  activeToday: number
  newThisWeek: number
}

export function useAdminData() {
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, activeToday: 0, newThisWeek: 0 })
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [activities, setActivities] = useState<(ActivityLog & { email?: string })[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setIsLoading(true)

    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    const profileList = (allProfiles ?? []) as Profile[]
    setProfiles(profileList)

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const activeToday = profileList.filter(
      (p) => p.last_sign_in_at && p.last_sign_in_at >= todayStart
    ).length

    const newThisWeek = profileList.filter(
      (p) => p.created_at >= weekAgo
    ).length

    setStats({ totalUsers: profileList.length, activeToday, newThisWeek })

    const { data: logs } = await supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    const logList = (logs ?? []) as ActivityLog[]
    const profileMap = new Map(profileList.map((p) => [p.id, p.email]))
    const enriched = logList.map((log) => ({
      ...log,
      email: profileMap.get(log.user_id) ?? '알 수 없음',
    }))
    setActivities(enriched)

    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const updateProfileRole = useCallback((id: string, newRole: Profile['role']) => {
    setProfiles((prev) => prev.map((p) => p.id === id ? { ...p, role: newRole } : p))
  }, [])

  const suspendUser = useCallback(async (id: string, status: Profile['status']) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', id)
    if (!error) {
      setProfiles((prev) => prev.map((p) => p.id === id ? { ...p, status } : p))
    }
    return { error: error?.message ?? null }
  }, [])

  return { stats, profiles, activities, isLoading, updateProfileRole, suspendUser }
}
