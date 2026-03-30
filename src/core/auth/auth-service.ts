import type { AxiosInstance } from 'axios'
import { createHttpClient } from '../network/http-client'
import type { AdminSession, AdminUser } from './auth-types'

const publicClient = createHttpClient()

type BackendUser = {
  id: string
  full_name: string
  email: string
  image_url: string | null
  role: 'admin' | 'user'
  created_at?: string
}

type AuthResponse = {
  accessToken: string
  refreshToken: string
  sessionId?: string
  user: BackendUser
}

function mapUser(user: BackendUser): AdminUser {
  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    imageUrl: user.image_url,
    role: user.role,
    createdAt: user.created_at,
  }
}

function mapSession(data: AuthResponse): AdminSession {
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    sessionId: data.sessionId,
    user: mapUser(data.user),
  }
}

export const authService = {
  async signin(payload: { email: string; password: string }): Promise<AdminSession> {
    const response = await publicClient.post<AuthResponse>('/auth/signin', payload)
    return mapSession(response.data)
  },
  async refresh(refreshToken: string): Promise<AdminSession> {
    const response = await publicClient.post<AuthResponse>('/auth/refresh', { refreshToken })
    return mapSession(response.data)
  },
  async signout(refreshToken: string): Promise<void> {
    await publicClient.post('/auth/signout', { refreshToken })
  },
  async getMe(client: AxiosInstance): Promise<AdminUser> {
    const response = await client.get<BackendUser>('/auth/me')
    return mapUser(response.data)
  },
}
