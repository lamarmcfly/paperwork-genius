interface LoadingOverlayProps {
  loading: boolean
}

export function LoadingOverlay({ loading }: LoadingOverlayProps) {
  if (!loading) return null

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
      <div className="bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-200 flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-600">Loading permits...</span>
      </div>
    </div>
  )
}
