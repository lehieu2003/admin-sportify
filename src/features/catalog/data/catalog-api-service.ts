import type { AxiosInstance } from 'axios'

export type CatalogListResponse<T> = {
  items: T[]
  nextCursor: string | null
  totalApprox?: number
}

export type CatalogQueryParams = {
  query?: string
  limit?: number
  cursor?: string | null
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export type UploadedImage = {
  url: string
  path: string
  filename: string
  mimetype: string
  size: number
}

export type ArtistItem = {
  id: string
  name: string
  bio: string | null
  image_url: string | null
  popularity_score: number
  created_at: string
  updated_at: string
}

export type AlbumItem = {
  id: string
  artist_id: string
  artist_name: string
  title: string
  release_date: string
  cover_url: string | null
  album_type: 'album' | 'single' | 'ep'
  created_at: string
  updated_at: string
}

export type TrackItem = {
  id: string
  album_id: string | null
  album_title: string | null
  artist_id: string
  artist_name: string
  title: string
  duration_ms: number
  release_date: string
  cover_url: string | null
  audio_url: string | null
  explicit: boolean
  popularity_score: number
  created_at: string
  updated_at: string
}

export type ArtistPayload = {
  name: string
  bio?: string
  imageUrl?: string
  popularityScore?: number
}

export type AlbumPayload = {
  artistId: string
  title: string
  releaseDate: string
  coverUrl?: string
  albumType?: 'album' | 'single' | 'ep'
}

export type TrackPayload = {
  albumId?: string
  artistId: string
  title: string
  durationMs: number
  releaseDate: string
  coverUrl?: string
  audioUrl?: string
  explicit?: boolean
  popularityScore?: number
}

export const catalogApiService = {
  listArtists(client: AxiosInstance, params: CatalogQueryParams) {
    return client
      .get<CatalogListResponse<ArtistItem>>('/admin/artists', {
        params: {
          query: params.query || undefined,
          limit: params.limit ?? 20,
          cursor: params.cursor || undefined,
          sortBy: params.sortBy || undefined,
          sortOrder: params.sortOrder || undefined,
        },
      })
      .then((res) => res.data)
  },
  createArtist(client: AxiosInstance, payload: ArtistPayload) {
    return client.post<ArtistItem>('/admin/artists', payload).then((res) => res.data)
  },
  updateArtist(client: AxiosInstance, artistId: string, payload: Partial<ArtistPayload>) {
    return client.patch<ArtistItem>(`/admin/artists/${artistId}`, payload).then((res) => res.data)
  },
  deleteArtist(client: AxiosInstance, artistId: string) {
    return client.delete(`/admin/artists/${artistId}`).then((res) => res.data)
  },

  listAlbums(client: AxiosInstance, params: CatalogQueryParams) {
    return client
      .get<CatalogListResponse<AlbumItem>>('/admin/albums', {
        params: {
          query: params.query || undefined,
          limit: params.limit ?? 20,
          cursor: params.cursor || undefined,
          sortBy: params.sortBy || undefined,
          sortOrder: params.sortOrder || undefined,
        },
      })
      .then((res) => res.data)
  },
  createAlbum(client: AxiosInstance, payload: AlbumPayload) {
    return client.post<AlbumItem>('/admin/albums', payload).then((res) => res.data)
  },
  updateAlbum(client: AxiosInstance, albumId: string, payload: Partial<AlbumPayload>) {
    return client.patch<AlbumItem>(`/admin/albums/${albumId}`, payload).then((res) => res.data)
  },
  deleteAlbum(client: AxiosInstance, albumId: string) {
    return client.delete(`/admin/albums/${albumId}`).then((res) => res.data)
  },

  listTracks(client: AxiosInstance, params: CatalogQueryParams) {
    return client
      .get<CatalogListResponse<TrackItem>>('/admin/tracks', {
        params: {
          query: params.query || undefined,
          limit: params.limit ?? 20,
          cursor: params.cursor || undefined,
          sortBy: params.sortBy || undefined,
          sortOrder: params.sortOrder || undefined,
        },
      })
      .then((res) => res.data)
  },
  createTrack(client: AxiosInstance, payload: TrackPayload) {
    return client.post<TrackItem>('/admin/tracks', payload).then((res) => res.data)
  },
  updateTrack(client: AxiosInstance, trackId: string, payload: Partial<TrackPayload>) {
    return client.patch<TrackItem>(`/admin/tracks/${trackId}`, payload).then((res) => res.data)
  },
  deleteTrack(client: AxiosInstance, trackId: string) {
    return client.delete(`/admin/tracks/${trackId}`).then((res) => res.data)
  },
  uploadImage(client: AxiosInstance, file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return client
      .post<UploadedImage>('/admin/uploads/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => res.data)
  },
}
