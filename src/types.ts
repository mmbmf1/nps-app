// Type definitions for NPS API responses

export interface Address {
  line1: string
  line2?: string
  line3?: string
  city: string
  stateCode: string
  postalCode: string
  type: string
}

export interface Park {
  id: string
  url: string
  fullName: string
  parkCode: string
  description: string
  latLong?: string
  addresses?: Address[]
  relevanceScore?: number
}

export interface ParksResponse {
  total: string
  limit: string
  start: string
  data: Park[]
}

export interface Alert {
  id: string
  url?: string
  title: string
  parkCode: string
  description: string
  category: 'Danger' | 'Park Closure' | 'Caution' | 'Information'
  severity?: string
  lastIndexedDate?: string
}

export interface AlertsResponse {
  total: string
  limit: string
  start: string
  data: Alert[]
}

export interface NewsRelease {
  id: string
  url?: string
  title: string
  abstract?: string
  releaseDate?: string
  date?: string
  parkCode: string
}

export interface NewsResponse {
  total: string
  limit: string
  start: string
  data: NewsRelease[]
}

export interface ThingToDo {
  id: string
  title: string
  shortDescription?: string
  longDescription?: string
  seasonDescription?: string
  timeOfDayDescription?: string
  durationDescription?: string
  accessibilityInformation?: string
  parkCode: string
}

export interface ThingsToDoResponse {
  total: string
  limit: string
  start: string
  data: ThingToDo[]
}

export interface Amenity {
  id: string
  name: string
  amenityType?: string
  parkCode: string
}

export interface AmenitiesResponse {
  total: string
  limit: string
  start: string
  data: Amenity[]
}

export interface State {
  value: string
  text: string
}

export interface MarkerData {
  marker: mapboxgl.Marker
  index: number
}

export type ContentType = 'overview' | 'news' | 'things' | 'amenities'
