import type { AdminSession, AdminUser } from './auth-types'

const refreshTokenKey = 'admin.refreshToken'

let accessToken: string | null = null
let currentUser: AdminUser | null = null
let currentSessionId: string | null = null

export const authSessionStore = {
  getAccessToken: () => accessToken,
  getRefreshToken: () => localStorage.getItem(refreshTokenKey),
  getUser: () => currentUser,
  getSessionId: () => currentSessionId,
  saveSession: (session: AdminSession) => {
    accessToken = session.accessToken
    currentUser = session.user
    currentSessionId = session.sessionId ?? null
    localStorage.setItem(refreshTokenKey, session.refreshToken)
  },
  updateAccessToken: (nextAccessToken: string) => {
    accessToken = nextAccessToken
  },
  updateUser: (nextUser: AdminUser) => {
    currentUser = nextUser
  },
  clear: () => {
    accessToken = null
    currentUser = null
    currentSessionId = null
    localStorage.removeItem(refreshTokenKey)
  },
}
