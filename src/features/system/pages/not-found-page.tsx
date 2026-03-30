import { Link } from 'react-router-dom'
import { Card } from '../../../core/ui/card'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-6">
      <Card className="w-full max-w-md">
        <h2 className="text-xl font-semibold text-white">Page not found</h2>
        <p className="mt-2 text-sm text-muted">The page you requested does not exist.</p>
        <Link to="/" className="mt-4 inline-block text-sm text-primary hover:text-primaryHover">
          Go to dashboard
        </Link>
      </Card>
    </div>
  )
}
