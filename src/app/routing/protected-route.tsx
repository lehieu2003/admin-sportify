import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../core/auth/use-auth'

export function ProtectedRoute() {
  const { isAuthenticated, isBootstrapping, user } = useAuth()
  const location = useLocation()

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-muted">
        Restoring session...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/forbidden" replace />
  }

  return <Outlet />
}
