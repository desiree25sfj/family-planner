const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
const API_BASE_URL = (
  import.meta.env.PROD ? '' : configuredApiBaseUrl || 'http://localhost:5123'
).replace(/\/+$/, '')

export function getApiBaseUrl() {
  return API_BASE_URL
}

export class ApiError extends Error {
  readonly status: number
  readonly details?: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export async function apiRequest<TResponse>(
  path: string,
  options: RequestInit = {},
): Promise<TResponse> {
  const requestUrl = `${API_BASE_URL}${path}`
  let response: Response

  try {
    response = await fetch(requestUrl, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    })
  } catch (error) {
    throw new ApiError(
      `Could not reach API at ${API_BASE_URL || 'the current site'}. Check the API URL, backend deployment, and proxy settings.`,
      0,
      error,
    )
  }

  if (!response.ok) {
    const details = await readResponseBody(response)
    const message = getErrorMessage(details) ?? `API request failed: ${response.status}`

    throw new ApiError(message, response.status, details)
  }

  if (response.status === 204) {
    return undefined as TResponse
  }

  try {
    return (await response.json()) as TResponse
  } catch (error) {
    throw new ApiError(
      `API at ${API_BASE_URL || 'the current site'} returned a non-JSON response. Check the backend API and proxy settings.`,
      response.status,
      error,
    )
  }
}

async function readResponseBody(response: Response) {
  const text = await response.text()

  if (!text) {
    return undefined
  }

  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

function getErrorMessage(details: unknown) {
  if (typeof details === 'string') {
    return details
  }

  if (details && typeof details === 'object' && 'message' in details) {
    const message = (details as { message?: unknown }).message
    return typeof message === 'string' ? message : undefined
  }

  return undefined
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return error.message
  }

  return fallback
}
