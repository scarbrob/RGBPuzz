import { ReactNode } from 'react'

interface GameStageProps {
  children: ReactNode
  variant?: 'rgb' | 'spectrum'
}

/**
 * Visual frame/stage for the puzzle area.
 * Creates a recessed, focused area where the color tiles live.
 */
export default function GameStage({ children, variant = 'rgb' }: GameStageProps) {
  const gradientFrom = variant === 'rgb' ? 'from-violet-500/5' : 'from-amber-500/5'
  const gradientTo = variant === 'rgb' ? 'to-fuchsia-500/5' : 'to-cyan-500/5'
  const borderColor = variant === 'rgb' ? 'border-light-accent/10 dark:border-dark-accent/10' : 'border-amber-500/10 dark:border-amber-400/10'

  return (
    <div className={`relative rounded-3xl p-4 sm:p-6 md:p-8 bg-gradient-to-br ${gradientFrom} ${gradientTo} dark:from-white/[0.02] dark:to-white/[0.01] border ${borderColor}`}>
      {/* Subtle inner glow at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-light-accent/20 dark:via-dark-accent/15 to-transparent" />
      {children}
    </div>
  )
}
