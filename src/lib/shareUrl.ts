interface ShareState {
  lat: number
  lng: number
  zoom: number
  types?: string[]
  minValue?: number
  startDate?: string
  endDate?: string
}

/**
 * Encode current view state to URL
 */
export function encodeShareUrl(state: ShareState): string {
  const params = new URLSearchParams()

  params.set('lat', state.lat.toFixed(4))
  params.set('lng', state.lng.toFixed(4))
  params.set('zoom', state.zoom.toFixed(1))

  if (state.types && state.types.length > 0) {
    params.set('types', state.types.join(','))
  }
  if (state.minValue) {
    params.set('minValue', String(state.minValue))
  }
  if (state.startDate) {
    params.set('startDate', state.startDate)
  }
  if (state.endDate) {
    params.set('endDate', state.endDate)
  }

  const baseUrl = window.location.origin + window.location.pathname
  return `${baseUrl}?${params.toString()}`
}

/**
 * Decode URL params to view state
 */
export function decodeShareUrl(searchParams: URLSearchParams): Partial<ShareState> {
  const state: Partial<ShareState> = {}

  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const zoom = searchParams.get('zoom')
  const types = searchParams.get('types')
  const minValue = searchParams.get('minValue')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  if (lat) state.lat = parseFloat(lat)
  if (lng) state.lng = parseFloat(lng)
  if (zoom) state.zoom = parseFloat(zoom)
  if (types) state.types = types.split(',')
  if (minValue) state.minValue = parseInt(minValue, 10)
  if (startDate) state.startDate = startDate
  if (endDate) state.endDate = endDate

  return state
}

/**
 * Copy URL to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-9999px'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      return true
    } catch {
      return false
    } finally {
      document.body.removeChild(textArea)
    }
  }
}
