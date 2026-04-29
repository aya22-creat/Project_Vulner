'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Shield, Code2, HardDrive, Globe, GitBranch, Github } from 'lucide-react'

export default function NewScanPage() {
  const [activeTab, setActiveTab] = useState<'code' | 'repo' | 'live'>('code')
  const [isScanning, setIsScanning] = useState(false)
  const [scanMessage, setScanMessage] = useState('Initializing scanner...')
  const router = useRouter()

  const tabs = [
    { id: 'code', label: 'Code Snippet', icon: Code2 },
    { id: 'repo', label: 'Repository', icon: HardDrive },
    { id: 'live', label: 'Live Website', icon: Globe },
  ]

  const handleScan = () => {
    setIsScanning(true)
    
    // Animate messages
    const messages = [
      "Parsing code structure...",
      "Running vulnerability checks...",
      "Generating AI report..."
    ]
    
    let i = 0
    const interval = setInterval(() => {
      setScanMessage(messages[i])
      i++
      if (i >= messages.length) clearInterval(interval)
    }, 800)

    setTimeout(() => {
      // Create random ID for mock
      const mockId = 'SCN-8921-A9F2' 
      router.push(`/scan/${mockId}`)
    }, 3000)
  }

  // State specific to tabs
  const [code, setCode] = useState('')
  const [repoPrivate, setRepoPrivate] = useState(false)
  const [depth, setDepth] = useState('Standard')

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div>
           <h1 className="font-display text-4xl font-bold">New Security Scan</h1>
           <p className="text-[var(--color-muted)] mt-2">Deploy scanning agents to analyze targets for zero-days and logic flaws.</p>
        </div>

        {/* Tab Bar */}
        <div className="flex bg-[var(--color-surface)] border border-[var(--color-border-glass)] rounded-xl p-1 relative w-full overflow-hidden">
           {tabs.map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as 'code' | 'repo' | 'live')}
               className={`relative flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 z-10 transition-colors ${activeTab === tab.id ? 'text-[var(--color-text-main)]' : 'text-[var(--color-muted)] hover:text-white'}`}
             >
               {activeTab === tab.id && (
                 <motion.div 
                   layoutId="activeTabBadge"
                   className="absolute inset-0 bg-[#151525] border border-[var(--color-border-glass)] rounded-lg shadow-[0_0_15px_rgba(124,58,237,0.2)]"
                   transition={{ type: "spring", stiffness: 400, damping: 30 }}
                 />
               )}
               <span className="relative z-20 flex items-center gap-2">
                 <tab.icon size={16} className={activeTab === tab.id ? 'text-[var(--color-cyan)]' : ''} />
                 {tab.label}
               </span>
             </button>
           ))}
        </div>

        {/* Tab Contents */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="glass-panel p-6"
          >
            {activeTab === 'code' && (
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                   <label className="text-sm font-bold uppercase tracking-widest text-[var(--color-muted)]">Source Code</label>
                   <select className="bg-[var(--color-surface)] border border-[var(--color-border-glass)] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-violet)]">
                      <option>Python</option>
                      <option>JavaScript</option>
                      <option>TypeScript</option>
                      <option>PHP</option>
                      <option>Java</option>
                   </select>
                </div>
                <div className="relative border border-[var(--color-border-glass)] rounded-xl overflow-hidden focus-within:border-[var(--color-violet)] transition-colors bg-[#060610] min-h-[300px] flex">
                   {/* Line numbers mock container */}
                   <div className="w-12 bg-[#0a0a14] border-r border-[#1a1a2e] text-right pr-2 py-4 text-[#4a5568] font-mono text-sm select-none">
                     {code.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
                     {code === '' && <div>1</div>}
                   </div>
                   <textarea 
                     className="flex-1 bg-transparent border-none text-white font-mono text-sm p-4 focus:outline-none resize-none leading-relaxed"
                     spellCheck={false}
                     placeholder="def handle_request(req):&#10;  # Paste vulnerable snippet here"
                     value={code}
                     onChange={e => setCode(e.target.value)}
                   />
                   
                   <div className="absolute bottom-4 right-4 flex items-center gap-4 text-xs font-mono text-[var(--color-muted)]">
                      <span className="bg-[#1a1a2e] px-2 py-1 rounded border border-[#2a2a3e]">Cmd+V to paste</span>
                      <span>{code.length} chars / {code.split('\n').length} lines</span>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'repo' && (
              <div className="space-y-6">
                <div>
                   <label className="text-sm font-bold uppercase tracking-widest text-[var(--color-muted)] block mb-2">Git Repository URL</label>
                   <div className="relative">
                     <Github className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)] w-5 h-5" />
                     <input type="text" placeholder="https://github.com/org/repo" className="w-full bg-[#0d0d1a] border border-[var(--color-border-glass)] rounded-xl py-3 pl-12 pr-4 text-sm focus:border-[var(--color-violet)] focus:outline-none text-white transition-colors font-mono" />
                   </div>
                </div>

                <div>
                   <label className="text-sm font-bold uppercase tracking-widest text-[var(--color-muted)] block mb-2">Target Branch (Optional)</label>
                   <div className="relative">
                     <GitBranch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)] w-5 h-5" />
                     <input type="text" placeholder="main" className="w-full bg-[#0d0d1a] border border-[var(--color-border-glass)] rounded-xl py-3 pl-12 pr-4 text-sm focus:border-[var(--color-violet)] focus:outline-none text-white transition-colors font-mono" />
                   </div>
                </div>

                <div className="pt-4 border-t border-[var(--color-border-glass)]">
                  <div className="flex items-center justify-between">
                     <div>
                       <span className="font-bold block">Private Repository</span>
                       <span className="text-xs text-[var(--color-muted)]">Requires a Personal Access Token to clone</span>
                     </div>
                     <button 
                       type="button"
                       role="switch"
                       aria-checked={repoPrivate}
                       onClick={() => setRepoPrivate(!repoPrivate)}
                       className={`w-12 h-6 rounded-full relative transition-colors ${repoPrivate ? 'bg-[var(--color-violet)]' : 'bg-slate-700'}`}
                     >
                       <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${repoPrivate ? 'translate-x-6' : 'translate-x-0'}`} />
                     </button>
                  </div>
                  
                  <AnimatePresence>
                    {repoPrivate && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 overflow-hidden"
                      >
                        <input type="password" placeholder="ghp_xxxxxxxxxxxxxxxxxxx..." className="w-full bg-[#060610] border border-[var(--color-border-glass)] rounded-xl py-3 px-4 text-sm focus:border-[var(--color-violet)] focus:outline-none text-white font-mono" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {activeTab === 'live' && (
              <div className="space-y-6">
                <div className="flex gap-4 p-4 border border-[var(--color-amber)]/30 bg-[var(--color-amber)]/5 rounded-xl border-l-[4px] border-l-[var(--color-amber)]">
                  <Shield className="w-6 h-6 text-[var(--color-amber)]" />
                  <div>
                    <h4 className="font-bold text-[var(--color-amber)] text-sm">Target Authorization</h4>
                    <p className="text-xs text-[var(--color-amber)] opacity-80 mt-1">Only scan targets you own or have explicit permission to test.</p>
                  </div>
                </div>

                <div>
                   <label className="text-sm font-bold uppercase tracking-widest text-[var(--color-muted)] block mb-2">Target Hostname/URL</label>
                   <div className="relative">
                     <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)] w-5 h-5" />
                     <input type="text" placeholder="https://example.com" className="w-full bg-[#0d0d1a] border border-[var(--color-border-glass)] rounded-xl py-3 pl-12 pr-4 text-sm focus:border-[var(--color-violet)] focus:outline-none text-white transition-colors font-mono" />
                   </div>
                </div>

                <div>
                   <label className="text-sm font-bold uppercase tracking-widest text-[var(--color-muted)] block mb-3">Scan Depth</label>
                   <div className="flex gap-4">
                     {['Light', 'Standard', 'Deep'].map(d => (
                       <button
                         key={d}
                         onClick={() => setDepth(d)}
                         className={`flex-1 py-4 border rounded-xl font-bold transition-all ${depth === d ? 'border-[var(--color-violet)] bg-[var(--color-violet)]/10 text-[var(--color-violet)] shadow-[0_0_15px_rgba(124,58,237,0.2)]' : 'border-[var(--color-border-glass)] bg-[var(--color-surface)] text-[var(--color-muted)] hover:border-white/20'}`}
                       >
                         {d}
                       </button>
                     ))}
                   </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Scan CTA */}
        <Button 
          onClick={handleScan}
          disabled={isScanning}
          className={`w-full h-14 rounded-xl text-base font-display font-bold transition-all relative overflow-hidden ${isScanning ? 'bg-[#0a0a14] border border-[var(--color-border-glass)] text-white' : 'bg-gradient-to-r from-[var(--color-violet)] to-[var(--color-violet-hot)] border-none text-white hover:shadow-[0_0_24px_rgba(168,85,247,0.6)]'}`}
        >
           {/* Animated Internal Progress Bar */}
           {isScanning && (
             <motion.div 
               className="absolute top-0 left-0 bottom-0 bg-[var(--color-violet)]/30 border-r border-[var(--color-violet)]"
               initial={{ width: "0%" }}
               animate={{ width: "100%" }}
               transition={{ duration: 3, ease: "linear" }}
             />
           )}
           
           <span className="relative z-10 flex items-center justify-center">
             <AnimatePresence mode="wait">
               {isScanning ? (
                 <motion.span 
                   key={scanMessage}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   transition={{ duration: 0.3 }}
                   className="text-[var(--color-cyan)]"
                 >
                   {scanMessage}
                 </motion.span>
               ) : (
                 <motion.span>INITIALIZE SCAN SEQUENCE</motion.span>
               )}
             </AnimatePresence>
           </span>
        </Button>
      </div>
    </DashboardLayout>
  )
}
