/**
 * One place that knows how to talk to the SplitEasy API.
 *
 * Components and hooks never call fetch directly. They receive normalized
 * data or a typed ApiError, so network details stay out of the UI layer.
 *
 * Only VITE_* variables are exposed to the browser by Vite. MONGO_URI stays
 * inside server/.env and is never referenced from this package.
 */

const DEFAULT_DEV_API_BASE_URL = 'http://localhost:5000/api'
const REQUEST_TIMEOUT_MS = 12_000

const viteEnvironment = import.meta.env ?? {}
const configuredBaseUrl =
  typeof viteEnvironment.VITE_API_BASE_URL === 'string'
    ? viteEnvironment.VITE_API_BASE_URL.trim()
    : ''
const fallbackBaseUrl = viteEnvironment.PROD ? '' : DEFAULT_DEV_API_BASE_URL

export const API_BASE_URL = (configuredBaseUrl || fallbackBaseUrl).replace(
  /\/+$/,
  '',
)

export class ApiError extends Error {
  constructor(message, { status = 0, details = [], kind = 'http' } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = Array.isArray(details) ? details : []
    this.kind = kind
  }
}

/** Field names returned by the API mapped to the names used by the forms. */
const API_FIELD_ALIASES = Object.freeze({
  paidBy: 'payerId',
})

function createAbortError() {
  const error = new Error('Request aborted.')
  error.name = 'AbortError'
  return error
}

function buildRequestUrl(path) {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * Sends one JSON request and returns the parsed response body.
 *
 * Every expected failure becomes an ApiError with a user-readable message:
 * network failure, timeout, non-2xx response, invalid JSON, or an API payload
 * that explicitly reports success: false. Unexpected failures reject and are
 * caught by the caller's action handler, so they can never unmount the app.
 */
export async function apiRequest(
  path,
  { method = 'GET', body, signal } = {},
) {
  if (!API_BASE_URL) {
    throw new ApiError(
      'VITE_API_BASE_URL is not configured. Set it to the deployed API URL and rebuild the client.',
      { kind: 'config' },
    )
  }

  const controller = new AbortController()
  const timeoutId = globalThis.setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS,
  )
  const abortFromCaller = () => controller.abort()

  if (signal) {
    if (signal.aborted) {
      globalThis.clearTimeout(timeoutId)
      throw createAbortError()
    }

    signal.addEventListener('abort', abortFromCaller, { once: true })
  }

  const headers = { Accept: 'application/json' }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  let response

  try {
    response = await fetch(buildRequestUrl(path), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    })
  } catch {
    if (signal?.aborted) {
      throw createAbortError()
    }

    if (controller.signal.aborted) {
      throw new ApiError(
        `The SplitEasy API did not respond within ${
          REQUEST_TIMEOUT_MS / 1000
        } seconds. Check that the backend is running.`,
        { kind: 'timeout' },
      )
    }

    throw new ApiError(
      `Cannot reach the SplitEasy API at ${API_BASE_URL}. Start the backend and make sure this browser origin is allowed by CORS.`,
      { kind: 'network' },
    )
  } finally {
    globalThis.clearTimeout(timeoutId)
    signal?.removeEventListener('abort', abortFromCaller)
  }

  let text

  try {
    text = await response.text()
  } catch {
    throw new ApiError('The API response could not be read.', {
      status: response.status,
      kind: 'invalid-response',
    })
  }

  let payload = null

  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = null
    }
  }

  if (!response.ok) {
    throw new ApiError(
      payload?.message ||
        `The API request failed with status ${response.status}.`,
      {
        status: response.status,
        details: payload?.errors,
        kind: 'http',
      },
    )
  }

  if (!payload || typeof payload !== 'object') {
    throw new ApiError('The API returned an unreadable response.', {
      status: response.status,
      kind: 'invalid-response',
    })
  }

  if (payload.success === false) {
    throw new ApiError(payload.message || 'The API rejected the request.', {
      status: response.status,
      details: payload.errors,
      kind: 'http',
    })
  }

  return payload
}

export function getApiErrorMessage(error, fallbackMessage) {
  if (error?.name === 'AbortError') {
    return ''
  }

  if (error instanceof ApiError) {
    const firstFieldError = error.details[0]?.message

    return firstFieldError || error.message || fallbackMessage
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallbackMessage
}

export function getApiErrorField(error) {
  const field = error?.details?.[0]?.field

  if (!field) {
    return ''
  }

  return API_FIELD_ALIASES[field] ?? field
}
