import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface ColorTileProps {
  id: string
  color: string
  index: number
  isCorrect?: boolean
  isIncorrect?: boolean
  locked?: boolean
}

export default function ColorTile({ id, color, index, isCorrect = false, isIncorrect = false, locked = false }: ColorTileProps) {
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
    transition: 'none', // No transitions for instant movement
    backgroundColor: color,
  }

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`color-tile relative group ${
        isCorrect ? 'ring-4 ring-green-400 ring-offset-2 ring-offset-gray-900' : 
        isIncorrect ? 'ring-4 ring-red-400 ring-offset-2 ring-offset-gray-900' : ''
      } ${isDragging ? 'opacity-50 scale-110 z-50' : 'opacity-100'} ${
        !locked ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
      }`}
    >
      {isCorrect && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg pointer-events-none">
          ✓
        </div>
      )}
      {isIncorrect && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg pointer-events-none">
          ✗
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <span className="text-white font-bold text-shadow bg-black bg-opacity-50 px-2 py-1 rounded">
          {index + 1}
        </span>
      </div>
    </button>
  )
}
