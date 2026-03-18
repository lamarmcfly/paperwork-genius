import type { PermitType } from '@/types/permit'

// Permit type colors for map pins
export const PERMIT_COLORS: Record<PermitType, string> = {
  new_construction: '#EF4444',    // Red
  demolition: '#F59E0B',          // Amber/Yellow
  commercial_buildout: '#3B82F6', // Blue
  major_renovation: '#22C55E',    // Green
  multifamily: '#A855F7',         // Purple
  other: '#6B7280',               // Gray
}

// Human-readable labels for permit types
export const PERMIT_LABELS: Record<PermitType, string> = {
  new_construction: 'New Construction',
  demolition: 'Demolition',
  commercial_buildout: 'Commercial Buildout',
  major_renovation: 'Major Renovation',
  multifamily: 'Multifamily',
  other: 'Other',
}

// Default map view centered on South Florida
export const DEFAULT_VIEW = {
  longitude: -80.2,
  latitude: 26.1,
  zoom: 9,
}

// Bounds covering Miami-Dade, Broward, Palm Beach
export const SOUTH_FLORIDA_BOUNDS = {
  minLng: -80.9,
  minLat: 25.2,
  maxLng: -79.8,
  maxLat: 26.95,
}

// OpenFreeMap tile style URL (no API key required)
export const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty'

// Cluster configuration
export const CLUSTER_CONFIG = {
  maxZoom: 14,
  radius: 50,
}

// Map layer IDs
export const MAP_LAYERS = {
  CLUSTERS: 'permit-clusters',
  CLUSTER_COUNT: 'cluster-count',
  PINS: 'permit-pins',
}

// Brand colors
export const BRAND = {
  primary: '#1E3A5F',    // Deep navy blue
  accent: '#3B82F6',     // Bright blue
  light: '#F8FAFC',      // Light gray background
  white: '#FFFFFF',
}

// All permit types for iteration
export const ALL_PERMIT_TYPES: PermitType[] = [
  'new_construction',
  'demolition',
  'commercial_buildout',
  'major_renovation',
  'multifamily',
  'other',
]
