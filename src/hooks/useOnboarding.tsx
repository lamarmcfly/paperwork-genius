import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'

const STORAGE_KEYS = {
  WELCOME: 'paperwork-genius:onboarding-welcome',
  TOUR: 'paperwork-genius:onboarding-tour',
}

export interface TourStep {
  id: string
  target: string // data-tour attribute value
  title: string
  description: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'map',
    target: 'heatmap',
    title: 'Explore the Map',
    description: 'Pan and zoom to explore permits across South Florida. Use these buttons to switch between pin view and heatmap.',
    position: 'right',
  },
  {
    id: 'pins',
    target: 'legend',
    title: 'Permit Types',
    description: 'Each color represents a different permit type. Red for new construction, blue for commercial, and more.',
    position: 'left',
  },
  {
    id: 'filters',
    target: 'filters',
    title: 'Filter Permits',
    description: 'Filter by permit type, project value, or date range to find exactly what you need.',
    position: 'bottom',
  },
  {
    id: 'search',
    target: 'search',
    title: 'Search',
    description: 'Search by address, permit number, or contractor name to quickly find specific permits.',
    position: 'bottom',
  },
  {
    id: 'heatmap',
    target: 'heatmap',
    title: 'Heatmap View',
    description: 'Toggle heatmap mode to visualize development hotspots by project value.',
    position: 'bottom',
  },
  {
    id: 'export',
    target: 'export',
    title: 'Export Data',
    description: 'Download filtered permits as CSV or generate a summary report for your records.',
    position: 'bottom',
  },
  {
    id: 'share',
    target: 'share',
    title: 'Share Your View',
    description: 'Copy a shareable link that preserves your current map view and filters.',
    position: 'bottom',
  },
]

interface OnboardingState {
  hasSeenWelcome: boolean
  hasCompletedTour: boolean
  showWelcome: boolean
  isTourActive: boolean
  currentStep: number
}

interface OnboardingContextValue extends OnboardingState {
  startTour: () => void
  nextStep: () => void
  prevStep: () => void
  skipTour: () => void
  completeTour: () => void
  dismissWelcome: () => void
  resetOnboarding: () => void
  currentTourStep: TourStep | null
  totalSteps: number
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(() => {
    // Check localStorage for previous visits
    const hasSeenWelcome = localStorage.getItem(STORAGE_KEYS.WELCOME) === 'true'
    const hasCompletedTour = localStorage.getItem(STORAGE_KEYS.TOUR) === 'true'

    return {
      hasSeenWelcome,
      hasCompletedTour,
      showWelcome: !hasSeenWelcome,
      isTourActive: false,
      currentStep: 0,
    }
  })

  const dismissWelcome = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.WELCOME, 'true')
    setState((prev) => ({
      ...prev,
      hasSeenWelcome: true,
      showWelcome: false,
    }))
  }, [])

  const startTour = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showWelcome: false,
      hasSeenWelcome: true,
      isTourActive: true,
      currentStep: 0,
    }))
    localStorage.setItem(STORAGE_KEYS.WELCOME, 'true')
  }, [])

  const nextStep = useCallback(() => {
    setState((prev) => {
      if (prev.currentStep >= TOUR_STEPS.length - 1) {
        // Tour complete
        localStorage.setItem(STORAGE_KEYS.TOUR, 'true')
        return {
          ...prev,
          hasCompletedTour: true,
          isTourActive: false,
          currentStep: 0,
        }
      }
      return {
        ...prev,
        currentStep: prev.currentStep + 1,
      }
    })
  }, [])

  const prevStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1),
    }))
  }, [])

  const skipTour = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.TOUR, 'true')
    setState((prev) => ({
      ...prev,
      hasCompletedTour: true,
      isTourActive: false,
      currentStep: 0,
    }))
  }, [])

  const completeTour = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.TOUR, 'true')
    setState((prev) => ({
      ...prev,
      hasCompletedTour: true,
      isTourActive: false,
      currentStep: 0,
    }))
  }, [])

  const resetOnboarding = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isTourActive: true,
      currentStep: 0,
    }))
  }, [])

  // Keyboard navigation
  useEffect(() => {
    if (!state.isTourActive) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'Enter':
          nextStep()
          break
        case 'ArrowLeft':
          prevStep()
          break
        case 'Escape':
          skipTour()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [state.isTourActive, nextStep, prevStep, skipTour])

  const currentTourStep = state.isTourActive ? TOUR_STEPS[state.currentStep] : null

  const value: OnboardingContextValue = {
    ...state,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
    dismissWelcome,
    resetOnboarding,
    currentTourStep,
    totalSteps: TOUR_STEPS.length,
  }

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider')
  }
  return context
}
