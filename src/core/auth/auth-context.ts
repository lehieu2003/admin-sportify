import { createContext } from 'react'
import type { AxiosInstance } from 'axios'
import type { AdminUser } from './auth-types'

type SigninPayload = {
  email: string
  password: string
}

export type AuthContextValue = {
  user: AdminUser | null
  isAuthenticated: boolean
  isBootstrapping: boolean
  authorizedClient: AxiosInstance
  signin: (payload: SigninPayload) => Promise<void>
  signout: () => Promise<void>
  restoreSession: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
