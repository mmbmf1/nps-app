# national park service app

search for national parks by name, activity, or location.

**[live demo](https://nps-app-xi.vercel.app/)**

## what it does

search for parks by typing anything - park names, activities like "hiking", or locations like "colorado". optionally filter by specific states. results appear on an interactive map with clickable markers.

## features

- **smart search**: find parks by name, activity, or location
- **interactive map**: mapbox integration with clickable park markers
- **synchronized experience**: click search results to highlight markers and vice versa
- **advanced filtering**: multi-select state filtering with clear button
- **shareable searches**: bookmark and share specific searches with url parameters
- **relevance sorting**: results sorted by relevance score
- **responsive design**: works on desktop and mobile
- **keyboard shortcuts**: cmd+k to focus search input
- **loading states**: visual feedback during searches
- **error handling**: specific error messages and validation

## setup

1. get a free api key from [nps.gov](https://www.nps.gov/subjects/developer/get-started.htm)
2. get a free mapbox token from [mapbox.com](https://www.mapbox.com/)
3. copy `js/config.example.js` to `js/config.js`
4. add your api keys
5. open `index.html`

## usage

type what you're looking for and hit search. use the advanced filters if you want to narrow down by state. click on search results to highlight markers on the map, or click markers to highlight search results.

**sharing searches**: copy the url to share specific searches with friends. the url includes your search terms, filters, and map position.

## examples

- search "hiking" to find all parks with hiking trails
- search "yellowstone" to find yellowstone national park
- search "colorado" to find all parks in colorado
- use advanced filters to search "hiking" in specific states
- **share searches**: copy url like `?q=hiking&states=CA,CO#zoom=6&center=-119.5,37.2`

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
  - park news and updates
  - events and programs
  - alerts and closures
  - amenities and facilities
  - live webcams
  - park articles and stories
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
