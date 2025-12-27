# National Park Service App

Search for national parks by name, activity, or location with semantic search powered by vector embeddings.

**[Live Demo](https://nps-app-xi.vercel.app/)**

## Features

- **Semantic Search**: Intelligent meaning-based search using vector embeddings
- **Interactive Map**: Mapbox integration with clickable park markers
- **Park Data**: Alerts, news, things to do, and amenities
- **State Filtering**: Filter results by state
- **Shareable URLs**: Bookmark and share specific searches
- **Responsive Design**: Works on desktop and mobile

## Quick Start

### Local Development

1. Get API keys:
   - [NPS API key](https://www.nps.gov/subjects/developer/get-started.htm)
   - [Mapbox token](https://www.mapbox.com/)

2. Copy `js/config.example.js` to `js/config.js` and add your keys

3. Open `index.html` in a browser (or use a local server: `npx serve`)

### Database Setup (for Semantic Search)

1. **Create Vercel Postgres database** via Vercel dashboard → Storage

2. **Enable pgvector extension** in Vercel SQL Editor:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

3. **Create schema** - run `schema.sql` in Vercel SQL Editor (creates `nps.parks` table)

4. **Sync parks data**:
   ```bash
   vercel env pull .env.local
   npm run sync
   ```

The sync script processes parks in parallel batches and can be resumed if interrupted.

### Production Deployment

Set these environment variables in Vercel:
- `NPS_API_KEY`
- `MAPBOX_ACCESS_TOKEN`
- `POSTGRES_URL` (auto-provided by Vercel Postgres)

Run `npm run build` before deploying.

## Project Structure

```
nps-app/
├── index.html          # Main HTML
├── api/
│   ├── search.js       # Semantic search endpoint
│   └── parks/[parkCode].js  # Park details endpoint
├── scripts/
│   └── sync-parks.js   # Database sync script
├── js/
│   ├── index.js        # Main app logic
│   └── config.js       # API keys (gitignored)
├── css/main.css        # Styles
├── schema.sql          # Database schema
└── package.json
```

## Usage

- **Search**: Type anything - park names, activities, or locations
- **Filter**: Use state dropdown and max results input
- **Explore**: Click park cards to see details (overview, news, things to do, amenities)
- **Map**: Click markers or results to sync views
- **Share**: Copy URL to share searches (`?q=hiking&state=CA&limit=5`)

## Tech Stack

Vanilla JS, jQuery, NPS API, Mapbox, Vercel Postgres, pgvector, semantic search (embeddings)

## Troubleshooting

- **No map**: Check Mapbox token in `js/config.js`
- **No results**: Verify NPS API key, check browser console
- **Sync fails**: Ensure `POSTGRES_URL` in `.env.local`, verify pgvector extension enabled
