import { useState, useCallback, useRef, useMemo } from 'react'
import Map, { Source, Layer, Popup } from 'react-map-gl/maplibre'
import type { MapRef, MapLayerMouseEvent, ViewStateChangeEvent } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'

import { PERMIT_COLORS, DEFAULT_VIEW, MAP_STYLE_URL, MAP_LAYERS } from '@/lib/constants'
import { permitsToGeoJSON } from '@/lib/permits'
import { MOCK_PERMITS, calculatePermitStats } from '@/lib/mockData'
import { useFilters } from '@/hooks/useFilters'
import type { PermitMapItem } from '@/types/permit'
import { PermitPopup } from './PermitPopup'
import { MapLegend } from './MapLegend'
import { SummaryStats } from './SummaryStats'
import { HeatmapToggle } from './HeatmapToggle'
import { LoadingOverlay } from './LoadingOverlay'
import { EmptyState } from './EmptyState'
import { MapControls } from './MapControls'
import { DrawControl } from './DrawControl'

interface PermitMapProps {
  onViewStateChange?: (viewState: { latitude: number; longitude: number; zoom: number }) => void
}

export function PermitMap({ onViewStateChange }: PermitMapProps) {
  const [selectedPermit, setSelectedPermit] = useState<PermitMapItem | null>(null)
  const [heatmapEnabled, setHeatmapEnabled] = useState(false)
  const [loading] = useState(false) // Will be used with real data loading
  const [viewState, setViewState] = useState(DEFAULT_VIEW)
  const [drawnPolygon, setDrawnPolygon] = useState<GeoJSON.Polygon | null>(null)
  const mapRef = useRef<MapRef>(null)

  const { filters, resetFilters, hasActiveFilters } = useFilters()

  // Filter mock data based on active filters
  const filteredPermits = useMemo(() => {
    let result = MOCK_PERMITS

    // Filter by permit types
    if (filters.permitTypes.length < 6) {
      result = result.filter((p) => filters.permitTypes.includes(p.permit_type))
    }

    // Filter by minimum value
    if (filters.minValue) {
      result = result.filter((p) => (p.project_value || 0) >= filters.minValue!)
    }

    // Filter by date range
    if (filters.startDate) {
      result = result.filter((p) => {
        if (!p.filing_date) return false
        return p.filing_date >= filters.startDate!
      })
    }

    // Filter by search query
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.address.toLowerCase().includes(q) ||
          p.permit_number?.toLowerCase().includes(q) ||
          p.contractor_name?.toLowerCase().includes(q)
      )
    }

    // Filter by drawn polygon (if any)
    if (drawnPolygon) {
      result = result.filter((p) => isPointInPolygon([p.longitude, p.latitude], drawnPolygon))
    }

    return result
  }, [filters, drawnPolygon])

  const geojson = useMemo(() => permitsToGeoJSON(filteredPermits), [filteredPermits])
  const stats = useMemo(() => calculatePermitStats(filteredPermits), [filteredPermits])

  const onClick = useCallback((event: MapLayerMouseEvent) => {
    const features = event.features
    if (features && features.length > 0) {
      const feature = features[0]
      const props = feature.properties

      // Handle cluster click - zoom in
      if (props?.cluster) {
        const clusterId = props.cluster_id as number
        const mapInstance = mapRef.current?.getMap()
        const source = mapInstance?.getSource('permits')
        if (source && source.type === 'geojson') {
          const geoJSONSource = source as unknown as { getClusterExpansionZoom: (id: number) => Promise<number> }
          geoJSONSource.getClusterExpansionZoom(clusterId).then((zoom: number) => {
            const coords = (feature.geometry as GeoJSON.Point).coordinates
            mapRef.current?.easeTo({
              center: [coords[0], coords[1]],
              zoom: zoom,
              duration: 500,
            })
          }).catch(() => {
            // Ignore cluster zoom errors
          })
        }
        return
      }

      // Handle permit pin click
      const coords = (feature.geometry as GeoJSON.Point).coordinates
      setSelectedPermit({
        id: props.id,
        latitude: coords[1],
        longitude: coords[0],
        permit_type: props.permit_type,
        address: props.address,
        description: props.description,
        project_value: props.project_value,
        filing_date: props.filing_date,
        permit_number: props.permit_number,
        contractor_name: props.contractor_name,
        status: props.status,
      })
    }
  }, [])

  const handleMove = useCallback((evt: ViewStateChangeEvent) => {
    setViewState(evt.viewState)
  }, [])

  const handleMoveEnd = useCallback((evt: ViewStateChangeEvent) => {
    onViewStateChange?.({
      latitude: evt.viewState.latitude,
      longitude: evt.viewState.longitude,
      zoom: evt.viewState.zoom,
    })
  }, [onViewStateChange])


  // Build a match expression for pin colors based on permit_type
  const circleColor = [
    'match',
    ['get', 'permit_type'],
    'new_construction', PERMIT_COLORS.new_construction,
    'demolition', PERMIT_COLORS.demolition,
    'commercial_buildout', PERMIT_COLORS.commercial_buildout,
    'major_renovation', PERMIT_COLORS.major_renovation,
    'multifamily', PERMIT_COLORS.multifamily,
    PERMIT_COLORS.other,
  ] as unknown as string

  // Heatmap weight expression based on project value
  const heatmapWeight = [
    'interpolate',
    ['linear'],
    ['coalesce', ['get', 'project_value'], 1000000],
    0, 0,
    100000000, 1,
  ] as unknown as number

  return (
    <div className="relative w-full h-full" data-tour="map">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={handleMove}
        onMoveEnd={handleMoveEnd}
        style={{ width: '100%', height: '100%' }}
        mapStyle={MAP_STYLE_URL}
        interactiveLayerIds={heatmapEnabled ? [] : [MAP_LAYERS.CLUSTERS, MAP_LAYERS.PINS]}
        onClick={onClick}
        cursor={heatmapEnabled ? 'grab' : 'pointer'}
      >
        <Source
          id="permits"
          type="geojson"
          data={geojson}
          cluster={!heatmapEnabled}
          clusterMaxZoom={14}
          clusterRadius={50}
        >
          {heatmapEnabled ? (
            // Heatmap layer
            <Layer
              id="permit-heatmap"
              type="heatmap"
              paint={{
                'heatmap-weight': heatmapWeight,
                'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 8, 1, 15, 3],
                'heatmap-color': [
                  'interpolate',
                  ['linear'],
                  ['heatmap-density'],
                  0, 'rgba(0, 0, 255, 0)',
                  0.1, 'rgb(65, 105, 225)',
                  0.3, 'rgb(0, 255, 0)',
                  0.5, 'rgb(255, 255, 0)',
                  0.7, 'rgb(255, 165, 0)',
                  1, 'rgb(255, 0, 0)',
                ],
                'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 8, 15, 15, 30],
                'heatmap-opacity': 0.8,
              }}
            />
          ) : (
            <>
              {/* Clustered circles */}
              <Layer
                id={MAP_LAYERS.CLUSTERS}
                type="circle"
                filter={['has', 'point_count']}
                paint={{
                  'circle-color': '#1E3A5F',
                  'circle-radius': ['step', ['get', 'point_count'], 20, 50, 30, 200, 40],
                  'circle-stroke-width': 2,
                  'circle-stroke-color': '#ffffff',
                  'circle-opacity': 0.85,
                }}
              />

              {/* Cluster count labels */}
              <Layer
                id={MAP_LAYERS.CLUSTER_COUNT}
                type="symbol"
                filter={['has', 'point_count']}
                layout={{
                  'text-field': '{point_count_abbreviated}',
                  'text-size': 13,
                }}
                paint={{ 'text-color': '#ffffff' }}
              />

              {/* Individual permit pins */}
              <Layer
                id={MAP_LAYERS.PINS}
                type="circle"
                filter={['!', ['has', 'point_count']]}
                paint={{
                  'circle-color': circleColor,
                  'circle-radius': 8,
                  'circle-stroke-width': 2,
                  'circle-stroke-color': '#ffffff',
                  'circle-opacity': 0.9,
                }}
              />
            </>
          )}
        </Source>

        {/* Detail popup on pin click */}
        {selectedPermit && !heatmapEnabled && (
          <Popup
            longitude={selectedPermit.longitude}
            latitude={selectedPermit.latitude}
            onClose={() => setSelectedPermit(null)}
            closeButton={true}
            closeOnClick={true}
            anchor="bottom"
            maxWidth="320px"
          >
            <PermitPopup permit={selectedPermit} />
          </Popup>
        )}
      </Map>

      {/* Map controls */}
      <HeatmapToggle enabled={heatmapEnabled} onToggle={setHeatmapEnabled} />
      <MapControls mapRef={mapRef} />
      <DrawControl mapRef={mapRef} onPolygonDrawn={setDrawnPolygon} />

      {/* Loading overlay */}
      <LoadingOverlay loading={loading} />

      {/* Empty state */}
      {filteredPermits.length === 0 && !loading && (
        <EmptyState hasFilters={hasActiveFilters} onResetFilters={resetFilters} />
      )}

      {/* Floating legend overlay */}
      <MapLegend />

      {/* Summary statistics bar */}
      <SummaryStats stats={stats} />
    </div>
  )
}

// Helper: Check if point is inside polygon (ray casting algorithm)
function isPointInPolygon(point: [number, number], polygon: GeoJSON.Polygon): boolean {
  const [x, y] = point
  const coords = polygon.coordinates[0]
  let inside = false

  for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
    const xi = coords[i][0], yi = coords[i][1]
    const xj = coords[j][0], yj = coords[j][1]

    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi)

    if (intersect) inside = !inside
  }

  return inside
}
