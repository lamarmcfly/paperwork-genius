import type { PermitType, PermitMapItem, PermitFeatureCollection } from '@/types/permit'

// Classify permit descriptions into our 6 categories
export function classifyPermitType(description: string, tags?: string[]): PermitType {
  const desc = (description || '').toLowerCase()
  const tagStr = (tags || []).join(' ').toLowerCase()
  const combined = `${desc} ${tagStr}`

  if (combined.match(/demol/)) return 'demolition'
  if (combined.match(/new\s*(construction|building|dwelling|residen)/)) return 'new_construction'
  if (combined.match(/multi\s*family|apartment|condo|townhome/)) return 'multifamily'
  if (combined.match(/commercial|tenant\s*build|retail|office\s*build/)) return 'commercial_buildout'
  if (combined.match(/renovation|remodel|alteration|addition|rehab/)) return 'major_renovation'
  return 'other'
}

// Convert permits array to GeoJSON FeatureCollection for MapLibre
export function permitsToGeoJSON(permits: PermitMapItem[]): PermitFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: permits.map((permit) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [permit.longitude, permit.latitude] as [number, number],
      },
      properties: permit,
    })),
  }
}

// Normalize ArcGIS feature to our permit format
export function normalizeArcGISFeature(feature: {
  properties: Record<string, unknown>
  geometry: { coordinates: [number, number] }
}): PermitMapItem {
  const p = feature.properties
  const coords = feature.geometry.coordinates

  return {
    id: String(p.OBJECTID || p.FID || Math.random()),
    latitude: coords[1],
    longitude: coords[0],
    permit_type: classifyPermitType(String(p.DESCRIPTION || ''), []),
    address: String(p.SITE_ADDR || p.ADDRESS || 'Unknown'),
    description: String(p.DESCRIPTION || '') || null,
    project_value: typeof p.EST_VALUE === 'number' ? p.EST_VALUE : parseFloat(String(p.EST_VALUE)) || null,
    filing_date: p.FILED_DATE ? new Date(p.FILED_DATE as string | number).toISOString() : null,
    permit_number: String(p.PERMIT_NUM || p.PROCESS_NUM || '') || null,
    contractor_name: String(p.CONTRACTOR || '') || null,
    status: String(p.STATUS || '') || null,
  }
}

// Normalize Shovels.ai permit to our format
export function normalizeShovelsPermit(permit: Record<string, unknown>): PermitMapItem {
  return {
    id: String(permit.id || Math.random()),
    latitude: Number(permit.latitude) || 0,
    longitude: Number(permit.longitude) || 0,
    permit_type: classifyPermitType(
      String(permit.description || ''),
      Array.isArray(permit.tags) ? permit.tags.map(String) : []
    ),
    address: String(permit.address || 'Unknown'),
    description: String(permit.description || '') || null,
    project_value: typeof permit.job_value === 'number' ? permit.job_value : null,
    filing_date: permit.filing_date ? String(permit.filing_date) : null,
    permit_number: String(permit.permit_number || '') || null,
    contractor_name: String(permit.contractor_name || '') || null,
    status: String(permit.status || '') || null,
  }
}
