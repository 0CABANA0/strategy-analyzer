/**
 * 팀 워크스페이스 상태 관리 훅
 *
 * Supabase 테이블:
 * - teams (id, name, created_by, created_at)
 * - team_members (team_id, user_id, role, joined_at)
 * - team_documents (team_id, document_id)
 */
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export interface Team {
  id: string
  name: string
  createdBy: string
  createdAt: string
}

export interface TeamMember {
  userId: string
  email: string
  displayName: string
  role: 'owner' | 'member'
  joinedAt: string
}

export interface TeamDocument {
  id: string
  businessItem: string
  updatedAt: string
  ownerName: string
}

interface UseTeamReturn {
  team: Team | null
  members: TeamMember[]
  documents: TeamDocument[]
  loading: boolean
  error: string | null
  createTeam: (name: string) => Promise<void>
  inviteMember: (email: string) => Promise<void>
  removeMember: (userId: string) => Promise<void>
  shareDocument: (documentId: string) => Promise<void>
  unshareDocument: (documentId: string) => Promise<void>
  refresh: () => Promise<void>
}

export function useTeam(): UseTeamReturn {
  const { user } = useAuth()
  const [team, setTeam] = useState<Team | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [documents, setDocuments] = useState<TeamDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const userId = user?.id

  const refresh = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)

    try {
      // 사용자가 속한 팀 조회
      const { data: memberData } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', userId)
        .limit(1)
        .single()

      if (!memberData) {
        setTeam(null)
        setMembers([])
        setDocuments([])
        return
      }

      const teamId = memberData.team_id

      // 팀 정보
      const { data: teamData } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single()

      if (teamData) {
        setTeam({
          id: teamData.id,
          name: teamData.name,
          createdBy: teamData.created_by,
          createdAt: teamData.created_at,
        })
      }

      // 팀 멤버
      const { data: membersData } = await supabase
        .from('team_members')
        .select('user_id, role, joined_at, profiles(email, display_name)')
        .eq('team_id', teamId)

      if (membersData) {
        setMembers(
          membersData.map((m: Record<string, unknown>) => {
            const profile = m.profiles as Record<string, string> | null
            return {
              userId: m.user_id as string,
              email: profile?.email || '',
              displayName: profile?.display_name || '',
              role: m.role as 'owner' | 'member',
              joinedAt: m.joined_at as string,
            }
          })
        )
      }

      // 팀 문서
      const { data: docsData } = await supabase
        .from('team_documents')
        .select('document_id, strategy_documents(id, business_item, updated_at, user_id, profiles:user_id(display_name))')
        .eq('team_id', teamId)

      if (docsData) {
        setDocuments(
          docsData
            .filter((d: Record<string, unknown>) => d.strategy_documents)
            .map((d: Record<string, unknown>) => {
              const doc = d.strategy_documents as Record<string, unknown>
              const profile = doc.profiles as Record<string, string> | null
              return {
                id: doc.id as string,
                businessItem: doc.business_item as string,
                updatedAt: doc.updated_at as string,
                ownerName: profile?.display_name || '',
              }
            })
        )
      }
    } catch {
      setError('팀 정보를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const createTeam = useCallback(async (name: string) => {
    if (!userId) return

    const { data, error: createError } = await supabase
      .from('teams')
      .insert({ name, created_by: userId })
      .select('id')
      .single()

    if (createError || !data) {
      throw new Error(createError?.message || '팀 생성 실패')
    }

    // 생성자를 owner로 추가
    await supabase.from('team_members').insert({
      team_id: data.id,
      user_id: userId,
      role: 'owner',
    })

    await refresh()
  }, [userId, refresh])

  const inviteMember = useCallback(async (email: string) => {
    if (!team) throw new Error('팀이 없습니다.')

    // 이메일로 사용자 조회
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (!profile) throw new Error('해당 이메일의 사용자를 찾을 수 없습니다.')

    const { error: insertError } = await supabase.from('team_members').insert({
      team_id: team.id,
      user_id: profile.id,
      role: 'member',
    })

    if (insertError) throw new Error(insertError.message)
    await refresh()
  }, [team, refresh])

  const removeMember = useCallback(async (targetUserId: string) => {
    if (!team) return

    await supabase
      .from('team_members')
      .delete()
      .eq('team_id', team.id)
      .eq('user_id', targetUserId)

    await refresh()
  }, [team, refresh])

  const shareDocument = useCallback(async (documentId: string) => {
    if (!team) throw new Error('팀이 없습니다.')

    const { error: insertError } = await supabase.from('team_documents').insert({
      team_id: team.id,
      document_id: documentId,
    })

    if (insertError) throw new Error(insertError.message)
    await refresh()
  }, [team, refresh])

  const unshareDocument = useCallback(async (documentId: string) => {
    if (!team) return

    await supabase
      .from('team_documents')
      .delete()
      .eq('team_id', team.id)
      .eq('document_id', documentId)

    await refresh()
  }, [team, refresh])

  return {
    team, members, documents, loading, error,
    createTeam, inviteMember, removeMember,
    shareDocument, unshareDocument, refresh,
  }
}
