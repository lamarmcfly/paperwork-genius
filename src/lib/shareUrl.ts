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

// Valid permit types for whitelist validation
const VALID_PERMIT_TYPES = [
  'new_construction',
  'demolition',
  'commercial_buildout',
  'major_renovation',
  'multifamily',
  'other',
]

// ISO date format regex (YYYY-MM-DD)
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

/**
 * Decode URL params to view state with security validation
 */
export function decodeShareUrl(searchParams: URLSearchParams): Partial<ShareState> {
  const state: Partial<ShareState> = {}

  // Validate latitude (-90 to 90)
  const lat = searchParams.get('lat')
  if (lat) {
    const latNum = parseFloat(lat)
    if (!isNaN(latNum) && isFinite(latNum) && latNum >= -90 && latNum <= 90) {
      state.lat = latNum
    }
  }

  // Validate longitude (-180 to 180)
  const lng = searchParams.get('lng')
  if (lng) {
    const lngNum = parseFloat(lng)
    if (!isNaN(lngNum) && isFinite(lngNum) && lngNum >= -180 && lngNum <= 180) {
      state.lng = lngNum
    }
  }

  // Validate zoom (0 to 22 for map tiles)
  const zoom = searchParams.get('zoom')
  if (zoom) {
    const zoomNum = parseFloat(zoom)
    if (!isNaN(zoomNum) && isFinite(zoomNum) && zoomNum >= 0 && zoomNum <= 22) {
      state.zoom = zoomNum
    }
  }

  // Validate and whitelist permit types
  const types = searchParams.get('types')
  if (types) {
    const validTypes = types.split(',').filter((t) => VALID_PERMIT_TYPES.includes(t))
    if (validTypes.length > 0) {
      state.types = validTypes
    }
  }

  // Validate minValue (positive integer, max 10 billion)
  const minValue = searchParams.get('minValue')
  if (minValue) {
    const val = parseInt(minValue, 10)
    if (!isNaN(val) && isFinite(val) && val >= 0 && val <= 10_000_000_000) {
      state.minValue = val
    }
  }

  // Validate date format (ISO 8601: YYYY-MM-DD)
  const startDate = searchParams.get('startDate')
  if (startDate && ISO_DATE_REGEX.test(startDate)) {
    state.startDate = startDate
  }

  const endDate = searchParams.get('endDate')
  if (endDate && ISO_DATE_REGEX.test(endDate)) {
    state.endDate = endDate
  }

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
