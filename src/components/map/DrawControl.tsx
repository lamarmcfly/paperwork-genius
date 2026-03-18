import { useEffect, useRef, useState } from 'react'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import type { MapRef } from 'react-map-gl/maplibre'
import { PenTool, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DrawControlProps {
  mapRef: React.RefObject<MapRef>
  onPolygonDrawn?: (polygon: GeoJSON.Polygon | null) => void
}

export function DrawControl({ mapRef, onPolygonDrawn }: DrawControlProps) {
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasPolygon, setHasPolygon] = useState(false)
  const drawRef = useRef<MapboxDraw | null>(null)

  useEffect(() => {
    const map = mapRef.current?.getMap()
    if (!map) return

    // Initialize draw control
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {},
      defaultMode: 'simple_select',
      styles: [
        // Polygon fill
        {
          id: 'gl-draw-polygon-fill',
          type: 'fill',
          filter: ['all', ['==', '$type', 'Polygon']],
          paint: {
            'fill-color': '#3B82F6',
            'fill-opacity': 0.1,
          },
        },
        // Polygon outline
        {
          id: 'gl-draw-polygon-stroke',
          type: 'line',
          filter: ['all', ['==', '$type', 'Polygon']],
          paint: {
            'line-color': '#3B82F6',
            'line-width': 2,
          },
        },
        // Vertex points
        {
          id: 'gl-draw-polygon-and-line-vertex-active',
          type: 'circle',
          filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point']],
          paint: {
            'circle-radius': 5,
            'circle-color': '#3B82F6',
          },
        },
      ],
    })

    map.addControl(draw as unknown as maplibregl.IControl)
    drawRef.current = draw

    // Listen for draw events
    const handleCreate = (e: { features: GeoJSON.Feature[] }) => {
      const polygon = e.features[0]?.geometry as GeoJSON.Polygon
      setHasPolygon(true)
      setIsDrawing(false)
      onPolygonDrawn?.(polygon)
    }

    const handleDelete = () => {
      setHasPolygon(false)
      onPolygonDrawn?.(null)
    }

    const handleUpdate = (e: { features: GeoJSON.Feature[] }) => {
      const polygon = e.features[0]?.geometry as GeoJSON.Polygon
      onPolygonDrawn?.(polygon)
    }

    map.on('draw.create', handleCreate)
    map.on('draw.delete', handleDelete)
    map.on('draw.update', handleUpdate)

    return () => {
      map.off('draw.create', handleCreate)
      map.off('draw.delete', handleDelete)
      map.off('draw.update', handleUpdate)
      map.removeControl(draw as unknown as maplibregl.IControl)
    }
  }, [mapRef, onPolygonDrawn])

  const startDrawing = () => {
    const draw = drawRef.current
    if (draw) {
      // Clear existing polygons first
      draw.deleteAll()
      draw.changeMode('draw_polygon')
      setIsDrawing(true)
      setHasPolygon(false)
    }
  }

  const clearPolygon = () => {
    const draw = drawRef.current
    if (draw) {
      draw.deleteAll()
      setHasPolygon(false)
      setIsDrawing(false)
      onPolygonDrawn?.(null)
    }
  }

  return (
    <div className="absolute top-4 right-20 z-10 hidden md:block">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-1 flex gap-1">
        <button
          onClick={startDrawing}
          disabled={isDrawing}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors',
            isDrawing
              ? 'bg-brand-accent text-white'
              : 'text-gray-600 hover:bg-gray-100'
          )}
          title="Draw to select area"
        >
          <PenTool className="w-4 h-4" />
          <span>Draw</span>
        </button>
        {hasPolygon && (
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
        <div className="mt-2 bg-brand-accent text-white text-xs px-3 py-1.5 rounded shadow">
          Click to add points. Double-click to finish.
        </div>
      )}
    </div>
  )
}
