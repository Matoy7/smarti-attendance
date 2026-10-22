/**
 * סמארטי-טיים places proxy (Cloudflare Worker).
 *
 * GET /autocomplete?input=<text>&session=<uuid>
 *   → { "suggestions": [{ "id": "<placeId>", "primary": "<main text>", "secondary": "<secondary text>" }] }
 *
 * Keeps the Google Places API key server-side (Worker secret GOOGLE_PLACES_API_KEY) and only
 * answers browsers from ALLOWED_ORIGINS. Calls Places API (New) Autocomplete:
 * https://developers.google.com/maps/documentation/places/web-service/place-autocomplete
 */

const GOOGLE_AUTOCOMPLETE = 'https://places.googleapis.com/v1/places:autocomplete'
const FIELD_MASK = 'suggestions.placePrediction.placeId,suggestions.placePrediction.text.text,suggestions.placePrediction.structuredFormat'
const MAX_INPUT = 120
const MAX_RESULTS = 8
const SESSION_RE = /^[A-Za-z0-9_-]{1,36}$/ // provider limit: URL-safe, ≤ 36 chars

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const origin = request.headers.get('Origin') || ''
    const allowed = (env.ALLOWED_ORIGINS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const cors = allowed.includes(origin)
      ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' }
      : null

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: cors ? 204 : 403,
        headers: { ...cors, 'Access-Control-Allow-Methods': 'GET', 'Access-Control-Allow-Headers': 'Accept', 'Access-Control-Max-Age': '86400' },
      })
    }
    if (!cors) return json({ error: 'origin_not_allowed' }, 403)
    if (request.method !== 'GET' || url.pathname !== '/autocomplete') return json({ error: 'not_found' }, 404, cors)
    if (!env.GOOGLE_PLACES_API_KEY) return json({ error: 'not_configured' }, 500, cors)

    const input = (url.searchParams.get('input') || '').trim().slice(0, MAX_INPUT)
    if (input.length < 2) return json({ suggestions: [] }, 200, cors)
    const session = url.searchParams.get('session') || ''

    const body = {
      input,
      languageCode: env.LANGUAGE_CODE || 'he',
      regionCode: env.REGION_CODE || 'il',
    }
    const regions = (env.INCLUDED_REGION_CODES ?? 'il').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 15)
    if (regions.length) body.includedRegionCodes = regions
    if (SESSION_RE.test(session)) body.sessionToken = session

    let upstream
    try {
      upstream = await fetch(GOOGLE_AUTOCOMPLETE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': env.GOOGLE_PLACES_API_KEY, 'X-Goog-FieldMask': FIELD_MASK },
        body: JSON.stringify(body),
      })
    } catch {
      return json({ error: 'upstream_unreachable' }, 502, cors)
    }
    if (!upstream.ok) {
      // Log the provider's reason server-side only; never echo it (or the key) to the browser.
      console.error('places autocomplete failed', upstream.status, await upstream.text().catch(() => ''))
      return json({ error: 'upstream_error' }, 502, cors)
    }

    const data = await upstream.json().catch(() => ({}))
    const suggestions = (data.suggestions || [])
      .map((s) => s.placePrediction)
      .filter((p) => p && p.placeId)
      .map((p) => ({
        id: p.placeId,
        primary: p.structuredFormat?.mainText?.text || p.text?.text || '',
        secondary: p.structuredFormat?.secondaryText?.text || '',
      }))
      .filter((s) => s.primary)
      .slice(0, MAX_RESULTS)

    return json({ suggestions }, 200, cors)
  },
}

function json(payload, status, headers = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  })
}
