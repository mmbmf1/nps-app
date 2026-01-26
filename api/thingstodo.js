// Vercel serverless function to proxy NPS things to do API
module.exports = async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { parkCode } = req.query

  if (!parkCode) {
    return res.status(400).json({ error: 'Query parameter "parkCode" is required' })
  }

  const apiKey = process.env.NPS_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'NPS API key not configured' })
  }

  try {
    const url = `https://developer.nps.gov/api/v1/thingstodo?parkCode=${parkCode}&api_key=${apiKey}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`NPS API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    console.error('Error proxying NPS things to do API:', error)
    res.status(500).json({ error: 'Failed to fetch things to do data' })
  }
}
