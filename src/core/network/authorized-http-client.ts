import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { env } from '../config/env'

type AuthHandlers = {
  getAccessToken: () => string | null
  refreshAccessToken: () => Promise<string | null>
  onUnauthorized: () => void
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

export function createAuthorizedHttpClient(handlers: AuthHandlers): AxiosInstance {
  const client = axios.create({
    baseURL: env.apiBaseUrl,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  let refreshPromise: Promise<string | null> | null = null

  client.interceptors.request.use((config) => {
    const token = handlers.getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const status = error.response?.status
      const requestConfig = error.config as RetriableConfig | undefined

      if (status !== 401 || !requestConfig || requestConfig._retry) {
        return Promise.reject(error)
      }

      requestConfig._retry = true

      if (!refreshPromise) {
        refreshPromise = handlers.refreshAccessToken().finally(() => {
          refreshPromise = null
        })
      }

      const nextToken = await refreshPromise
      if (!nextToken) {
        handlers.onUnauthorized()
        return Promise.reject(error)
      }

      requestConfig.headers = requestConfig.headers || {}
      requestConfig.headers.Authorization = `Bearer ${nextToken}`
      return client(requestConfig)
    },
  )

  return client
}
