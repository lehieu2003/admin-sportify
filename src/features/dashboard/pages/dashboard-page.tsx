import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../../core/auth/use-auth'
import { authService } from '../../../core/auth/auth-service'
import { Card } from '../../../core/ui/card'
import { queryKeys } from '../../../core/query/query-keys'

export function DashboardPage() {
  const { authorizedClient } = useAuth()
  const { data: me } = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => authService.getMe(authorizedClient),
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-4xl font-bold text-white">Dashboard</h2>
        <p className="mt-1 text-sm text-muted">
          Overview and quick access to admin modules.
        </p>
      </div>

      <Card>
        <p className="text-sm uppercase tracking-wide text-muted">Current admin profile</p>
        <div className="mt-4 grid gap-2 text-sm md:grid-cols-3">
          <p>
            <span className="text-muted">Name</span>
            <br />
            <span className="font-medium text-white">{me?.fullName || '-'}</span>
          </p>
          <p>
            <span className="text-muted">Email</span>
            <br />
            <span className="font-medium text-white">{me?.email || '-'}</span>
          </p>
          <p>
            <span className="text-muted">Role</span>
            <br />
            <span className="font-medium capitalize text-primary">{me?.role || '-'}</span>
          </p>
        </div>
      </Card>

      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <h3 className="text-xl font-semibold text-white">Catalog Module</h3>
          <p className="mt-2 text-sm text-muted">
            Artist/Album/Track CRUD will be implemented in the next phase.
          </p>
        </Card>
        <Card>
          <h3 className="text-xl font-semibold text-white">Spotify Import Module</h3>
          <p className="mt-2 text-sm text-muted">
            Admin import and nightly sync UI will be implemented in the next phase.
          </p>
        </Card>
      </div>
    </div>
  )
}
