// Type definitions for Mapbox GL JS
// Minimal declarations for what we use

declare namespace mapboxgl {
  interface MapOptions {
    container: string | HTMLElement
    style: string
    center: [number, number]
    zoom: number
    preserveDrawingBuffer?: boolean
    hash?: boolean
  }

  interface PopupOptions {
    maxWidth?: string
    className?: string
    anchor?: string
    closeButton?: boolean
  }

  interface LngLat {
    lng: number
    lat: number
  }

  interface LngLatBounds {
    extend(coordinates: [number, number]): LngLatBounds
  }

  interface NavigationControlOptions {
    showZoom?: boolean
    showCompass?: boolean
  }

  interface FlyToOptions {
    center: [number, number] | LngLat
    zoom?: number
  }

  interface FitBoundsOptions {
    padding?: number
  }

  class Map {
    constructor(options: MapOptions)
    addControl(control: NavigationControl): void
    resize(): void
    getZoom(): number
    flyTo(options: FlyToOptions): void
    fitBounds(bounds: LngLatBounds, options?: FitBoundsOptions): void
  }

  class Marker {
    constructor()
    setLngLat(coordinates: [number, number] | LngLat): Marker
    setPopup(popup: Popup): Marker
    addTo(map: Map): Marker
    getElement(): HTMLElement
    getPopup(): Popup
    getLngLat(): LngLat
  }

  class Popup {
    constructor(options?: PopupOptions)
    setHTML(html: string): Popup
  }

  class LngLatBounds {
    constructor()
    extend(coordinates: [number, number]): LngLatBounds
  }

  class NavigationControl {
    constructor(options?: NavigationControlOptions)
  }

  let accessToken: string
}
