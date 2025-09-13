'use strict'

// Mapbox configuration
mapboxgl.accessToken = '%%MAPBOX_ACCESS_TOKEN%%' || config.MAPBOX_ACCESS_TOKEN

// Initialize map
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/outdoors-v11',
  center: [-95.7129, 37.0902],
  zoom: 4,
})

// Add navigation controls
map.addControl(new mapboxgl.NavigationControl())

// Handle window resize
window.addEventListener('resize', () => {
  map.resize()
})

// load configuration - Vercel will replace this
const API_KEY = '%%NPS_API_KEY%%' || config.NPS_API_KEY
const searchURL = 'https://developer.nps.gov/api/v1/parks'

// format query search
function formatQueryParams(params) {
  const queryItems = Object.keys(params).map(
    (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
  )
  return queryItems.join('&')
}

// show loading state
function showLoading() {
  $('#js-error-message').empty()
  $('#results').addClass('hidden')
  $('#js-form input[type="submit"]').prop('disabled', true).val('Searching...')
}

// hide loading state
function hideLoading() {
  $('#js-form input[type="submit"]').prop('disabled', false).val('Search')
}

// display results in DOM
function displayResults(responseJson, maxResults, requestedStates) {
  $('#results-list').empty()
  $('#js-error-message').empty()

  if (!responseJson.data || responseJson.data.length === 0) {
    $('#js-error-message').text(
      'No parks found for the specified search terms. Please try different search terms.'
    )
    return
  }

  for (let i = 0; i < responseJson.data.length && i < maxResults; i++) {
    const park = responseJson.data[i]
    const address =
      park.addresses && park.addresses[1] ? park.addresses[1] : null

    let addressHtml = ''
    if (address) {
      addressHtml = `<address>${address.line1}<br>${address.city}, ${address.stateCode} ${address.postalCode}</address>`
    }

    $('#results-list').append(
      `<li><h3>${park.fullName}</h3><p>${park.description}</p><a href="${park.url}" target="_blank" rel="noopener">${park.url}</a>${addressHtml}</li>`
    )
  }
  $('#results').removeClass('hidden')
}

//  GET query & response from API
function getNatParkList(query, maxResults) {
  // Get selected states from dropdown
  const selectedStates = []
  $('#state-filter option:selected').each(function () {
    selectedStates.push($(this).val())
  })

  // If states are selected, use stateCode parameter with search term
  if (selectedStates.length > 0) {
    // Make separate API calls for each selected state
    const promises = selectedStates.map((stateCode) => {
      const params = {
        stateCode: stateCode,
        q: query,
        limit: maxResults,
        fields: 'addresses',
        sort: '-relevanceScore',
        api_key: API_KEY,
      }
      const queryString = formatQueryParams(params)
      const url = searchURL + '?' + queryString

      return fetch(url).then((response) => {
        if (response.ok) {
          return response.json()
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      })
    })

    Promise.all(promises)
      .then((responses) => {
        // Combine all results and remove duplicates
        const allParks = []
        responses.forEach((response) => {
          if (response.data) {
            allParks.push(...response.data)
          }
        })

        // Sort combined results by relevance score
        const uniqueParks = allParks
          .filter(
            (park, index, self) =>
              index === self.findIndex((p) => p.id === park.id)
          )
          .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
          .slice(0, maxResults)

        const combinedResponse = { data: uniqueParks }
        displayResults(combinedResponse, maxResults, query)
      })
      .catch((error) => {
        $('#js-error-message').text(`Something went wrong: ${error.message}`)
      })
      .finally(() => {
        hideLoading()
      })
  } else {
    // No states selected, use q parameter for general search
    const params = {
      q: query,
      limit: maxResults,
      fields: 'addresses',
      sort: '-relevanceScore',
      api_key: API_KEY,
    }

    const queryString = formatQueryParams(params)
    const url = searchURL + '?' + queryString

    fetch(url)
      .then((response) => {
        if (response.ok) {
          return response.json()
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      })
      .then((responseJson) => {
        displayResults(responseJson, maxResults, query)
      })
      .catch((error) => {
        $('#js-error-message').text(`Something went wrong: ${error.message}`)
      })
      .finally(() => {
        hideLoading()
      })
  }
}

// listen for submit
function watchForm() {
  $('#js-form').submit((event) => {
    event.preventDefault()

    const searchTerm = $('#js-basic-search').val().trim()
    const maxResults = $('#js-max-results').val()

    if (!searchTerm) {
      $('#js-error-message').text('Please enter a search term.')
      return
    }

    showLoading()
    getNatParkList(searchTerm, maxResults)
  })

  // Clear states button
  $('#clear-states').click(() => {
    $('#state-filter option:selected').prop('selected', false)
  })

  $(document).on('keydown', function (event) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault()
      $('#js-basic-search').focus()
    }
  })
}

$(watchForm)
