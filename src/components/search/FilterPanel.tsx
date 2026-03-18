import { useState } from 'react'
import { Filter, X, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'
import { useFilters } from '@/hooks/useFilters'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { PERMIT_COLORS, PERMIT_LABELS, ALL_PERMIT_TYPES } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import { subDays, format } from 'date-fns'

interface FilterPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function FilterPanel({ isOpen, onClose }: FilterPanelProps) {
  const {
    filters,
    togglePermitType,
    setValueRange,
    setDateRange,
    resetFilters,
    hasActiveFilters,
  } = useFilters()

  const [expandedSections, setExpandedSections] = useState({
    types: true,
    value: true,
    date: true,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  // Date presets
  const datePresets = [
    { label: '30 days', days: 30 },
    { label: '60 days', days: 60 },
    { label: '90 days', days: 90 },
    { label: '1 year', days: 365 },
  ]

  const handleDatePreset = (days: number) => {
    const end = new Date()
    const start = subDays(end, days)
    setDateRange(format(start, 'yyyy-MM-dd'), format(end, 'yyyy-MM-dd'))
  }

  const clearDateRange = () => {
    setDateRange(null, null)
  }

  // Value presets (in millions)
  const valuePresets = [
    { label: 'Any', value: null },
    { label: '$1M+', value: 1000000 },
    { label: '$5M+', value: 5000000 },
    { label: '$10M+', value: 10000000 },
    { label: '$50M+', value: 50000000 },
  ]

  if (!isOpen) return null

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className="fixed inset-0 bg-black/30 z-30 md:hidden"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed md:absolute left-0 top-0 md:top-14 h-full md:h-auto w-80 bg-white shadow-xl z-40 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-brand-primary" />
            <h2 className="font-semibold text-gray-900">Filters</h2>
            {hasActiveFilters && (
              <span className="px-2 py-0.5 text-xs bg-brand-accent text-white rounded-full">
                Active
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                title="Reset filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Permit Types */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('types')}
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100"
            >
              <span className="font-medium text-sm text-gray-700">Permit Type</span>
              {expandedSections.types ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {expandedSections.types && (
              <div className="p-3 space-y-2">
                {ALL_PERMIT_TYPES.map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1 rounded"
                  >
                    <Checkbox
                      checked={filters.permitTypes.includes(type)}
                      onCheckedChange={() => togglePermitType(type)}
                    />
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: PERMIT_COLORS[type] }}
                    />
                    <span className="text-sm text-gray-700">{PERMIT_LABELS[type]}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Value Range */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('value')}
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100"
            >
              <span className="font-medium text-sm text-gray-700">Project Value</span>
              {expandedSections.value ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {expandedSections.value && (
              <div className="p-3">
                <div className="flex flex-wrap gap-2 mb-4">
                  {valuePresets.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => setValueRange(preset.value, null)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        filters.minValue === preset.value
                          ? 'bg-brand-accent text-white border-brand-accent'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-brand-accent'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="px-2">
                  <Slider
                    value={[filters.minValue || 0]}
                    onValueChange={([val]) => setValueRange(val || null, null)}
                    min={0}
                    max={100000000}
                    step={1000000}
                    formatLabel={(val) => formatCurrency(val)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Date Range */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('date')}
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100"
            >
              <span className="font-medium text-sm text-gray-700">Filing Date</span>
              {expandedSections.date ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {expandedSections.date && (
              <div className="p-3">
                <div className="flex flex-wrap gap-2 mb-3">
                  {datePresets.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => handleDatePreset(preset.days)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        filters.startDate &&
                        format(subDays(new Date(), preset.days), 'yyyy-MM-dd') === filters.startDate
                          ? 'bg-brand-accent text-white border-brand-accent'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-brand-accent'
                      }`}
                    >
                      Last {preset.label}
                    </button>
                  ))}
                </div>

                {filters.startDate && (
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                      {filters.startDate} to {filters.endDate || 'now'}
                    </span>
                    <button
                      onClick={clearDateRange}
                      className="text-xs text-brand-accent hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Apply button (mobile) */}
        <div className="p-4 border-t border-gray-200 md:hidden">
          <Button onClick={onClose} className="w-full">
            Apply Filters
          </Button>
        </div>
      </div>
    </>
  )
}
