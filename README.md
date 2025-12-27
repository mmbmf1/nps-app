# national park service app

search for national parks by name, activity, or location.

**[live demo](https://nps-app-xi.vercel.app/)**

## what it does

search for parks by typing anything - park names, activities like "hiking", or locations like "colorado". optionally filter by specific states. results appear on an interactive map with clickable markers. explore comprehensive park data including alerts, news, things to do, and amenities.

## features

- **smart search**: find parks by name, activity, or location
- **interactive map**: mapbox integration with clickable park markers
- **comprehensive park data**: alerts, news, things to do, and amenities
- **synchronized experience**: click search results to highlight markers on the map, or click map markers to highlight search results. two-way synchronization keeps everything in sync.
- **advanced filtering**: multi-select state filtering with clear button
- **shareable searches**: bookmark and share specific searches with url parameters
- **relevance sorting**: results sorted by relevance score
- **responsive design**: works on desktop and mobile
- **keyboard shortcuts**: cmd+k (mac) or ctrl+k (windows/linux) to focus search input
- **loading states**: visual feedback during searches
- **error handling**: specific error messages and validation
- **expandable alerts**: click alert headers in map popups to expand/collapse details
- **park submenus**: switch between overview, news, things to do, and amenities for each park

## project structure

```
nps-app/
├── index.html          # main html file
├── js/
│   ├── index.js        # main application logic
│   ├── config.js       # api keys (gitignored, created from config.example.js)
│   └── config.example.js  # template for config.js
├── css/
│   └── main.css        # styles
├── constants.js        # state list and other constants
├── build.js           # build script for deployment
└── package.json       # project metadata
```

## setup

### prerequisites

- a web browser with webgl support
- a free nps api key from [nps.gov](https://www.nps.gov/subjects/developer/get-started.htm)
- a free mapbox access token from [mapbox.com](https://www.mapbox.com/)

### local development

1. get a free api key from [nps.gov](https://www.nps.gov/subjects/developer/get-started.htm)
2. get a free mapbox token from [mapbox.com](https://www.mapbox.com/)
3. copy `js/config.example.js` to `js/config.js`
4. add your api keys to `js/config.js`:
   ```javascript
   const config = {
     NPS_API_KEY: 'your_nps_api_key_here',
     MAPBOX_ACCESS_TOKEN: 'your_mapbox_token_here',
   }
   ```
5. open `index.html` in a web browser

### running with a local server

for better development experience, use a local server:

```bash
# using python
python -m http.server 8000

# using node.js
npx serve

# using php
php -S localhost:8000
```

then open `http://localhost:8000` in your browser.

### production/deployment

for production deployments (e.g., vercel), set these environment variables:

- `NPS_API_KEY` - your nps api key
- `MAPBOX_ACCESS_TOKEN` - your mapbox access token

the `build.js` script will automatically create `config.js` from these environment variables:

```bash
npm run build
```

## usage

### basic search

type what you're looking for and hit search. the app searches park names, descriptions, activities, and locations.

### advanced filters

use the "advanced filters" section to:

- set maximum number of results (default: 25, max: 100)
- filter by one or more states using the multi-select dropdown
- clear state filters with the "clear states" button

### exploring park data

click on search result cards to explore detailed information:

- **overview**: park description, website, and address
- **news**: recent news releases and updates
- **things to do**: activities, seasonal information, and accessibility details
- **amenities**: facilities and services available at the park

use the submenu buttons to switch between different types of information.

### map interaction

- **click search results**: highlights the corresponding marker on the map and centers the view
- **click map markers**: highlights the corresponding search result and opens a popup with park alerts
- **map popups**: click alert headers to expand/collapse details, or click "view full alert" to open the official nps page

### sharing searches

copy the url to share specific searches with friends. the url includes:

- your search terms (`q` parameter)
- selected state filters (`states` parameter)
- maximum results (`limit` parameter)
- map position and zoom level (stored in url hash by mapbox)

**example url:**

```
?q=hiking&limit=10&states=CA,CO#zoom=6&center=-119.5,37.2
```

## url parameters

the app supports shareable urls with encoded search state:

- `q` - search query term
- `limit` - maximum number of results (default: 25)
- `states` - comma-separated list of state codes (e.g., `CA,CO,NY`)
- map position is stored in the url hash (handled automatically by mapbox)

**examples:**

- `?q=yellowstone` - search for yellowstone
- `?q=hiking&states=CA,CO` - search for hiking in california and colorado
- `?q=colorado&limit=50` - search for colorado parks, show up to 50 results

## examples

- search "hiking" to find all parks with hiking trails
- search "yellowstone" to find yellowstone national park
- search "colorado" to find all parks in colorado
- use advanced filters to search "hiking" in specific states
- **explore park details**: click "things to do" to see activities, "news" for recent updates
- **share searches**: copy url like `?q=hiking&states=CA,CO#zoom=6&center=-119.5,37.2`

## keyboard shortcuts

- `cmd+k` (mac) or `ctrl+k` (windows/linux) - focus search input

## api endpoints

the app uses the following nps api endpoints:

- `GET /parks` - search parks by query, state, etc.
- `GET /alerts` - get park alerts and closures
- `GET /newsreleases` - get park news releases
- `GET /thingstodo` - get activities and things to do
- `GET /amenities` - get park amenities and facilities

## dependencies

- **jquery 3.3.1** - dom manipulation and event handling
- **mapbox gl js v2.15.0** - interactive map rendering
- **national park service api** - park data
- **mapbox api** - map tiles and geocoding

## browser support

- modern browsers with es6+ support
- mapbox gl js requires webgl support
- tested on chrome, firefox, safari, and edge

## troubleshooting

### map not displaying

- verify your mapbox access token is correct in `js/config.js`
- check browser console for errors
- ensure webgl is enabled in your browser
- try a different browser if issues persist

### no search results

- verify your nps api key is correct in `js/config.js`
- check the api key hasn't exceeded rate limits
- try a different search term
- check browser console for api errors

### markers not appearing

- ensure parks have valid coordinates in the api response
- check browser console for javascript errors
- verify mapbox token is valid and has proper permissions

### config.js not found

- make sure you've copied `js/config.example.js` to `js/config.js`
- verify the file exists and contains both api keys
- check file permissions

## tech

vanilla js, jquery, nps api, mapbox

---

# development roadmap

## phase 1: core functionality ✅ complete

- enhanced search with basic + advanced filtering
- better error handling and user feedback
- performance optimization

## phase 2: user experience polish ✅ complete

- **map integration with mapbox**
  - map-focused layout with search panel
  - park pins with click interactions
  - search results sync with map view
- responsive design improvements

## phase 3: smart features 🔮 current

- **comprehensive nps api integration**
  - park news and updates ✅ complete
  - events and programs ✅ complete
  - alerts and closures ✅ complete
  - amenities and facilities ✅ complete
  - park boundaries and shapes
- **dynamic hashtag suggestions**
  - analyze search results to generate relevant hashtags
  - show clickable filtering options based on actual results
  - contextual filtering that adapts to your search
- **url parameters for sharing** ✅ complete
  - encode search terms, filters, and map state in url
  - make searches bookmarkable and shareable
  - restore state from url on page load
- search suggestions and autocomplete
- park details modal/page
- search history and favorites

## phase 4: polish & optimization 🔧 future

- **code cleanup & simplification**
  - consolidate and organize css (currently 895+ lines)
  - remove unused styles and duplicate code
  - optimize javascript function organization
  - add inline documentation and comments
- better styling (outdoor minimalist design)
- pagination for large result sets
- performance optimizations
- advanced responsive design

## phase 5: advanced features 🔮 future

- **contextual map layers**
  - fishing spots, water bodies, access points
  - trail difficulty, elevation contours, trailheads
  - wildlife viewing areas, migration routes
  - scenic overlooks, photography spots
- **smart map intelligence** - adapts layers based on search intent

## vision

transform from simple search tool to comprehensive park discovery platform with interactive maps and rich, multi-endpoint data integration.
