import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../../core/auth/use-auth'
import { toApiError } from '../../../core/network/api-error'
import { Button } from '../../../core/ui/button'
import { Card } from '../../../core/ui/card'
import { Input } from '../../../core/ui/input'
import {
  catalogApiService,
  type AlbumPayload,
  type ArtistPayload,
  type TrackPayload,
} from '../data/catalog-api-service'

type CatalogTab = 'artists' | 'albums' | 'tracks'

export function CatalogPage() {
  const { authorizedClient } = useAuth()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<CatalogTab>('artists')
  const [query, setQuery] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)

  const artistsQuery = useQuery({
    queryKey: ['admin-catalog', 'artists', query],
    queryFn: () => catalogApiService.listArtists(authorizedClient, query),
    enabled: tab === 'artists',
  })
  const albumsQuery = useQuery({
    queryKey: ['admin-catalog', 'albums', query],
    queryFn: () => catalogApiService.listAlbums(authorizedClient, query),
    enabled: tab === 'albums',
  })
  const tracksQuery = useQuery({
    queryKey: ['admin-catalog', 'tracks', query],
    queryFn: () => catalogApiService.listTracks(authorizedClient, query),
    enabled: tab === 'tracks',
  })

  const refreshCurrent = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin-catalog', tab] })
  }

  const createArtist = useMutation({
    mutationFn: (payload: ArtistPayload) => catalogApiService.createArtist(authorizedClient, payload),
    onSuccess: () => {
      setFeedback('Artist created.')
      refreshCurrent()
    },
    onError: (error) => setFeedback(toApiError(error).message),
  })
  const updateArtist = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ArtistPayload> }) =>
      catalogApiService.updateArtist(authorizedClient, id, payload),
    onSuccess: () => {
      setFeedback('Artist updated.')
      refreshCurrent()
    },
    onError: (error) => setFeedback(toApiError(error).message),
  })
  const deleteArtist = useMutation({
    mutationFn: (id: string) => catalogApiService.deleteArtist(authorizedClient, id),
    onSuccess: () => {
      setFeedback('Artist deleted.')
      refreshCurrent()
    },
    onError: (error) => setFeedback(toApiError(error).message),
  })

  const createAlbum = useMutation({
    mutationFn: (payload: AlbumPayload) => catalogApiService.createAlbum(authorizedClient, payload),
    onSuccess: () => {
      setFeedback('Album created.')
      refreshCurrent()
    },
    onError: (error) => setFeedback(toApiError(error).message),
  })
  const updateAlbum = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AlbumPayload> }) =>
      catalogApiService.updateAlbum(authorizedClient, id, payload),
    onSuccess: () => {
      setFeedback('Album updated.')
      refreshCurrent()
    },
    onError: (error) => setFeedback(toApiError(error).message),
  })
  const deleteAlbum = useMutation({
    mutationFn: (id: string) => catalogApiService.deleteAlbum(authorizedClient, id),
    onSuccess: () => {
      setFeedback('Album deleted.')
      refreshCurrent()
    },
    onError: (error) => setFeedback(toApiError(error).message),
  })

  const createTrack = useMutation({
    mutationFn: (payload: TrackPayload) => catalogApiService.createTrack(authorizedClient, payload),
    onSuccess: () => {
      setFeedback('Track created.')
      refreshCurrent()
    },
    onError: (error) => setFeedback(toApiError(error).message),
  })
  const updateTrack = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<TrackPayload> }) =>
      catalogApiService.updateTrack(authorizedClient, id, payload),
    onSuccess: () => {
      setFeedback('Track updated.')
      refreshCurrent()
    },
    onError: (error) => setFeedback(toApiError(error).message),
  })
  const deleteTrack = useMutation({
    mutationFn: (id: string) => catalogApiService.deleteTrack(authorizedClient, id),
    onSuccess: () => {
      setFeedback('Track deleted.')
      refreshCurrent()
    },
    onError: (error) => setFeedback(toApiError(error).message),
  })

  const activeData = useMemo(() => {
    if (tab === 'artists') return artistsQuery
    if (tab === 'albums') return albumsQuery
    return tracksQuery
  }, [albumsQuery, artistsQuery, tab, tracksQuery])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold text-white">Catalog</h2>
          <p className="text-sm text-muted">Manage artists, albums, and tracks.</p>
        </div>
      </div>

      <Card className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {(['artists', 'albums', 'tracks'] as CatalogTab[]).map((item) => (
            <Button
              key={item}
              variant={tab === item ? 'primary' : 'secondary'}
              onClick={() => setTab(item)}
            >
              {item[0].toUpperCase() + item.slice(1)}
            </Button>
          ))}
        </div>
        <div className="max-w-sm">
          <Input
            placeholder="Search by title/name"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </Card>

      {feedback ? (
        <Card className="border-primary/40 bg-primary/10 p-3 text-sm text-white">{feedback}</Card>
      ) : null}

      {tab === 'artists' ? (
        <ArtistSection
          rows={artistsQuery.data || []}
          isLoading={artistsQuery.isLoading}
          onCreate={(payload) => createArtist.mutate(payload)}
          onUpdate={(id, payload) => updateArtist.mutate({ id, payload })}
          onDelete={(id) => deleteArtist.mutate(id)}
        />
      ) : null}

      {tab === 'albums' ? (
        <AlbumSection
          rows={albumsQuery.data || []}
          isLoading={albumsQuery.isLoading}
          onCreate={(payload) => createAlbum.mutate(payload)}
          onUpdate={(id, payload) => updateAlbum.mutate({ id, payload })}
          onDelete={(id) => deleteAlbum.mutate(id)}
        />
      ) : null}

      {tab === 'tracks' ? (
        <TrackSection
          rows={tracksQuery.data || []}
          isLoading={tracksQuery.isLoading}
          onCreate={(payload) => createTrack.mutate(payload)}
          onUpdate={(id, payload) => updateTrack.mutate({ id, payload })}
          onDelete={(id) => deleteTrack.mutate(id)}
        />
      ) : null}

      {activeData.isError ? (
        <Card className="border-danger/40 bg-danger/10 p-3 text-sm text-white">
          {toApiError(activeData.error).message}
        </Card>
      ) : null}
    </div>
  )
}

function ArtistSection({
  rows,
  isLoading,
  onCreate,
  onUpdate,
  onDelete,
}: {
  rows: Array<{ id: string; name: string; popularity_score: number; image_url: string | null }>
  isLoading: boolean
  onCreate: (payload: ArtistPayload) => void
  onUpdate: (id: string, payload: Partial<ArtistPayload>) => void
  onDelete: (id: string) => void
}) {
  const [createForm, setCreateForm] = useState<ArtistPayload>({ name: '' })
  const [editId, setEditId] = useState<string>('')
  const [editName, setEditName] = useState('')

  return (
    <Card className="space-y-4">
      <h3 className="text-xl font-semibold text-white">Artists</h3>
      <div className="grid gap-3 md:grid-cols-4">
        <Input
          placeholder="Name"
          value={createForm.name}
          onChange={(event) => setCreateForm((prev) => ({ ...prev, name: event.target.value }))}
        />
        <Input
          placeholder="Image URL (optional)"
          value={createForm.imageUrl || ''}
          onChange={(event) => setCreateForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
        />
        <Input
          placeholder="Popularity 0-100"
          value={String(createForm.popularityScore ?? '')}
          onChange={(event) =>
            setCreateForm((prev) => ({ ...prev, popularityScore: Number(event.target.value || 0) }))
          }
        />
        <Button
          onClick={() => createForm.name.trim() && onCreate(createForm)}
          disabled={!createForm.name.trim()}
        >
          Create artist
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <Input placeholder="Artist ID for update/delete" value={editId} onChange={(e) => setEditId(e.target.value)} />
        <Input placeholder="New name (for update)" value={editName} onChange={(e) => setEditName(e.target.value)} />
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => editId && editName.trim() && onUpdate(editId, { name: editName })}
          >
            Update
          </Button>
          <Button variant="danger" onClick={() => editId && onDelete(editId)}>
            Delete
          </Button>
        </div>
      </div>

      {isLoading ? <p className="text-sm text-muted">Loading...</p> : null}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-muted">
            <tr>
              <th className="px-2 py-2">ID</th>
              <th className="px-2 py-2">Name</th>
              <th className="px-2 py-2">Popularity</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.id} className="border-t border-border/60">
                <td className="px-2 py-2 font-mono text-xs text-muted">{item.id}</td>
                <td className="px-2 py-2 text-white">{item.name}</td>
                <td className="px-2 py-2 text-muted">{item.popularity_score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function AlbumSection({
  rows,
  isLoading,
  onCreate,
  onUpdate,
  onDelete,
}: {
  rows: Array<{ id: string; title: string; artist_name: string; release_date: string }>
  isLoading: boolean
  onCreate: (payload: AlbumPayload) => void
  onUpdate: (id: string, payload: Partial<AlbumPayload>) => void
  onDelete: (id: string) => void
}) {
  const [createForm, setCreateForm] = useState<AlbumPayload>({
    artistId: '',
    title: '',
    releaseDate: '',
  })
  const [editId, setEditId] = useState('')
  const [editTitle, setEditTitle] = useState('')

  return (
    <Card className="space-y-4">
      <h3 className="text-xl font-semibold text-white">Albums</h3>
      <div className="grid gap-3 md:grid-cols-5">
        <Input
          placeholder="Artist ID"
          value={createForm.artistId}
          onChange={(e) => setCreateForm((prev) => ({ ...prev, artistId: e.target.value }))}
        />
        <Input
          placeholder="Title"
          value={createForm.title}
          onChange={(e) => setCreateForm((prev) => ({ ...prev, title: e.target.value }))}
        />
        <Input
          type="date"
          placeholder="Release Date"
          value={createForm.releaseDate}
          onChange={(e) => setCreateForm((prev) => ({ ...prev, releaseDate: e.target.value }))}
        />
        <Input
          placeholder="Cover URL (optional)"
          value={createForm.coverUrl || ''}
          onChange={(e) => setCreateForm((prev) => ({ ...prev, coverUrl: e.target.value }))}
        />
        <Button
          onClick={() =>
            createForm.artistId.trim() && createForm.title.trim() && createForm.releaseDate && onCreate(createForm)
          }
          disabled={!createForm.artistId || !createForm.title || !createForm.releaseDate}
        >
          Create album
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <Input placeholder="Album ID for update/delete" value={editId} onChange={(e) => setEditId(e.target.value)} />
        <Input placeholder="New title (for update)" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => editId && editTitle.trim() && onUpdate(editId, { title: editTitle })}
          >
            Update
          </Button>
          <Button variant="danger" onClick={() => editId && onDelete(editId)}>
            Delete
          </Button>
        </div>
      </div>

      {isLoading ? <p className="text-sm text-muted">Loading...</p> : null}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-muted">
            <tr>
              <th className="px-2 py-2">ID</th>
              <th className="px-2 py-2">Title</th>
              <th className="px-2 py-2">Artist</th>
              <th className="px-2 py-2">Release</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.id} className="border-t border-border/60">
                <td className="px-2 py-2 font-mono text-xs text-muted">{item.id}</td>
                <td className="px-2 py-2 text-white">{item.title}</td>
                <td className="px-2 py-2 text-muted">{item.artist_name}</td>
                <td className="px-2 py-2 text-muted">{String(item.release_date).slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function TrackSection({
  rows,
  isLoading,
  onCreate,
  onUpdate,
  onDelete,
}: {
  rows: Array<{ id: string; title: string; artist_name: string; album_title: string | null }>
  isLoading: boolean
  onCreate: (payload: TrackPayload) => void
  onUpdate: (id: string, payload: Partial<TrackPayload>) => void
  onDelete: (id: string) => void
}) {
  const [createForm, setCreateForm] = useState<TrackPayload>({
    artistId: '',
    title: '',
    durationMs: 180000,
    releaseDate: '',
  })
  const [editId, setEditId] = useState('')
  const [editTitle, setEditTitle] = useState('')

  return (
    <Card className="space-y-4">
      <h3 className="text-xl font-semibold text-white">Tracks</h3>
      <div className="grid gap-3 md:grid-cols-6">
        <Input
          placeholder="Artist ID"
          value={createForm.artistId}
          onChange={(e) => setCreateForm((prev) => ({ ...prev, artistId: e.target.value }))}
        />
        <Input
          placeholder="Album ID (optional)"
          value={createForm.albumId || ''}
          onChange={(e) => setCreateForm((prev) => ({ ...prev, albumId: e.target.value }))}
        />
        <Input
          placeholder="Title"
          value={createForm.title}
          onChange={(e) => setCreateForm((prev) => ({ ...prev, title: e.target.value }))}
        />
        <Input
          type="number"
          placeholder="Duration ms"
          value={String(createForm.durationMs)}
          onChange={(e) => setCreateForm((prev) => ({ ...prev, durationMs: Number(e.target.value || 0) }))}
        />
        <Input
          type="date"
          value={createForm.releaseDate}
          onChange={(e) => setCreateForm((prev) => ({ ...prev, releaseDate: e.target.value }))}
        />
        <Button
          onClick={() =>
            createForm.artistId && createForm.title.trim() && createForm.releaseDate && onCreate(createForm)
          }
          disabled={!createForm.artistId || !createForm.title || !createForm.releaseDate}
        >
          Create track
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <Input placeholder="Track ID for update/delete" value={editId} onChange={(e) => setEditId(e.target.value)} />
        <Input placeholder="New title (for update)" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => editId && editTitle.trim() && onUpdate(editId, { title: editTitle })}
          >
            Update
          </Button>
          <Button variant="danger" onClick={() => editId && onDelete(editId)}>
            Delete
          </Button>
        </div>
      </div>

      {isLoading ? <p className="text-sm text-muted">Loading...</p> : null}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-muted">
            <tr>
              <th className="px-2 py-2">ID</th>
              <th className="px-2 py-2">Title</th>
              <th className="px-2 py-2">Artist</th>
              <th className="px-2 py-2">Album</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.id} className="border-t border-border/60">
                <td className="px-2 py-2 font-mono text-xs text-muted">{item.id}</td>
                <td className="px-2 py-2 text-white">{item.title}</td>
                <td className="px-2 py-2 text-muted">{item.artist_name}</td>
                <td className="px-2 py-2 text-muted">{item.album_title || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
