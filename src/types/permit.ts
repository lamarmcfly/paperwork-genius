// Permit type categories
export type PermitType =
  | 'new_construction'
  | 'demolition'
  | 'commercial_buildout'
  | 'major_renovation'
  | 'multifamily'
  | 'other'

// Data source identifiers
export type PermitSource = 'shovels' | 'miami_dade_arcgis' | 'manual'

// Core permit interface matching database schema
export interface Permit {
  id: string
  source: PermitSource
  source_id: string | null
  address: string
  city: string | null
  county: string
  state: string
  zip_code: string | null
  latitude: number
  longitude: number
  permit_type: PermitType
  permit_number: string | null
  description: string | null
  project_value: number | null
  filing_date: string | null
  issue_date: string | null
  completion_date: string | null
  status: string | null
  contractor_name: string | null
  contractor_license: string | null
  raw_data: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

// Simplified permit for map display (reduce payload size)
export interface PermitMapItem {
  id: string
  latitude: number
  longitude: number
  permit_type: PermitType
  address: string
  description: string | null
  project_value: number | null
  filing_date: string | null
  permit_number: string | null
  contractor_name: string | null
  status: string | null
}

// GeoJSON feature for map rendering
export interface PermitFeature {
  type: 'Feature'
  geometry: {
    type: 'Point'
    coordinates: [number, number] // [longitude, latitude]
  }
  properties: PermitMapItem
}

export interface PermitFeatureCollection {
  type: 'FeatureCollection'
  features: PermitFeature[]
}

// Map bounding box for spatial queries
export interface BoundingBox {
  minLng: number
  minLat: number
  maxLng: number
  maxLat: number
}

// Permit filter options
export interface PermitFilters {
  permitTypes?: PermitType[]
  minValue?: number
  startDate?: string
  endDate?: string
}

// Statistics for summary display
export interface PermitStats {
  total: number
  totalValue: number
  byType: Record<PermitType, number>
}
