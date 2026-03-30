import type { AxiosInstance } from 'axios'

export type ImportSummary = {
  message?: string
  created?: number
  updated?: number
  skipped?: number
  failed?: number
  [key: string]: unknown
}

export const spotifyImportApiService = {
  importArtist(client: AxiosInstance, spotifyArtistId: string) {
    return client
      .post<ImportSummary>('/admin/spotify/import/artist', { spotifyArtistId })
      .then((res) => res.data)
  },
  importAlbum(client: AxiosInstance, spotifyAlbumId: string) {
    return client
      .post<ImportSummary>('/admin/spotify/import/album', { spotifyAlbumId })
      .then((res) => res.data)
  },
  importBySearch(
    client: AxiosInstance,
    payload: { query: string; type?: 'artist' | 'album' | 'track'; limit?: number },
  ) {
    return client.post<ImportSummary>('/admin/spotify/import/search', payload).then((res) => res.data)
  },
  runNightlySync(client: AxiosInstance, limitPerType?: number) {
    return client
      .post<ImportSummary>('/admin/spotify/sync/nightly', limitPerType ? { limitPerType } : {})
      .then((res) => res.data)
  },
}
