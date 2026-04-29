'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

export function AmbientOverlays() {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="pointer-events-none fixed inset-0 z-[49]"
      >
        {/* Breathing Orbs */}
        <div className="ambient-orb orb-violet" />
        <div className="ambient-orb orb-cyan" />

        {/* Global Scanline Overlay */}
        <div className="scanline" />

        {/* Global Noise Overlay */}
        <div className="noise-overlay" />
      </motion.div>
    </AnimatePresence>
  )
}
