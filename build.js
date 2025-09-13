const fs = require('fs')

// Read the original index.js
let content = fs.readFileSync('js/index.js', 'utf8')

// Replace the placeholder with the environment variable
content = content.replace('%%NPS_API_KEY%%', process.env.NPS_API_KEY)
content = content.replace(
  '%%MAPBOX_ACCESS_TOKEN%%',
  process.env.MAPBOX_ACCESS_TOKEN
)

// Write the processed file
fs.writeFileSync('js/index.js', content)

// Create config.js for the fallback
const configContent = `const config = {
  NPS_API_KEY: '${process.env.NPS_API_KEY}',
  MAPBOX_ACCESS_TOKEN: '${process.env.MAPBOX_ACCESS_TOKEN}'
}`
fs.writeFileSync('js/config.js', configContent)
