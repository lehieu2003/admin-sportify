import { useCallback, useMemo, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAuthorizedHttpClient } from '../core/network/authorized-http-client'
import { authSessionStore } from '../core/auth/auth-session-store'
import { authService } from '../core/auth/auth-service'
import { AuthContextProvider } from '../core/auth/auth-context-provider'
import type { AuthContextValue } from '../core/auth/auth-context'
import type { AdminUser } from '../core/auth/auth-types'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(authSessionStore.getUser())
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  const clearSession = useCallback(() => {
    authSessionStore.clear()
    setUser(null)
    queryClient.clear()
  }, [])

  const refreshAccessToken = useCallback(async () => {
    const refreshToken = authSessionStore.getRefreshToken()
    if (!refreshToken) return null

    try {
      const session = await authService.refresh(refreshToken)
      authSessionStore.saveSession(session)
      setUser(session.user)
      return session.accessToken
    } catch {
      clearSession()
      return null
    }
  }, [clearSession])

  const authorizedClient = useMemo(
    () =>
      createAuthorizedHttpClient({
        getAccessToken: authSessionStore.getAccessToken,
        refreshAccessToken,
        onUnauthorized: clearSession,
      }),
    [clearSession, refreshAccessToken],
  )

  const restoreSession = useCallback(async () => {
    setIsBootstrapping(true)
    try {
      const nextToken = await refreshAccessToken()
      if (!nextToken) {
        clearSession()
        return
      }
      const me = await authService.getMe(authorizedClient)
      authSessionStore.updateUser(me)
      setUser(me)
    } finally {
      setIsBootstrapping(false)
    }
  }, [authorizedClient, clearSession, refreshAccessToken])

  const signin = useCallback(
    async (payload: { email: string; password: string }) => {
      const session = await authService.signin(payload)
      authSessionStore.saveSession(session)
      setUser(session.user)
      queryClient.invalidateQueries()
    },
    [],
  )

  const signout = useCallback(async () => {
    const refreshToken = authSessionStore.getRefreshToken()
    if (refreshToken) {
      try {
        await authService.signout(refreshToken)
      } catch {
        // Ignore signout network errors, local cleanup is enough for MVP.
      }
    }
    clearSession()
  }, [clearSession])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      authorizedClient,
      signin,
      signout,
      restoreSession,
    }),
    [authorizedClient, isBootstrapping, restoreSession, signin, signout, user],
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider value={value}>{children}</AuthContextProvider>
    </QueryClientProvider>
  )
}
