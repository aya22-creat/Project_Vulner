import React from 'react'
import { motion } from 'framer-motion'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showStatusIndicator?: boolean
  className?: string
}

export function Logo({ size = 'md', showStatusIndicator = false, className = '' }: LogoProps) {
  const sizeMap = {
    sm: { fontSize: '16px', supFontSize: '0.45em' },
    md: { fontSize: '20px', supFontSize: '0.45em' },
    lg: { fontSize: '48px', supFontSize: '0.45em' },
  }

  const currentSize = sizeMap[size]

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          fontSize: currentSize.fontSize,
          color: '#ffffff',
          margin: 0,
          padding: 0,
        }}
      >
        CodeScan
        <sup
          style={{
            fontSize: currentSize.supFontSize,
            opacity: 0.5,
            verticalAlign: 'super',
            marginLeft: '2px',
          }}
        >
          ™
        </sup>
      </span>

      {showStatusIndicator && (
        <motion.div
          className="w-1.5 h-1.5 bg-emerald-500 rounded-full"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)',
          }}
        />
      )}
    </div>
  )
}
