import axios from 'axios'

export type ApiError = {
  message: string
  details: unknown
  code: string
  status?: number
}

const fallbackMessage = 'Request failed'

export function toApiError(error: unknown): ApiError {
  if (!axios.isAxiosError(error)) {
    return {
      message: fallbackMessage,
      details: null,
      code: 'INTERNAL_ERROR',
    }
  }

  const status = error.response?.status
  const data = error.response?.data as
    | { message?: string; details?: unknown; code?: string }
    | undefined

  return {
    message: data?.message || error.message || fallbackMessage,
    details: data?.details ?? null,
    code: data?.code || (status === 401 ? 'UNAUTHORIZED' : 'INTERNAL_ERROR'),
    status,
  }
}
