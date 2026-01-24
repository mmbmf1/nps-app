const fs = require('fs')
const { execSync } = require('child_process')

// Compile TypeScript
console.log('Compiling TypeScript...')
try {
  execSync('npx tsc', { stdio: 'inherit' })
  console.log('TypeScript compilation complete')
} catch (error) {
  console.error('TypeScript compilation failed:', error)
  process.exit(1)
}

// Create config.js with environment variables AND exports
// This file combines the runtime config with the TypeScript exports
const configContent = `// Configuration module that reads from global config object
// The config object is injected by build.js from environment variables

const config = {
  NPS_API_KEY: '${process.env.NPS_API_KEY || ''}',
  MAPBOX_ACCESS_TOKEN: '${process.env.MAPBOX_ACCESS_TOKEN || ''}'
}
window.config = config

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

export function getAPIKey() {
  return getConfig().NPS_API_KEY
}

export function getMapboxAccessToken() {
  return getConfig().MAPBOX_ACCESS_TOKEN
}

export const SEARCH_URL = 'https://developer.nps.gov/api/v1/parks'
`
fs.writeFileSync('js/config.js', configContent)
console.log('Config file created')
