import type { AxiosInstance } from 'axios'

export type ArtistItem = {
  id: string
  name: string
  bio: string | null
  image_url: string | null
  popularity_score: number
}

export type AlbumItem = {
  id: string
  artist_id: string
  artist_name: string
  title: string
  release_date: string
  cover_url: string | null
  album_type: 'album' | 'single' | 'ep'
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
  listArtists(client: AxiosInstance, query: string, limit = 50) {
    return client
      .get<ArtistItem[]>('/admin/artists', { params: { query: query || undefined, limit } })
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

  listAlbums(client: AxiosInstance, query: string, limit = 50) {
    return client
      .get<AlbumItem[]>('/admin/albums', { params: { query: query || undefined, limit } })
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

  listTracks(client: AxiosInstance, query: string, limit = 50) {
    return client
      .get<TrackItem[]>('/admin/tracks', { params: { query: query || undefined, limit } })
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
}
