import { AuthContext, type AuthContextValue } from './auth-context'

export function AuthContextProvider({
  value,
  children,
}: {
  value: AuthContextValue
  children: React.ReactNode
}) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
