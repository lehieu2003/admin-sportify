import { Link } from 'react-router-dom'
import { Card } from '../../../core/ui/card'

export function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-6">
      <Card className="w-full max-w-md">
        <h2 className="text-xl font-semibold text-white">Access denied</h2>
        <p className="mt-2 text-sm text-muted">
          You do not have permission to access admin management.
        </p>
        <Link to="/login" className="mt-4 inline-block text-sm text-primary hover:text-primaryHover">
          Back to login
        </Link>
      </Card>
    </div>
  )
}
