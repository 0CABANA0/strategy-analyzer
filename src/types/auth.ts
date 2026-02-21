export interface Profile {
  id: string
  email: string
  display_name: string | null
  role: 'user' | 'admin'
  status: 'active' | 'suspended'
  created_at: string
  last_sign_in_at: string | null
}

export interface ActivityLog {
  id: string
  user_id: string
  action: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface AuthState {
  user: Profile | null
  isLoading: boolean
  isAdmin: boolean
}
