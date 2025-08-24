const fs = require('fs')

// Debug: let's see what environment variable we're getting
console.log('Environment variable NPS_API_KEY:', process.env.NPS_API_KEY)
console.log(
  'Environment variable length:',
  process.env.NPS_API_KEY ? process.env.NPS_API_KEY.length : 'undefined'
)

// Read the original index.js
let content = fs.readFileSync('js/index.js', 'utf8')

// Replace the placeholder with the environment variable
content = content.replace('%%NPS_API_KEY%%', process.env.NPS_API_KEY)

// Debug: let's see what the replacement looks like
console.log(
  'Replacement result:',
  content.includes('%%NPS_API_KEY%%')
    ? 'FAILED - placeholder still there'
    : 'SUCCESS - placeholder replaced'
)

// Write the processed file
fs.writeFileSync('js/index.js', content)

// Create config.js for the fallback
const configContent = `const config = {
  NPS_API_KEY: '${process.env.NPS_API_KEY}'
}`
fs.writeFileSync('js/config.js', configContent)

console.log('Build complete - API key injected and config.js created')
