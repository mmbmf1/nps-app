// Escape HTML to prevent XSS attacks
function escapeHtml(text) {
    if (!text)
        return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
// Check if text contains HTML tags
function containsHtml(text) {
    if (!text)
        return false;
    return /<[a-z][\s\S]*>/i.test(text);
}
// Sanitize HTML by allowing only safe tags
function sanitizeHtml(html) {
    if (!html)
        return '';
    // Create a temporary div to parse HTML
    const div = document.createElement('div');
    div.innerHTML = html;
    // Remove script tags and event handlers
    const scripts = div.querySelectorAll('script');
    scripts.forEach(script => script.remove());
    // Remove event handlers from all elements
    const allElements = div.querySelectorAll('*');
    allElements.forEach(el => {
        Array.from(el.attributes).forEach(attr => {
            if (attr.name.startsWith('on')) {
                el.removeAttribute(attr.name);
            }
        });
    });
    return div.innerHTML;
}
// Format park alerts for display
export function formatParkAlerts(alerts) {
    let html = `<div class="alerts-container">
      <div class="alerts-list">`;
    if (!alerts || alerts.length === 0) {
        html += '<p>no current alerts</p>';
    }
    else {
        // Sort alerts by priority
        const sortedAlerts = [...alerts].sort((a, b) => {
            const priorityOrder = {
                Danger: 1,
                'Park Closure': 2,
                Caution: 3,
                Information: 4,
            };
            return ((priorityOrder[a.category] || 5) - (priorityOrder[b.category] || 5));
        });
        sortedAlerts.forEach((alert) => {
            const categoryClass = alert.category.toLowerCase().replace(/\s+/g, '-');
            const url = alert.url || '';
            const title = alert.title || '';
            const description = alert.description || '';
            const category = alert.category || '';
            // If content contains HTML, sanitize it; otherwise escape it
            const safeUrl = escapeHtml(url);
            const safeTitle = containsHtml(title) ? sanitizeHtml(title) : escapeHtml(title);
            const safeDescription = containsHtml(description) ? sanitizeHtml(description) : escapeHtml(description);
            const safeCategory = escapeHtml(category);
            // Only show view full alert button if there's a URL
            const viewFullAlertButton = url
                ? `<button class="alert-link" onclick="openAlertUrl('${safeUrl}')">view full alert</button>`
                : '';
            html += `
        <div class="alert-item ${categoryClass}">
          <div class="alert-header" onclick="toggleAlert(this)">
            <span class="alert-category">${safeCategory}</span>
            <h4 class="alert-title">${safeTitle}</h4>
            <span class="alert-toggle">+</span>
          </div>
          <div class="alert-content" style="display: none;">
            <p class="alert-description">${safeDescription}</p>
            ${viewFullAlertButton}
          </div>
        </div>
      `;
        });
    }
    html += `</div>
  </div>`;
    return html;
}
// Format news releases for display
export function formatNews(news) {
    if (!news || news.length === 0) {
        return '<p>no current news</p>';
    }
    // Sort news by date (most recent first)
    const sortedNews = [...news].sort((a, b) => {
        const dateA = new Date(a.releaseDate || a.date || 0).getTime();
        const dateB = new Date(b.releaseDate || b.date || 0).getTime();
        return dateB - dateA; // most recent first
    });
    let html = '';
    sortedNews.forEach((newsItem) => {
        const title = newsItem.title || '';
        const description = newsItem.abstract || newsItem.title || 'No description available';
        const url = newsItem.url || '';
        const releaseDate = newsItem.releaseDate || newsItem.date;
        // If content contains HTML, sanitize it; otherwise escape it
        const safeTitle = containsHtml(title) ? sanitizeHtml(title) : escapeHtml(title);
        const safeDescription = containsHtml(description) ? sanitizeHtml(description) : escapeHtml(description);
        const safeUrl = escapeHtml(url);
        html += `
      <div class="alert-item information">
        <div class="alert-header">
          <span class="alert-category">News</span>
          <h4 class="alert-title">${safeTitle}</h4>
        </div>
        <div class="alert-content">
          <p class="alert-description">${safeDescription}</p>
          ${releaseDate
            ? `<p class="news-date"><strong>Published:</strong> ${new Date(releaseDate).toLocaleDateString()}</p>`
            : ''}
          ${url
            ? `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="alert-link">read full article</a>`
            : ''}
        </div>
      </div>
    `;
    });
    return html;
}
// Format things to do for display
export function formatThingsToDo(thingsToDo) {
    if (!thingsToDo || thingsToDo.length === 0) {
        return '<p>no things to do listed</p>';
    }
    let html = '<div class="things-list">';
    thingsToDo.forEach((thing) => {
        const title = thing.title || '';
        const shortDesc = thing.shortDescription || 'No description available';
        const longDesc = thing.longDescription || '';
        const season = thing.seasonDescription || '';
        const timeOfDay = thing.timeOfDayDescription || '';
        const duration = thing.durationDescription || '';
        const accessibility = thing.accessibilityInformation || '';
        // If content contains HTML, sanitize it; otherwise escape it
        const safeTitle = containsHtml(title) ? sanitizeHtml(title) : escapeHtml(title);
        const safeShortDesc = containsHtml(shortDesc) ? sanitizeHtml(shortDesc) : escapeHtml(shortDesc);
        const safeLongDesc = containsHtml(longDesc) ? sanitizeHtml(longDesc) : escapeHtml(longDesc);
        const safeSeason = containsHtml(season) ? sanitizeHtml(season) : escapeHtml(season);
        const safeTimeOfDay = containsHtml(timeOfDay) ? sanitizeHtml(timeOfDay) : escapeHtml(timeOfDay);
        const safeDuration = containsHtml(duration) ? sanitizeHtml(duration) : escapeHtml(duration);
        const safeAccessibility = containsHtml(accessibility) ? sanitizeHtml(accessibility) : escapeHtml(accessibility);
        html += `
      <div class="thing-item">
        <h4 class="thing-title">${safeTitle}</h4>
        <p class="thing-description">${safeShortDesc}</p>
        ${safeLongDesc ? `<p class="thing-details">${safeLongDesc}</p>` : ''}
        <div class="thing-meta">
          ${safeSeason
            ? `<span class="meta-item"><strong>Season:</strong> ${safeSeason}</span>`
            : ''}
          ${safeTimeOfDay
            ? `<span class="meta-item"><strong>Best Time:</strong> ${safeTimeOfDay}</span>`
            : ''}
          ${safeDuration
            ? `<span class="meta-item"><strong>Duration:</strong> ${safeDuration}</span>`
            : ''}
          ${safeAccessibility
            ? `<span class="meta-item"><strong>Accessibility:</strong> ${safeAccessibility}</span>`
            : ''}
        </div>
      </div>
    `;
    });
    html += '</div>';
    return html;
}
// Format amenities for display
export function formatAmenities(amenities) {
    if (!amenities || amenities.length === 0) {
        return '<p>no amenities listed</p>';
    }
    let html = '<ul style="list-style: none; padding: 0; margin: 0;">';
    amenities.forEach((amenity) => {
        const escapedName = escapeHtml(amenity.name);
        const escapedType = escapeHtml(amenity.amenityType || '');
        html += `
      <li style="background: white; border-radius: 2px; padding: 12px; margin-bottom: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <strong>${escapedName}</strong>
        ${escapedType ? `<span style="color: #666; font-size: 14px;"> - ${escapedType}</span>` : ''}
      </li>
    `;
    });
    html += '</ul>';
    return html;
}
