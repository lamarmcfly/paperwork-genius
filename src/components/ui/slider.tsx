import * as React from 'react'
import { cn } from '@/lib/utils'

interface SliderProps {
  value: number[]
  onValueChange: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  className?: string
  formatLabel?: (value: number) => string
}

export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className,
  formatLabel,
}: SliderProps) {
  const [localValue, setLocalValue] = React.useState(value[0])

  React.useEffect(() => {
    setLocalValue(value[0])
  }, [value])

  const percentage = ((localValue - min) / (max - min)) * 100

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value)
    setLocalValue(newValue)
  }

  const handleChangeEnd = () => {
    onValueChange([localValue])
  }

  return (
    <div className={cn('relative w-full', className)}>
      <div className="relative h-2 w-full rounded-full bg-gray-200">
        <div
          className="absolute h-full rounded-full bg-brand-accent"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={localValue}
        onChange={handleChange}
        onMouseUp={handleChangeEnd}
        onTouchEnd={handleChangeEnd}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-brand-accent shadow-md pointer-events-none"
        style={{ left: `calc(${percentage}% - 8px)` }}
      />
      {formatLabel && (
        <div className="mt-2 text-xs text-gray-600 text-center">
          {formatLabel(localValue)}
        </div>
      )}
    </div>
  )
}
