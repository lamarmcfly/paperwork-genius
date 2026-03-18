import { MapPin, Search } from 'lucide-react'

interface EmptyStateProps {
  hasFilters: boolean
  onResetFilters?: () => void
}

export function EmptyState({ hasFilters, onResetFilters }: EmptyStateProps) {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center max-w-sm">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {hasFilters ? (
            <Search className="w-6 h-6 text-gray-400" />
          ) : (
            <MapPin className="w-6 h-6 text-gray-400" />
          )}
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">
          {hasFilters ? 'No matching permits' : 'No permits in this area'}
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          {hasFilters
            ? 'Try adjusting your filters or zoom out to see more permits.'
            : 'Pan or zoom to explore different areas of South Florida.'}
        </p>
        {hasFilters && onResetFilters && (
          <button
            onClick={onResetFilters}
            className="text-sm text-brand-accent hover:underline font-medium"
          >
            Reset filters
          </button>
        )}
      </div>
    </div>
  )
}
