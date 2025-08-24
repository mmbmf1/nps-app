'use strict'

// Load configuration
const API_KEY = config.NPS_API_KEY
const searchURL = 'https://developer.nps.gov/api/v1/parks'

//format query search
function formatQueryParams(params) {
  const queryItems = Object.keys(params).map(
    (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
  )
  return queryItems.join('&')
}

//show loading state
function showLoading() {
  $('#js-error-message').empty()
  $('#results').addClass('hidden')
  $('#js-form input[type="submit"]').prop('disabled', true).val('Searching...')
}

//hide loading state
function hideLoading() {
  $('#js-form input[type="submit"]').prop('disabled', false).val('Search')
}

//display results in DOM
function displayResults(responseJson, maxResults) {
  $('#results-list').empty()
  $('#js-error-message').empty()

  if (!responseJson.data || responseJson.data.length === 0) {
    $('#js-error-message').text(
      'No parks found for the specified states. Please try different state codes.'
    )
    return
  }

  for (let i = 0; i < responseJson.data.length && i < responseJson.limit; i++) {
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

//GET query & response from API
function getNatParkList(query, maxResults) {
  const params = {
    stateCode: query,
    limit: maxResults,
    fields: 'addresses',
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
    .then((responseJson) => displayResults(responseJson, maxResults))
    .catch((error) => {
      $('#js-error-message').text(`Something went wrong: ${error.message}`)
    })
    .finally(() => {
      hideLoading()
    })
}

//validate state codes
function validateStateCodes(codes) {
  const validStates = [
    'AL',
    'AK',
    'AZ',
    'AR',
    'CA',
    'CO',
    'CT',
    'DE',
    'FL',
    'GA',
    'HI',
    'ID',
    'IL',
    'IN',
    'IA',
    'KS',
    'KY',
    'LA',
    'ME',
    'MD',
    'MA',
    'MI',
    'MN',
    'MS',
    'MO',
    'MT',
    'NE',
    'NV',
    'NH',
    'NJ',
    'NM',
    'NY',
    'NC',
    'ND',
    'OH',
    'OK',
    'OR',
    'PA',
    'RI',
    'SC',
    'SD',
    'TN',
    'TX',
    'UT',
    'VT',
    'VA',
    'WA',
    'WV',
    'WI',
    'WY',
  ]
  const inputCodes = codes.split(',').map((code) => code.trim().toUpperCase())
  const invalidCodes = inputCodes.filter((code) => !validStates.includes(code))

  if (invalidCodes.length > 0) {
    return `Invalid state codes: ${invalidCodes.join(
      ', '
    )}. Please use valid 2-letter state codes.`
  }
  return null
}

//listen for submit
function watchForm() {
  $('#js-form').submit((event) => {
    event.preventDefault()
    const searchTerm = $('#js-state-park-search').val().trim()
    const maxResults = $('#js-max-results').val()

    if (!searchTerm) {
      $('#js-error-message').text('Please enter at least one state code.')
      return
    }

    const validationError = validateStateCodes(searchTerm)
    if (validationError) {
      $('#js-error-message').text(validationError)
      return
    }

    showLoading()
    getNatParkList(searchTerm, maxResults)
  })
}

$(watchForm)
