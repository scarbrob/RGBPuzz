import { useState, useEffect } from 'react'

const STORAGE_KEY = 'rgbpuzz-tutorial-seen'

export default function TutorialHint() {
  const [show, setShow] = useState(false)
  const [fadingOut, setFadingOut] = useState(false)

  useEffect(() => {
    setShow(!localStorage.getItem(STORAGE_KEY))

    const handleDismiss = () => {
      setFadingOut(true)
      setShow(false)
      setTimeout(() => setFadingOut(false), 800)
    }

    window.addEventListener('storage', handleDismiss)
    return () => window.removeEventListener('storage', handleDismiss)
  }, [])

  if (!show && !fadingOut) return null

  return (
    <div
      className="flex justify-center overflow-hidden mb-4"
      style={{
        transition: 'max-height 0.8s ease-in-out, opacity 0.8s ease-in-out',
        maxHeight: fadingOut ? '0px' : '200px',
        opacity: fadingOut ? 0 : 1,
      }}
    >
      <div className="px-4 py-3 bg-light-accent/10 dark:bg-dark-accent/10 border border-light-accent/30 dark:border-dark-accent/30 rounded-xl">
        <p className="text-center text-sm sm:text-base text-light-text-primary dark:text-dark-text-primary font-semibold">
          👆 <span className="text-light-accent dark:text-dark-accent">Drag and drop</span> the tiles below to reorder them!
        </p>
      </div>
    </div>
  )
}
