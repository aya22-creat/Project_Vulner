'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthScene } from '@/components/3d/auth-scene'
import { Shield, Mail, Lock, User as UserIcon, CheckCircle2, Github } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth-store'

// We define custom Glitch Text effect via CSS inline or mapping
function GlitchText({ text }: { text: string }) {
  const [isGlitching, setIsGlitching] = useState(false)
  useEffect(() => {
    const triggerGlitch = () => {
      setIsGlitching(true)
      setTimeout(() => setIsGlitching(false), 200)
    }
    const interval = setInterval(triggerGlitch, 4000)
    return () => clearInterval(interval)
  }, [])
  
  return (
    <h1 className="relative font-display text-6xl font-[800] tracking-widest text-[var(--color-text-main)] mb-4 uppercase">
      {isGlitching ? (
        <span className="animate-pulse">
           <span className="absolute top-0 left-[2px] text-[var(--color-violet)] mix-blend-screen opacity-70 clip-path-glitch-1">{text}</span>
           <span className="absolute top-0 left-[-2px] text-[var(--color-cyan)] mix-blend-screen opacity-70 clip-path-glitch-2">{text}</span>
           {text}
        </span>
      ) : text}
      <style jsx>{`
        .clip-path-glitch-1 { clip-path: inset(10% 0 60% 0); }
        .clip-path-glitch-2 { clip-path: inset(70% 0 10% 0); }
      `}</style>
    </h1>
  )
}

export default function AuthPage() {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)
  const router = useRouter()
  const { login } = useAuthStore()

  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setIsError(false)
    
    setTimeout(() => {
      // Mock auth logic requested
      if (tab === 'signin' && formData.email === 'admin@codescan.io' && formData.password === 'admin123') {
        setIsSuccess(true)
        login('admin', { 
           id: 'admin_01', 
           name: 'Admin', 
           email: 'admin@codescan.io', 
           role: 'admin', 
           plan: 'enterprise' 
        })
        setTimeout(() => router.push('/dashboard'), 800)
      } else if (tab === 'signup' && formData.email && formData.password) {
        setIsSuccess(true)
        login('user', { 
           id: 'user_' + Math.floor(Math.random()*1000), 
           name: formData.name || 'User', 
           email: formData.email, 
           role: 'user', 
           plan: 'free' 
        })
        setTimeout(() => router.push('/dashboard'), 800)
      } else if (tab === 'signin' && formData.email && formData.password) {
         // Generic user login for test
         setIsSuccess(true)
         login('user', { 
            id: 'user_02', 
            name: 'Demo User', 
            email: formData.email, 
            role: 'user', 
            plan: 'pro' 
         })
         setTimeout(() => router.push('/dashboard'), 800)
      } else {
        setIsError(true)
        setIsLoading(false)
      }
    }, 1500)
  }

  const badges = [
    "256-bit AES Encryption",
    "SOC 2 Type II",
    "OWASP Top 10"
  ]

  return (
    <div className="flex min-h-screen bg-[var(--color-void)] overflow-hidden font-sans">
      {/* Left Panel 55% */}
      <div className="hidden lg:flex relative w-[55%] items-center justify-center border-r border-[var(--color-border-glass)] shadow-[5px_0_30px_rgba(124,58,237,0.1)] z-10 overflow-hidden">
        <AuthScene />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-void)] to-transparent opacity-80" />
        
        <div className="relative z-20 max-w-lg text-center mx-auto pointer-events-none p-10 glass-panel border-[var(--color-border-glass)] backdrop-blur-2xl bg-[rgba(10,15,30,0.4)]">
          <GlitchText text="CodeScan" />
          <p className="text-xl text-[var(--color-muted)] mb-10 font-medium">Enterprise-grade security, developer-friendly.</p>
          
          <div className="flex flex-col gap-4 items-center">
            {badges.map((badge, idx) => (
              <motion.div 
                key={idx}
                className="glass-panel px-6 py-3 flex items-center justify-center gap-3 w-[260px]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-2 h-2 rounded-full bg-[var(--color-emerald)] animate-pulse" />
                <span className="font-sans font-semibold text-[var(--color-text-main)] text-sm">{badge}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel 45% */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-20 bg-[var(--color-void)]">
        <motion.div 
          className="w-full max-w-[400px] glass-panel p-8"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Mobile Header */}
          <div className="flex lg:hidden justify-center mb-8">
            <Shield className="w-10 h-10 text-[var(--color-violet)]" />
          </div>

          {/* Pill Tabs */}
          <div className="relative flex bg-[#0d0d1a] rounded-full p-1 mb-10 border border-[var(--color-border-glass)]">
            {/* Animated Tab Background Indicator */}
            <motion.div 
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[var(--color-surface)] border border-[var(--color-border-glass)] rounded-full shadow-[0_0_15px_rgba(124,58,237,0.2)]"
              animate={{ left: tab === 'signin' ? '4px' : '50%' }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
            <button 
              className={`relative flex-1 py-2 text-sm font-bold z-10 transition-colors ${tab === 'signin' ? 'text-[var(--color-text-main)]' : 'text-[var(--color-muted)]'}`}
              onClick={() => { setTab('signin'); setIsError(false) }}
            >
              Sign In
            </button>
            <button 
              className={`relative flex-1 py-2 text-sm font-bold z-10 transition-colors ${tab === 'signup' ? 'text-[var(--color-text-main)]' : 'text-[var(--color-muted)]'}`}
              onClick={() => { setTab('signup'); setIsError(false) }}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="popLayout">
              {tab === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted)] group-focus-within:text-[var(--color-violet)] transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Full Name" 
                      required 
                      className="w-full bg-[#0d0d1a] border border-[var(--color-border-glass)] rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[var(--color-violet)] focus:ring-1 focus:ring-[var(--color-violet)] transition-all font-sans"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted)] group-focus-within:text-[var(--color-violet)] transition-colors" />
              <input 
                type="email" 
                placeholder="Email Address" 
                required 
                className="w-full bg-[#0d0d1a] border border-[var(--color-border-glass)] rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[var(--color-violet)] focus:ring-1 focus:ring-[var(--color-violet)] transition-all font-sans"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted)] group-focus-within:text-[var(--color-violet)] transition-colors" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Password" 
                required 
                className="w-full bg-[#0d0d1a] border border-[var(--color-border-glass)] rounded-xl py-3 pl-12 pr-12 text-sm focus:outline-none focus:border-[var(--color-violet)] focus:ring-1 focus:ring-[var(--color-violet)] transition-all font-sans"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
              <button 
                type="button" 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--color-muted)] hover:text-[var(--color-text-main)]"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>

            <motion.div animate={isError ? { x: [-10, 10, -6, 6, 0] } : {}} transition={{ duration: 0.4 }}>
               <Button 
                 type="submit" 
                 disabled={isLoading || isSuccess}
                 className={`w-full h-12 rounded-xl text-base font-bold transition-all mt-6 relative overflow-hidden ${isSuccess ? 'bg-[var(--color-emerald)]' : 'bg-gradient-to-r from-[var(--color-violet)] to-[var(--color-violet-hot)] border-none'}`}
               >
                 {isLoading && !isSuccess ? (
                   <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                 ) : isSuccess ? (
                   <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                     <CheckCircle2 className="w-6 h-6 text-white" />
                   </motion.div>
                 ) : (
                   <span className="text-[var(--color-text-main)]">{tab === 'signin' ? 'Sign In' : 'Create Account'}</span>
                 )}
               </Button>
            </motion.div>
          </form>

          <div className="relative mt-8 mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--color-border-glass)]"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[rgba(10,15,30,0.65)] px-4 text-[var(--color-muted)] uppercase tracking-widest font-bold">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-12 bg-[#06060c] border-[var(--color-border-glass)] hover:border-[var(--color-violet)] hover:bg-[#06060c] interactive-hover font-bold text-[var(--color-muted)]">
              <Github className="w-4 h-4 mr-2 text-white" /> GitHub
            </Button>
            <Button variant="outline" className="h-12 bg-[#0d0d1a] border-[var(--color-border-glass)] hover:border-[var(--color-cyan)] hover:bg-[#0d0d1a] interactive-hover font-bold text-[var(--color-muted)]">
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.36,22 12.2,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z"/></svg> Google
            </Button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4 text-xs font-medium text-[var(--color-muted)]">
             <Link href="#" className="hover:text-[var(--color-text-main)] transition-colors">Forgot password?</Link>
             <span>•</span>
             <Link href="#" className="hover:text-[var(--color-text-main)] transition-colors">Terms</Link>
             <span>•</span>
             <Link href="#" className="hover:text-[var(--color-text-main)] transition-colors">Privacy</Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
