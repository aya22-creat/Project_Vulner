'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'

export function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 })
  const [isHovering, setIsHovering] = useState(false)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    // Check for interactive elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // Consider links, buttons, inputs, and elements with 'glass-panel' as hoverable
      if (
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'input' ||
        target.closest('a') ||
        target.closest('button') ||
        target.classList.contains('glass-panel')
      ) {
        setIsHovering(true)
      } else {
        setIsHovering(false)
      }
    }

    window.addEventListener('mousemove', updateMousePosition)
    window.addEventListener('mouseover', handleMouseOver)

    return () => {
      window.removeEventListener('mousemove', updateMousePosition)
      window.removeEventListener('mouseover', handleMouseOver)
    }
  }, [])

  // Framer Motion spring configuration for the lag effect
  const springConfig = {
    damping: 25,
    stiffness: 700,
    mass: 0.5
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] hidden md:block">
      {/* Outer Ring */}
      <motion.div
        ref={ringRef}
        className="absolute top-0 left-0 rounded-full border border-[var(--color-violet)]"
        animate={{
          x: mousePosition.x - (isHovering ? 22 : 14),
          y: mousePosition.y - (isHovering ? 22 : 14),
          width: isHovering ? 44 : 28,
          height: isHovering ? 44 : 28,
          scale: isHovering ? 1 : 1,
        }}
        transition={{
          type: 'spring',
          ...springConfig,
          restDelta: 0.001
        }}
      />
      {/* Inner Dot */}
      <motion.div
        className="absolute top-0 left-0 h-1.5 w-1.5 rounded-full bg-[var(--color-violet)]"
        animate={{
          x: mousePosition.x - 3,
          y: mousePosition.y - 3,
          opacity: isHovering ? 0 : 1,
        }}
        transition={{
          type: 'tween',
          ease: 'backOut',
          duration: 0.05
        }}
      />
    </div>
  )
}
