# national park service app

search for national parks by name, activity, or location.

**[live demo](https://nps-app-xi.vercel.app/)**

## what it does

search for parks by typing anything - park names, activities like "hiking", or locations like "colorado". optionally filter by specific states.

## features

- **smart search**: find parks by name, activity, or location
- **advanced filtering**: multi-select state filtering with clear button
- **relevance sorting**: results sorted by relevance score
- **responsive design**: works on desktop and mobile
- **keyboard shortcuts**: cmd+k to focus search input
- **loading states**: visual feedback during searches
- **error handling**: specific error messages and validation

## setup

1. get a free api key from [nps.gov](https://www.nps.gov/subjects/developer/get-started.htm)
2. copy `js/config.example.js` to `js/config.js`
3. add your api key
4. open `index.html`

## usage

type what you're looking for and hit search. use the advanced filters if you want to narrow down by state.

## examples

- search "hiking" to find all parks with hiking trails
- search "yellowstone" to find yellowstone national park
- search "colorado" to find all parks in colorado
- use advanced filters to search "hiking" in specific states

## tech

vanilla js, jquery, nps api
