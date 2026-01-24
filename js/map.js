import { getMapboxAccessToken } from './config.js';
import { fetchParkAlerts } from './api.js';
import { formatParkAlerts } from './formatters.js';
// Initialize map
let mapInstance = null;
function getMap() {
    if (mapInstance) {
        return mapInstance;
    }
    // Check if map container exists
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        throw new Error('Map container element not found');
    }
    // Ensure container has dimensions (Mapbox requires this)
    const rect = mapContainer.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
        console.warn('Map container has no dimensions, waiting for layout...');
        // Force a reflow and check again
        void mapContainer.offsetHeight;
        const rect2 = mapContainer.getBoundingClientRect();
        if (rect2.width === 0 || rect2.height === 0) {
            throw new Error('Map container has no dimensions');
        }
    }
    if (typeof mapboxgl === 'undefined') {
        throw new Error('Mapbox GL JS is not loaded');
    }
    const accessToken = getMapboxAccessToken();
    if (!accessToken) {
        throw new Error('Mapbox access token is not configured');
    }
    mapboxgl.accessToken = accessToken;
    try {
        mapInstance = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/outdoors-v11',
            center: [-95.7129, 37.0902],
            zoom: 4,
            preserveDrawingBuffer: true,
            hash: true,
        });
    }
    catch (error) {
        console.error('Error creating map:', error);
        throw error;
    }
    // Add navigation controls
    mapInstance.addControl(new mapboxgl.NavigationControl({
        showZoom: false,
        showCompass: true,
    }));
    // Handle window resize
    window.addEventListener('resize', () => {
        if (mapInstance) {
            mapInstance.resize();
        }
    });
    return mapInstance;
}
// Export map initialization function
export function initializeMapInstance() {
    return getMap();
}
// Store markers and callback for highlighting search results
let currentMarkers = [];
let highlightSearchResultCallback = null;
// Set callback for highlighting search results
export function setHighlightSearchResultCallback(callback) {
    highlightSearchResultCallback = callback;
}
// Parse coordinates from latLong string
function parseCoordinates(latLong) {
    try {
        const coords = latLong.split(', ');
        const lat = parseFloat(coords[0].split(':')[1]);
        const lng = parseFloat(coords[1].split(':')[1]);
        if (isNaN(lat) || isNaN(lng)) {
            return null;
        }
        return [lng, lat];
    }
    catch {
        return null;
    }
}
// Clear existing markers
export function clearMarkers() {
    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach((marker) => marker.remove());
    currentMarkers = [];
}
// Add park markers to map
export function addParkMarkers(parks) {
    clearMarkers();
    const mapInstance = getMap();
    parks.forEach((park, index) => {
        if (!park.latLong)
            return;
        const coords = parseCoordinates(park.latLong);
        if (!coords)
            return;
        const [lng, lat] = coords;
        // Create marker
        const marker = new mapboxgl.Marker()
            .setLngLat([lng, lat])
            .setPopup(new mapboxgl.Popup({
            maxWidth: '400px',
            className: 'custom-popup',
            anchor: 'top',
            closeButton: false,
        }).setHTML(`<h3>${park.fullName}</h3><p>loading park information...</p>`))
            .addTo(mapInstance);
        // Add click event to marker
        marker.getElement().addEventListener('click', async () => {
            if (highlightSearchResultCallback) {
                highlightSearchResultCallback(index);
            }
            // Fetch only alerts for popup
            const alerts = await fetchParkAlerts(park.parkCode);
            const parkDataHtml = formatParkAlerts(alerts);
            // Update popup content
            marker.getPopup().setHTML(`
        <h3>${park.fullName}</h3>
        ${parkDataHtml}
      `);
            // Add tab handlers to the new content
            setTimeout(() => {
                if (window.addTabHandlers) {
                    window.addTabHandlers();
                }
            }, 100);
        });
        // Store marker with index
        currentMarkers.push({ marker, index });
    });
    // Fit map to show all markers if we have any
    if (parks.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        parks.forEach((park) => {
            if (park.latLong) {
                const coords = parseCoordinates(park.latLong);
                if (coords) {
                    bounds.extend(coords);
                }
            }
        });
        const mapInstance = getMap();
        mapInstance.fitBounds(bounds, { padding: 50 });
    }
}
// Highlight marker when search result is clicked
export function highlightMarker(index) {
    // Remove previous highlights from markers
    currentMarkers.forEach(({ marker }) => {
        marker.getElement().classList.remove('highlighted-marker');
    });
    // Highlight the selected marker
    if (currentMarkers[index]) {
        currentMarkers[index].marker
            .getElement()
            .classList.add('highlighted-marker');
        // Center map on the marker
        const mapInstance = getMap();
        const coords = currentMarkers[index].marker.getLngLat();
        mapInstance.flyTo({ center: coords, zoom: Math.max(mapInstance.getZoom(), 10) });
    }
}
// Reset map to default view
export function resetMapView() {
    const mapInstance = getMap();
    mapInstance.flyTo({
        center: [-95.7129, 37.0902],
        zoom: 4,
    });
}
