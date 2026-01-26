import { populateStatesDropdown, watchForm, setupExampleTags, restoreSearchFromURL, highlightSearchResult, parseSearchURL, } from './ui.js';
import { setHighlightSearchResultCallback, initializeMapInstance } from './map.js';
// Toggle alert expansion
window.toggleAlert = function (header) {
    const content = header.nextElementSibling;
    const toggle = header.querySelector('.alert-toggle');
    if (!content || !toggle)
        return;
    if (content.style.display === 'none') {
        content.style.display = 'block';
        toggle.textContent = '−';
    }
    else {
        content.style.display = 'none';
        toggle.textContent = '+';
    }
};
// Function to open alert URLs
window.openAlertUrl = function (url) {
    if (url && url !== '#') {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
    else {
        console.log('No valid URL provided');
    }
};
// Handle tab switching
function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach((content) => {
        ;
        content.style.display = 'none';
    });
    // Remove active class from all tabs
    document.querySelectorAll('.tab').forEach((tab) => {
        tab.classList.remove('active');
    });
    // Show selected tab content
    const tabContent = document.getElementById(`${tabName}-content`);
    if (tabContent) {
        tabContent.style.display = 'block';
    }
    // Add active class to selected tab
    const tab = document.querySelector(`[data-tab="${tabName}"]`);
    if (tab) {
        tab.classList.add('active');
    }
}
// Add click handlers to tabs
window.addTabHandlers = function () {
    document.querySelectorAll('.tab').forEach((tab) => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            if (tabName) {
                switchTab(tabName);
            }
        });
    });
};
// Initialize UI functionality (doesn't depend on map)
function initUI() {
    // Populate states dropdown
    populateStatesDropdown();
    // Watch form for submission
    watchForm();
    // Setup example tags
    setupExampleTags();
    // Restore search state from URL on page load
    restoreSearchFromURL();
    // Welcome section defaults to collapsed (set in HTML)
    // If there's a search term in URL, ensure it stays collapsed
    const urlParams = parseSearchURL();
    if (urlParams.searchTerm) {
        const welcomeContent = document.querySelector('.welcome-content');
        const toggleIcon = document.querySelector('.toggle-icon');
        if (welcomeContent) {
            welcomeContent.classList.add('collapsed');
        }
        if (toggleIcon) {
            toggleIcon.textContent = '+';
        }
    }
}
// Initialize map (separate from UI)
function initMap() {
    try {
        initializeMapInstance();
        // Set up callback for highlighting search results when markers are clicked
        setHighlightSearchResultCallback(highlightSearchResult);
    }
    catch (error) {
        console.error('Failed to initialize map:', error);
        // Show error message to user
        const errorMessage = document.getElementById('js-error-message');
        if (errorMessage) {
            errorMessage.textContent = `Map initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    }
}
// Wait for DOM to be ready and initialize UI immediately
function init() {
    // Initialize UI first (doesn't need mapboxgl)
    initUI();
    // Try to initialize map (will wait for mapboxgl if needed)
    if (typeof mapboxgl !== 'undefined') {
        // Mapbox is already loaded, initialize map
        requestAnimationFrame(() => {
            requestAnimationFrame(initMap);
        });
    }
    else {
        // Wait for mapboxgl to load
        function waitForMapbox() {
            if (typeof mapboxgl === 'undefined') {
                setTimeout(waitForMapbox, 100);
                return;
            }
            requestAnimationFrame(() => {
                requestAnimationFrame(initMap);
            });
        }
        waitForMapbox();
    }
}
// Start initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        requestAnimationFrame(() => {
            requestAnimationFrame(init);
        });
    });
}
else {
    // DOM is already ready
    requestAnimationFrame(() => {
        requestAnimationFrame(init);
    });
}
