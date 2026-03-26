// Vercel Edge Function: Proxy to Shovels.ai API
// This protects the API key from being exposed in client-side code

export const config = { runtime: 'edge' }

const ALLOWED_ORIGIN = 'https://paperwork-genius.vercel.app'

// Whitelist of allowed query parameters for Shovels.ai API
const ALLOWED_PARAMS = ['lat', 'lng', 'radius', 'limit', 'offset', 'type', 'status', 'min_value', 'max_value', 'start_date', 'end_date']

export default async function handler(request: Request) {
  const url = new URL(request.url)
  const searchParams = url.searchParams
  const origin = request.headers.get('origin') || ''

  // Validate CORS origin
  const corsOrigin = origin === ALLOWED_ORIGIN || origin.includes('localhost') ? origin : ALLOWED_ORIGIN

  // Build Shovels.ai API URL (V2 API)
  const shovelsUrl = new URL('https://api.shovels.ai/v2/permits')

  // Forward only whitelisted query parameters
  searchParams.forEach((value, key) => {
    if (ALLOWED_PARAMS.includes(key)) {
      shovelsUrl.searchParams.set(key, value)
    }
  })

  // Check for API key
  const apiKey = process.env.SHOVELS_API_KEY
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'Shovels.ai API key not configured' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  try {
    const response = await fetch(shovelsUrl.toString(), {
      headers: {
        'X-API-Key': apiKey,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return new Response(
        JSON.stringify({
          error: 'Shovels.ai API error',
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
    console.error('Shovels.ai API error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch permits from Shovels.ai' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
