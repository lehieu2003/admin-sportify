import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { useAuth } from '../../../core/auth/use-auth'
import { toApiError } from '../../../core/network/api-error'
import { Button } from '../../../core/ui/button'
import { Card } from '../../../core/ui/card'
import { Input } from '../../../core/ui/input'
import { env } from '../../../core/config/env'
import {
  catalogApiService,
  type AlbumItem,
  type AlbumPayload,
  type ArtistItem,
  type ArtistPayload,
  type CatalogQueryParams,
  type TrackItem,
  type TrackPayload,
} from '../data/catalog-api-service'

type CatalogTab = 'artists' | 'albums' | 'tracks'
type SortOrder = 'asc' | 'desc'
type ModalMode = 'create' | 'edit'

type ArtistFormValues = {
  name: string
  bio: string
  imageUrl: string
  popularityScore: number
}

type AlbumFormValues = {
  artistId: string
  title: string
  releaseDate: string
  coverUrl: string
  albumType: 'album' | 'single' | 'ep'
}

type TrackFormValues = {
  artistId: string
  albumId: string
  title: string
  durationMs: number
  releaseDate: string
  coverUrl: string
  audioUrl: string
  explicit: boolean
  popularityScore: number
}

const artistSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  bio: z.string().optional(),
  imageUrl: z.string().optional(),
  popularityScore: z.number().min(0).max(100),
})

const albumSchema = z.object({
  artistId: z.string().uuid('Artist ID must be a UUID'),
  title: z.string().trim().min(1, 'Title is required'),
  releaseDate: z.string().min(1, 'Release date is required'),
  coverUrl: z.string().optional(),
  albumType: z.enum(['album', 'single', 'ep']),
})

const trackSchema = z.object({
  artistId: z.string().uuid('Artist ID must be a UUID'),
  albumId: z.string().optional(),
  title: z.string().trim().min(1, 'Title is required'),
  durationMs: z.number().int().min(1000),
  releaseDate: z.string().min(1, 'Release date is required'),
  coverUrl: z.string().optional(),
  audioUrl: z.string().optional(),
  explicit: z.boolean(),
  popularityScore: z.number().min(0).max(100),
})

const tabConfig: Record<
  CatalogTab,
  {
    label: string
    sortOptions: Array<{ label: string; value: string }>
    defaultSortBy: string
  }
> = {
  artists: {
    label: 'Artists',
    sortOptions: [
      { label: 'Updated time', value: 'updatedAt' },
      { label: 'Created time', value: 'createdAt' },
      { label: 'Name', value: 'name' },
      { label: 'Popularity', value: 'popularityScore' },
    ],
    defaultSortBy: 'updatedAt',
  },
  albums: {
    label: 'Albums',
    sortOptions: [
      { label: 'Updated time', value: 'updatedAt' },
      { label: 'Created time', value: 'createdAt' },
      { label: 'Title', value: 'title' },
      { label: 'Release date', value: 'releaseDate' },
    ],
    defaultSortBy: 'updatedAt',
  },
  tracks: {
    label: 'Tracks',
    sortOptions: [
      { label: 'Updated time', value: 'updatedAt' },
      { label: 'Created time', value: 'createdAt' },
      { label: 'Title', value: 'title' },
      { label: 'Release date', value: 'releaseDate' },
      { label: 'Popularity', value: 'popularityScore' },
    ],
    defaultSortBy: 'updatedAt',
  },
}

const apiOrigin = (() => {
  try {
    return new URL(env.apiBaseUrl).origin
  } catch {
    return ''
  }
})()

export function CatalogPage() {
  const { authorizedClient } = useAuth()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<CatalogTab>('artists')
  const [rawQuery, setRawQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [sortBy, setSortBy] = useState(tabConfig.artists.defaultSortBy)
  const [feedback, setFeedback] = useState<string | null>(null)

  const [artistModal, setArtistModal] = useState<{ mode: ModalMode; item?: ArtistItem } | null>(null)
  const [albumModal, setAlbumModal] = useState<{ mode: ModalMode; item?: AlbumItem } | null>(null)
  const [trackModal, setTrackModal] = useState<{ mode: ModalMode; item?: TrackItem } | null>(null)
  const [deleteState, setDeleteState] = useState<{ tab: CatalogTab; id: string; label: string } | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(rawQuery.trim()), 350)
    return () => clearTimeout(timer)
  }, [rawQuery])

  const baseParams: CatalogQueryParams = useMemo(
    () => ({
      query: debouncedQuery || undefined,
      limit: 20,
      sortBy,
      sortOrder,
    }),
    [debouncedQuery, sortBy, sortOrder],
  )

  const uploadImage = useCallback(
    async (file: File) => {
      const result = await catalogApiService.uploadImage(authorizedClient, file)
      return result.url
    },
    [authorizedClient],
  )

  const artistsQuery = useInfiniteQuery({
    queryKey: ['admin-catalog', 'artists', baseParams],
    queryFn: ({ pageParam }) =>
      catalogApiService.listArtists(authorizedClient, { ...baseParams, cursor: pageParam || undefined }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: tab === 'artists',
  })

  const albumsQuery = useInfiniteQuery({
    queryKey: ['admin-catalog', 'albums', baseParams],
    queryFn: ({ pageParam }) =>
      catalogApiService.listAlbums(authorizedClient, { ...baseParams, cursor: pageParam || undefined }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: tab === 'albums',
  })

  const tracksQuery = useInfiniteQuery({
    queryKey: ['admin-catalog', 'tracks', baseParams],
    queryFn: ({ pageParam }) =>
      catalogApiService.listTracks(authorizedClient, { ...baseParams, cursor: pageParam || undefined }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: tab === 'tracks',
  })

  const artists = useMemo(
    () => (artistsQuery.data?.pages ?? []).flatMap((page) => page.items),
    [artistsQuery.data?.pages],
  )
  const albums = useMemo(
    () => (albumsQuery.data?.pages ?? []).flatMap((page) => page.items),
    [albumsQuery.data?.pages],
  )
  const tracks = useMemo(
    () => (tracksQuery.data?.pages ?? []).flatMap((page) => page.items),
    [tracksQuery.data?.pages],
  )

  const invalidateCurrent = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin-catalog', tab] })
  }

  const handleMutationError = (error: unknown) => {
    const parsed = toApiError(error)
    setFeedback(parsed.message)
    if (parsed.code === 'NOT_FOUND') {
      invalidateCurrent()
    }
  }

  const createArtist = useMutation({
    mutationFn: (payload: ArtistPayload) => catalogApiService.createArtist(authorizedClient, payload),
    onSuccess: () => {
      setFeedback('Artist created.')
      setArtistModal(null)
      invalidateCurrent()
    },
    onError: handleMutationError,
  })
  const updateArtist = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ArtistPayload> }) =>
      catalogApiService.updateArtist(authorizedClient, id, payload),
    onSuccess: () => {
      setFeedback('Artist updated.')
      setArtistModal(null)
      invalidateCurrent()
    },
    onError: handleMutationError,
  })
  const deleteArtist = useMutation({
    mutationFn: (id: string) => catalogApiService.deleteArtist(authorizedClient, id),
    onSuccess: () => {
      setFeedback('Artist deleted.')
      setDeleteState(null)
      invalidateCurrent()
    },
    onError: handleMutationError,
  })

  const createAlbum = useMutation({
    mutationFn: (payload: AlbumPayload) => catalogApiService.createAlbum(authorizedClient, payload),
    onSuccess: () => {
      setFeedback('Album created.')
      setAlbumModal(null)
      invalidateCurrent()
    },
    onError: handleMutationError,
  })
  const updateAlbum = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AlbumPayload> }) =>
      catalogApiService.updateAlbum(authorizedClient, id, payload),
    onSuccess: () => {
      setFeedback('Album updated.')
      setAlbumModal(null)
      invalidateCurrent()
    },
    onError: handleMutationError,
  })
  const deleteAlbum = useMutation({
    mutationFn: (id: string) => catalogApiService.deleteAlbum(authorizedClient, id),
    onSuccess: () => {
      setFeedback('Album deleted.')
      setDeleteState(null)
      invalidateCurrent()
    },
    onError: handleMutationError,
  })

  const createTrack = useMutation({
    mutationFn: (payload: TrackPayload) => catalogApiService.createTrack(authorizedClient, payload),
    onSuccess: () => {
      setFeedback('Track created.')
      setTrackModal(null)
      invalidateCurrent()
    },
    onError: handleMutationError,
  })
  const updateTrack = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<TrackPayload> }) =>
      catalogApiService.updateTrack(authorizedClient, id, payload),
    onSuccess: () => {
      setFeedback('Track updated.')
      setTrackModal(null)
      invalidateCurrent()
    },
    onError: handleMutationError,
  })
  const deleteTrack = useMutation({
    mutationFn: (id: string) => catalogApiService.deleteTrack(authorizedClient, id),
    onSuccess: () => {
      setFeedback('Track deleted.')
      setDeleteState(null)
      invalidateCurrent()
    },
    onError: handleMutationError,
  })

  const activeQuery = tab === 'artists' ? artistsQuery : tab === 'albums' ? albumsQuery : tracksQuery
  const isTableLoading = activeQuery.isLoading
  const isTableError = activeQuery.isError
  const tableError = isTableError ? toApiError(activeQuery.error).message : null
  const hasRows = tab === 'artists' ? artists.length > 0 : tab === 'albums' ? albums.length > 0 : tracks.length > 0

  const loadMore = () => {
    void activeQuery.fetchNextPage()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold text-white">Catalog</h2>
          <p className="text-sm text-muted">Manage artists, albums and tracks with row-level actions.</p>
        </div>
        <Button
          onClick={() => {
            if (tab === 'artists') setArtistModal({ mode: 'create' })
            if (tab === 'albums') setAlbumModal({ mode: 'create' })
            if (tab === 'tracks') setTrackModal({ mode: 'create' })
          }}
        >
          Create {tabConfig[tab].label.slice(0, -1)}
        </Button>
      </div>

      <Card className="sticky top-3 z-10 space-y-3">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(tabConfig) as CatalogTab[]).map((item) => (
            <Button
              key={item}
              variant={tab === item ? 'primary' : 'secondary'}
              onClick={() => {
                setTab(item)
                setSortBy(tabConfig[item].defaultSortBy)
                setSortOrder('desc')
              }}
            >
              {tabConfig[item].label}
            </Button>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-[minmax(220px,320px)_220px_140px]">
          <Input
            placeholder="Search..."
            value={rawQuery}
            onChange={(event) => setRawQuery(event.target.value)}
          />
          <select
            className="rounded-md border border-border bg-panel px-3 py-2 text-sm text-white"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            {tabConfig[tab].sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            className="rounded-md border border-border bg-panel px-3 py-2 text-sm text-white"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value as SortOrder)}
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </div>
      </Card>

      {feedback ? <Card className="border-primary/40 bg-primary/10 p-3 text-sm text-white">{feedback}</Card> : null}

      <Card className="space-y-4">
        {isTableLoading ? <p className="text-sm text-muted">Loading records...</p> : null}
        {tableError ? <p className="text-sm text-danger">{tableError}</p> : null}

        {!isTableLoading && !hasRows ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted">
              {debouncedQuery ? 'No results for this query.' : 'No records yet, create your first item.'}
            </p>
          </div>
        ) : null}

        {tab === 'artists' && artists.length > 0 ? (
          <ArtistsTable
            rows={artists}
            onEdit={(item) => setArtistModal({ mode: 'edit', item })}
            onDelete={(item) => setDeleteState({ tab: 'artists', id: item.id, label: item.name })}
          />
        ) : null}
        {tab === 'albums' && albums.length > 0 ? (
          <AlbumsTable
            rows={albums}
            onEdit={(item) => setAlbumModal({ mode: 'edit', item })}
            onDelete={(item) => setDeleteState({ tab: 'albums', id: item.id, label: item.title })}
          />
        ) : null}
        {tab === 'tracks' && tracks.length > 0 ? (
          <TracksTable
            rows={tracks}
            onEdit={(item) => setTrackModal({ mode: 'edit', item })}
            onDelete={(item) => setDeleteState({ tab: 'tracks', id: item.id, label: item.title })}
          />
        ) : null}

        {activeQuery.hasNextPage ? (
          <div className="flex justify-center">
            <Button variant="secondary" onClick={loadMore} disabled={activeQuery.isFetchingNextPage}>
              {activeQuery.isFetchingNextPage ? 'Loading more...' : 'Load more'}
            </Button>
          </div>
        ) : null}
      </Card>

      {artistModal ? (
        <ArtistModal
          mode={artistModal.mode}
          item={artistModal.item}
          onClose={() => setArtistModal(null)}
          onSubmit={(payload) => {
            if (artistModal.mode === 'create') {
              createArtist.mutate(payload)
            } else if (artistModal.item) {
              updateArtist.mutate({ id: artistModal.item.id, payload })
            }
          }}
          isSubmitting={createArtist.isPending || updateArtist.isPending}
          uploadImage={uploadImage}
        />
      ) : null}

      {albumModal ? (
        <AlbumModal
          mode={albumModal.mode}
          item={albumModal.item}
          onClose={() => setAlbumModal(null)}
          onSubmit={(payload) => {
            if (albumModal.mode === 'create') {
              createAlbum.mutate(payload)
            } else if (albumModal.item) {
              updateAlbum.mutate({ id: albumModal.item.id, payload })
            }
          }}
          isSubmitting={createAlbum.isPending || updateAlbum.isPending}
          uploadImage={uploadImage}
        />
      ) : null}

      {trackModal ? (
        <TrackModal
          mode={trackModal.mode}
          item={trackModal.item}
          onClose={() => setTrackModal(null)}
          onSubmit={(payload) => {
            if (trackModal.mode === 'create') {
              createTrack.mutate(payload)
            } else if (trackModal.item) {
              updateTrack.mutate({ id: trackModal.item.id, payload })
            }
          }}
          isSubmitting={createTrack.isPending || updateTrack.isPending}
          uploadImage={uploadImage}
        />
      ) : null}

      {deleteState ? (
        <ConfirmDeleteModal
          label={deleteState.label}
          pending={deleteArtist.isPending || deleteAlbum.isPending || deleteTrack.isPending}
          onClose={() => setDeleteState(null)}
          onConfirm={() => {
            if (deleteState.tab === 'artists') deleteArtist.mutate(deleteState.id)
            if (deleteState.tab === 'albums') deleteAlbum.mutate(deleteState.id)
            if (deleteState.tab === 'tracks') deleteTrack.mutate(deleteState.id)
          }}
        />
      ) : null}
    </div>
  )
}

function ArtistsTable({
  rows,
  onEdit,
  onDelete,
}: {
  rows: ArtistItem[]
  onEdit: (item: ArtistItem) => void
  onDelete: (item: ArtistItem) => void
}) {
  return (
    <TableShell
      headers={['Image', 'Name', 'Popularity', 'Updated', 'Actions']}
      rows={rows.map((item) => (
        <tr key={item.id} className="border-t border-border/60">
          <td className="px-3 py-3">
            <ImageThumb src={item.image_url} alt={item.name} />
          </td>
          <td className="px-3 py-3">
            <p className="font-medium text-white">{item.name}</p>
            <p className="mt-1 font-mono text-xs text-muted">{item.id}</p>
          </td>
          <td className="px-3 py-3 text-muted">{item.popularity_score}</td>
          <td className="px-3 py-3 text-muted">{formatDate(item.updated_at)}</td>
          <td className="px-3 py-3">
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => onEdit(item)}>
                Edit
              </Button>
              <Button variant="danger" onClick={() => onDelete(item)}>
                Delete
              </Button>
            </div>
          </td>
        </tr>
      ))}
    />
  )
}

function AlbumsTable({
  rows,
  onEdit,
  onDelete,
}: {
  rows: AlbumItem[]
  onEdit: (item: AlbumItem) => void
  onDelete: (item: AlbumItem) => void
}) {
  return (
    <TableShell
      headers={['Cover', 'Title', 'Artist', 'Release', 'Updated', 'Actions']}
      rows={rows.map((item) => (
        <tr key={item.id} className="border-t border-border/60">
          <td className="px-3 py-3">
            <ImageThumb src={item.cover_url} alt={item.title} />
          </td>
          <td className="px-3 py-3">
            <p className="font-medium text-white">{item.title}</p>
            <p className="mt-1 font-mono text-xs text-muted">{item.id}</p>
          </td>
          <td className="px-3 py-3 text-muted">{item.artist_name}</td>
          <td className="px-3 py-3 text-muted">{String(item.release_date).slice(0, 10)}</td>
          <td className="px-3 py-3 text-muted">{formatDate(item.updated_at)}</td>
          <td className="px-3 py-3">
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => onEdit(item)}>
                Edit
              </Button>
              <Button variant="danger" onClick={() => onDelete(item)}>
                Delete
              </Button>
            </div>
          </td>
        </tr>
      ))}
    />
  )
}

function TracksTable({
  rows,
  onEdit,
  onDelete,
}: {
  rows: TrackItem[]
  onEdit: (item: TrackItem) => void
  onDelete: (item: TrackItem) => void
}) {
  return (
    <TableShell
      headers={['Cover', 'Title', 'Artist', 'Album', 'Duration', 'Updated', 'Actions']}
      rows={rows.map((item) => (
        <tr key={item.id} className="border-t border-border/60">
          <td className="px-3 py-3">
            <ImageThumb src={item.cover_url} alt={item.title} />
          </td>
          <td className="px-3 py-3">
            <p className="font-medium text-white">{item.title}</p>
            <p className="mt-1 font-mono text-xs text-muted">{item.id}</p>
          </td>
          <td className="px-3 py-3 text-muted">{item.artist_name}</td>
          <td className="px-3 py-3 text-muted">{item.album_title || '-'}</td>
          <td className="px-3 py-3 text-muted">{Math.floor(item.duration_ms / 1000)}s</td>
          <td className="px-3 py-3 text-muted">{formatDate(item.updated_at)}</td>
          <td className="px-3 py-3">
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => onEdit(item)}>
                Edit
              </Button>
              <Button variant="danger" onClick={() => onDelete(item)}>
                Delete
              </Button>
            </div>
          </td>
        </tr>
      ))}
    />
  )
}

function TableShell({
  headers,
  rows,
}: {
  headers: string[]
  rows: ReactNode[]
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="text-muted">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-3 py-2 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  )
}

function ImageThumb({ src, alt }: { src?: string | null; alt: string }) {
  const resolved = resolveImageUrl(src)
  if (!resolved) {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded bg-panel-alt text-xs text-muted">
        No image
      </div>
    )
  }
  return (
    <img
      src={resolved}
      alt={alt}
      className="h-12 w-12 rounded object-cover"
      loading="lazy"
    />
  )
}

function ModalShell({
  title,
  children,
  onClose,
}: {
  title: string
  children: ReactNode
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 p-4">
      <Card className="w-full max-w-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
        {children}
      </Card>
    </div>
  )
}

function ArtistModal({
  mode,
  item,
  onClose,
  onSubmit,
  isSubmitting,
  uploadImage,
}: {
  mode: ModalMode
  item?: ArtistItem
  onClose: () => void
  onSubmit: (payload: ArtistPayload) => void
  isSubmitting: boolean
  uploadImage: (file: File) => Promise<string>
}) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const form = useForm<ArtistFormValues>({
    defaultValues: {
      name: item?.name || '',
      bio: item?.bio || '',
      imageUrl: item?.image_url || '',
      popularityScore: item?.popularity_score ?? 0,
    },
  })
  const imageUrl = form.watch('imageUrl')

  const submit = form.handleSubmit((values) => {
    const parsed = artistSchema.safeParse(values)
    if (!parsed.success) return
    const payload: ArtistPayload = {
      name: parsed.data.name,
      bio: parsed.data.bio || undefined,
      imageUrl: parsed.data.imageUrl || undefined,
      popularityScore: parsed.data.popularityScore,
    }
    onSubmit(payload)
  })

  return (
    <ModalShell title={mode === 'create' ? 'Create artist' : 'Edit artist'} onClose={onClose}>
      <form className="space-y-3" onSubmit={submit}>
        <Input placeholder="Name" {...form.register('name')} />
        <Input placeholder="Bio" {...form.register('bio')} />
        <Input placeholder="Image URL" {...form.register('imageUrl')} />
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              className="w-full rounded-md border border-border bg-panel px-3 py-2 text-sm text-white file:mr-3 file:rounded file:border-0 file:bg-panel-alt file:px-3 file:py-1 file:text-sm file:text-white"
              onChange={async (event) => {
                const file = event.target.files?.[0]
                if (!file) return
                setUploadError(null)
                setIsUploading(true)
                try {
                  const uploadedUrl = await uploadImage(file)
                  form.setValue('imageUrl', uploadedUrl, { shouldDirty: true, shouldTouch: true })
                } catch (error) {
                  setUploadError(toApiError(error).message)
                } finally {
                  setIsUploading(false)
                  event.target.value = ''
                }
              }}
            />
            {isUploading ? <span className="text-xs text-muted">Uploading...</span> : null}
          </div>
          {uploadError ? <p className="text-xs text-danger">{uploadError}</p> : null}
          {imageUrl ? <ImageThumb src={imageUrl} alt="Artist preview" /> : null}
        </div>
        <Input type="number" placeholder="Popularity 0-100" {...form.register('popularityScore', { valueAsNumber: true })} />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || isUploading}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </ModalShell>
  )
}

function AlbumModal({
  mode,
  item,
  onClose,
  onSubmit,
  isSubmitting,
  uploadImage,
}: {
  mode: ModalMode
  item?: AlbumItem
  onClose: () => void
  onSubmit: (payload: AlbumPayload) => void
  isSubmitting: boolean
  uploadImage: (file: File) => Promise<string>
}) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const form = useForm<AlbumFormValues>({
    defaultValues: {
      artistId: item?.artist_id || '',
      title: item?.title || '',
      releaseDate: item?.release_date ? String(item.release_date).slice(0, 10) : '',
      coverUrl: item?.cover_url || '',
      albumType: item?.album_type || 'album',
    },
  })
  const coverUrl = form.watch('coverUrl')

  const submit = form.handleSubmit((values) => {
    const parsed = albumSchema.safeParse(values)
    if (!parsed.success) return
    onSubmit({
      artistId: parsed.data.artistId,
      title: parsed.data.title,
      releaseDate: parsed.data.releaseDate,
      coverUrl: parsed.data.coverUrl || undefined,
      albumType: parsed.data.albumType,
    })
  })

  return (
    <ModalShell title={mode === 'create' ? 'Create album' : 'Edit album'} onClose={onClose}>
      <form className="space-y-3" onSubmit={submit}>
        <Input placeholder="Artist ID" {...form.register('artistId')} />
        <Input placeholder="Title" {...form.register('title')} />
        <Input type="date" {...form.register('releaseDate')} />
        <Input placeholder="Cover URL" {...form.register('coverUrl')} />
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              className="w-full rounded-md border border-border bg-panel px-3 py-2 text-sm text-white file:mr-3 file:rounded file:border-0 file:bg-panel-alt file:px-3 file:py-1 file:text-sm file:text-white"
              onChange={async (event) => {
                const file = event.target.files?.[0]
                if (!file) return
                setUploadError(null)
                setIsUploading(true)
                try {
                  const uploadedUrl = await uploadImage(file)
                  form.setValue('coverUrl', uploadedUrl, { shouldDirty: true, shouldTouch: true })
                } catch (error) {
                  setUploadError(toApiError(error).message)
                } finally {
                  setIsUploading(false)
                  event.target.value = ''
                }
              }}
            />
            {isUploading ? <span className="text-xs text-muted">Uploading...</span> : null}
          </div>
          {uploadError ? <p className="text-xs text-danger">{uploadError}</p> : null}
          {coverUrl ? <ImageThumb src={coverUrl} alt="Album preview" /> : null}
        </div>
        <select
          className="w-full rounded-md border border-border bg-panel px-3 py-2 text-sm text-white"
          {...form.register('albumType')}
        >
          <option value="album">album</option>
          <option value="single">single</option>
          <option value="ep">ep</option>
        </select>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || isUploading}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </ModalShell>
  )
}

function TrackModal({
  mode,
  item,
  onClose,
  onSubmit,
  isSubmitting,
  uploadImage,
}: {
  mode: ModalMode
  item?: TrackItem
  onClose: () => void
  onSubmit: (payload: TrackPayload) => void
  isSubmitting: boolean
  uploadImage: (file: File) => Promise<string>
}) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const form = useForm<TrackFormValues>({
    defaultValues: {
      artistId: item?.artist_id || '',
      albumId: item?.album_id || '',
      title: item?.title || '',
      durationMs: item?.duration_ms ?? 180000,
      releaseDate: item?.release_date ? String(item.release_date).slice(0, 10) : '',
      coverUrl: item?.cover_url || '',
      audioUrl: item?.audio_url || '',
      explicit: item?.explicit ?? false,
      popularityScore: item?.popularity_score ?? 0,
    },
  })
  const coverUrl = form.watch('coverUrl')

  const submit = form.handleSubmit((values) => {
    const parsed = trackSchema.safeParse(values)
    if (!parsed.success) return
    onSubmit({
      artistId: parsed.data.artistId,
      albumId: parsed.data.albumId || undefined,
      title: parsed.data.title,
      durationMs: parsed.data.durationMs,
      releaseDate: parsed.data.releaseDate,
      coverUrl: parsed.data.coverUrl || undefined,
      audioUrl: parsed.data.audioUrl || undefined,
      explicit: parsed.data.explicit,
      popularityScore: parsed.data.popularityScore,
    })
  })

  return (
    <ModalShell title={mode === 'create' ? 'Create track' : 'Edit track'} onClose={onClose}>
      <form className="space-y-3" onSubmit={submit}>
        <Input placeholder="Artist ID" {...form.register('artistId')} />
        <Input placeholder="Album ID (optional)" {...form.register('albumId')} />
        <Input placeholder="Title" {...form.register('title')} />
        <Input type="number" placeholder="Duration ms" {...form.register('durationMs', { valueAsNumber: true })} />
        <Input type="date" {...form.register('releaseDate')} />
        <Input placeholder="Cover URL" {...form.register('coverUrl')} />
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              className="w-full rounded-md border border-border bg-panel px-3 py-2 text-sm text-white file:mr-3 file:rounded file:border-0 file:bg-panel-alt file:px-3 file:py-1 file:text-sm file:text-white"
              onChange={async (event) => {
                const file = event.target.files?.[0]
                if (!file) return
                setUploadError(null)
                setIsUploading(true)
                try {
                  const uploadedUrl = await uploadImage(file)
                  form.setValue('coverUrl', uploadedUrl, { shouldDirty: true, shouldTouch: true })
                } catch (error) {
                  setUploadError(toApiError(error).message)
                } finally {
                  setIsUploading(false)
                  event.target.value = ''
                }
              }}
            />
            {isUploading ? <span className="text-xs text-muted">Uploading...</span> : null}
          </div>
          {uploadError ? <p className="text-xs text-danger">{uploadError}</p> : null}
          {coverUrl ? <ImageThumb src={coverUrl} alt="Track preview" /> : null}
        </div>
        <Input placeholder="Audio URL" {...form.register('audioUrl')} />
        <Input
          type="number"
          placeholder="Popularity 0-100"
          {...form.register('popularityScore', { valueAsNumber: true })}
        />
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" {...form.register('explicit')} />
          Explicit
        </label>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || isUploading}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </ModalShell>
  )
}

function ConfirmDeleteModal({
  label,
  pending,
  onClose,
  onConfirm,
}: {
  label: string
  pending: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <ModalShell title="Confirm delete" onClose={onClose}>
      <p className="text-sm text-muted">
        Delete <span className="font-semibold text-white">{label}</span>? This action cannot be undone.
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={pending}>
          {pending ? 'Deleting...' : 'Delete'}
        </Button>
      </div>
    </ModalShell>
  )
}

function formatDate(value: string | undefined) {
  if (!value) return '-'
  return new Date(value).toLocaleString()
}

function resolveImageUrl(value?: string | null) {
  if (!value) return null
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value
  }
  if (value.startsWith('/')) {
    return apiOrigin ? `${apiOrigin}${value}` : value
  }
  return value
}
