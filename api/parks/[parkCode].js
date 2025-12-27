import pkg from 'pg'
const { Pool } = pkg

// Initialize PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
})

const NPS_API_KEY = process.env.NPS_API_KEY
const NPS_API_URL = 'https://developer.nps.gov/api/v1'

// Fetch dynamic data from NPS API
async function fetchParkAlerts(parkCode) {
  try {
    const response = await fetch(
      `${NPS_API_URL}/alerts?parkCode=${parkCode}&api_key=${NPS_API_KEY}`
    )
    if (response.ok) {
      const data = await response.json()
      return data.data || []
    }
    return []
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return []
  }
}

async function fetchParkNews(parkCode) {
  try {
    const response = await fetch(
      `${NPS_API_URL}/newsreleases?parkCode=${parkCode}&api_key=${NPS_API_KEY}`
    )
    if (response.ok) {
      const data = await response.json()
      return data.data || []
    }
    return []
  } catch (error) {
    console.error('Error fetching news:', error)
    return []
  }
}

async function fetchParkThingsToDo(parkCode) {
  try {
    const response = await fetch(
      `${NPS_API_URL}/thingstodo?parkCode=${parkCode}&api_key=${NPS_API_KEY}`
    )
    if (response.ok) {
      const data = await response.json()
      return data.data || []
    }
    return []
  } catch (error) {
    console.error('Error fetching things to do:', error)
    return []
  }
}

async function fetchParkAmenities(parkCode) {
  try {
    const response = await fetch(
      `${NPS_API_URL}/amenities?parkCode=${parkCode}&api_key=${NPS_API_KEY}`
    )
    if (response.ok) {
      const data = await response.json()
      return data.data || []
    }
    return []
  } catch (error) {
    console.error('Error fetching amenities:', error)
    return []
  }
}

// Format park data from DB
// Note: pg library automatically parses JSONB, so no JSON.parse needed
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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { parkCode } = req.query

    if (!parkCode) {
      return res.status(400).json({ error: 'Park code is required' })
    }

    // Fetch static data from database
    const dbResult = await pool.query(
      'SELECT * FROM nps.parks WHERE park_code = $1',
      [parkCode]
    )

    let park = null

    if (dbResult.rows.length > 0) {
      park = formatParkFromDB(dbResult.rows[0])
    } else {
      // If not in DB, fallback to NPS API for basic info
      const response = await fetch(
        `${NPS_API_URL}/parks?parkCode=${parkCode}&api_key=${NPS_API_KEY}`
      )
      if (response.ok) {
        const data = await response.json()
        if (data.data && data.data.length > 0) {
          park = data.data[0]
        }
      }
    }

    if (!park) {
      return res.status(404).json({ error: 'Park not found' })
    }

    // Fetch dynamic data from NPS API
    const [alerts, news, thingsToDo, amenities] = await Promise.all([
      fetchParkAlerts(parkCode),
      fetchParkNews(parkCode),
      fetchParkThingsToDo(parkCode),
      fetchParkAmenities(parkCode),
    ])

    // Combine static and dynamic data
    return res.status(200).json({
      ...park,
      alerts,
      news,
      thingsToDo,
      amenities,
    })
  } catch (error) {
    console.error('Error fetching park details:', error)
    return res.status(500).json({
      error: 'Failed to fetch park details',
      message: error.message,
    })
  }
}
