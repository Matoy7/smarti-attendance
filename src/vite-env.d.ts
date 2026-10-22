/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Base URL of the places proxy (server/places-proxy), e.g. https://smarti-places.example.workers.dev.
   * Public, not a secret: the Google API key stays on the proxy. Unset → location search shows as unavailable.
   */
  readonly VITE_PLACES_PROXY_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
