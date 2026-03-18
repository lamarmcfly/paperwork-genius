import { PERMIT_COLORS, PERMIT_LABELS, ALL_PERMIT_TYPES } from '@/lib/constants'

export function MapLegend() {
  return (
    <div className="absolute bottom-20 left-4 bg-white rounded-lg shadow-lg p-3 z-10" data-tour="legend">
      <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
        Permit Types
      </h4>
      <div className="space-y-1.5">
        {ALL_PERMIT_TYPES.map((type) => (
          <div key={type} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: PERMIT_COLORS[type] }}
            />
            <span className="text-xs text-gray-600">
              {PERMIT_LABELS[type]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
