import { PERMIT_LABELS, PERMIT_COLORS, ALL_PERMIT_TYPES } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import type { PermitStats } from '@/types/permit'

interface SummaryStatsProps {
  stats: PermitStats
}

export function SummaryStats({ stats }: SummaryStatsProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-4 py-2 z-10">
      <div className="flex items-center justify-between max-w-screen-xl mx-auto">
        {/* Total count and value */}
        <div className="flex items-center gap-6">
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wide">Total Permits</span>
            <p className="text-lg font-bold text-brand-primary">{stats.total.toLocaleString()}</p>
          </div>
          <div className="hidden sm:block">
            <span className="text-xs text-gray-500 uppercase tracking-wide">Total Value</span>
            <p className="text-lg font-bold text-brand-primary">{formatCurrency(stats.totalValue)}</p>
          </div>
        </div>

        {/* Counts by type */}
        <div className="flex items-center gap-3 overflow-x-auto">
          {ALL_PERMIT_TYPES.map((type) => {
            const count = stats.byType[type]
            if (count === 0) return null
            return (
              <div
                key={type}
                className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-100 text-xs whitespace-nowrap cursor-help"
                title={PERMIT_LABELS[type]}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: PERMIT_COLORS[type] }}
                />
                <span className="text-gray-600 hidden md:inline">{PERMIT_LABELS[type]}:</span>
                <span className="font-semibold text-gray-900">{count}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
