import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { PermitType } from '@/types/permit'
import { ALL_PERMIT_TYPES } from '@/lib/constants'

export interface PermitFilters {
  permitTypes: PermitType[]
  minValue: number | null
  maxValue: number | null
  startDate: string | null
  endDate: string | null
  searchQuery: string
}

interface FiltersContextType {
  filters: PermitFilters
  setPermitTypes: (types: PermitType[]) => void
  togglePermitType: (type: PermitType) => void
  setValueRange: (min: number | null, max: number | null) => void
  setDateRange: (start: string | null, end: string | null) => void
  setSearchQuery: (query: string) => void
  resetFilters: () => void
  hasActiveFilters: boolean
}

const defaultFilters: PermitFilters = {
  permitTypes: [...ALL_PERMIT_TYPES],
  minValue: null,
  maxValue: null,
  startDate: null,
  endDate: null,
  searchQuery: '',
}

const FiltersContext = createContext<FiltersContextType | undefined>(undefined)

export function FiltersProvider({ children }: { children: React.ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState<PermitFilters>(() => {
    // Initialize from URL params
    const types = searchParams.get('types')
    const minVal = searchParams.get('minValue')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const search = searchParams.get('q')

    return {
      permitTypes: types
        ? (types.split(',').filter((t) => ALL_PERMIT_TYPES.includes(t as PermitType)) as PermitType[])
        : [...ALL_PERMIT_TYPES],
      minValue: minVal ? Number(minVal) : null,
      maxValue: null,
      startDate: startDate || null,
      endDate: endDate || null,
      searchQuery: search || '',
    }
  })

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams()

    if (filters.permitTypes.length < ALL_PERMIT_TYPES.length) {
      params.set('types', filters.permitTypes.join(','))
    }
    if (filters.minValue) {
      params.set('minValue', String(filters.minValue))
    }
    if (filters.startDate) {
      params.set('startDate', filters.startDate)
    }
    if (filters.endDate) {
      params.set('endDate', filters.endDate)
    }
    if (filters.searchQuery) {
      params.set('q', filters.searchQuery)
    }

    setSearchParams(params, { replace: true })
  }, [filters, setSearchParams])

  const setPermitTypes = useCallback((types: PermitType[]) => {
    setFilters((prev) => ({ ...prev, permitTypes: types }))
  }, [])

  const togglePermitType = useCallback((type: PermitType) => {
    setFilters((prev) => {
      const current = prev.permitTypes
      if (current.includes(type)) {
        // Don't allow deselecting all types
        if (current.length === 1) return prev
        return { ...prev, permitTypes: current.filter((t) => t !== type) }
      }
      return { ...prev, permitTypes: [...current, type] }
    })
  }, [])

  const setValueRange = useCallback((min: number | null, max: number | null) => {
    setFilters((prev) => ({ ...prev, minValue: min, maxValue: max }))
  }, [])

  const setDateRange = useCallback((start: string | null, end: string | null) => {
    setFilters((prev) => ({ ...prev, startDate: start, endDate: end }))
  }, [])

  const setSearchQuery = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters)
  }, [])

  const hasActiveFilters =
    filters.permitTypes.length < ALL_PERMIT_TYPES.length ||
    filters.minValue !== null ||
    filters.startDate !== null ||
    filters.endDate !== null ||
    filters.searchQuery !== ''

  return (
    <FiltersContext.Provider
      value={{
        filters,
        setPermitTypes,
        togglePermitType,
        setValueRange,
        setDateRange,
        setSearchQuery,
        resetFilters,
        hasActiveFilters,
      }}
    >
      {children}
    </FiltersContext.Provider>
  )
}

export function useFilters() {
  const context = useContext(FiltersContext)
  if (!context) {
    throw new Error('useFilters must be used within a FiltersProvider')
  }
  return context
}
