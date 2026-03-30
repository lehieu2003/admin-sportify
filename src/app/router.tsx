import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AdminLayout } from './layout/admin-layout'
import { ProtectedRoute } from './routing/protected-route'
import { LoginPage } from '../features/auth/pages/login-page'
import { DashboardPage } from '../features/dashboard/pages/dashboard-page'
import { CatalogPage } from '../features/catalog/pages/catalog-page'
import { SpotifyImportPage } from '../features/spotify-import/pages/spotify-import-page'
import { ForbiddenPage } from '../features/system/pages/forbidden-page'
import { NotFoundPage } from '../features/system/pages/not-found-page'
import { useAuth } from '../core/auth/use-auth'

export function AppRouter() {
  const { restoreSession } = useAuth()

  useEffect(() => {
    void restoreSession()
  }, [restoreSession])

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forbidden" element={<ForbiddenPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="catalog/*" element={<CatalogPage />} />
          <Route path="spotify-import" element={<SpotifyImportPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
