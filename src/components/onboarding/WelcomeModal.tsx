import { Filter, Download, TrendingUp, Eye } from 'lucide-react'
import { useOnboarding } from '@/hooks/useOnboarding'
import { Button } from '@/components/ui/button'

export function WelcomeModal() {
  const { showWelcome, startTour, dismissWelcome } = useOnboarding()

  if (!showWelcome) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header with branding */}
        <div className="bg-black text-white p-6 rounded-t-2xl flex items-center justify-center">
          <img
            src="/paperworkgenius.jpeg"
            alt="Genius Lens - Paperwork Genius"
            className="h-24 w-auto object-contain"
          />
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Welcome! Here's what you can do:
          </h2>

          <div className="space-y-4">
            <Feature
              icon={<Eye className="w-5 h-5" />}
              title="Explore Permits"
              description="View thousands of construction permits on an interactive map"
            />
            <Feature
              icon={<Filter className="w-5 h-5" />}
              title="Filter & Search"
              description="Find permits by type, value, date, or location"
            />
            <Feature
              icon={<TrendingUp className="w-5 h-5" />}
              title="Spot Trends"
              description="Use heatmap view to identify development hotspots"
            />
            <Feature
              icon={<Download className="w-5 h-5" />}
              title="Export Data"
              description="Download filtered results for your reports"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 flex flex-col gap-3">
          <Button
            onClick={startTour}
            className="w-full bg-brand-accent hover:bg-blue-600 text-white py-3 text-base"
          >
            Take a Quick Tour
          </Button>
          <button
            onClick={dismissWelcome}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Skip for now — I'll explore on my own
          </button>
        </div>
      </div>
    </div>
  )
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-brand-accent flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  )
}
