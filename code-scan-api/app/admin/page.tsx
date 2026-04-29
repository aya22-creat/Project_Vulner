'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { useAuthStore } from '@/store/auth-store'
import { MOCK_USERS, User } from '@/lib/mock-data'
import { Users, Activity, ScanLine, DollarSign, ShieldAlert, Ban, Eye } from 'lucide-react'

// Live Activity Mock Engine
const generateActivity = () => {
   const actions = ['started a Code scan', 'deleted a report', 'upgraded to PRO', 'encountered a Failed scan', 'logged in', 'exported a PDF']
   const users = ['Alice Admin', 'Bob Developer', 'Charlie Code', 'Diana Hack']
   return {
     id: Math.random().toString(),
     user: users[Math.floor(Math.random() * users.length)],
     action: actions[Math.floor(Math.random() * actions.length)],
     time: 'Just now'
   }
}

export default function AdminDashboardPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>(MOCK_USERS)
  const [bannedIds, setBannedIds] = useState<Set<string>>(new Set())
  const [activities, setActivities] = useState<any[]>([])

  // Route protection
  useEffect(() => {
    if (!user || user.role !== 'admin') {
       router.push('/dashboard')
    }
  }, [user, router])

  // Live feed simulation
  useEffect(() => {
    // Initial load
    setActivities([generateActivity(), generateActivity(), generateActivity()])
    
    const interval = setInterval(() => {
       setActivities(prev => {
          const newFeed = [generateActivity(), ...prev]
          if (newFeed.length > 20) newFeed.pop()
          return newFeed
       })
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const toggleBan = (id: string) => {
    setBannedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (!user || user.role !== 'admin') return null

  return (
    <DashboardLayout>
       <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
          
          <div className="flex items-center gap-4">
             <ShieldAlert className="w-10 h-10 text-[var(--color-rose)]" />
             <div>
               <h1 className="font-display text-4xl font-bold tracking-tight text-[var(--color-text-main)]">Admin Root</h1>
               <p className="text-[var(--color-rose)] mt-1 font-bold uppercase tracking-widest text-xs">Superuser Access Granted</p>
             </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Users', val: '1,247', icon: Users, color: 'text-[var(--color-cyan)]' },
              { label: 'Active Today', val: '89', icon: Activity, color: 'text-[var(--color-emerald)]' },
              { label: 'System Scans Today', val: '342', icon: ScanLine, color: 'text-[var(--color-violet)]' },
              { label: 'MRR', val: '$8,420', icon: DollarSign, color: 'text-[var(--color-amber)]' }
            ].map((stat, i) => (
               <div key={i} className="glass-panel p-6 flex justify-between items-center bg-[#080812]">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted)] mb-2">{stat.label}</p>
                    <h2 className="font-display text-4xl font-bold">{stat.val}</h2>
                  </div>
                  <div className={`p-4 rounded-full bg-white/5 ${stat.color}`}>
                     <stat.icon size={24} />
                  </div>
               </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             
             {/* Left Col: Users Table & System Health */}
             <div className="lg:col-span-2 space-y-8">
                
                {/* System Health */}
                <div className="glass-panel p-6">
                   <h3 className="font-display text-xl font-bold mb-6">System Nodes</h3>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['Core API', 'AI Engine', 'DB Cluster', 'Worker Queue'].map((node, i) => (
                         <div key={i} className="border border-[var(--color-border-glass)] rounded-xl p-4 bg-[#0a0a14] flex flex-col items-center text-center">
                            <span className="relative flex h-4 w-4 mb-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-emerald)] opacity-50 p-2" style={{ animationDuration: '2s' }}></span>
                              <span className="relative inline-flex rounded-full h-4 w-4 bg-[var(--color-emerald)]"></span>
                            </span>
                            <span className="font-bold text-sm text-[var(--color-text-main)] mb-1">{node}</span>
                            <span className="text-xs text-[var(--color-emerald)] uppercase tracking-wider font-bold">Operational</span>
                         </div>
                      ))}
                   </div>
                </div>

                {/* Users Table */}
                <div className="glass-panel overflow-hidden">
                   <div className="px-6 py-4 border-b border-[var(--color-border-glass)] flex justify-between items-center bg-[var(--color-surface)]">
                     <h3 className="font-display text-xl font-bold">User Management</h3>
                     <span className="text-xs text-[var(--color-muted)]">{users.length} Active Records</span>
                   </div>
                   <div className="w-full overflow-x-auto max-h-[500px]">
                     <table className="w-full text-left">
                       <thead className="bg-[#03030a] sticky top-0 z-10 border-b border-[var(--color-border-glass)] shadow-md">
                         <tr>
                           <th className="p-4 text-xs font-mono tracking-widest text-[var(--color-muted)] font-bold uppercase">User</th>
                           <th className="p-4 text-xs font-mono tracking-widest text-[var(--color-muted)] font-bold uppercase">Role</th>
                           <th className="p-4 text-xs font-mono tracking-widest text-[var(--color-muted)] font-bold uppercase">Plan</th>
                           <th className="p-4 text-xs font-mono tracking-widest text-[var(--color-muted)] font-bold uppercase text-right">Access</th>
                         </tr>
                       </thead>
                       <tbody>
                         {users.map((u) => {
                           const isBanned = bannedIds.has(u.id)
                           return (
                             <tr key={u.id} className={`border-b border-[var(--color-border-glass)]/20 transition-opacity ${isBanned ? 'opacity-40 bg-slate-900' : 'hover:bg-white/5'}`}>
                               <td className="p-4">
                                  <div className="flex items-center gap-3">
                                     <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${u.role === 'admin' ? 'bg-[var(--color-violet)] text-white' : 'bg-slate-700 text-slate-300'}`}>
                                        {u.name.charAt(0)}
                                     </div>
                                     <div className="flex flex-col">
                                        <span className={`font-bold text-sm ${isBanned ? 'line-through text-slate-500' : 'text-white'}`}>{u.name}</span>
                                        <span className={`text-xs ${isBanned ? 'line-through text-slate-600' : 'text-[var(--color-muted)]'}`}>{u.email}</span>
                                     </div>
                                  </div>
                               </td>
                               <td className="p-4">
                                  {u.role === 'admin' ? (
                                    <span className="px-2 py-1 bg-gradient-to-r from-[var(--color-violet)] to-[var(--color-cyan)] rounded text-[10px] font-bold uppercase text-white shadow-sm">Admin</span>
                                  ) : (
                                    <span className="text-sm text-slate-400 capitalize">{u.role}</span>
                                  )}
                               </td>
                               <td className="p-4">
                                  {u.plan === 'enterprise' ? (
                                    <span className="text-xs font-bold text-[var(--color-cyan)] tracking-wider">Enterprise</span>
                                  ) : u.plan === 'pro' ? (
                                    <span className="text-xs font-bold text-[var(--color-amber)] tracking-wider drop-shadow-md">Pro</span>
                                  ) : (
                                    <span className="text-xs text-slate-500 capitalize">Free</span>
                                  )}
                               </td>
                               <td className="p-4 text-right">
                                  <div className="flex items-center justify-end gap-3 translate-z-0">
                                     <button className="text-[var(--color-cyan)] hover:text-white transition-colors" title="View details"><Eye size={16} /></button>
                                     <button 
                                       className={`${isBanned ? 'text-[var(--color-emerald)]' : 'text-[var(--color-rose)]'} hover:text-white transition-colors`} 
                                       title={isBanned ? 'Restore Access' : 'Ban User'}
                                       onClick={() => toggleBan(u.id)}
                                     >
                                        <Ban size={16} />
                                     </button>
                                  </div>
                               </td>
                             </tr>
                           )
                         })}
                       </tbody>
                     </table>
                   </div>
                </div>
             </div>

             {/* Right Col: Live Activity Feed */}
             <div className="lg:col-span-1">
                <div className="glass-panel p-6 h-[720px] flex flex-col">
                   <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--color-border-glass)]">
                      <h3 className="font-display text-xl font-bold">Live Activity</h3>
                      <div className="flex items-center gap-2">
                        <span className="animate-ping w-2 h-2 rounded-full bg-[var(--color-emerald)]"></span>
                        <span className="text-[10px] text-[var(--color-emerald)] uppercase font-bold tracking-widest">Listening</span>
                      </div>
                   </div>
                   
                   <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                      <AnimatePresence initial={false}>
                         {activities.map((act) => (
                            <motion.div 
                              key={act.id}
                              initial={{ opacity: 0, y: -20, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className="bg-[#0a0a14] border border-[var(--color-border-glass)] p-4 rounded-xl flex gap-4"
                            >
                               <div className="w-8 h-8 rounded-full bg-[var(--color-surface)] flex items-center justify-center shrink-0 border border-white/5 font-bold text-xs text-[var(--color-cyan)]">
                                  {act.user.charAt(0)}
                               </div>
                               <div>
                                  <p className="text-sm font-sans">
                                     <span className="font-bold text-white">{act.user}</span> <span className="text-[var(--color-muted)]">{act.action}</span>
                                  </p>
                                  <span className="text-[10px] font-mono text-[var(--color-violet-hot)] mt-1 block">{act.time}</span>
                               </div>
                            </motion.div>
                         ))}
                      </AnimatePresence>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </DashboardLayout>
  )
}
