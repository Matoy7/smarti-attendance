/**
 * Address / place autocomplete client.
 *
 * Talks only to our own proxy (server/places-proxy), which holds the Google Places API key and
 * returns normalized suggestions. No key or provider secret is ever shipped to the browser, and
 * there is no built-in fallback data: without VITE_PLACES_PROXY_URL the search reports itself
 * as unavailable.
 */
export type PlaceSuggestion = {
  /** Provider place id */
  id: string
  /** Place name or street address, e.g. "דיזנגוף 50" */
  primary: string
  /** City / wider address, e.g. "תל אביב-יפו, ישראל" */
  secondary: string
}

export type PlacesErrorKind = 'config' | 'network' | 'server'

export class PlacesError extends Error {
  constructor(readonly kind: PlacesErrorKind) {
    super(`places:${kind}`)
  }
}

const PROXY_URL = (import.meta.env.VITE_PLACES_PROXY_URL ?? '').trim().replace(/\/+$/, '')

/** False until the proxy URL is configured at build time. */
export const placesConfigured = PROXY_URL !== ''

/** Queries shorter than this are not sent. */
export const MIN_QUERY_LENGTH = 2
const MAX_QUERY_LENGTH = 120
const MAX_RESULTS = 8

/**
 * Autocomplete session token (groups one search session for provider billing).
 * The provider accepts at most 36 URL-safe characters; a v4 UUID fits.
 */
export function newSessionToken(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const b = crypto.getRandomValues(new Uint8Array(16))
  b[6] = (b[6] & 0x0f) | 0x40
  b[8] = (b[8] & 0x3f) | 0x80
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}

function isSuggestion(v: unknown): v is PlaceSuggestion {
  if (!v || typeof v !== 'object') return false
  const s = v as Record<string, unknown>
  return typeof s.id === 'string' && s.id !== '' && typeof s.primary === 'string' && s.primary !== '' && typeof s.secondary === 'string'
}

/**
 * Suggestions for `input`. Rejects with PlacesError (config / network / server) or, when
 * `signal` aborts, with the abort error — callers ignore that one.
 */
export async function searchPlaces(input: string, opts: { signal: AbortSignal; sessionToken: string }): Promise<PlaceSuggestion[]> {
  if (!placesConfigured) throw new PlacesError('config')
  const url = new URL(`${PROXY_URL}/autocomplete`)
  url.searchParams.set('input', input.trim().slice(0, MAX_QUERY_LENGTH))
  url.searchParams.set('session', opts.sessionToken)

  let res: Response
  try {
    res = await fetch(url, { signal: opts.signal, headers: { Accept: 'application/json' } })
  } catch (error) {
    if (opts.signal.aborted) throw error
    throw new PlacesError('network')
  }
  if (!res.ok) throw new PlacesError('server')

  const data: unknown = await res.json().catch(() => null)
  const list = data && typeof data === 'object' ? (data as { suggestions?: unknown }).suggestions : null
  if (!Array.isArray(list)) throw new PlacesError('server')
  return list.filter(isSuggestion).slice(0, MAX_RESULTS)
}
