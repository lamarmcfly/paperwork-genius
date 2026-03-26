import { useEffect, useRef, useState, useCallback } from 'react'
import type { MapRef, MapLayerMouseEvent } from 'react-map-gl/maplibre'
import { PenTool, Trash2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DrawControlProps {
  mapRef: React.RefObject<MapRef>
  onPolygonDrawn?: (polygon: GeoJSON.Polygon | null) => void
}

// Custom drawing solution using MapLibre native features
export function DrawControl({ mapRef, onPolygonDrawn }: DrawControlProps) {
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasPolygon, setHasPolygon] = useState(false)
  const [points, setPoints] = useState<[number, number][]>([])
  const sourceAdded = useRef(false)

  // Initialize sources and layers for drawing
  useEffect(() => {
    const map = mapRef.current?.getMap()
    if (!map) return

    const onLoad = () => {
      if (sourceAdded.current) return

      // Add source for the drawn polygon
      if (!map.getSource('draw-polygon')) {
        map.addSource('draw-polygon', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [],
          },
        })
      }

      // Add source for polygon vertices
      if (!map.getSource('draw-points')) {
        map.addSource('draw-points', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [],
          },
        })
      }

      // Add source for the line connecting points while drawing
      if (!map.getSource('draw-line')) {
        map.addSource('draw-line', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [],
          },
        })
      }

      // Add polygon fill layer
      if (!map.getLayer('draw-polygon-fill')) {
        map.addLayer({
          id: 'draw-polygon-fill',
          type: 'fill',
          source: 'draw-polygon',
          paint: {
            'fill-color': '#3B82F6',
            'fill-opacity': 0.15,
          },
        })
      }

      // Add polygon outline layer
      if (!map.getLayer('draw-polygon-outline')) {
        map.addLayer({
          id: 'draw-polygon-outline',
          type: 'line',
          source: 'draw-polygon',
          paint: {
            'line-color': '#3B82F6',
            'line-width': 3,
          },
        })
      }

      // Add line layer for drawing in progress
      if (!map.getLayer('draw-line-layer')) {
        map.addLayer({
          id: 'draw-line-layer',
          type: 'line',
          source: 'draw-line',
          paint: {
            'line-color': '#3B82F6',
            'line-width': 2,
            'line-dasharray': [2, 2],
          },
        })
      }

      // Add vertex points layer
      if (!map.getLayer('draw-points-layer')) {
        map.addLayer({
          id: 'draw-points-layer',
          type: 'circle',
          source: 'draw-points',
          paint: {
            'circle-radius': 6,
            'circle-color': '#3B82F6',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
          },
        })
      }

      sourceAdded.current = true
    }

    if (map.loaded()) {
      onLoad()
    } else {
      map.on('load', onLoad)
    }

    return () => {
      map.off('load', onLoad)
    }
  }, [mapRef])

  // Update map sources when points change
  useEffect(() => {
    const map = mapRef.current?.getMap()
    if (!map || !sourceAdded.current) return

    const pointSource = map.getSource('draw-points') as maplibregl.GeoJSONSource
    const lineSource = map.getSource('draw-line') as maplibregl.GeoJSONSource
    const polygonSource = map.getSource('draw-polygon') as maplibregl.GeoJSONSource

    if (!pointSource || !lineSource || !polygonSource) return

    // Update points
    pointSource.setData({
      type: 'FeatureCollection',
      features: points.map((p) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: p,
        },
        properties: {},
      })),
    })

    // Update line (while drawing)
    if (points.length >= 2 && isDrawing) {
      lineSource.setData({
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: points,
          },
          properties: {},
        }],
      })
    } else {
      lineSource.setData({
        type: 'FeatureCollection',
        features: [],
      })
    }

    // Update polygon (when complete)
    if (points.length >= 3 && !isDrawing) {
      const closedPolygon = [...points, points[0]]
      polygonSource.setData({
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [closedPolygon],
          },
          properties: {},
        }],
      })
    } else if (isDrawing && points.length >= 3) {
      // Show preview polygon while drawing
      const closedPolygon = [...points, points[0]]
      polygonSource.setData({
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [closedPolygon],
          },
          properties: {},
        }],
      })
    } else {
      polygonSource.setData({
        type: 'FeatureCollection',
        features: [],
      })
    }
  }, [points, isDrawing, mapRef])

  // Handle map click while drawing
  const handleMapClick = useCallback((e: MapLayerMouseEvent) => {
    if (!isDrawing) return

    const { lng, lat } = e.lngLat
    setPoints((prev) => [...prev, [lng, lat]])
  }, [isDrawing])

  // Add/remove click listener based on drawing state
  useEffect(() => {
    const map = mapRef.current?.getMap()
    if (!map) return

    if (isDrawing) {
      map.on('click', handleMapClick)
      map.getCanvas().style.cursor = 'crosshair'
    } else {
      map.off('click', handleMapClick)
      map.getCanvas().style.cursor = ''
    }

    return () => {
      map.off('click', handleMapClick)
      if (map.getCanvas()) {
        map.getCanvas().style.cursor = ''
      }
    }
  }, [isDrawing, handleMapClick, mapRef])

  const startDrawing = () => {
    // Clear any existing polygon first
    setPoints([])
    setHasPolygon(false)
    setIsDrawing(true)
    onPolygonDrawn?.(null)
  }

  const finishDrawing = () => {
    if (points.length >= 3) {
      const polygon: GeoJSON.Polygon = {
        type: 'Polygon',
        coordinates: [[...points, points[0]]],
      }
      setHasPolygon(true)
      onPolygonDrawn?.(polygon)
    }
    setIsDrawing(false)
  }

  const clearPolygon = () => {
    setPoints([])
    setHasPolygon(false)
    setIsDrawing(false)
    onPolygonDrawn?.(null)
  }

  return (
    <div className="absolute top-4 right-20 z-10 hidden md:block">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-1 flex gap-1">
        {!isDrawing ? (
          <button
            onClick={startDrawing}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors',
              hasPolygon
                ? 'bg-brand-accent text-white'
                : 'text-gray-600 hover:bg-gray-100'
            )}
            title="Draw to select area"
          >
            <PenTool className="w-4 h-4" />
            <span>Draw</span>
          </button>
        ) : (
          <button
            onClick={finishDrawing}
            disabled={points.length < 3}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors',
              points.length >= 3
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            )}
            title={points.length < 3 ? 'Add at least 3 points' : 'Finish drawing'}
          >
            <Check className="w-4 h-4" />
            <span>Done ({points.length} pts)</span>
          </button>
        )}
        {(hasPolygon || (isDrawing && points.length > 0)) && (
          <button
            onClick={clearPolygon}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            title="Clear selection"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear</span>
          </button>
        )}
      </div>
      {isDrawing && (
        <div className="mt-2 bg-brand-accent text-white text-xs px-3 py-1.5 rounded shadow max-w-[200px]">
          Click map to add points. Click Done when finished.
        </div>
      )}
    </div>
  )
}
