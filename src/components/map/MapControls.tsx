import { ZoomIn, ZoomOut, LocateFixed, Maximize2, RotateCcw } from 'lucide-react'
import type { MapRef } from 'react-map-gl/maplibre'
import { DEFAULT_VIEW } from '@/lib/constants'

interface MapControlsProps {
  mapRef: React.RefObject<MapRef>
}

export function MapControls({ mapRef }: MapControlsProps) {
  const handleZoomIn = () => {
    const map = mapRef.current
    if (map) {
      map.zoomIn({ duration: 300 })
    }
  }

  const handleZoomOut = () => {
    const map = mapRef.current
    if (map) {
      map.zoomOut({ duration: 300 })
    }
  }

  const handleLocate = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const map = mapRef.current
        if (map) {
          map.flyTo({
            center: [position.coords.longitude, position.coords.latitude],
            zoom: 14,
            duration: 1500,
          })
        }
      },
      () => {
        alert('Unable to retrieve your location')
      }
    )
  }

  const handleReset = () => {
    const map = mapRef.current
    if (map) {
      map.flyTo({
        center: [DEFAULT_VIEW.longitude, DEFAULT_VIEW.latitude],
        zoom: DEFAULT_VIEW.zoom,
        duration: 1000,
      })
    }
  }

  const handleFullscreen = () => {
    const elem = document.documentElement
    if (!document.fullscreenElement) {
      elem.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }

  return (
    <div className="absolute top-20 right-4 z-10 flex flex-col gap-2">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-gray-100 border-b border-gray-200 block w-full"
          title="Zoom in"
        >
          <ZoomIn className="w-5 h-5 text-gray-600 mx-auto" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-gray-100 block w-full"
          title="Zoom out"
        >
          <ZoomOut className="w-5 h-5 text-gray-600 mx-auto" />
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <button
          onClick={handleLocate}
          className="p-2 hover:bg-gray-100 border-b border-gray-200 block w-full"
          title="My location"
        >
          <LocateFixed className="w-5 h-5 text-gray-600 mx-auto" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 hover:bg-gray-100 border-b border-gray-200 block w-full"
          title="Reset view"
        >
          <RotateCcw className="w-5 h-5 text-gray-600 mx-auto" />
        </button>
        <button
          onClick={handleFullscreen}
          className="p-2 hover:bg-gray-100 block w-full"
          title="Fullscreen"
        >
          <Maximize2 className="w-5 h-5 text-gray-600 mx-auto" />
        </button>
      </div>
    </div>
  )
}
