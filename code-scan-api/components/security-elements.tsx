'use client'

import React from 'react'
import { motion } from 'framer-motion'

export function FloatingSecurityOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Floating security orbs that move across the screen */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 200 + 100,
            height: Math.random() * 200 + 100,
            background: i % 2 === 0 ? 'rgba(124, 58, 237, 0.08)' : 'rgba(6, 182, 212, 0.08)',
            filter: 'blur(40px)',
          }}
          animate={{
            x: [
              Math.random() * -200 - 100,
              Math.random() * 200 + 100,
              Math.random() * -200 - 100,
            ],
            y: [
              Math.random() * -300,
              Math.random() * 300,
              Math.random() * -300,
            ],
          }}
          transition={{
            duration: 20 + i * 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

export function AnimatedGrid() {
  return (
    <div className="absolute inset-0 opacity-30">
      <svg className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="rgba(124, 58, 237, 0.3)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  )
}

export function GlitchLines() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            height: '2px',
            width: '100%',
            background: `linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.4), transparent)`,
            top: `${20 + i * 20}%`,
          }}
          animate={{
            opacity: [0, 0.5, 0],
            x: [-100, 100, -100],
          }}
          transition={{
            duration: 3,
            delay: i * 0.3,
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  )
}

export function LockShapeAnimated() {
  return (
    <motion.div
      className="absolute top-1/4 right-1/4"
      animate={{
        x: [0, 20, 0, -20, 0],
        y: [0, -30, 0, 30, 0],
        rotate: [0, 5, 0, -5, 0],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <svg className="w-32 h-32 opacity-10" viewBox="0 0 24 24" fill="none" stroke="rgba(124, 58, 237, 0.5)" strokeWidth="1">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        <circle cx="12" cy="16" r="1" fill="rgba(124, 58, 237, 0.5)" />
      </svg>
    </motion.div>
  )
}

export function ShieldPulse() {
  return (
    <motion.div
      className="absolute bottom-1/3 left-1/4"
      animate={{
        y: [0, -20, 0, 20, 0],
        scale: [1, 1.05, 1, 0.95, 1],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <svg className="w-40 h-40 opacity-10" viewBox="0 0 24 24" fill="none" stroke="rgba(6, 182, 212, 0.5)" strokeWidth="1">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    </motion.div>
  )
}

export function ScanLineAnimation() {
  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
        animate={{
          top: ['0%', '100%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          boxShadow: '0 0 20px rgba(6, 182, 212, 0.6)',
        }}
      />
    </motion.div>
  )
}
