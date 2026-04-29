'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/button'
import { Shield, Menu, X, LogOut, Settings, LayoutDashboard, Code2, HardDrive, Globe } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
    { icon: Code2, label: 'All Scans', href: '/scans' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ]

  if (user?.role === 'admin') {
    navItems.push({ icon: Shield, label: 'Admin', href: '/admin' })
  }

  return (
    <div className="flex h-screen bg-[var(--color-void)] text-[var(--color-text-main)] overflow-hidden font-sans">
      {/* Sidebar background: #080812 */}
      <aside
        className={`hidden md:flex relative transition-all duration-300 flex-col bg-[#080812] z-50 ${
          sidebarOpen ? 'w-[260px]' : 'w-20'
        }`}
      >
        {/* Animated Sweep Line on right border simulated by pseudo or simple div */}
        <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-[var(--color-violet)] via-transparent to-transparent opacity-50" />

        <div className="p-6 border-b border-white/5 relative">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <Shield className="w-8 h-8 text-[var(--color-violet)] group-hover:drop-shadow-[0_0_8px_rgba(124,58,237,0.8)] transition-all" />
            {sidebarOpen && (
               <div className="flex flex-col">
                 <span className="font-display font-[800] tracking-widest text-lg uppercase text-[var(--color-text-main)] group-hover:text-white transition-colors">CodeScan</span>
                 <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--color-cyan)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               </div>
            )}
          </Link>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
             const active = pathname === item.href
             return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-4 px-4 py-3 rounded-tr-lg rounded-br-lg rounded-tl-sm rounded-bl-sm transition-all group ${
                  active 
                    ? 'bg-[rgba(124,58,237,0.12)] text-white' 
                    : 'text-[var(--color-muted)] hover:text-white hover:bg-white/5'
                }`}
              >
                {active && (
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--color-violet)] shadow-[0_0_8px_rgba(124,58,237,0.8)] rounded-full" />
                )}
                <item.icon className={`w-5 h-5 transition-all ${active ? 'text-[var(--color-violet)] drop-shadow-[0_0_5px_rgba(124,58,237,0.8)]' : 'text-[var(--color-muted)] group-hover:text-[var(--color-cyan)]'}`} />
                {sidebarOpen && <span className="text-sm font-bold tracking-wide">{item.label}</span>}
              </Link>
             )
          })}
        </nav>

        {/* User Card */}
        <div className="p-4 mt-auto border-t border-white/5 relative">
           <div className={`flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-violet)] to-[var(--color-cyan)] p-[2px] cursor-pointer">
                    <div className="w-full h-full bg-[#080812] rounded-full flex items-center justify-center font-display font-bold text-sm">
                       {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                 </div>
                 {sidebarOpen && (
                   <div className="flex flex-col">
                      <span className="text-sm font-display font-bold">{user?.name || 'Administrator'}</span>
                      <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--color-amber)] mt-1">{user?.plan || 'PRO'}</span>
                   </div>
                 )}
              </div>
              {sidebarOpen && (
                 <button onClick={handleLogout} className="text-[var(--color-muted)] hover:text-[var(--color-rose)] transition-colors">
                    <LogOut size={18} />
                 </button>
              )}
           </div>
        </div>

        {/* Toggle Button */}
        <button
           onClick={() => setSidebarOpen(!sidebarOpen)}
           className="absolute top-1/2 -right-3 w-6 h-12 bg-[#080812] border border-white/10 rounded-r-lg flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-cyan)] transition-colors shadow-lg z-20"
        >
           {sidebarOpen ? <X size={14} /> : <Menu size={14} />}
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-0 h-full overflow-y-auto overflow-x-hidden bg-[var(--color-void)] md:pb-0 pb-20">
         <div className="p-6 md:p-10 min-h-full">
            {children}
         </div>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-[70px] bg-[#03030a]/90 backdrop-blur-xl border-t border-white/5 z-50 flex justify-around items-center px-2 pb-safe">
         {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all ${active ? 'text-[var(--color-violet)]' : 'text-[var(--color-muted)]'}`}
              >
                {active && (
                  <motion.div layoutId="mobileTabActive" className="absolute inset-0 bg-[var(--color-violet)]/10 rounded-xl" />
                )}
                <item.icon className="w-5 h-5 relative z-10" />
                <span className="text-[10px] font-bold mt-1 relative z-10">{item.label}</span>
              </Link>
            )
         })}
      </div>
    </div>
  )
}
