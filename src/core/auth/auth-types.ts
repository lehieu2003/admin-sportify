export type AdminUserRole = 'admin' | 'user'

export type AdminUser = {
  id: string
  fullName: string
  email: string
  imageUrl: string | null
  role: AdminUserRole
  createdAt?: string
}

export type AdminSession = {
  accessToken: string
  refreshToken: string
  sessionId?: string
  user: AdminUser
}
