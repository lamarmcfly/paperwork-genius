import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, MapPin } from 'lucide-react'
import { useFilters } from '@/hooks/useFilters'
import { Input } from '@/components/ui/input'
import { debounce } from '@/lib/utils'
import { MOCK_PERMITS } from '@/lib/mockData'
import type { PermitMapItem } from '@/types/permit'

interface SearchBarProps {
  onSelectResult?: (permit: PermitMapItem) => void
}

export function SearchBar({ onSelectResult }: SearchBarProps) {
  const { filters, setSearchQuery } = useFilters()
  const [inputValue, setInputValue] = useState(filters.searchQuery)
  const [results, setResults] = useState<PermitMapItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query)

      if (query.length < 2) {
        setResults([])
        return
      }

      // Search through mock data (will switch to Supabase RPC later)
      const q = query.toLowerCase()
      const matches = MOCK_PERMITS.filter(
        (p) =>
          p.address.toLowerCase().includes(q) ||
          p.permit_number?.toLowerCase().includes(q) ||
          p.contractor_name?.toLowerCase().includes(q)
      ).slice(0, 8)

      setResults(matches)
      setIsOpen(matches.length > 0)
    }, 300),
    [setSearchQuery]
  )

  useEffect(() => {
    debouncedSearch(inputValue)
  }, [inputValue, debouncedSearch])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (permit: PermitMapItem) => {
    setInputValue(permit.address)
    setIsOpen(false)
    onSelectResult?.(permit)
  }

  const handleClear = () => {
    setInputValue('')
    setResults([])
    setIsOpen(false)
    setSearchQuery('')
  }

  const handleExpand = () => {
    setIsExpanded(true)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  // Mobile: show icon button, expand on click
  // Desktop: always show full input
  return (
    <div ref={containerRef} className="relative">
      {/* Mobile collapsed state */}
      <button
        onClick={handleExpand}
        className="md:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
        aria-label="Search"
      >
        <Search className="w-5 h-5" />
      </button>

      {/* Desktop or expanded mobile */}
      <div
        className={`${
          isExpanded ? 'absolute right-0 top-0 w-72' : 'hidden md:block'
        }`}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search address, permit #, contractor..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            onBlur={() => isExpanded && setTimeout(() => setIsExpanded(false), 200)}
            className="pl-9 pr-8 w-64 bg-white"
          />
          {inputValue && (
            <button
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Results dropdown */}
        {isOpen && results.length > 0 && (
          <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto z-50">
            {results.map((permit) => (
              <button
                key={permit.id}
                onClick={() => handleSelect(permit)}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-start gap-2 border-b border-gray-100 last:border-0"
              >
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">
                    {highlightMatch(permit.address, inputValue)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {permit.permit_number && `#${permit.permit_number} • `}
                    {permit.contractor_name || 'No contractor listed'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Highlight matching text
function highlightMatch(text: string, query: string) {
  if (!query) return text
  const regex = new RegExp(`(${query})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-yellow-200 rounded">
        {part}
      </mark>
    ) : (
      part
    )
  )
}
