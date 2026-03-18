import { Flame, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeatmapToggleProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
}

export function HeatmapToggle({ enabled, onToggle }: HeatmapToggleProps) {
  return (
    <div className="absolute top-4 left-4 z-10" data-tour="heatmap">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-1 flex gap-1">
        <button
          onClick={() => onToggle(false)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors',
            !enabled
              ? 'bg-brand-primary text-white'
              : 'text-gray-600 hover:bg-gray-100'
          )}
          title="Pin view"
        >
          <MapPin className="w-4 h-4" />
          <span className="hidden sm:inline">Pins</span>
        </button>
        <button
          onClick={() => onToggle(true)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors',
            enabled
              ? 'bg-brand-primary text-white'
              : 'text-gray-600 hover:bg-gray-100'
          )}
          title="Heatmap view"
        >
          <Flame className="w-4 h-4" />
          <span className="hidden sm:inline">Heatmap</span>
        </button>
      </div>
    </div>
  )
}
