'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { LayoutDashboard, ShieldAlert, Activity, Search, Bell, Code2, HardDrive, Globe, ChevronUp, ChevronDown, CheckCircle2 } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'

// Realistic Mock Data for UI demonstration
const chartData = [
  { time: '10:00', alerts: 2, scanned: 110 },
  { time: '11:00', alerts: 5, scanned: 140 },
  { time: '12:00', alerts: 3, scanned: 180 },
  { time: '13:00', alerts: 14, scanned: 250 },
  { time: '14:00', alerts: 7, scanned: 275 },
  { time: '15:00', alerts: 1, scanned: 320 },
]

const recentScansMocks = [
  { id: 'SCN-8921', type: 'Code', name: 'auth_service.py', status: 'running', conf: '-', date: 'Just now', verdict: 'IN_PROGRESS' },
  { id: 'SCN-8920', type: 'RepoUrl', name: 'backend-api-core', status: 'completed', conf: '98%', date: '12 mins ago', verdict: 'VULNERABLE' },
  { id: 'SCN-8919', type: 'Website', name: 'app.codescan.io', status: 'completed', conf: '99%', date: '45 mins ago', verdict: 'CLEAN' },
  { id: 'SCN-8918', type: 'Code', name: 'payment_gw.js', status: 'completed', conf: '94%', date: '2 hours ago', verdict: 'CLEAN' },
]

export default function DashboardPage() {
  const [stamp, setStamp] = useState('')
  useEffect(() => {
    const i = setInterval(() => {
       const d = new Date()
       setStamp(`${d.toISOString().split('T')[0]} ${d.toTimeString().split(' ')[0]} UTC`)
    }, 1000)
    return () => clearInterval(i)
  }, [])

  const StatusBadge = ({ status, verdict }: { status: string, verdict: string }) => {
    if (status === 'running') {
       return (
         <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-amber)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-amber)]"></span>
            </span>
            <span className="text-xs uppercase tracking-wider text-[var(--color-amber)] font-bold">Scanning</span>
         </div>
       )
    }
    if (verdict === 'VULNERABLE') {
       return (
         <span className="px-3 py-1 bg-[var(--color-rose)]/10 border border-[var(--color-rose)]/30 text-[var(--color-rose)] text-[10px] font-bold uppercase tracking-widest rounded shadow-[0_0_10px_rgba(244,63,94,0.3)]">
           Vulnerable
         </span>
       )
    }
    return (
       <span className="px-3 py-1 bg-[var(--color-emerald)]/10 border border-[var(--color-emerald)]/30 text-[var(--color-emerald)] text-[10px] font-bold uppercase tracking-widest rounded shadow-[0_0_10px_rgba(16,185,129,0.3)]">
         Clean
       </span>
    )
  }

  return (
    <DashboardLayout>
      <motion.div 
        className="space-y-8"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
        }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <div>
             <div className="flex items-center gap-3">
               <h1 className="font-display text-4xl font-bold tracking-tight text-[var(--color-text-main)]">Dashboard</h1>
               <div className="hidden lg:flex items-center px-3 py-1 glass-panel text-[10px] font-mono text-[var(--color-cyan)]">
                 LIVE: {stamp}
               </div>
             </div>
             <p className="text-[var(--color-muted)] font-sans mt-2">Mission control. Real-time threat telemetry active.</p>
           </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Scans', val: '247', trend: '12%', up: true, icon: Activity },
            { label: 'Vulnerabilities Found', val: '89', trend: '3', up: true, alert: true, icon: ShieldAlert },
            { label: 'Clean Scans', val: '158', trend: '64%', up: true, icon: CheckCircle2 },
            { label: 'Avg Confidence', val: '94.2%', trend: '1.8%', up: true, icon: LayoutDashboard },
          ].map((stat, i) => (
             <motion.div 
               key={i}
               variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }}
               className="glass-panel p-6 relative overflow-hidden group cursor-default"
             >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500 group-hover:rotate-12">
                   <stat.icon size={100} className="text-[var(--color-violet)]" />
                </div>
                
                <div className="flex items-start justify-between relative z-10">
                   <div>
                     <p className="text-xs uppercase tracking-widest text-[var(--color-muted)] font-bold mb-2">{stat.label}</p>
                     <h2 className="font-display text-4xl font-bold">{stat.val}</h2>
                   </div>
                   <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-[var(--color-violet)]/20 to-[var(--color-cyan)]/20 border border-[var(--color-cyan)]/30 group-hover:border-[var(--color-cyan)] transition-colors">
                     <stat.icon size={20} className="text-[var(--color-cyan)] group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                   </div>
                </div>
                
                <div className="mt-4 flex items-center gap-2 relative z-10">
                  {stat.up ? <ChevronUp size={16} className={stat.alert ? 'text-[var(--color-rose)]' : 'text-[var(--color-emerald)]'} /> 
                           : <ChevronDown size={16} className="text-[var(--color-rose)]" />}
                  <span className={`text-xs font-bold ${stat.alert ? 'text-[var(--color-rose)]' : 'text-[var(--color-emerald)]'}`}>
                    {stat.up ? '+' : '-'}{stat.trend} {stat.alert ? 'today' : 'this week'}
                  </span>
                </div>
             </motion.div>
          ))}
        </div>

        {/* Chart & Quick Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <motion.div 
            className="lg:col-span-2 glass-panel p-6 flex flex-col"
            variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-display text-xl font-bold">Threat Velocity</h3>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--color-cyan)] shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                <span className="text-xs text-[var(--color-cyan)] uppercase tracking-widest font-mono">Real-time Stream</span>
              </div>
            </div>
            
            <div className="flex-1 min-h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="cyberArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-violet)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--color-cyan)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="time" stroke="var(--color-muted)" tick={{fill: 'var(--color-muted)', fontSize: 12, fontFamily: 'var(--font-mono)'}} axisLine={false} tickLine={false} />
                  <YAxis stroke="var(--color-muted)" tick={{fill: 'var(--color-muted)', fontSize: 12, fontFamily: 'var(--font-mono)'}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(3, 3, 10, 0.95)', border: '1px solid var(--color-cyan)', borderRadius: '12px', boxShadow: '0 0 20px rgba(6,182,212,0.2)' }}
                    itemStyle={{ color: 'var(--color-cyan)', fontFamily: 'var(--font-display)', fontWeight: 700 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="alerts" 
                    stroke="var(--color-cyan)" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#cyberArea)" 
                    activeDot={{ r: 6, fill: 'var(--color-void)', stroke: 'var(--color-cyan)', strokeWidth: 3 }} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <div className="flex flex-col gap-6">
            <motion.div variants={{ hidden: { opacity: 0, x: 30 }, visible: { opacity: 1, x: 0 } }}>
               <h3 className="font-display text-lg font-bold mb-4">Quick Actions</h3>
               <div className="flex flex-col gap-4">
                 {[
                   { icon: Code2, title: 'Scan Code', desc: 'Direct snippet analysis', href: '/scan/new?t=code' },
                   { icon: HardDrive, title: 'Scan Repository', desc: 'GitHub / GitLab / Bitbucket', href: '/scan/new?t=repo' },
                   { icon: Globe, title: 'Scan Website', desc: 'DAST Live Target', href: '/scan/new?t=web' }
                 ].map((action, i) => (
                   <Link href={action.href} key={i}>
                     <div className="glass-panel p-4 flex items-center gap-4 group cursor-pointer hover:border-[var(--color-violet)]/50 transition-all">
                        <div className="w-12 h-12 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-glass)] flex items-center justify-center group-hover:bg-gradient-to-br from-[var(--color-violet)] to-[var(--color-cyan)] group-hover:border-transparent transition-all shadow-lg">
                           <action.icon className="w-5 h-5 text-[var(--color-text-main)]" />
                        </div>
                        <div>
                          <h4 className="font-bold font-display text-sm group-hover:text-[var(--color-cyan)] transition-colors">{action.title}</h4>
                          <p className="text-xs text-[var(--color-muted)]">{action.desc}</p>
                        </div>
                     </div>
                   </Link>
                 ))}
               </div>
            </motion.div>
          </div>
          
        </div>

        {/* Table Area */}
        <motion.div 
          className="glass-panel overflow-hidden"
          variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
        >
          <div className="px-6 py-5 border-b border-[var(--color-border-glass)] flex justify-between items-center bg-[var(--color-surface)]">
             <h3 className="font-display text-lg font-bold">Recent Scans</h3>
             <Link href="/scans" className="text-xs font-bold text-[var(--color-cyan)] uppercase tracking-wider hover:text-[var(--color-cyan-hot)]">View All Tracker &gt;</Link>
          </div>
          
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--color-violet)]/5 border-b border-[var(--color-border-glass)]">
                  <th className="p-4 text-xs font-mono tracking-widest text-[var(--color-muted)] font-bold uppercase">Scan ID</th>
                  <th className="p-4 text-xs font-mono tracking-widest text-[var(--color-muted)] font-bold uppercase">Target</th>
                  <th className="p-4 text-xs font-mono tracking-widest text-[var(--color-muted)] font-bold uppercase">Type</th>
                  <th className="p-4 text-xs font-mono tracking-widest text-[var(--color-muted)] font-bold uppercase">Status</th>
                  <th className="p-4 text-xs font-mono tracking-widest text-[var(--color-muted)] font-bold uppercase text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentScansMocks.map((scan, i) => (
                  <tr key={i} className="border-b border-[var(--color-border-glass)]/30 hover:bg-[var(--color-glass)] transition-colors group cursor-pointer hover:border-l-[2px] border-l-transparent hover:border-l-[var(--color-violet)]">
                    <td className="p-4 font-mono text-xs text-[var(--color-cyan)]">{scan.id}</td>
                    <td className="p-4 font-medium text-sm">{scan.name}</td>
                    <td className="p-4 text-sm text-[var(--color-muted)]">{scan.type}</td>
                    <td className="p-4">
                      <StatusBadge status={scan.status} verdict={scan.verdict} />
                    </td>
                    <td className="p-4 text-xs font-mono text-[var(--color-muted)] text-right group-hover:text-[var(--color-text-main)] transition-colors">{scan.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}

