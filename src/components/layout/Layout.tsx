import React, { useState, useCallback } from 'react'
import { Header } from './Header'
import { FilterPanel } from '@/components/search/FilterPanel'
import type { PermitMapItem } from '@/types/permit'
import { DEFAULT_VIEW } from '@/lib/constants'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [viewState, setViewState] = useState({
    latitude: DEFAULT_VIEW.latitude,
    longitude: DEFAULT_VIEW.longitude,
    zoom: DEFAULT_VIEW.zoom,
  })

  const handleToggleFilters = useCallback(() => {
    setFiltersOpen((prev) => !prev)
  }, [])

  const handleViewStateChange = useCallback((newViewState: typeof viewState) => {
    setViewState(newViewState)
  }, [])

  const handleSearchSelect = useCallback((_permit: PermitMapItem) => {
    // The map component handles flying to the location via search
    // Close filters on mobile when searching
    setFiltersOpen(false)
  }, [])

  return (
    <div className="h-screen flex flex-col">
      <Header
        onToggleFilters={handleToggleFilters}
        filtersOpen={filtersOpen}
        viewState={viewState}
        onSelectSearchResult={handleSearchSelect}
      />
      <main className="flex-1 relative overflow-hidden">
        {/* Filter panel */}
        <FilterPanel isOpen={filtersOpen} onClose={() => setFiltersOpen(false)} />

        {/* Main content (map) - clone children to pass props */}
        {React.isValidElement(children)
          ? React.cloneElement(children as React.ReactElement<{ onViewStateChange?: (vs: typeof viewState) => void }>, {
              onViewStateChange: handleViewStateChange,
            })
          : children}
      </main>
    </div>
  )
}
