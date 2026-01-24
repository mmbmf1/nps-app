import { ParksResponse, Park, ContentType, Address } from './types.js'
import { STATES } from './constants.js'
import { searchParks, fetchParkNews, fetchParkThingsToDo, fetchParkAmenities } from './api.js'
import { formatNews, formatThingsToDo, formatAmenities } from './formatters.js'
import { addParkMarkers, highlightMarker, clearMarkers, resetMapView } from './map.js'

// Store current results
let currentResults: Park[] = []

// Populate states dropdown
export function populateStatesDropdown(): void {
  const stateFilter = document.getElementById('state-filter')
  if (!stateFilter) return

  STATES.forEach((state) => {
    const option = document.createElement('option')
    option.value = state.value
    option.textContent = state.text
    stateFilter.appendChild(option)
  })
}

// Show loading state
export function showLoading(): void {
  const errorMessage = document.getElementById('js-error-message')
  const results = document.getElementById('results')
  const submitButton = document.querySelector<HTMLInputElement>(
    '#js-form input[type="submit"]'
  )

  if (errorMessage) {
    errorMessage.textContent = ''
  }
  if (results) {
    results.classList.add('hidden')
  }
  if (submitButton) {
    submitButton.disabled = true
    submitButton.value = 'searching...'
  }
}

// Hide loading state
export function hideLoading(): void {
  const submitButton = document.querySelector<HTMLInputElement>(
    '#js-form input[type="submit"]'
  )
  if (submitButton) {
    submitButton.disabled = false
    submitButton.value = 'Search'
  }
}

// Highlight search result when marker is clicked
export function highlightSearchResult(index: number): void {
  // Remove previous highlights
  document.querySelectorAll('.search-result-item').forEach((item) => {
    item.classList.remove('highlighted')
  })

  // Highlight the selected result
  const resultItems = document.querySelectorAll('.search-result-item')
  if (resultItems[index]) {
    resultItems[index].classList.add('highlighted')
    resultItems[index].scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

// Format address HTML
function formatAddressHtml(address: Address | null): string {
  if (!address) return ''
  return `<address>${address.line1}<br>${address.city}, ${address.stateCode} ${address.postalCode}</address>`
}

// Switch park content in search results
async function switchParkContent(
  parkIndex: number,
  contentType: ContentType,
  parkCode: string
): Promise<void> {
  const contentDiv = document.getElementById(`park-${parkIndex}-${contentType}`)
  if (!contentDiv) return

  // Hide all content divs for this park
  const allContentDivs = [
    `park-${parkIndex}-overview`,
    `park-${parkIndex}-news`,
    `park-${parkIndex}-things`,
    `park-${parkIndex}-amenities`,
  ]

  allContentDivs.forEach((id) => {
    const div = document.getElementById(id)
    if (div) {
      div.classList.add('hidden')
    }
  })

  // Show the selected content
  contentDiv.classList.remove('hidden')

  if (contentType === 'overview') {
    // Overview is already loaded, just show it
    return
  }

  if (contentType === 'news') {
    const news = await fetchParkNews(parkCode)
    contentDiv.innerHTML = formatNews(news)
  } else if (contentType === 'things') {
    const thingsToDo = await fetchParkThingsToDo(parkCode)
    contentDiv.innerHTML = formatThingsToDo(thingsToDo)
  } else if (contentType === 'amenities') {
    const amenities = await fetchParkAmenities(parkCode)
    contentDiv.innerHTML = formatAmenities(amenities)
  }
}

// Display results in DOM
export function displayResults(
  responseJson: ParksResponse,
  maxResults: string
): void {
  const resultsList = document.getElementById('results-list')
  const errorMessage = document.getElementById('js-error-message')
  const results = document.getElementById('results')

  if (!resultsList || !errorMessage || !results) return

  resultsList.innerHTML = ''
  errorMessage.textContent = ''

  if (!responseJson.data || responseJson.data.length === 0) {
    errorMessage.textContent =
      'no parks found for the specified search terms. please try different search terms.'
    return
  }

  // Sort results by relevance score (highest first)
  const sortedResults = [...responseJson.data].sort((a, b) => {
    const scoreA = a.relevanceScore || 0
    const scoreB = b.relevanceScore || 0
    return scoreB - scoreA // descending order
  })

  // Limit to maxResults
  const maxResultsNum = parseInt(maxResults, 10) || 5
  const limitedResults = sortedResults.slice(0, maxResultsNum)

  // Store current results
  currentResults = limitedResults

  // Add markers to map
  addParkMarkers(limitedResults)

  limitedResults.forEach((park, i) => {
    const address =
      park.addresses && park.addresses[1] ? park.addresses[1] : null
    const addressHtml = formatAddressHtml(address)

    // Create result item
    const resultItem = document.createElement('li')
    resultItem.className = 'search-result-item'
    resultItem.setAttribute('data-index', i.toString())

    resultItem.innerHTML = `
      <div class="park-header">
        <div class="park-title-row">
          <h3>${park.fullName}</h3>
          <button class="zoom-btn" title="Zoom to park on map">📍</button>
        </div>
        <div class="park-submenu">
          <button class="submenu-btn active" data-content="overview">Overview</button>
          <button class="submenu-btn" data-content="news">News</button>
          <button class="submenu-btn" data-content="things">Things to Do</button>
          <button class="submenu-btn" data-content="amenities">Amenities</button>
        </div>
      </div>
      <div class="park-content" id="park-${i}-overview">
        <p>${park.description}</p>
        <a href="${park.url}" target="_blank" rel="noopener">${park.url}</a>
        ${addressHtml}
      </div>
      <div class="park-content hidden" id="park-${i}-news">
        <p>Loading news...</p>
      </div>
      <div class="park-content hidden" id="park-${i}-things">
        <p>Loading things to do...</p>
      </div>
      <div class="park-content hidden" id="park-${i}-amenities">
        <p>Loading amenities...</p>
      </div>
    `

    // Add zoom button click handler
    const zoomBtn = resultItem.querySelector('.zoom-btn')
    if (zoomBtn) {
      zoomBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        highlightMarker(i)
      })
    }

    // Add card click handler for zoom
    resultItem.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      // Only zoom if not clicking submenu buttons or zoom button
      if (
        !target.classList.contains('submenu-btn') &&
        !target.classList.contains('zoom-btn')
      ) {
        highlightMarker(i)
      }
    })

    // Add submenu click handlers
    const submenuBtns = resultItem.querySelectorAll('.submenu-btn')
    submenuBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        const contentType = (e.target as HTMLElement).getAttribute(
          'data-content'
        ) as ContentType
        switchParkContent(i, contentType, park.parkCode)

        // Update active button
        submenuBtns.forEach((b) => b.classList.remove('active'))
        btn.classList.add('active')
      })
    })

    resultsList.appendChild(resultItem)
  })

  results.classList.remove('hidden')
}

// Clear search and reset to initial state
export function clearSearch(): void {
  const searchInput = document.getElementById('js-basic-search') as HTMLInputElement
  const stateFilter = document.getElementById('state-filter') as HTMLSelectElement
  const maxResults = document.getElementById('js-max-results') as HTMLInputElement
  const errorMessage = document.getElementById('js-error-message')
  const results = document.getElementById('results')
  const resultsList = document.getElementById('results-list')
  const welcomeContent = document.querySelector('.welcome-content')
  const toggleIcon = document.querySelector('.toggle-icon')

  if (searchInput) searchInput.value = ''
  if (stateFilter) stateFilter.value = ''
  if (maxResults) maxResults.value = '5'
  if (errorMessage) errorMessage.textContent = ''
  if (results) results.classList.add('hidden')
  if (resultsList) resultsList.innerHTML = ''
  if (welcomeContent) welcomeContent.classList.remove('collapsed')
  if (toggleIcon) toggleIcon.textContent = '−'

  // Clear map markers
  clearMarkers()

  // Clear current results
  currentResults = []

  // Clear URL parameters
  window.history.pushState({}, '', window.location.pathname)

  // Reset map to default view
  resetMapView()
}

// Toggle welcome section
export function toggleWelcomeSection(): void {
  const welcomeContent = document.querySelector('.welcome-content')
  const toggleIcon = document.querySelector('.toggle-icon')

  if (!welcomeContent || !toggleIcon) return

  if (welcomeContent.classList.contains('collapsed')) {
    welcomeContent.classList.remove('collapsed')
    toggleIcon.textContent = '−'
  } else {
    welcomeContent.classList.add('collapsed')
    toggleIcon.textContent = '+'
  }
}

// URL parameter management
export function updateSearchURL(
  searchTerm: string,
  maxResults: string,
  selectedState: string
): void {
  const params = new URLSearchParams(window.location.search)

  if (searchTerm) {
    params.set('q', searchTerm)
  } else {
    params.delete('q')
  }

  if (maxResults && maxResults !== '5') {
    params.set('limit', maxResults)
  } else {
    params.delete('limit')
  }

  if (selectedState && selectedState !== '') {
    params.set('state', selectedState)
  } else {
    params.delete('state')
  }

  const newURL = `${window.location.pathname}?${params.toString()}`
  window.history.pushState({}, '', newURL)
}

export function parseSearchURL(): {
  searchTerm: string
  maxResults: string
  selectedState: string
} {
  const params = new URLSearchParams(window.location.search)
  return {
    searchTerm: params.get('q') || '',
    maxResults: params.get('limit') || '5',
    selectedState: params.get('state') || '',
  }
}

export function restoreSearchFromURL(): void {
  const urlParams = parseSearchURL()

  // Restore search form
  const searchInput = document.getElementById('js-basic-search') as HTMLInputElement
  const maxResults = document.getElementById('js-max-results') as HTMLInputElement
  const stateFilter = document.getElementById('state-filter') as HTMLSelectElement

  if (searchInput && urlParams.searchTerm) {
    searchInput.value = urlParams.searchTerm
  }
  if (maxResults && urlParams.maxResults) {
    maxResults.value = urlParams.maxResults
  }
  if (stateFilter && urlParams.selectedState) {
    stateFilter.value = urlParams.selectedState
  }

  // If we have a search term, perform the search
  if (urlParams.searchTerm) {
    showLoading()
    performSearch(urlParams.searchTerm, urlParams.maxResults)
  }
}

// Perform search
async function performSearch(searchTerm: string, maxResults: string): Promise<void> {
  const stateFilter = document.getElementById('state-filter') as HTMLSelectElement
  const selectedState = stateFilter ? stateFilter.value : ''

  try {
    const responseJson = await searchParks(searchTerm, maxResults, selectedState)
    displayResults(responseJson, maxResults)
  } catch (error) {
    const errorMessage = document.getElementById('js-error-message')
    if (errorMessage) {
      errorMessage.textContent = `something went wrong: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    }
  } finally {
    hideLoading()
  }
}

// Watch form for submission
export function watchForm(): void {
  const form = document.getElementById('js-form')
  if (!form) return

  form.addEventListener('submit', (event) => {
    event.preventDefault()

    const searchInput = document.getElementById('js-basic-search') as HTMLInputElement
    const maxResults = document.getElementById('js-max-results') as HTMLInputElement
    const stateFilter = document.getElementById('state-filter') as HTMLSelectElement

    const searchTerm = searchInput ? searchInput.value.trim() : ''
    const maxResultsValue = maxResults ? maxResults.value : '5'
    const selectedState = stateFilter ? stateFilter.value : ''

    if (!searchTerm) {
      const errorMessage = document.getElementById('js-error-message')
      if (errorMessage) {
        errorMessage.textContent = 'please enter a search term.'
      }
      return
    }

    // Update URL with search parameters
    updateSearchURL(searchTerm, maxResultsValue, selectedState)

    showLoading()
    performSearch(searchTerm, maxResultsValue)
  })

  // Toggle welcome section
  const toggleHelp = document.getElementById('toggle-help')
  if (toggleHelp) {
    toggleHelp.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      toggleWelcomeSection()
    })
  }

  // Clear search button
  const clearSearchBtn = document.getElementById('clear-search')
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      clearSearch()
    })
  }

  // Keyboard shortcut (Cmd/Ctrl+K)
  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault()
      const searchInput = document.getElementById('js-basic-search') as HTMLInputElement
      if (searchInput) {
        searchInput.focus()
      }
    }
  })
}

// Setup example tag clicks
export function setupExampleTags(): void {
  const exampleTags = document.querySelectorAll('.example-tag')
  exampleTags.forEach((tag) => {
    tag.addEventListener('click', () => {
      const query = tag.getAttribute('data-query')
      const searchInput = document.getElementById('js-basic-search') as HTMLInputElement
      const form = document.getElementById('js-form')
      if (query && searchInput) {
        searchInput.value = query
        if (form) {
          form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
        }
      }
    })
  })
}
