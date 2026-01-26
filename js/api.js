// Helper function to validate and parse API responses
async function fetchWithValidation(url, validator) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        if (!validator(data)) {
            throw new Error('Invalid response format');
        }
        return data;
    }
    catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}
// Type guards for API responses
function isParksResponse(data) {
    return (typeof data === 'object' &&
        data !== null &&
        'data' in data &&
        Array.isArray(data.data));
}
function isAlertsResponse(data) {
    return (typeof data === 'object' &&
        data !== null &&
        'data' in data &&
        Array.isArray(data.data));
}
function isNewsResponse(data) {
    return (typeof data === 'object' &&
        data !== null &&
        'data' in data &&
        Array.isArray(data.data));
}
function isThingsToDoResponse(data) {
    return (typeof data === 'object' &&
        data !== null &&
        'data' in data &&
        Array.isArray(data.data));
}
function isAmenitiesResponse(data) {
    return (typeof data === 'object' &&
        data !== null &&
        'data' in data &&
        Array.isArray(data.data));
}
// Search parks with query and optional state filter
export async function searchParks(query, maxResults, stateCode) {
    const params = new URLSearchParams({
        q: query,
        limit: maxResults,
        fields: 'addresses',
        sort: '-relevanceScore',
    });
    if (stateCode && stateCode !== '') {
        params.set('stateCode', stateCode);
    }
    const url = `/api/parks?${params.toString()}`;
    return fetchWithValidation(url, isParksResponse);
}
// Fetch alerts for a specific park
export async function fetchParkAlerts(parkCode) {
    try {
        const url = `/api/alerts?parkCode=${parkCode}`;
        const response = await fetchWithValidation(url, isAlertsResponse);
        return response.data || [];
    }
    catch (error) {
        console.error('Error fetching alerts:', error);
        return [];
    }
}
// Fetch news releases for a specific park
export async function fetchParkNews(parkCode) {
    try {
        const url = `/api/news?parkCode=${parkCode}`;
        const response = await fetchWithValidation(url, isNewsResponse);
        return response.data || [];
    }
    catch (error) {
        console.error('Error fetching news releases:', error);
        return [];
    }
}
// Fetch things to do for a specific park
export async function fetchParkThingsToDo(parkCode) {
    try {
        const url = `/api/thingstodo?parkCode=${parkCode}`;
        const response = await fetchWithValidation(url, isThingsToDoResponse);
        return response.data || [];
    }
    catch (error) {
        console.error('Error fetching things to do:', error);
        return [];
    }
}
// Fetch amenities for a specific park
export async function fetchParkAmenities(parkCode) {
    try {
        const url = `/api/amenities?parkCode=${parkCode}`;
        const response = await fetchWithValidation(url, isAmenitiesResponse);
        return response.data || [];
    }
    catch (error) {
        console.error('Error fetching amenities:', error);
        return [];
    }
}
