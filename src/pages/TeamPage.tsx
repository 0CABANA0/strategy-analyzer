import { useState } from 'react'
import { useTeam } from '../hooks/useTeam'
import TeamSettings from '../components/team/TeamSettings'
import TeamDocumentList from '../components/team/TeamDocumentList'
import { useToast } from '../hooks/useToast'
import { Users, FileText, Settings, Loader2, Plus } from 'lucide-react'

type TabKey = 'documents' | 'settings'

export default function TeamPage() {
  const { team, members, documents, loading, error, createTeam, inviteMember, removeMember } = useTeam()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState<TabKey>('documents')
  const [teamName, setTeamName] = useState('')
  const [creating, setCreating] = useState(false)

  const handleCreateTeam = async () => {
    if (!teamName.trim()) return
    setCreating(true)
    try {
      await createTeam(teamName.trim())
      toast.success(`"${teamName}" 팀이 생성되었습니다.`)
      setTeamName('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '팀 생성 실패')
    } finally {
      setCreating(false)
    }
  }

  const handleInvite = async (email: string) => {
    const trimmed = email.trim().toLowerCase()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error('유효한 이메일 주소를 입력해주세요.')
      return
    }
    try {
      await inviteMember(trimmed)
      toast.success(`${trimmed}을(를) 초대했습니다.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '초대 실패')
    }
  }

  const handleRemove = async (userId: string) => {
    await removeMember(userId)
    toast.success('멤버가 제거되었습니다.')
  }

  if (loading) {
    return (
      <main id="main-content" className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main id="main-content" className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center py-12 text-sm text-red-500">{error}</div>
      </main>
    )
  }

  // 팀이 없으면 생성 화면
  if (!team) {
    return (
      <main id="main-content" className="max-w-lg mx-auto px-4 py-8 animate-fade-in">
        <div className="text-center mb-8">
          <Users className="w-12 h-12 text-primary-500 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">팀 워크스페이스</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            팀을 만들고 구성원과 함께 전략 문서를 공유하세요.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">팀 이름</label>
          <div className="flex gap-2 mt-2">
            <input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="예: 전략기획팀"
              className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateTeam()}
            />
            <button
              onClick={handleCreateTeam}
              disabled={creating || !teamName.trim()}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              생성
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main id="main-content" className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary-500" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{team.name}</h1>
          <span className="text-xs text-gray-400 dark:text-gray-500">{members.length}명</span>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('documents')}
          className={`flex items-center gap-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'documents'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <FileText className="w-4 h-4" />
          문서 ({documents.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'settings'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Settings className="w-4 h-4" />
          설정
        </button>
      </div>

      {activeTab === 'documents' && <TeamDocumentList documents={documents} />}
      {activeTab === 'settings' && (
        <TeamSettings
          members={members}
          onInvite={handleInvite}
          onRemove={handleRemove}
        />
      )}
    </main>
  )
}
