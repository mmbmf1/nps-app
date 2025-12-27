import pkg from 'pg'
const { Pool } = pkg
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Will be initialized in syncParks function
let generateEmbedding

// Initialize PostgreSQL connection
const pool = new Pool({
  connectionString:
    process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING,
})

const NPS_API_KEY = process.env.NPS_API_KEY
const NPS_API_URL = 'https://developer.nps.gov/api/v1/parks'

// Fetch all parks from NPS API with pagination
async function fetchAllParks() {
  const allParks = []
  let start = 0
  const limit = 50
  let hasMore = true

  console.log('Fetching parks from NPS API...')

  while (hasMore) {
    const url = `${NPS_API_URL}?limit=${limit}&start=${start}&api_key=${NPS_API_KEY}`

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      const parks = data.data || []

      if (parks.length === 0) {
        hasMore = false
      } else {
        allParks.push(...parks)
        start += limit
        console.log(`Fetched ${allParks.length} parks so far...`)

        // Check if we've reached the total
        if (allParks.length >= (data.total || 0)) {
          hasMore = false
        }
      }
    } catch (error) {
      console.error(`Error fetching parks (start=${start}):`, error.message)
      hasMore = false
    }
  }

  console.log(`Total parks fetched: ${allParks.length}`)
  return allParks
}

// Generate embedding text from park data
function createEmbeddingText(park) {
  const parts = [
    park.fullName || '',
    park.description || '',
    park.activities?.map((a) => a.name).join(' ') || '',
    park.topics?.map((t) => t.name).join(' ') || '',
  ]
  return parts
    .filter((p) => p.trim().length > 0)
    .join(' ')
    .trim()
}

// Check if park already has an embedding
async function parkHasEmbedding(parkCode) {
  const result = await pool.query(
    'SELECT embedding FROM nps.parks WHERE park_code = $1 AND embedding IS NOT NULL',
    [parkCode]
  )
  return result.rows.length > 0
}

// Sync a single park
async function syncPark(park, index, total) {
  try {
    // Create embedding text
    const embeddingText = createEmbeddingText(park)

    if (!embeddingText) {
      console.warn(`Skipping park ${park.parkCode}: no text for embedding`)
      return 'skipped'
    }

    // Generate embedding (no console log here - batch processing handles progress)
    const embedding = await generateEmbedding(embeddingText)

    // Parse lat/long if available
    let latLong = null
    if (park.latLong) {
      latLong = park.latLong
    }

    // Upsert park data
    await pool.query(
      `INSERT INTO nps.parks (
        id, park_code, full_name, description, url, states,
        lat_long, relevance_score, addresses, activities,
        topics, amenities, embedding, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      ON CONFLICT (park_code) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        description = EXCLUDED.description,
        url = EXCLUDED.url,
        states = EXCLUDED.states,
        lat_long = EXCLUDED.lat_long,
        relevance_score = EXCLUDED.relevance_score,
        addresses = EXCLUDED.addresses,
        activities = EXCLUDED.activities,
        topics = EXCLUDED.topics,
        amenities = EXCLUDED.amenities,
        embedding = EXCLUDED.embedding,
        updated_at = NOW()`,
      [
        park.id,
        park.parkCode,
        park.fullName,
        park.description || null,
        park.url || null,
        Array.isArray(park.states)
          ? park.states
          : park.states
          ? [park.states]
          : [],
        latLong,
        park.relevanceScore || 0,
        JSON.stringify(park.addresses || []),
        JSON.stringify(park.activities || []),
        JSON.stringify(park.topics || []),
        JSON.stringify(park.amenities || []),
        JSON.stringify(embedding), // pgvector expects array format
      ]
    )

    return 'synced'
  } catch (error) {
    console.error(`✗ Error syncing park ${park.parkCode}:`, error.message)
    return 'error'
  }
}

// Main sync function
async function syncParks() {
  try {
    console.log('Starting park sync...\n')

    // Import embeddings module (ES module) - must be done first
    console.log(
      'Loading embeddings module (this may take a moment on first run)...\n'
    )
    const embeddingsModule = await import('simple-embeddings')
    generateEmbedding = embeddingsModule.generateEmbedding
    console.log('✓ Embeddings module loaded\n')

    // Test database connection
    await pool.query('SELECT 1')
    console.log('✓ Database connection successful\n')

    // Fetch all parks
    const parks = await fetchAllParks()

    if (parks.length === 0) {
      console.log('No parks found. Exiting.')
      process.exit(0)
    }

    // Check how many already have embeddings
    const existingCount = await pool.query(
      'SELECT COUNT(*) FROM nps.parks WHERE embedding IS NOT NULL'
    )
    const existing = parseInt(existingCount.rows[0].count, 10)
    console.log(
      `\nFound ${existing} parks with existing embeddings (will skip those)\n`
    )

    // Filter parks that need syncing
    const parksToSync = []
    for (const park of parks) {
      const hasEmbedding = await parkHasEmbedding(park.parkCode)
      if (!hasEmbedding) {
        parksToSync.push(park)
      }
    }

    const skipped = parks.length - parksToSync.length
    console.log(
      `\n${parksToSync.length} parks need syncing, ${skipped} already have embeddings\n`
    )

    if (parksToSync.length === 0) {
      console.log('✓ All parks already synced!')
      return
    }

    // Process parks in parallel batches for speed
    const BATCH_SIZE = 5 // Process 5 embeddings in parallel
    let synced = 0
    let errors = 0

    console.log(
      `Syncing ${parksToSync.length} parks in batches of ${BATCH_SIZE}...\n`
    )

    for (let i = 0; i < parksToSync.length; i += BATCH_SIZE) {
      const batch = parksToSync.slice(i, i + BATCH_SIZE)
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1
      const totalBatches = Math.ceil(parksToSync.length / BATCH_SIZE)

      console.log(
        `Processing batch ${batchNumber}/${totalBatches} (${batch.length} parks)...`
      )

      // Process batch in parallel
      const results = await Promise.allSettled(
        batch.map((park, batchIndex) =>
          syncPark(park, i + batchIndex, parksToSync.length)
        )
      )

      // Count results
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          if (result.value === 'synced') {
            synced++
          } else if (result.value === 'error') {
            errors++
          }
        } else {
          errors++
          console.error('Batch error:', result.reason)
        }
      })

      console.log(
        `Batch ${batchNumber} complete: ${synced} synced so far, ${errors} errors\n`
      )
    }

    console.log(
      `\n✓ Sync complete! ${synced} parks synced, ${skipped} skipped (already had embeddings), ${errors} errors.`
    )
  } catch (error) {
    console.error('Sync error:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

// Run sync
syncParks()
