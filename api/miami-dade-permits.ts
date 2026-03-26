// Vercel Edge Function: Proxy/cache for Miami-Dade County ArcGIS REST API
// This is the primary FREE data source (no API key required)

export const config = { runtime: 'edge' }

const ARCGIS_BASE = 'https://services.arcgis.com/8Pc9XBTAsYuxx9Ny/arcgis/rest/services'
const PERMIT_LAYER = 'Building_Permit/FeatureServer/0/query'
const ALLOWED_ORIGIN = 'https://paperwork-genius.vercel.app'

// Validate and parse numeric parameter with bounds
function validateNumber(value: string | null, defaultVal: number, min: number, max: number): number {
  if (!value) return defaultVal
  const num = parseFloat(value)
  if (isNaN(num) || !isFinite(num)) return defaultVal
  return Math.max(min, Math.min(max, num))
}

export default async function handler(request: Request) {
  const url = new URL(request.url)
  const origin = request.headers.get('origin') || ''

  // Validate CORS origin (allow same-origin and production domain)
  const corsOrigin = origin === ALLOWED_ORIGIN || origin.includes('localhost') ? origin : ALLOWED_ORIGIN

  // Validate bounding box parameters
  const minLng = validateNumber(url.searchParams.get('minLng'), -80.5, -180, 180)
  const minLat = validateNumber(url.searchParams.get('minLat'), 25.5, -90, 90)
  const maxLng = validateNumber(url.searchParams.get('maxLng'), -80.0, -180, 180)
  const maxLat = validateNumber(url.searchParams.get('maxLat'), 26.0, -90, 90)
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '2000', 10) || 2000, 1), 5000)

  // Build ArcGIS query parameters
  const params = new URLSearchParams({
    where: '1=1',
    geometry: `${minLng},${minLat},${maxLng},${maxLat}`,
    geometryType: 'esriGeometryEnvelope',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: '*',
    returnGeometry: 'true',
    outSR: '4326',
    f: 'geojson',
    resultRecordCount: String(limit),
    orderByFields: 'OBJECTID DESC',
  })

  try {
    const response = await fetch(`${ARCGIS_BASE}/${PERMIT_LAYER}?${params}`)

    if (!response.ok) {
      const errorText = await response.text()
      return new Response(
        JSON.stringify({
          error: 'Miami-Dade ArcGIS API error',
          status: response.status,
          details: errorText,
        }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const data = await response.json()

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // Cache for 1 hour, serve stale for 24 hours while revalidating
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        // CORS headers - restricted to allowed origins
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
    })
  } catch (error) {
    console.error('Miami-Dade ArcGIS API error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch Miami-Dade permits' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}