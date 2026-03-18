import { useState } from 'react'
import { LogOut, MapPin, Filter, Menu, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useFilters } from '@/hooks/useFilters'
import { Button } from '@/components/ui/button'
import { SearchBar } from '@/components/search/SearchBar'
import { ExportButton } from '@/components/export/ExportButton'
import { ShareButton } from '@/components/export/ShareButton'
import { MOCK_PERMITS } from '@/lib/mockData'
import type { PermitMapItem } from '@/types/permit'

interface HeaderProps {
  onToggleFilters: () => void
  filtersOpen: boolean
  viewState: { latitude: number; longitude: number; zoom: number }
  onSelectSearchResult?: (permit: PermitMapItem) => void
}

export function Header({ onToggleFilters, filtersOpen, viewState, onSelectSearchResult }: HeaderProps) {
  const { user, signOut, loading } = useAuth()
  const { hasActiveFilters, filters } = useFilters()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Filter permits for export based on current filters
  const filteredPermits = MOCK_PERMITS.filter((p) => {
    if (filters.permitTypes.length < 6 && !filters.permitTypes.includes(p.permit_type)) {
      return false
    }
    if (filters.minValue && (p.project_value || 0) < filters.minValue) {
      return false
    }
    return true
  })

  return (
    <header className="bg-brand-primary text-white h-14 flex items-center justify-between px-4 shadow-md z-20">
      {/* Logo / Brand */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-brand-accent rounded-lg flex items-center justify-center">
          <MapPin className="w-5 h-5 text-white" />
        </div>
        <div className="hidden sm:block">
          <h1 className="text-lg font-bold tracking-tight">Paperwork Genius</h1>
          <p className="text-[10px] text-blue-200 -mt-0.5">See where development is happening</p>
        </div>
      </div>

      {/* Center: Search bar (desktop) */}
      <div className="hidden md:flex items-center gap-2 flex-1 justify-center max-w-xl mx-4" data-tour="search">
        <SearchBar onSelectResult={onSelectSearchResult} />
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Filter toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleFilters}
          data-tour="filters"
          className={`text-white hover:bg-white/10 hover:text-white relative ${
            filtersOpen ? 'bg-white/20' : ''
          }`}
        >
          <Filter className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-accent rounded-full" />
          )}
        </Button>

        {/* Export button */}
        <div className="hidden sm:block" data-tour="export">
          <ExportButton permits={filteredPermits} />
        </div>

        {/* Share button */}
        <div className="hidden sm:block" data-tour="share">
          <ShareButton viewState={viewState} />
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden p-2 rounded-lg hover:bg-white/10"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* User menu (desktop) */}
        {user && !loading && (
          <div className="hidden sm:flex items-center gap-3 ml-2 pl-2 border-l border-white/20">
            <span className="text-sm text-blue-200 hidden lg:block">
              {user.email}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-white hover:bg-white/10 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="absolute top-14 left-0 right-0 bg-brand-primary border-t border-white/10 p-4 space-y-3 sm:hidden z-50">
          {/* Mobile search */}
          <div className="mb-3">
            <SearchBar onSelectResult={(permit) => {
              onSelectSearchResult?.(permit)
              setMobileMenuOpen(false)
            }} />
          </div>

          {/* Mobile actions */}
          <div className="flex gap-2">
            <ExportButton permits={filteredPermits} />
            <ShareButton viewState={viewState} />
          </div>

          {/* User info and logout */}
          {user && (
            <div className="pt-3 border-t border-white/10">
              <p className="text-sm text-blue-200 mb-2">{user.email}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  signOut()
                  setMobileMenuOpen(false)
                }}
                className="w-full text-white border-white/30 hover:bg-white/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
