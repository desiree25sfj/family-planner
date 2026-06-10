const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
const API_BASE_URL = (
  configuredApiBaseUrl || (import.meta.env.PROD ? '' : 'http://localhost:5123')
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
  if (!API_BASE_URL) {
    throw new ApiError(
      'Missing VITE_API_BASE_URL. Set it in Vercel to your Railway API URL, then redeploy the frontend.',
      0,
    )
  }

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
      `Could not reach API at ${API_BASE_URL}. Check the Vercel API URL, Railway backend URL, and CORS settings.`,
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
      `API at ${API_BASE_URL} returned a non-JSON response. Check that VITE_API_BASE_URL points to the backend API, not the Vercel frontend.`,
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
