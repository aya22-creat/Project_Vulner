'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { MOCK_SCANS, ScanType, ScanVerdict, ScanStatus } from '@/lib/mock-data'
import { Shield, Search, Copy, CheckSquare, Square, Trash2, Cpu, FilterX } from 'lucide-react'

export default function ScansPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilters, setTypeFilters] = useState<ScanType[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Realistic mock data initialization
  const [scans, setScans] = useState(MOCK_SCANS)

  const toggleTypeFilter = (type: ScanType) => {
    setTypeFilters(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (selectedIds.size === filteredScans.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(filteredScans.map(s => s.id)))
  }

  const filteredScans = useMemo(() => {
    return scans.filter(scan => {
      const matchSearch = scan.name.toLowerCase().includes(searchTerm.toLowerCase()) || scan.id.toLowerCase().includes(searchTerm.toLowerCase())
      const matchType = typeFilters.length === 0 || typeFilters.includes(scan.type)
      const matchStatus = statusFilter === 'All' || scan.status === statusFilter || scan.verdict === statusFilter
      return matchSearch && matchType && matchStatus
    })
  }, [scans, searchTerm, typeFilters, statusFilter])

  const deleteSelected = () => {
    setScans(prev => prev.filter(s => !selectedIds.has(s.id)))
    setSelectedIds(new Set())
  }

  const StatusBadge = ({ scan }: { scan: any }) => {
    if (scan.status === 'running') {
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
    if (scan.status === 'failed') {
       return <span className="px-3 py-1 bg-slate-800/50 border border-slate-700 text-slate-400 text-[10px] font-bold uppercase rounded">Failed</span>
    }
    if (scan.verdict === 'VULNERABLE') {
       return <span className="px-3 py-1 bg-[var(--color-rose)]/10 border border-[var(--color-rose)]/30 text-[var(--color-rose)] text-[10px] font-bold uppercase tracking-widest rounded shadow-[0_0_10px_rgba(244,63,94,0.3)]">Vulnerable</span>
    }
    if (scan.verdict === 'CLEAN') {
       return <span className="px-3 py-1 bg-[var(--color-emerald)]/10 border border-[var(--color-emerald)]/30 text-[var(--color-emerald)] text-[10px] font-bold uppercase tracking-widest rounded shadow-[0_0_10px_rgba(16,185,129,0.3)]">Clean</span>
    }
    return <span className="text-xs text-[var(--color-muted)]">Unknown</span>
  }

  return (
    <DashboardLayout>
       <div className="space-y-6 pb-24 max-w-[1400px] mx-auto">
          <div className="flex justify-between items-center bg-transparent pt-4 pb-2">
            <h1 className="font-display text-4xl font-bold tracking-tight">Scan Registry</h1>
          </div>

          {/* Filters Bar */}
          <div className="glass-panel p-4 flex flex-col md:flex-row justify-between gap-4">
             <div className="relative w-full md:w-96 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)] group-focus-within:text-[var(--color-violet)] transition-colors" />
                <input 
                  type="text"
                  placeholder="Seach by ID or Target Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#03030a] border border-[var(--color-border-glass)] rounded-lg pl-10 pr-4 py-2 text-sm focus:border-[var(--color-violet)] focus:outline-none transition-all text-white font-mono"
                />
             </div>
             
             <div className="flex flex-wrap items-center gap-3">
                {/* Type Chips */}
                <div className="flex items-center gap-2 border-r border-[var(--color-border-glass)] pr-4">
                  {(['Code', 'RepoUrl', 'Website'] as ScanType[]).map(t => (
                     <button
                       key={t}
                       onClick={() => toggleTypeFilter(t)}
                       className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded-full transition-colors border ${typeFilters.includes(t) ? 'bg-[var(--color-violet)]/20 border-[var(--color-violet)] text-[var(--color-violet)] shadow-[0_0_10px_rgba(124,58,237,0.3)]' : 'bg-transparent border-[var(--color-border-glass)] text-[var(--color-muted)] hover:border-white/20'}`}
                     >
                       {t}
                     </button>
                  ))}
                </div>

                {/* Status Dropdown */}
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#03030a] border border-[var(--color-border-glass)] text-[var(--color-text-main)] text-xs uppercase font-bold rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--color-violet)]"
                >
                  <option value="All">All Verdicts</option>
                  <option value="VULNERABLE">Vulnerable</option>
                  <option value="CLEAN">Clean</option>
                  <option value="running">In Progress</option>
                  <option value="failed">Failed</option>
                </select>

                {(searchTerm || typeFilters.length > 0 || statusFilter !== 'All') && (
                  <button 
                    onClick={() => { setSearchTerm(''); setTypeFilters([]); setStatusFilter('All') }}
                    className="text-[var(--color-rose)] text-xs font-bold uppercase hover:text-white transition-colors"
                  >
                    Clear All
                  </button>
                )}
             </div>
          </div>

          {/* Bulk Action Slide-down */}
          <AnimatePresence>
            {selectedIds.size > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                className="glass-panel p-4 flex items-center justify-between border-[var(--color-rose)]/30 bg-[var(--color-rose)]/5"
              >
                 <span className="font-bold text-[var(--color-rose)] text-sm ml-4">{selectedIds.size} row(s) selected</span>
                 <button onClick={deleteSelected} className="flex items-center gap-2 bg-[var(--color-rose)]/20 hover:bg-[var(--color-rose)]/40 text-[var(--color-rose)] px-4 py-2 rounded font-bold text-xs uppercase transition-colors">
                   <Trash2 size={16} /> Delete Selected
                 </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Table Container */}
          <div className="glass-panel overflow-hidden w-full">
            {filteredScans.length === 0 ? (
               <div className="p-24 flex flex-col items-center justify-center text-[var(--color-muted)]">
                  <Shield className="w-24 h-24 mb-6 opacity-20" />
                  <p className="font-display text-2xl font-bold mb-2">No scans found</p>
                  <p className="font-sans text-sm">Adjust filters or start a new scan sequence.</p>
               </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-[var(--color-violet)]/10 border-b border-[var(--color-border-glass)]">
                      <th className="p-4 w-12 text-center text-[var(--color-violet)] cursor-pointer" onClick={selectAll}>
                         {selectedIds.size === filteredScans.length ? <CheckSquare size={16}/> : <Square size={16}/>}
                      </th>
                      <th className="p-4 text-xs font-mono tracking-widest text-[var(--color-muted)] font-bold uppercase">Scan ID</th>
                      <th className="p-4 text-xs font-mono tracking-widest text-[var(--color-muted)] font-bold uppercase">Target</th>
                      <th className="p-4 text-xs font-mono tracking-widest text-[var(--color-muted)] font-bold uppercase">Type</th>
                      <th className="p-4 text-xs font-mono tracking-widest text-[var(--color-muted)] font-bold uppercase">Status</th>
                      <th className="p-4 text-xs font-mono tracking-widest text-[var(--color-muted)] font-bold uppercase">Date</th>
                      <th className="p-4 text-xs font-mono tracking-widest text-[var(--color-muted)] font-bold uppercase text-right">Owner</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                    {filteredScans.map((scan, i) => (
                      <motion.tr 
                        key={scan.id} 
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2, delay: i * 0.05 }}
                        className={`border-b border-[var(--color-border-glass)]/50 transition-colors group cursor-pointer ${selectedIds.has(scan.id) ? 'bg-[var(--color-violet)]/10' : 'hover:bg-[var(--color-glass)]'}`}
                        onClick={(e) => {
                          const target = e.target as HTMLElement
                          if (!target.closest('.checkbox-col') && !target.closest('.copy-col')) {
                            router.push(`/scan/${scan.id}`)
                          }
                        }}
                      >
                        <td className="p-4 text-center checkbox-col" onClick={() => toggleSelect(scan.id)}>
                           <div className="flex justify-center text-[var(--color-muted)] hover:text-[var(--color-violet)] transition-colors">
                             {selectedIds.has(scan.id) ? <CheckSquare size={16} className="text-[var(--color-violet)]"/> : <Square size={16} />}
                           </div>
                        </td>
                        <td className="p-4 font-mono text-xs hidden-copy group/id">
                           <div className="flex items-center gap-2 text-[var(--color-cyan)]">
                             {scan.id.split('-')[0] + '-' + scan.id.split('-')[1]}
                             <div className="copy-col opacity-0 group-hover/id:opacity-100 transition-opacity hover:text-white" onClick={() => navigator.clipboard.writeText(scan.id)}>
                               <Copy size={12} />
                             </div>
                           </div>
                        </td>
                        <td className="p-4 font-medium text-sm text-[var(--color-text-main)] group-hover:text-[var(--color-violet-hot)] transition-colors">{scan.name}</td>
                        <td className="p-4 text-sm font-sans font-bold text-[var(--color-muted)]">{scan.type}</td>
                        <td className="p-4">
                          <StatusBadge scan={scan} />
                        </td>
                        <td className="p-4 font-mono text-xs text-[var(--color-muted)]">{new Date(scan.createdAt).toLocaleString(undefined, {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}</td>
                        <td className="p-4 text-right">
                          <div className="w-6 h-6 rounded-full bg-[var(--color-surface)] border border-[var(--color-border-glass)] ml-auto flex items-center justify-center text-[10px] font-bold">
                            {scan.userId === 'admin_01' ? 'A' : 'U'}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </div>
       </div>
    </DashboardLayout>
  )
}
