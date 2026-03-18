import { useEffect, useState, useRef } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useOnboarding } from '@/hooks/useOnboarding'
import { Button } from '@/components/ui/button'

interface TooltipPosition {
  top: number
  left: number
  arrowPosition: 'top' | 'bottom' | 'left' | 'right'
}

interface SpotlightRect {
  top: number
  left: number
  width: number
  height: number
}

export function TourStep() {
  const {
    currentTourStep,
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    skipTour,
    isTourActive,
  } = useOnboarding()

  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null)
  const [tooltipPos, setTooltipPos] = useState<TooltipPosition | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!currentTourStep || !isTourActive) {
      setSpotlight(null)
      setTooltipPos(null)
      return
    }

    const updatePosition = () => {
      const target = document.querySelector(`[data-tour="${currentTourStep.target}"]`)
      if (!target) {
        // If target not found, skip to next step after a short delay
        const timer = setTimeout(() => {
          if (currentStep < totalSteps - 1) {
            nextStep()
          }
        }, 100)
        return () => clearTimeout(timer)
      }

      const rect = target.getBoundingClientRect()
      const padding = 8

      // Set spotlight position
      setSpotlight({
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      })

      // Calculate tooltip position
      const tooltipWidth = 320
      const tooltipHeight = 180
      const gap = 16

      let top = 0
      let left = 0
      let arrowPosition: 'top' | 'bottom' | 'left' | 'right' = 'top'

      const preferredPosition = currentTourStep.position || 'bottom'

      switch (preferredPosition) {
        case 'bottom':
          top = rect.bottom + gap
          left = rect.left + rect.width / 2 - tooltipWidth / 2
          arrowPosition = 'top'
          break
        case 'top':
          top = rect.top - tooltipHeight - gap
          left = rect.left + rect.width / 2 - tooltipWidth / 2
          arrowPosition = 'bottom'
          break
        case 'left':
          top = rect.top + rect.height / 2 - tooltipHeight / 2
          left = rect.left - tooltipWidth - gap
          arrowPosition = 'right'
          break
        case 'right':
          top = rect.top + rect.height / 2 - tooltipHeight / 2
          left = rect.right + gap
          arrowPosition = 'left'
          break
      }

      // Keep tooltip within viewport
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      if (left < 16) left = 16
      if (left + tooltipWidth > viewportWidth - 16) left = viewportWidth - tooltipWidth - 16
      if (top < 16) {
        top = rect.bottom + gap
        arrowPosition = 'top'
      }
      if (top + tooltipHeight > viewportHeight - 16) {
        top = rect.top - tooltipHeight - gap
        arrowPosition = 'bottom'
      }

      setTooltipPos({ top, left, arrowPosition })
    }

    updatePosition()

    // Update on resize/scroll
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [currentTourStep, isTourActive, currentStep, totalSteps, nextStep])

  if (!isTourActive || !currentTourStep || !spotlight || !tooltipPos) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Dark overlay with spotlight cutout using CSS mask */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none">
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect
              x={spotlight.left}
              y={spotlight.top}
              width={spotlight.width}
              height={spotlight.height}
              rx="8"
              fill="black"
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.75)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Spotlight border highlight */}
      <div
        className="fixed pointer-events-none rounded-lg ring-4 ring-brand-accent ring-opacity-50 transition-all duration-300"
        style={{
          top: spotlight.top,
          left: spotlight.left,
          width: spotlight.width,
          height: spotlight.height,
        }}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed w-80 bg-white rounded-xl shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95"
        style={{
          top: tooltipPos.top,
          left: tooltipPos.left,
        }}
      >
        {/* Arrow */}
        <div
          className={`absolute w-3 h-3 bg-white transform rotate-45 ${
            tooltipPos.arrowPosition === 'top'
              ? '-top-1.5 left-1/2 -translate-x-1/2'
              : tooltipPos.arrowPosition === 'bottom'
              ? '-bottom-1.5 left-1/2 -translate-x-1/2'
              : tooltipPos.arrowPosition === 'left'
              ? '-left-1.5 top-1/2 -translate-y-1/2'
              : '-right-1.5 top-1/2 -translate-y-1/2'
          }`}
        />

        {/* Content */}
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {currentTourStep.title}
            </h3>
            <button
              onClick={skipTour}
              className="text-gray-400 hover:text-gray-600 p-1 -mr-1 -mt-1"
              aria-label="Close tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-4">
            {currentTourStep.description}
          </p>

          {/* Footer with progress and navigation */}
          <div className="flex items-center justify-between">
            {/* Progress dots */}
            <div className="flex gap-1.5">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentStep
                      ? 'bg-brand-accent'
                      : i < currentStep
                      ? 'bg-blue-200'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevStep}
                  className="text-gray-600"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              )}
              <Button
                size="sm"
                onClick={nextStep}
                className="bg-brand-accent hover:bg-blue-600 text-white"
              >
                {currentStep === totalSteps - 1 ? (
                  'Finish'
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard hint */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-xs flex items-center gap-4">
        <span>Use arrow keys to navigate</span>
        <span>Press Esc to skip</span>
      </div>
    </div>
  )
}
