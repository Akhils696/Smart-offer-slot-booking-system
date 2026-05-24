import axios from 'axios'

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    if (data && typeof data === 'object') {
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        return data.errors.join(' ')
      }
      if (typeof data.message === 'string') {
        return data.message
      }
    }
    return error.response?.statusText ?? fallback
  }

  return error instanceof Error ? error.message : fallback
}
