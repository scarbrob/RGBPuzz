import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import ColorTile from './ColorTile'

interface ColorBoardProps {
  colors: Array<{ id: string; hex: string }>
  correctPositions?: number[]
  incorrectPositions?: number[]
  locked?: boolean
  onOrderChange?: (newOrder: string[]) => void
}

export default function ColorBoard({ colors, correctPositions = [], incorrectPositions = [], locked = false, onOrderChange }: ColorBoardProps) {
  const [items, setItems] = useState(colors)
  const [tileSize, setTileSize] = useState(96) // Default size in pixels

  useEffect(() => {
    setItems(colors)
  }, [colors])

  useEffect(() => {
    const calculateTileSize = () => {
      const numColors = colors.length
      const screenWidth = window.innerWidth
      
      // Account for padding and gaps
      const padding = screenWidth < 640 ? 32 : 48 // px-4 sm:px-6 = 16px or 24px per side
      const gapSize = screenWidth < 640 ? 8 : screenWidth < 768 ? 8 : screenWidth < 1024 ? 12 : 16
      const totalGaps = (numColors - 1) * gapSize
      const availableWidth = screenWidth - padding - totalGaps
      
      // Calculate max tile size that fits
      let calculatedSize = Math.floor(availableWidth / numColors)
      
      // Set responsive max sizes based on breakpoint
      let maxSize = 96 // lg default
      if (screenWidth < 640) {
        maxSize = 40 // mobile
      } else if (screenWidth < 768) {
        maxSize = 64 // sm
      } else if (screenWidth < 1024) {
        maxSize = 80 // md
      }
      
      // Use smaller of calculated or max
      calculatedSize = Math.min(calculatedSize, maxSize)
      
      // Ensure minimum size
      calculatedSize = Math.max(calculatedSize, 32)
      
      setTileSize(calculatedSize)
    }

    calculateTileSize()
    window.addEventListener('resize', calculateTileSize)
    return () => window.removeEventListener('resize', calculateTileSize)
  }, [colors.length])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Small movement to start drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (locked) return;

    // Mark tutorial as seen on first interaction
    if (typeof window !== 'undefined' && !localStorage.getItem('rgbpuzz-tutorial-seen')) {
      localStorage.setItem('rgbpuzz-tutorial-seen', 'true');
      // Trigger a storage event so the page can update
      window.dispatchEvent(new Event('storage'));
    }

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        const newOrder = arrayMove(items, oldIndex, newIndex)
        
        if (onOrderChange) {
          onOrderChange(newOrder.map(item => item.id))
        }
        
        return newOrder
      })
    }
  }

  return (
    <div className="flex flex-col justify-center items-center py-8 w-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map(item => item.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex gap-2 sm:gap-2 md:gap-3 lg:gap-4 justify-center w-full px-4 sm:px-6 relative">
            {items.map((item, index) => (
              <ColorTile
                key={item.id}
                id={item.id}
                color={item.hex}
                index={index}
                isCorrect={correctPositions.includes(index)}
                isIncorrect={incorrectPositions.includes(index)}
                locked={locked}
                size={tileSize}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
