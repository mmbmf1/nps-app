'use strict'

// mapbox configuration
mapboxgl.accessToken = config.MAPBOX_ACCESS_TOKEN

// initialize map
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/outdoors-v11',
  center: [-95.7129, 37.0902],
  zoom: 4,
})

// add navigation controls
map.addControl(new mapboxgl.NavigationControl())

// handle window resize
window.addEventListener('resize', () => {
  map.resize()
})

// load configuration - vercel will replace this
const API_KEY = config.NPS_API_KEY
const searchURL = 'https://developer.nps.gov/api/v1/parks'

// store markers and results for click events
let currentMarkers = []
let currentResults = []

// clear existing markers
function clearMarkers() {
  // remove all existing markers
  const markers = document.querySelectorAll('.mapboxgl-marker')
  markers.forEach((marker) => marker.remove())
  currentMarkers = []
}

// add park markers to map
function addParkMarkers(parks) {
  clearMarkers()

  parks.forEach((park, index) => {
    // use latlong field if available
    if (park.latLong) {
      // parse "lat:44.59824417, long:-110.5471695" format
      const coords = park.latLong.split(', ')
      const lat = parseFloat(coords[0].split(':')[1])
      const lng = parseFloat(coords[1].split(':')[1])

      // create marker
      const marker = new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.Popup().setHTML(
            `<h3>${park.fullName}</h3><p>loading alerts...</p>`
          )
        )
        .addTo(map)

      // add click event to marker
      marker.getElement().addEventListener('click', async () => {
        highlightSearchResult(index)

        // fetch and display alerts
        const alerts = await fetchParkAlerts(park.parkCode)
        const alertsHtml = formatAlerts(alerts)

        // update popup content
        marker.getPopup().setHTML(`
          ${alertsHtml}
        `)
      })

      // store marker with index
      currentMarkers.push({ marker, index })
    }
  })

  // fit map to show all markers if we have any
  if (parks.length > 0) {
    const bounds = new mapboxgl.LngLatBounds()
    parks.forEach((park) => {
      if (park.latLong) {
        const coords = park.latLong.split(', ')
        const lat = parseFloat(coords[0].split(':')[1])
        const lng = parseFloat(coords[1].split(':')[1])
        bounds.extend([lng, lat])
      }
    })
    map.fitBounds(bounds, { padding: 50 })
  }
}

// highlight search result when marker is clicked
function highlightSearchResult(index) {
  // remove previous highlights
  document.querySelectorAll('.search-result-item').forEach((item) => {
    item.classList.remove('highlighted')
  })

  // highlight the selected result
  const resultItems = document.querySelectorAll('.search-result-item')
  if (resultItems[index]) {
    resultItems[index].classList.add('highlighted')
    resultItems[index].scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

// highlight marker when search result is clicked
function highlightMarker(index) {
  // remove previous highlights from search results
  document.querySelectorAll('.search-result-item').forEach((item) => {
    item.classList.remove('highlighted')
  })

  // remove previous highlights from markers
  currentMarkers.forEach(({ marker }) => {
    marker.getElement().classList.remove('highlighted-marker')
  })

  // highlight the selected marker
  if (currentMarkers[index]) {
    currentMarkers[index].marker
      .getElement()
      .classList.add('highlighted-marker')

    // center map on the marker
    const coords = currentMarkers[index].marker.getLngLat()
    map.flyTo({ center: coords, zoom: Math.max(map.getZoom(), 10) })
  }

  // highlight the selected search result
  const resultItems = document.querySelectorAll('.search-result-item')
  if (resultItems[index]) {
    resultItems[index].classList.add('highlighted')
  }
}

// fetch alerts for a specific park
async function fetchParkAlerts(parkCode) {
  try {
    const response = await fetch(
      `https://developer.nps.gov/api/v1/alerts?parkCode=${parkCode}&api_key=${API_KEY}`
    )
    if (response.ok) {
      const data = await response.json()
      return data.data || []
    }
    return []
  } catch (error) {
    console.error('error fetching alerts:', error)
    return []
  }
}

// format alerts for display
function formatAlerts(alerts) {
  if (!alerts || alerts.length === 0) {
    return '<p>no current alerts</p>'
  }

  let html = `<div class="alerts-container">
    <h3>alerts (${alerts.length})</h3>`

  alerts.forEach((alert) => {
    const categoryClass = alert.category.toLowerCase().replace(/\s+/g, '-')
    html += `
      <div class="alert-item ${categoryClass}">
        <div class="alert-header" onclick="toggleAlert(this)">
          <span class="alert-category">${alert.category}</span>
          <h4 class="alert-title">${alert.title}</h4>
          <span class="alert-toggle">+</span>
        </div>
        <div class="alert-content" style="display: none;">
          <p class="alert-description">${alert.description}</p>
          <a href="${alert.url}" target="_blank" class="alert-link">view full alert</a>
        </div>
      </div>
    `
  })
  html += '</div>'
  return html
}

// toggle alert expansion
function toggleAlert(header) {
  const content = header.nextElementSibling
  const toggle = header.querySelector('.alert-toggle')

  if (content.style.display === 'none') {
    content.style.display = 'block'
    toggle.textContent = '−'
  } else {
    content.style.display = 'none'
    toggle.textContent = '+'
  }
}

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
  $('#js-form input[type="submit"]').prop('disabled', true).val('searching...')
}

// hide loading state
function hideLoading() {
  $('#js-form input[type="submit"]').prop('disabled', false).val('search')
}

// display results in dom
function displayResults(responseJson, maxResults, requestedStates) {
  $('#results-list').empty()
  $('#js-error-message').empty()

  if (!responseJson.data || responseJson.data.length === 0) {
    $('#js-error-message').text(
      'no parks found for the specified search terms. please try different search terms.'
    )
    return
  }

  // store current results
  currentResults = responseJson.data

  // add markers to map
  addParkMarkers(responseJson.data)

  for (let i = 0; i < responseJson.data.length && i < maxResults; i++) {
    const park = responseJson.data[i]
    const address =
      park.addresses && park.addresses[1] ? park.addresses[1] : null

    let addressHtml = ''
    if (address) {
      addressHtml = `<address>${address.line1}<br>${address.city}, ${address.stateCode} ${address.postalCode}</address>`
    }

    // create clickable result item
    const resultItem = $(`
      <li class="search-result-item" data-index="${i}">
        <h3>${park.fullName}</h3>
        <p>${park.description}</p>
        <a href="${park.url}" target="_blank" rel="noopener">${park.url}</a>
        ${addressHtml}
      </li>
    `)

    // add click event to result item
    resultItem.on('click', () => {
      highlightMarker(i)
    })

    $('#results-list').append(resultItem)
  }
  $('#results').removeClass('hidden')
}

// get query & response from api
function getNatParkList(query, maxResults) {
  // get selected states from dropdown
  const selectedStates = []
  $('#state-filter option:selected').each(function () {
    selectedStates.push($(this).val())
  })

  // if states are selected, use statecode parameter with search term
  if (selectedStates.length > 0) {
    // make separate api calls for each selected state
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
        // combine all results and remove duplicates
        const allParks = []
        responses.forEach((response) => {
          if (response.data) {
            allParks.push(...response.data)
          }
        })

        // sort combined results by relevance score
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
        $('#js-error-message').text(`something went wrong: ${error.message}`)
      })
      .finally(() => {
        hideLoading()
      })
  } else {
    // no states selected, use q parameter for general search
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
        $('#js-error-message').text(`something went wrong: ${error.message}`)
      })
      .finally(() => {
        hideLoading()
      })
  }
}

// populate states dropdown
function populateStatesDropdown() {
  const stateFilter = document.getElementById('state-filter')
  STATES.forEach((state) => {
    const option = document.createElement('option')
    option.value = state.value
    option.textContent = state.text
    stateFilter.appendChild(option)
  })
}

// listen for submit
function watchForm() {
  $('#js-form').submit((event) => {
    event.preventDefault()

    const searchTerm = $('#js-basic-search').val().trim()
    const maxResults = $('#js-max-results').val()

    if (!searchTerm) {
      $('#js-error-message').text('please enter a search term.')
      return
    }

    showLoading()
    getNatParkList(searchTerm, maxResults)
  })

  // clear states button
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
$(populateStatesDropdown)
