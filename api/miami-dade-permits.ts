// Vercel Edge Function: Proxy/cache for Miami-Dade County ArcGIS REST API
// This is the primary FREE data source (no API key required)

export const config = { runtime: 'edge' }

const ARCGIS_BASE = 'https://services.arcgis.com/8Pc9XBTAsYuxx9Ny/arcgis/rest/services'
const PERMIT_LAYER = 'Building_Permit/FeatureServer/0/query'

export default async function handler(request: Request) {
  const url = new URL(request.url)

  // Get bounding box parameters (with defaults for South Florida)
  const minLng = url.searchParams.get('minLng') || '-80.5'
  const minLat = url.searchParams.get('minLat') || '25.5'
  const maxLng = url.searchParams.get('maxLng') || '-80.0'
  const maxLat = url.searchParams.get('maxLat') || '26.0'
  const limit = url.searchParams.get('limit') || '2000'

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
    resultRecordCount: limit,
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
        // CORS headers
        'Access-Control-Allow-Origin': '*',
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
