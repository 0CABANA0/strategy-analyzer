import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { supabase } from '../../lib/supabase'
import { Search, Loader2, ShieldCheck, ShieldOff, UserX, UserCheck } from 'lucide-react'
import ConfirmModal from '../common/ConfirmModal'
import type { Profile } from '../../types'

interface UserTableProps {
  profiles: Profile[]
  onUpdate: (id: string, role: Profile['role']) => void
  onSuspend: (id: string, status: Profile['status']) => Promise<{ error: string | null }>
}

function formatDate(d: string | null) {
  if (!d) return '-'
  return new Date(d).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })
}

export default function UserTable({ profiles, onUpdate, onSuspend }: UserTableProps) {
  const { user: currentUser } = useAuth()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<'created_at' | 'last_sign_in_at' | 'email'>('created_at')
  const [sortAsc, setSortAsc] = useState(false)
  const [togglingRole, setTogglingRole] = useState<string | null>(null)
  const [suspendingId, setSuspendingId] = useState<string | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<Profile | null>(null)

  const handleToggleRole = async (profile: Profile) => {
    if (profile.id === currentUser?.id) {
      toast.warning('자신의 역할은 변경할 수 없습니다.')
      return
    }
    const newRole: Profile['role'] = profile.role === 'admin' ? 'user' : 'admin'
    setTogglingRole(profile.id)
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', profile.id)
    setTogglingRole(null)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success(`${profile.email}의 역할이 ${newRole === 'admin' ? '관리자' : '사용자'}로 변경되었습니다.`)
      onUpdate(profile.id, newRole)
    }
  }

  const handleSuspendConfirm = async () => {
    if (!confirmTarget) return
    const newStatus: Profile['status'] = confirmTarget.status === 'suspended' ? 'active' : 'suspended'
    setSuspendingId(confirmTarget.id)
    setConfirmTarget(null)
    const { error } = await onSuspend(confirmTarget.id, newStatus)
    setSuspendingId(null)
    if (error) {
      toast.error(`상태 변경 실패: ${error}`)
    } else {
      toast.success(
        newStatus === 'suspended'
          ? `${confirmTarget.email} 계정이 정지되었습니다.`
          : `${confirmTarget.email} 계정이 복원되었습니다.`,
      )
    }
  }

  const filtered = profiles
    .filter((p) => {
      if (!search) return true
      const q = search.toLowerCase()
      return p.email.toLowerCase().includes(q) || (p.display_name ?? '').toLowerCase().includes(q)
    })
    .sort((a, b) => {
      const av = a[sortField] ?? ''
      const bv = b[sortField] ?? ''
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av)
    })

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(false)
    }
  }

  const sortIndicator = (field: typeof sortField) =>
    sortField === field ? (sortAsc ? ' ▲' : ' ▼') : ''

  return (
    <>
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">사용자 목록</h2>
          <div className="relative flex-1 max-w-xs ml-auto">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="이메일 또는 이름 검색"
              aria-label="사용자 검색"
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-left">
              <tr>
                <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300 cursor-pointer select-none" onClick={() => handleSort('email')}>
                  이메일{sortIndicator('email')}
                </th>
                <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300">표시명</th>
                <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300">역할</th>
                <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300">상태</th>
                <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300 cursor-pointer select-none" onClick={() => handleSort('created_at')}>
                  가입일{sortIndicator('created_at')}
                </th>
                <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300 cursor-pointer select-none" onClick={() => handleSort('last_sign_in_at')}>
                  마지막 접속{sortIndicator('last_sign_in_at')}
                </th>
                <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300 text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map((p) => {
                const isSuspended = p.status === 'suspended'
                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 ${isSuspended ? 'opacity-50' : ''}`}
                  >
                    <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{p.email}</td>
                    <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{p.display_name ?? '-'}</td>
                    <td className="px-4 py-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        p.role === 'admin'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {p.role === 'admin' ? '관리자' : '사용자'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        isSuspended
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                          : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                      }`}>
                        {isSuspended ? '정지' : '활성'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-500 dark:text-gray-400">{formatDate(p.created_at)}</td>
                    <td className="px-4 py-2 text-gray-500 dark:text-gray-400">{formatDate(p.last_sign_in_at)}</td>
                    <td className="px-4 py-2 text-center">
                      <div className="inline-flex items-center gap-1">
                        {/* 역할 토글 */}
                        <button
                          onClick={() => handleToggleRole(p)}
                          disabled={togglingRole === p.id || p.id === currentUser?.id}
                          title={p.id === currentUser?.id ? '자신의 역할은 변경 불가' : p.role === 'admin' ? '사용자로 변경' : '관리자로 변경'}
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors disabled:opacity-40 ${
                            p.role === 'admin'
                              ? 'text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20'
                              : 'text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20'
                          }`}
                        >
                          {togglingRole === p.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : p.role === 'admin' ? (
                            <><ShieldOff className="w-3.5 h-3.5" /> 해제</>
                          ) : (
                            <><ShieldCheck className="w-3.5 h-3.5" /> 승격</>
                          )}
                        </button>

                        {/* 퇴출/복원 */}
                        <button
                          onClick={() => setConfirmTarget(p)}
                          disabled={suspendingId === p.id || p.id === currentUser?.id}
                          title={p.id === currentUser?.id ? '자기 자신은 퇴출 불가' : isSuspended ? '계정 복원' : '강제 퇴출'}
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors disabled:opacity-40 ${
                            isSuspended
                              ? 'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20'
                              : 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
                          }`}
                        >
                          {suspendingId === p.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : isSuspended ? (
                            <><UserCheck className="w-3.5 h-3.5" /> 복원</>
                          ) : (
                            <><UserX className="w-3.5 h-3.5" /> 퇴출</>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                    {search ? '검색 결과가 없습니다.' : '등록된 사용자가 없습니다.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 퇴출/복원 확인 모달 */}
      <ConfirmModal
        isOpen={!!confirmTarget}
        title={confirmTarget?.status === 'suspended' ? '계정 복원' : '강제 퇴출'}
        message={
          confirmTarget?.status === 'suspended'
            ? `${confirmTarget.email} 계정을 복원하시겠습니까? 복원 후 다시 로그인할 수 있습니다.`
            : `${confirmTarget?.email ?? ''} 계정을 정지하시겠습니까? 해당 사용자는 즉시 로그아웃되며 로그인이 차단됩니다.`
        }
        confirmLabel={confirmTarget?.status === 'suspended' ? '복원' : '퇴출'}
        variant={confirmTarget?.status === 'suspended' ? 'default' : 'danger'}
        onConfirm={handleSuspendConfirm}
        onCancel={() => setConfirmTarget(null)}
      />
    </>
  )
}
