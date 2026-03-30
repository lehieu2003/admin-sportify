import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '../../../core/auth/use-auth'
import { toApiError } from '../../../core/network/api-error'
import { Button } from '../../../core/ui/button'
import { Card } from '../../../core/ui/card'
import { Input } from '../../../core/ui/input'
import { spotifyImportApiService, type ImportSummary } from '../data/spotify-import-api-service'

export function SpotifyImportPage() {
  const { authorizedClient } = useAuth()
  const [artistId, setArtistId] = useState('')
  const [albumId, setAlbumId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<'artist' | 'album' | 'track'>('track')
  const [searchLimit, setSearchLimit] = useState(10)
  const [nightlyLimit, setNightlyLimit] = useState(50)
  const [result, setResult] = useState<ImportSummary | null>(null)
  const [errorText, setErrorText] = useState<string | null>(null)

  const artistMutation = useMutation({
    mutationFn: () => spotifyImportApiService.importArtist(authorizedClient, artistId),
    onSuccess: (data) => {
      setErrorText(null)
      setResult(data)
    },
    onError: (error) => setErrorText(toApiError(error).message),
  })

  const albumMutation = useMutation({
    mutationFn: () => spotifyImportApiService.importAlbum(authorizedClient, albumId),
    onSuccess: (data) => {
      setErrorText(null)
      setResult(data)
    },
    onError: (error) => setErrorText(toApiError(error).message),
  })

  const searchMutation = useMutation({
    mutationFn: () =>
      spotifyImportApiService.importBySearch(authorizedClient, {
        query: searchQuery,
        type: searchType,
        limit: searchLimit,
      }),
    onSuccess: (data) => {
      setErrorText(null)
      setResult(data)
    },
    onError: (error) => setErrorText(toApiError(error).message),
  })

  const nightlyMutation = useMutation({
    mutationFn: () => spotifyImportApiService.runNightlySync(authorizedClient, nightlyLimit),
    onSuccess: (data) => {
      setErrorText(null)
      setResult(data)
    },
    onError: (error) => setErrorText(toApiError(error).message),
  })

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-3xl font-bold text-white">Spotify Import</h2>
        <p className="text-sm text-muted">
          Trigger admin Spotify ingestion and nightly metadata sync.
        </p>
      </div>

      {errorText ? (
        <Card className="border-danger/40 bg-danger/10 p-3 text-sm text-white">{errorText}</Card>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <Card className="space-y-3">
          <h3 className="text-xl font-semibold text-white">Import Artist</h3>
          <Input
            placeholder="Spotify Artist ID"
            value={artistId}
            onChange={(event) => setArtistId(event.target.value)}
          />
          <Button onClick={() => artistId.trim() && artistMutation.mutate()} disabled={!artistId.trim()}>
            {artistMutation.isPending ? 'Importing...' : 'Import artist'}
          </Button>
        </Card>

        <Card className="space-y-3">
          <h3 className="text-xl font-semibold text-white">Import Album</h3>
          <Input
            placeholder="Spotify Album ID"
            value={albumId}
            onChange={(event) => setAlbumId(event.target.value)}
          />
          <Button onClick={() => albumId.trim() && albumMutation.mutate()} disabled={!albumId.trim()}>
            {albumMutation.isPending ? 'Importing...' : 'Import album'}
          </Button>
        </Card>
      </div>

      <Card className="space-y-3">
        <h3 className="text-xl font-semibold text-white">Import by Search</h3>
        <div className="grid gap-3 md:grid-cols-4">
          <Input
            placeholder="Query"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <select
            className="rounded-md border border-border bg-panel px-3 py-2 text-sm text-white"
            value={searchType}
            onChange={(event) => setSearchType(event.target.value as 'artist' | 'album' | 'track')}
          >
            <option value="track">track</option>
            <option value="album">album</option>
            <option value="artist">artist</option>
          </select>
          <Input
            type="number"
            value={String(searchLimit)}
            onChange={(event) => setSearchLimit(Number(event.target.value || 10))}
          />
          <Button
            onClick={() => searchQuery.trim() && searchMutation.mutate()}
            disabled={!searchQuery.trim()}
          >
            {searchMutation.isPending ? 'Importing...' : 'Import search results'}
          </Button>
        </div>
      </Card>

      <Card className="space-y-3">
        <h3 className="text-xl font-semibold text-white">Nightly Sync Trigger</h3>
        <div className="grid gap-3 md:grid-cols-[220px_auto]">
          <Input
            type="number"
            value={String(nightlyLimit)}
            onChange={(event) => setNightlyLimit(Number(event.target.value || 50))}
          />
          <Button onClick={() => nightlyMutation.mutate()}>
            {nightlyMutation.isPending ? 'Running...' : 'Run nightly sync now'}
          </Button>
        </div>
      </Card>

      <Card className="space-y-3">
        <h3 className="text-xl font-semibold text-white">Last result</h3>
        <pre className="overflow-x-auto rounded bg-black/40 p-3 text-xs text-muted">
          {JSON.stringify(result, null, 2)}
        </pre>
      </Card>
    </div>
  )
}
