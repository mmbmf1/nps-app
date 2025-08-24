const fs = require('fs')

// Read the original index.js
let content = fs.readFileSync('js/index.js', 'utf8')

// Replace the placeholder with the environment variable
content = content.replace('%%VERCEL_API_KEY%%', process.env.VERCEL_API_KEY)

// Write the processed file
fs.writeFileSync('js/index.js', content)

console.log('Build complete - API key injected')
