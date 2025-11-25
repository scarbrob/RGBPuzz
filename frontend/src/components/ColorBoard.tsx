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

  useEffect(() => {
    setItems(colors)
  }, [colors])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1, // Minimal movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (locked) return;

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
    <div className="flex justify-center items-center py-8">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map(item => item.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex gap-4 flex-wrap justify-center">
            {items.map((item, index) => (
              <ColorTile
                key={item.id}
                id={item.id}
                color={item.hex}
                index={index}
                isCorrect={correctPositions.includes(index)}
                isIncorrect={incorrectPositions.includes(index)}
                locked={locked}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
