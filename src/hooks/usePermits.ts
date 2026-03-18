import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { MOCK_PERMITS } from '@/lib/mockData'
import type { PermitMapItem, BoundingBox } from '@/types/permit'

interface UsePermitsOptions {
  bounds?: BoundingBox
  permitTypes?: string[]
  minValue?: number
}

interface UsePermitsReturn {
  permits: PermitMapItem[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function usePermits(options: UsePermitsOptions = {}): UsePermitsReturn {
  const [permits, setPermits] = useState<PermitMapItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPermits = useCallback(async () => {
    // If Supabase is not configured, use mock data
    if (!isSupabaseConfigured) {
      setPermits(MOCK_PERMITS)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { bounds, permitTypes, minValue } = options

      // Use the RPC function for spatial queries
      if (bounds) {
        const { data, error: queryError } = await supabase
          .rpc('get_permits_in_bounds', {
            min_lng: bounds.minLng,
            min_lat: bounds.minLat,
            max_lng: bounds.maxLng,
            max_lat: bounds.maxLat,
            permit_types: permitTypes || null,
            min_value: minValue || null,
          })

        if (queryError) throw queryError

        // Transform to PermitMapItem
        const mapped: PermitMapItem[] = (data || []).map((p: Record<string, unknown>) => ({
          id: String(p.id),
          latitude: Number(p.latitude),
          longitude: Number(p.longitude),
          permit_type: String(p.permit_type) as PermitMapItem['permit_type'],
          address: String(p.address),
          description: p.description ? String(p.description) : null,
          project_value: typeof p.project_value === 'number' ? p.project_value : null,
          filing_date: p.filing_date ? String(p.filing_date) : null,
          permit_number: p.permit_number ? String(p.permit_number) : null,
          contractor_name: p.contractor_name ? String(p.contractor_name) : null,
          status: p.status ? String(p.status) : null,
        }))

        setPermits(mapped)
      } else {
        // Fallback: direct query without bounds
        const { data, error: queryError } = await supabase
          .from('permits')
          .select('id, latitude, longitude, permit_type, address, description, project_value, filing_date, permit_number, contractor_name, status')
          .order('filing_date', { ascending: false })
          .limit(5000)

        if (queryError) throw queryError

        const mapped: PermitMapItem[] = (data || []).map((p) => ({
          id: p.id,
          latitude: p.latitude,
          longitude: p.longitude,
          permit_type: p.permit_type,
          address: p.address,
          description: p.description,
          project_value: p.project_value,
          filing_date: p.filing_date,
          permit_number: p.permit_number,
          contractor_name: p.contractor_name,
          status: p.status,
        }))

        setPermits(mapped)
      }
    } catch (err) {
      // Silently fall back to mock data on error (expected in demo mode)
      setError(err instanceof Error ? err.message : 'Failed to fetch permits')
      setPermits(MOCK_PERMITS)
    } finally {
      setLoading(false)
    }
  }, [options.bounds?.minLng, options.bounds?.minLat, options.bounds?.maxLng, options.bounds?.maxLat, options.permitTypes, options.minValue])

  useEffect(() => {
    fetchPermits()
  }, [fetchPermits])

  return {
    permits,
    loading,
    error,
    refetch: fetchPermits,
  }
}
