// Re-export maplibre-gl as mapbox-gl for compatibility with @mapbox/mapbox-gl-draw
import maplibregl from 'maplibre-gl'

// @ts-expect-error - Shimming mapbox-gl with maplibre-gl
window.mapboxgl = maplibregl

export default maplibregl
