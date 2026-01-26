// Vercel serverless function to proxy NPS parks API
module.exports = async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { q, limit, stateCode, fields, sort } = req.query

  if (!q) {
    return res.status(400).json({ error: 'Query parameter "q" is required' })
  }

  const apiKey = process.env.NPS_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'NPS API key not configured' })
  }

  try {
    const params = new URLSearchParams({
      q,
      limit: limit || '5',
      fields: fields || 'addresses',
      sort: sort || '-relevanceScore',
      api_key: apiKey,
    })

    if (stateCode) {
      params.set('stateCode', stateCode)
    }

    const url = `https://developer.nps.gov/api/v1/parks?${params.toString()}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`NPS API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    console.error('Error proxying NPS API:', error)
    res.status(500).json({ error: 'Failed to fetch parks data' })
  }
}
