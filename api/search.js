import pkg from 'pg'
const { Pool } = pkg

// Initialize PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
})

// Lazy load embeddings
let generateEmbedding = null
async function getGenerateEmbedding() {
  if (!generateEmbedding) {
    const { generateEmbedding: fn } = await import('simple-embeddings')
    generateEmbedding = fn
  }
  return generateEmbedding
}

// Fallback to NPS API if database query fails
async function searchNPSAPI(query, limit, state) {
  const params = new URLSearchParams({
    q: query,
    limit: limit.toString(),
    fields: 'addresses',
    sort: '-relevanceScore',
    api_key: process.env.NPS_API_KEY,
  })

  if (state) {
    params.set('stateCode', state)
  }

  const url = `https://developer.nps.gov/api/v1/parks?${params.toString()}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`NPS API error: ${response.status}`)
  }

  const data = await response.json()
  return data.data || []
}

// Format park data from DB to match NPS API response format
function formatParkFromDB(row) {
  return {
    id: row.id,
    parkCode: row.park_code,
    fullName: row.full_name,
    description: row.description,
    url: row.url,
    states: row.states || [],
    latLong: row.lat_long,
    relevanceScore: row.relevance_score || 0,
    addresses: row.addresses || [],
    activities: row.activities || [],
    topics: row.topics || [],
    amenities: row.amenities || [],
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { query, limit = 5, state = null } = req.body

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ error: 'Query is required' })
    }

    // Try semantic search first
    try {
      const generateEmbeddingFn = await getGenerateEmbedding()
      const queryEmbedding = await generateEmbeddingFn(query.trim())

      let sql = `
        SELECT 
          id, park_code, full_name, description, url, states,
          lat_long, relevance_score, addresses, activities,
          topics, amenities,
          1 - (embedding <=> $1::vector) as similarity
        FROM nps.parks
        WHERE embedding IS NOT NULL
      `
      const params = [JSON.stringify(queryEmbedding)]
      let paramIndex = 2

      if (state && state.trim() !== '') {
        sql += ` AND $${paramIndex} = ANY(states)`
        params.push(state.trim())
        paramIndex++
      }

      sql += `
        ORDER BY embedding <=> $1::vector
        LIMIT $${paramIndex}
      `
      params.push(parseInt(limit, 10))

      const result = await pool.query(sql, params)
      const parks = result.rows.map(formatParkFromDB)

      return res.status(200).json({
        data: parks,
        total: parks.length,
      })
    } catch (semanticError) {
      // Fall back to NPS API if semantic search fails
      console.error(
        'Semantic search failed, using NPS API:',
        semanticError.message
      )
      const parks = await searchNPSAPI(query, limit, state)
      return res.status(200).json({
        data: parks,
        total: parks.length,
        fallback: true,
      })
    }
  } catch (error) {
    console.error('Search error:', error)
    return res.status(500).json({
      error: 'Search failed',
      message: error.message,
    })
  }
}
