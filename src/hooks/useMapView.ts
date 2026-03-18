import { useState, useCallback, useMemo } from 'react'
import { DEFAULT_VIEW, SOUTH_FLORIDA_BOUNDS } from '@/lib/constants'
import type { BoundingBox } from '@/types/permit'
import { debounce } from '@/lib/utils'

interface ViewState {
  longitude: number
  latitude: number
  zoom: number
}

interface UseMapViewReturn {
  viewState: ViewState
  bounds: BoundingBox
  onMove: (evt: { viewState: ViewState }) => void
  onMoveEnd: (evt: { viewState: ViewState }) => void
  resetView: () => void
}

// Calculate bounds from view state
function calculateBounds(viewState: ViewState): BoundingBox {
  // Approximate bounds based on zoom level
  // At zoom 9, we see roughly +/- 1 degree
  // Each zoom level halves the visible area
  const zoomFactor = Math.pow(2, 9 - viewState.zoom)
  const latOffset = 0.5 * zoomFactor
  const lngOffset = 0.7 * zoomFactor

  return {
    minLng: Math.max(viewState.longitude - lngOffset, SOUTH_FLORIDA_BOUNDS.minLng),
    minLat: Math.max(viewState.latitude - latOffset, SOUTH_FLORIDA_BOUNDS.minLat),
    maxLng: Math.min(viewState.longitude + lngOffset, SOUTH_FLORIDA_BOUNDS.maxLng),
    maxLat: Math.min(viewState.latitude + latOffset, SOUTH_FLORIDA_BOUNDS.maxLat),
  }
}

export function useMapView(): UseMapViewReturn {
  const [viewState, setViewState] = useState<ViewState>(DEFAULT_VIEW)
  const [bounds, setBounds] = useState<BoundingBox>(() => calculateBounds(DEFAULT_VIEW))

  // Update view state on every move (for smooth panning)
  const onMove = useCallback((evt: { viewState: ViewState }) => {
    setViewState(evt.viewState)
  }, [])

  // Update bounds only when movement ends (debounced data fetch)
  const updateBounds = useMemo(
    () =>
      debounce((vs: ViewState) => {
        setBounds(calculateBounds(vs))
      }, 300),
    []
  )

  const onMoveEnd = useCallback(
    (evt: { viewState: ViewState }) => {
      updateBounds(evt.viewState)
    },
    [updateBounds]
  )

  // Reset to default view
  const resetView = useCallback(() => {
    setViewState(DEFAULT_VIEW)
    setBounds(calculateBounds(DEFAULT_VIEW))
  }, [])

  return {
    viewState,
    bounds,
    onMove,
    onMoveEnd,
    resetView,
  }
}
