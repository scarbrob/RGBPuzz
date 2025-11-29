import { useEffect, useState } from 'react'

interface AnimatedNumberProps {
  value: number
  duration?: number
  decimals?: number
  suffix?: string
  className?: string
  isTime?: boolean
}

export default function AnimatedNumber({ value, duration = 1000, decimals = 0, suffix = '', className = '', isTime = false }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let startTime: number | null = null
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      
      // Ease-out animation
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(value * easeProgress)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [value, duration])

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${seconds}s`
  }

  const formattedValue = isTime 
    ? formatTime(displayValue)
    : decimals > 0 
      ? displayValue.toFixed(decimals)
      : Math.floor(displayValue).toString()

  return <span className={className}>{formattedValue}{suffix}</span>
}
