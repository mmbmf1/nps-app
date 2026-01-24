// Configuration module that reads from global config object
// The config object is injected by build.js from environment variables

declare global {
  interface Window {
    config?: {
      NPS_API_KEY: string
      MAPBOX_ACCESS_TOKEN: string
    }
  }
}

// Access config from window (set by build.js)
function getConfig() {
  if (typeof window !== 'undefined' && window.config) {
    return window.config
  }
  // Fallback for when config is not yet loaded
  return {
    NPS_API_KEY: '',
    MAPBOX_ACCESS_TOKEN: '',
  }
}

export function getAPIKey(): string {
  return getConfig().NPS_API_KEY
}

export function getMapboxAccessToken(): string {
  return getConfig().MAPBOX_ACCESS_TOKEN
}

export const SEARCH_URL = 'https://developer.nps.gov/api/v1/parks'
