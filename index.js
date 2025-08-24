'use strict'

const keyValue = 'PZIGouZyjjkJFT2NuHv1I0U5vvRpCBeWqU4ksuWl'
const searchURL = 'https://developer.nps.gov/api/v1/parks'

//format query search
function formatQueryParams(params) {
  const queryItems = Object.keys(params).map(
    (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
  )
  return queryItems.join('&')
}

//display results in DOM
function displayResults(responseJson, maxResults) {
  console.log(responseJson)
  $('#results-list').empty()
  $('#js-error-message').empty()
  for (
    let i = 0;
    (i < responseJson.data.length) & (i < responseJson.limit);
    i++
  ) {
    $('#results-list').append(
      `<li><h3>${responseJson.data[i].fullName}</h3><p>${responseJson.data[i].description}</p><a href="${responseJson.data[i].url}" target="_blank">${responseJson.data[i].url}</a><address>${responseJson.data[i].addresses[1].line1}<br>${responseJson.data[i].addresses[1].city}, ${responseJson.data[i].addresses[1].stateCode} ${responseJson.data[i].addresses[1].postalCode}</address>`
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
    api_key: keyValue,
  }
  const queryString = formatQueryParams(params)
  const url = searchURL + '?' + queryString

  console.log(url)

  fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.json()
      }
      throw new Error(response.message)
    })
    .then((responseJson) => displayResults(responseJson))
    .catch((error) => {
      $('#js-error-message').text(`Something went wrong: ${error.message}`)
    })
}

//listen for submit
function watchForm() {
  $('#js-form').submit((event) => {
    event.preventDefault()
    const searchTerm = $('#js-state-park-search').val()
    const maxResults = $('#js-max-results').val()
    getNatParkList(searchTerm, maxResults)
  })
}

$(watchForm)
