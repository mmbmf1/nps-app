const fs = require('fs')

// Read the original index.js
let content = fs.readFileSync('js/index.js', 'utf8')

// Replace the placeholder with the environment variable
content = content.replace('%%NPS_API_KEY%%', process.env.NPS_API_KEY)

// Write the processed file
fs.writeFileSync('js/index.js', content)

// Create config.js for the fallback
const configContent = `const config = {
  NPS_API_KEY: '${process.env.NPS_API_KEY}'
}`
fs.writeFileSync('js/config.js', configContent)
