# Places proxy

Server-side proxy for the location search in סמארטי-טיים. The app (a static GitHub Pages site) cannot
hold a secret, so the Google Places API key lives here as a Worker secret; the browser only knows this
proxy's public URL.

Contract: `GET /autocomplete?input=<text>&session=<uuid>` →
`{ "suggestions": [{ "id", "primary", "secondary" }] }` (max 8). Errors return `4xx/5xx` JSON without
provider details. Only origins in `ALLOWED_ORIGINS` get CORS access.

## Setup

1. **Google Cloud**: create (or pick) a project with billing enabled, enable **Places API (New)**, and
   create an API key. Restrict the key: *API restrictions* → Places API (New) only. (Application
   restrictions by referrer don't apply to server calls; keep the key secret instead.)
2. **Cloudflare**: `cd server/places-proxy`, then
   - `npx wrangler login`
   - `npx wrangler secret put GOOGLE_PLACES_API_KEY` (paste the key)
   - adjust `ALLOWED_ORIGINS` in `wrangler.toml` if the site moves, then `npx wrangler deploy`
   - note the Worker URL, e.g. `https://smarti-time-places.<account>.workers.dev`
3. **GitHub**: repo → Settings → Secrets and variables → Actions → **Variables** → add
   `PLACES_PROXY_URL` = the Worker URL. It is public, so a variable (not a secret) is correct.
   The deploy workflow passes it to the build as `VITE_PLACES_PROXY_URL`; re-run the workflow.

For local development put `VITE_PLACES_PROXY_URL=<worker url>` in `.env.local` (git-ignored).

Without the variable the app builds and runs normally; the location dialog shows that address search
is unavailable and never offers placeholder results.
