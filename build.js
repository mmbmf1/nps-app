import fs from 'fs'

// create config.js with environment variables
const configContent = `const config = {
  NPS_API_KEY: '${process.env.NPS_API_KEY}',
  MAPBOX_ACCESS_TOKEN: '${process.env.MAPBOX_ACCESS_TOKEN}'
}`
fs.writeFileSync('js/config.js', configContent)
