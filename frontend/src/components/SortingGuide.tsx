import { useState } from 'react'

interface SortingGuideProps {
  variant: 'rgb' | 'hue'
}

export default function SortingGuide({ variant }: SortingGuideProps) {
  const [showHint, setShowHint] = useState(false)

  const isRgb = variant === 'rgb'
  const buttonClass = isRgb
    ? 'bg-gradient-to-r from-light-accent via-purple-600 to-pink-600 dark:from-dark-accent dark:via-purple-400 dark:to-pink-400'
    : 'bg-gradient-to-r from-rose-500 via-amber-500 to-cyan-500 dark:from-rose-400 dark:via-amber-400 dark:to-cyan-400'

  const gradient = isRgb
    ? 'linear-gradient(to right, #000000, #0000ff, #00ff00, #00ffff, #ff0000, #ff00ff, #ffff00, #ffffff)'
    : 'linear-gradient(to right, hsl(0,80%,55%), hsl(60,80%,55%), hsl(120,80%,55%), hsl(180,80%,55%), hsl(240,80%,55%), hsl(300,80%,55%), hsl(360,80%,55%))'

  const labels = isRgb
    ? { left: 'Lowest RGB', right: 'Highest RGB' }
    : { left: 'Red', middle: 'Green', right: 'Blue' }

  const icon = isRgb ? '💡' : '🌈'
  const label = isRgb ? 'Sorting Guide' : 'Hue Guide'

  return (
    <div className="mb-8">
      <button
        onClick={() => setShowHint(!showHint)}
        className={`w-full text-center text-sm ${buttonClass} bg-clip-text text-transparent hover:opacity-80 mb-2 transition-opacity font-bold`}
      >
        {icon} {showHint ? 'Hide' : 'Show'} {label}
      </button>
      {showHint && (
        <div className="relative h-7 rounded-xl overflow-hidden shadow-lg animate-fade-in mb-3">
          <div className="absolute inset-0" style={{ background: gradient }} />
          <div className="absolute inset-0 flex items-center justify-between px-4 text-sm font-bold text-white" style={{ textShadow: '0 0 4px black, 0 0 8px black' }}>
            <span>{labels.left}</span>
            {'middle' in labels && <span>{labels.middle}</span>}
            <span>{labels.right}</span>
          </div>
        </div>
      )}
    </div>
  )
}
