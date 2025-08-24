# national park service app

a simple web app to search for national parks by state using the national park service api.

## what it does

- search for national parks by entering state codes (e.g., AZ, CA, NY)
- displays park names, descriptions, websites, and addresses
- limit the number of results shown
- clean, responsive interface

## setup

1. get a free api key from [nps.gov](https://www.nps.gov/subjects/developer/get-started.htm)
2. copy `config.example.js` to `config.js`
3. replace `your_api_key_here` with your actual api key
4. open `index.html` in your browser

## usage

1. enter state codes separated by commas (e.g., `AZ,CA,TX`)
2. set max results (default: 10)
3. click search
4. browse the results

## tech

- vanilla javascript
- jquery for dom manipulation
- national park service api
- html5 & css3
