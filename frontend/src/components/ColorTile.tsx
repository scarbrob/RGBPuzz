import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface ColorTileProps {
  id: string
  color: string
  index?: number
  isCorrect?: boolean
  isIncorrect?: boolean
  locked?: boolean
  size?: number
}

export default function ColorTile({ id, color, index, isCorrect = false, isIncorrect = false, locked = false, size }: ColorTileProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useSortable({ 
    id,
    disabled: locked,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : 'transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 200ms ease',
    backgroundColor: color,
    width: size ? `${size}px` : undefined,
    height: size ? `${size}px` : undefined,
  }

  return (
    <button
      ref={setNodeRef}
      style={style}
      aria-label={`Color tile ${index !== undefined ? index + 1 : ''}`}
      {...attributes}
      {...listeners}
      className={`color-tile relative group ${
        isCorrect ? 'ring-2 sm:ring-3 ring-emerald-400 ring-offset-2 ring-offset-light-bg dark:ring-offset-dark-bg' : 
        isIncorrect ? 'ring-2 sm:ring-3 ring-red-400 ring-offset-2 ring-offset-light-bg dark:ring-offset-dark-bg' : ''
      } ${isDragging ? 'opacity-90 scale-110 z-50 rotate-3 !shadow-2xl' : 'opacity-100'} ${
        !locked ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
      }`}
    >
      {/* Glossy highlight effect */}
      <div className="absolute inset-0 rounded-xl sm:rounded-2xl overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/20 to-transparent" />
      </div>
      
      {isCorrect && (
        <div className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg pointer-events-none animate-bounce-once ring-2 ring-light-bg dark:ring-dark-bg">
          ✓
        </div>
      )}
      {isIncorrect && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg pointer-events-none animate-bounce-once ring-2 ring-light-bg dark:ring-dark-bg">
          ✗
        </div>
      )}
    </button>
  )
}
