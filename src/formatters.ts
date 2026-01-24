import { Alert, NewsRelease, ThingToDo, Amenity } from './types.js'

// Escape HTML to prevent XSS attacks
function escapeHtml(text: string | undefined | null): string {
  if (!text) return ''
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// Format park alerts for display
export function formatParkAlerts(alerts: Alert[]): string {
  let html = `<div class="alerts-container">
      <div class="alerts-list">`

  if (!alerts || alerts.length === 0) {
    html += '<p>no current alerts</p>'
  } else {
    // Sort alerts by priority
    const sortedAlerts = [...alerts].sort((a, b) => {
      const priorityOrder: Record<string, number> = {
        Danger: 1,
        'Park Closure': 2,
        Caution: 3,
        Information: 4,
      }
      return (
        (priorityOrder[a.category] || 5) - (priorityOrder[b.category] || 5)
      )
    })

    sortedAlerts.forEach((alert) => {
      const categoryClass = alert.category.toLowerCase().replace(/\s+/g, '-')
      const escapedUrl = escapeHtml(alert.url)
      const escapedTitle = escapeHtml(alert.title)
      const escapedDescription = escapeHtml(alert.description)

      // Only show view full alert button if there's a URL
      const viewFullAlertButton = alert.url
        ? `<button class="alert-link" onclick="openAlertUrl('${escapedUrl}')">view full alert</button>`
        : ''

      const escapedCategory = escapeHtml(alert.category)

      html += `
        <div class="alert-item ${categoryClass}">
          <div class="alert-header" onclick="toggleAlert(this)">
            <span class="alert-category">${escapedCategory}</span>
            <h4 class="alert-title">${escapedTitle}</h4>
            <span class="alert-toggle">+</span>
          </div>
          <div class="alert-content" style="display: none;">
            <p class="alert-description">${escapedDescription}</p>
            ${viewFullAlertButton}
          </div>
        </div>
      `
    })
  }

  html += `</div>
  </div>`
  return html
}

// Format news releases for display
export function formatNews(news: NewsRelease[]): string {
  if (!news || news.length === 0) {
    return '<p>no current news</p>'
  }

  // Sort news by date (most recent first)
  const sortedNews = [...news].sort((a, b) => {
    const dateA = new Date(a.releaseDate || a.date || 0).getTime()
    const dateB = new Date(b.releaseDate || b.date || 0).getTime()
    return dateB - dateA // most recent first
  })

  let html = ''
  sortedNews.forEach((newsItem) => {
    // Use abstract if available, otherwise use title as fallback
    const description =
      escapeHtml(newsItem.abstract || newsItem.title || 'No description available')
    const escapedTitle = escapeHtml(newsItem.title)
    const escapedUrl = escapeHtml(newsItem.url)
    const releaseDate = newsItem.releaseDate || newsItem.date

    html += `
      <div class="alert-item information">
        <div class="alert-header">
          <span class="alert-category">News</span>
          <h4 class="alert-title">${escapedTitle}</h4>
        </div>
        <div class="alert-content">
          <p class="alert-description">${description}</p>
          ${
            releaseDate
              ? `<p class="news-date"><strong>Published:</strong> ${new Date(
                  releaseDate
                ).toLocaleDateString()}</p>`
              : ''
          }
          ${
            newsItem.url
              ? `<a href="${escapedUrl}" target="_blank" rel="noopener noreferrer" class="alert-link">read full article</a>`
              : ''
          }
        </div>
      </div>
    `
  })
  return html
}

// Format things to do for display
export function formatThingsToDo(thingsToDo: ThingToDo[]): string {
  if (!thingsToDo || thingsToDo.length === 0) {
    return '<p>no things to do listed</p>'
  }

  let html = '<div class="things-list">'
  thingsToDo.forEach((thing) => {
    const escapedTitle = escapeHtml(thing.title)
    const escapedShortDesc = escapeHtml(
      thing.shortDescription || 'No description available'
    )
    const escapedLongDesc = escapeHtml(thing.longDescription || '')
    const escapedSeason = escapeHtml(thing.seasonDescription || '')
    const escapedTimeOfDay = escapeHtml(thing.timeOfDayDescription || '')
    const escapedDuration = escapeHtml(thing.durationDescription || '')
    const escapedAccessibility = escapeHtml(
      thing.accessibilityInformation || ''
    )

    html += `
      <div class="thing-item">
        <h4 class="thing-title">${escapedTitle}</h4>
        <p class="thing-description">${escapedShortDesc}</p>
        ${escapedLongDesc ? `<p class="thing-details">${escapedLongDesc}</p>` : ''}
        <div class="thing-meta">
          ${
            escapedSeason
              ? `<span class="meta-item"><strong>Season:</strong> ${escapedSeason}</span>`
              : ''
          }
          ${
            escapedTimeOfDay
              ? `<span class="meta-item"><strong>Best Time:</strong> ${escapedTimeOfDay}</span>`
              : ''
          }
          ${
            escapedDuration
              ? `<span class="meta-item"><strong>Duration:</strong> ${escapedDuration}</span>`
              : ''
          }
          ${
            escapedAccessibility
              ? `<span class="meta-item"><strong>Accessibility:</strong> ${escapedAccessibility}</span>`
              : ''
          }
        </div>
      </div>
    `
  })
  html += '</div>'
  return html
}

// Format amenities for display
export function formatAmenities(amenities: Amenity[]): string {
  if (!amenities || amenities.length === 0) {
    return '<p>no amenities listed</p>'
  }

  let html = '<ul style="list-style: none; padding: 0; margin: 0;">'
  amenities.forEach((amenity) => {
    const escapedName = escapeHtml(amenity.name)
    const escapedType = escapeHtml(amenity.amenityType || '')

    html += `
      <li style="background: white; border-radius: 2px; padding: 12px; margin-bottom: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <strong>${escapedName}</strong>
        ${escapedType ? `<span style="color: #666; font-size: 14px;"> - ${escapedType}</span>` : ''}
      </li>
    `
  })
  html += '</ul>'
  return html
}
