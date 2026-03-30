import { Card } from '../../../core/ui/card'

export function SpotifyImportPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-white">Spotify Import</h2>
      <Card>
        <p className="text-sm text-muted">
          Placeholder for admin endpoints:
          <code className="ml-1 rounded bg-panel-alt px-1 py-0.5 text-xs text-white">
            /admin/spotify/*
          </code>
          .
        </p>
      </Card>
    </div>
  )
}
