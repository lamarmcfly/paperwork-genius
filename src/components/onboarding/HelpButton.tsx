import { HelpCircle } from 'lucide-react'
import { useOnboarding } from '@/hooks/useOnboarding'

export function HelpButton() {
  const { resetOnboarding, isTourActive, showWelcome } = useOnboarding()

  // Don't show help button during tour or welcome modal
  if (isTourActive || showWelcome) return null

  return (
    <button
      onClick={resetOnboarding}
      className="fixed bottom-20 right-4 z-50 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-brand-accent hover:border-brand-accent transition-colors group"
      aria-label="Start tour"
      title="Take a tour"
    >
      <HelpCircle className="w-5 h-5" />
      <span className="absolute right-full mr-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Take a tour
      </span>
    </button>
  )
}
