'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Shield, ShieldAlert, ShieldCheck, Download, Trash2, Cpu, CheckCircle2, ChevronRight, ChevronDown, FileText, FolderOpen, AlertTriangle } from 'lucide-react'
import { MOCK_SCANS, ScanResponse } from '@/lib/mock-data'

export default function ScanDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [scan, setScan] = useState<ScanResponse | null>(null)
  
  useEffect(() => {
    // Locate mock scan
    const found = MOCK_SCANS.find(s => s.id === id) || MOCK_SCANS[0]
    setScan(found)
  }, [id])

  if (!scan) return null

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-24">
        {/* Banner */}
        <div className={`relative overflow-hidden rounded-2xl p-6 md:p-8 flex items-center justify-between shadow-2xl ${
          scan.status === 'running' ? 'bg-gradient-to-r from-[var(--color-amber)]/20 to-transparent border border-[var(--color-amber)]/30' :
          scan.verdict === 'VULNERABLE' ? 'bg-gradient-to-r from-[var(--color-rose)]/20 to-transparent border border-[var(--color-rose)]/30' : 
          'bg-gradient-to-r from-[var(--color-emerald)]/20 to-transparent border border-[var(--color-emerald)]/30'
        }`}>
           {/* Shimmer sweep */}
           <motion.div 
             className="absolute top-0 left-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg]"
             animate={{ x: ['-200%', '300%'] }}
             transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
           />
           
           <div className="flex items-center gap-6 relative z-10">
              {scan.status === 'running' ? (
                 <div className="w-16 h-16 rounded-full bg-[var(--color-amber)]/10 flex items-center justify-center border-2 border-[var(--color-amber)]/50 relative">
                   <span className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-[var(--color-amber)] opacity-50"></span>
                   <Cpu className="text-[var(--color-amber)] w-8 h-8" />
                 </div>
              ) : scan.verdict === 'VULNERABLE' ? (
                 <div className="w-16 h-16 rounded-full bg-[var(--color-rose)]/10 flex items-center justify-center border-2 border-[var(--color-rose)]/50">
                   <ShieldAlert className="text-[var(--color-rose)] w-8 h-8" />
                 </div>
              ) : (
                 <div className="w-16 h-16 rounded-full bg-[var(--color-emerald)]/10 flex items-center justify-center border-2 border-[var(--color-emerald)]/50">
                   <ShieldCheck className="text-[var(--color-emerald)] w-8 h-8" />
                 </div>
              )}
              
              <div>
                <p className="font-mono text-xs text-white/50 tracking-widest uppercase mb-1">{scan.id}</p>
                <h1 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-wide">
                  {scan.status === 'running' ? 'IN PROGRESS...' : 
                   scan.verdict === 'VULNERABLE' ? 'CRITICAL VULNERABILITIES FOUND' : 
                   'NO VULNERABILITIES DETECTED'}
                </h1>
              </div>
           </div>

           <div className="hidden md:flex relative z-10 gap-3">
             <Button variant="outline" className="border-white/20 hover:border-white hover:bg-white/10 text-white gap-2 h-12 px-6">
               <Download size={16} /> Report
             </Button>
           </div>
        </div>

        {/* Top Meta Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {/* Stat Cards */}
           <div className="glass-panel p-5">
             <p className="text-[10px] text-[var(--color-muted)] font-bold uppercase tracking-widest mb-1">Status</p>
             <p className="font-display font-bold text-lg text-[var(--color-text-main)] capitalize">{scan.status}</p>
           </div>
           <div className="glass-panel p-5">
             <p className="text-[10px] text-[var(--color-muted)] font-bold uppercase tracking-widest mb-1">Type</p>
             <p className="font-display font-bold text-lg text-[var(--color-text-main)]">{scan.type}</p>
           </div>
           <div className="glass-panel p-5">
             <p className="text-[10px] text-[var(--color-muted)] font-bold uppercase tracking-widest mb-1">Target</p>
             <p className="font-mono text-xs text-[var(--color-text-main)] truncate mt-1">{scan.name}</p>
           </div>
           <div className="glass-panel p-5 flex items-center justify-between">
             <div>
                <p className="text-[10px] text-[var(--color-muted)] font-bold uppercase tracking-widest mb-1">Confidence</p>
                <p className="font-display font-bold text-lg text-[var(--color-text-main)]">{scan.confidenceScore > 0 ? scan.confidenceScore + '%' : 'N/A'}</p>
             </div>
             {scan.confidenceScore > 0 && (
                <div className="w-10 h-10 relative">
                  <svg className="w-10 h-10 transform -rotate-90">
                     <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                     <motion.circle 
                       cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="4" fill="transparent"
                       strokeDasharray="100"
                       initial={{ strokeDashoffset: 100 }}
                       animate={{ strokeDashoffset: 100 - scan.confidenceScore }}
                       transition={{ duration: 1.5, ease: "easeOut" }}
                       className={scan.confidenceScore > 90 ? 'text-[var(--color-emerald)]' : scan.confidenceScore > 70 ? 'text-[var(--color-amber)]' : 'text-[var(--color-rose)]'}
                     />
                  </svg>
                </div>
             )}
           </div>
        </div>

        {/* Context-Aware Views */}
        {scan.type === 'Code' && <CodeResultView scan={scan} />}
        {scan.type === 'RepoUrl' && <RepoResultView scan={scan} />}
        {scan.type === 'Website' && <LiveResultView scan={scan} />}

      </div>
    </DashboardLayout>
  )
}

function TypewriterText({ text, speed = 25 }: { text: string, speed?: number }) {
  const [content, setContent] = useState('')
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
       setContent(text.substring(0, i+1))
       i++
       if (i >= text.length) clearInterval(t)
    }, speed)
    return () => clearInterval(t)
  }, [text, speed])
  return <span>{content}</span>
}

function CodeResultView({ scan }: { scan: ScanResponse }) {
  if (!scan.code) return null
  
  // Quick Mock to find a red line based on SQL/Eval keywords in the code string
  const lines = scan.code.split('\n')
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <div className="glass-panel overflow-hidden">
         <div className="border-b border-[var(--color-border-glass)] bg-[var(--color-surface)] px-4 py-3 flex items-center gap-3">
           <FileText className="w-4 h-4 text-[var(--color-muted)]" />
           <span className="font-mono text-xs font-bold text-[var(--color-text-main)]">Target Snippet</span>
         </div>
         <div className="bg-[#06060c] font-mono text-sm overflow-x-auto max-h-[500px] overflow-y-auto">
           {lines.map((l, i) => {
             const isVuln = l.includes('SELECT *') || l.includes('eval(') || l.includes('move_uploaded_file') || l.includes('explicitChildren')
             return (
               <div key={i} className={`flex px-2 py-1 relative hover:bg-white/5 transition-colors ${isVuln ? 'bg-[rgba(244,63,94,0.08)] border-l-2 border-[var(--color-rose)]' : ''}`}>
                 <span className="w-8 text-[var(--color-muted)] select-none text-right pr-4 text-xs">{i+1}</span>
                 <span className={`whitespace-pre ${isVuln ? 'text-[var(--color-rose)]' : 'text-slate-300'}`}>{l}</span>
                 {isVuln && (
                   <AlertTriangle className="absolute right-4 w-4 h-4 text-[var(--color-rose)] animate-pulse" />
                 )}
               </div>
             )
           })}
         </div>
      </div>

      {scan.aiRawResponse && (
         <motion.div 
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           className="glass-panel p-6 relative overflow-hidden"
         >
            <div className="absolute top-0 right-0 p-4">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-violet-hot)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--color-violet)]"></span>
              </span>
            </div>
            <h3 className="font-display font-bold text-xl mb-4 text-[var(--color-violet-hot)]">AI Security Analysis</h3>
            <div className="font-sans text-sm leading-relaxed text-[var(--color-muted)] min-h-[150px]">
               <TypewriterText text={scan.aiRawResponse} />
            </div>
         </motion.div>
      )}
    </div>
  )
}

function RepoResultView({ scan }: { scan: ScanResponse }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
       <div className="glass-panel p-4 lg:col-span-1 border-t-2 border-t-[var(--color-cyan)] max-h-[500px] overflow-y-auto">
          <h3 className="font-display font-bold text-sm uppercase tracking-widest text-[var(--color-muted)] mb-4">File Tree</h3>
          <div className="space-y-1">
             {scan.resultsJson?.files?.map((f: any, i: number) => (
                <div key={i} className={`flex flex-col border border-[var(--color-border-glass)] rounded-lg p-2 ${f.isVuln ? 'bg-[var(--color-rose)]/5 border-[var(--color-rose)]/20' : 'bg-transparent'}`}>
                   <div className="flex items-center gap-2 cursor-pointer p-1">
                      {f.isVuln ? <AlertTriangle className="w-4 h-4 text-[var(--color-rose)]" /> : <FileText className="w-4 h-4 text-[var(--color-muted)]" />}
                      <span className={`font-mono text-xs font-bold ${f.isVuln ? 'text-[var(--color-rose)]' : 'text-slate-300'}`}>{f.name}</span>
                   </div>
                </div>
             )) || (
               <div className="text-[var(--color-muted)] text-sm italic p-4 text-center">Repository tree processing unavailable</div>
             )}
          </div>
       </div>

       <div className="glass-panel lg:col-span-2 p-6 flex flex-col items-center justify-center min-h-[400px]">
          {scan.aiRawResponse ? (
             <div className="w-full h-full text-left">
               <h3 className="font-display font-bold text-xl mb-4 text-[var(--color-text-main)]">Cross-File Analysis</h3>
               <p className="font-mono text-sm leading-relaxed text-[var(--color-muted)] bg-[#04040a] p-4 rounded-xl border border-[var(--color-border-glass)]">
                  <TypewriterText text={scan.aiRawResponse} />
               </p>
             </div>
          ) : (
            <div className="text-center opacity-50">
               <Shield className="w-16 h-16 mx-auto text-[var(--color-muted)] mb-4" />
               <p className="font-display">Select a file to view analysis</p>
            </div>
          )}
       </div>
    </div>
  )
}

function LiveResultView({ scan }: { scan: ScanResponse }) {
  if (!scan.resultsJson) return (
     <div className="glass-panel p-12 text-center text-white/50">Details currently unavailable.</div>
  )

  const { critical, high, medium, low, findings } = scan.resultsJson

  return (
    <div className="space-y-6">
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel border-b-4 border-b-[var(--color-rose)] p-4 flex justify-between items-end">
            <span className="text-[10px] uppercase font-bold text-[var(--color-muted)]">Critical</span>
            <span className="font-display text-4xl text-[var(--color-rose)] font-bold">{critical}</span>
          </div>
          <div className="glass-panel border-b-4 border-b-[var(--color-amber)] p-4 flex justify-between items-end">
            <span className="text-[10px] uppercase font-bold text-[var(--color-muted)]">High</span>
            <span className="font-display text-4xl text-[var(--color-amber)] font-bold">{high}</span>
          </div>
          <div className="glass-panel border-b-4 border-b-[#eab308] p-4 flex justify-between items-end">
            <span className="text-[10px] uppercase font-bold text-[var(--color-muted)]">Medium</span>
            <span className="font-display text-4xl text-[#eab308] font-bold">{medium}</span>
          </div>
          <div className="glass-panel border-b-4 border-b-[var(--color-cyan)] p-4 flex justify-between items-end">
            <span className="text-[10px] uppercase font-bold text-[var(--color-muted)]">Low</span>
            <span className="font-display text-4xl text-[var(--color-cyan)] font-bold">{low}</span>
          </div>
       </div>

       {findings && findings.length > 0 && (
         <div className="space-y-4 pt-6">
            <h3 className="font-display font-bold text-xl uppercase tracking-widest text-[var(--color-text-main)] mb-6">Detailed Findings</h3>
            {findings.map((f: any, i: number) => (
               <div key={i} className="glass-panel p-6 border-l-[3px] border-l-[var(--color-amber)]">
                  <div className="flex justify-between items-start mb-4">
                     <h4 className="font-display font-bold text-lg">{f.title}</h4>
                     <span className="px-3 py-1 bg-[var(--color-amber)]/10 text-[var(--color-amber)] text-[10px] font-bold uppercase rounded-full border border-[var(--color-amber)]/30">
                       {f.severity}
                     </span>
                  </div>
                  <p className="text-sm font-sans text-[var(--color-muted)] mb-4">{f.description}</p>
                  
                  <div className="bg-[#0a1012] border border-[var(--color-emerald)]/10 p-4 rounded-xl">
                     <span className="text-xs uppercase font-bold text-[var(--color-emerald)] block mb-2 tracking-widest">Remediation</span>
                     <p className="text-sm text-slate-300 font-mono">{f.solution}</p>
                  </div>
                  <div className="mt-4 flex gap-2">
                     <span className="px-2 py-1 bg-[var(--color-void)] text-[var(--color-muted)] font-mono text-[10px] rounded border border-[var(--color-border-glass)]">{f.cwe}</span>
                  </div>
               </div>
            ))}
         </div>
       )}
    </div>
  )
}
