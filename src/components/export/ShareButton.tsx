import { Share2, Check } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { encodeShareUrl, copyToClipboard } from '@/lib/shareUrl'
import { useFilters } from '@/hooks/useFilters'

interface ShareButtonProps {
  viewState: {
    latitude: number
    longitude: number
    zoom: number
  }
}

export function ShareButton({ viewState }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const { filters } = useFilters()

  const handleShare = async () => {
    const url = encodeShareUrl({
      lat: viewState.latitude,
      lng: viewState.longitude,
      zoom: viewState.zoom,
      types: filters.permitTypes,
      minValue: filters.minValue || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
    })

    const success = await copyToClipboard(url)

    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className="gap-2"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-500" />
          <span className="hidden sm:inline">Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share</span>
        </>
      )}
    </Button>
  )
}
