'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Check, X, Plus, Zap } from 'lucide-react'

// Simple animated number component for price change
const AnimatedPrice = ({ price }: { price: string }) => {
  return (
    <div className="flex font-display text-5xl font-bold mb-4 items-end justify-center">
      <span className="text-2xl text-[var(--color-muted)] mb-1 mr-1">$</span>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={price}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
        >
          {price}
        </motion.span>
      </AnimatePresence>
      <span className="text-base text-[var(--color-muted)] font-sans ml-2 mb-2">/mo</span>
    </div>
  )
}

export default function UpgradePage() {
  const [isAnnual, setIsAnnual] = useState(true)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  // Prices based on mock toggle
  const proPrice = isAnnual ? '99' : '129'
  const entPrice = isAnnual ? '499' : '599'

  const faqs = [
    { q: "What happens when I hit my scan limit?", a: "Your scans will be queued in priority mode until the next billing cycle, or you can purchase on-demand scan credits directly from your dashboard." },
    { q: "Do you store my source code?", a: "No. Our agents analyze the code in memory during the execution phase and immediately flush the buffers once the AI JSON report is compiled." },
    { q: "Can I upgrade or downgrade at any time?", a: "Yes, billing is prorated. You can upgrade instantly. Downgrades take effect at the end of your current billing cycle." },
    { q: "What is the difference between CodeScan-v2 and v3?", a: "v3-Ultra introduces massive context windows capable of analyzing entire monolithic repositories at once for cross-file logical vulnerabilities." },
    { q: "Is there a discount for open-source projects?", a: "Yes! If you maintain a recognized open-source library, contact our team for a free Pro license." },
    { q: "Do you offer SLA agreements?", a: "Service Level Agreements with guaranteed uptime and 1-hour priority support response are available exclusively on the Enterprise tier." }
  ]

  return (
    <DashboardLayout>
       <div className="max-w-6xl mx-auto pb-32">
          
          <div className="text-center pt-8 mb-16">
             <h1 className="font-display text-5xl md:text-6xl font-[800] tracking-tight mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-cyan)] via-[var(--color-violet-hot)] to-[var(--color-cyan)] animate-[gradient_6s_linear_infinite] bg-[length:200%_auto]">Upgrade Your Security</span>
             </h1>
             <p className="text-xl text-[var(--color-muted)] max-w-2xl mx-auto font-sans">
                Unlock deep-context scanning, unlimited concurrent pipelines, and zero-day threat intelligence.
             </p>
             
             {/* Billing Toggle */}
             <div className="flex items-center justify-center gap-4 mt-12">
               <span className={`text-sm font-bold ${!isAnnual ? 'text-white' : 'text-[var(--color-muted)]'}`}>Monthly</span>
               <div 
                 onClick={() => setIsAnnual(!isAnnual)}
                 className="w-16 h-8 bg-black border border-[var(--color-border-glass)] rounded-full p-1 cursor-pointer relative"
               >
                 <motion.div 
                   className="w-6 h-6 rounded-full bg-[var(--color-violet)]"
                   animate={{ x: isAnnual ? 32 : 0 }}
                   transition={{ type: "spring", stiffness: 500, damping: 30 }}
                 />
               </div>
               <span className={`text-sm font-bold flex items-center gap-2 ${isAnnual ? 'text-white' : 'text-[var(--color-muted)]'}`}>
                 Annual
                 <span className="px-2 py-1 bg-[var(--color-emerald)]/10 border border-[var(--color-emerald)]/30 text-[var(--color-emerald)] rounded text-[10px] uppercase">Save 20%</span>
               </span>
             </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center px-4">
             {/* Free Tier */}
             <div className="glass-panel p-8 text-center flex flex-col min-h-[500px]">
                <h3 className="font-display text-xl font-bold mb-2">Community</h3>
                <p className="text-[var(--color-muted)] text-sm mb-8 h-10">For individual developers testing the waters.</p>
                <div className="font-display text-5xl font-bold mb-4 flex justify-center items-end">
                   <span className="text-2xl text-[var(--color-muted)] mb-1 mr-1">$</span>0
                </div>
                
                <div className="flex flex-col gap-4 text-sm font-sans text-left mt-8 mb-auto">
                   <p className="flex items-center gap-3"><Check size={16} className="text-[var(--color-emerald)] shrink-0"/> 10 Scans per month</p>
                   <p className="flex items-center gap-3"><Check size={16} className="text-[var(--color-emerald)] shrink-0"/> Light & Standard Depth</p>
                   <p className="flex items-center gap-3"><Check size={16} className="text-[var(--color-emerald)] shrink-0"/> CodeScan-v1-Legacy AI</p>
                   <p className="flex items-center gap-3 text-white/30"><X size={16} className="shrink-0"/> No Concurrent Pipelines</p>
                   <p className="flex items-center gap-3 text-white/30"><X size={16} className="shrink-0"/> No Priority Queue</p>
                </div>
                
                <Button disabled className="w-full h-12 rounded-xl mt-8 bg-white/5 text-[var(--color-muted)]">Current Plan</Button>
             </div>

             {/* PRO Tier (Highlighted) */}
             <div className="relative glass-panel p-8 text-center flex flex-col min-h-[560px] transform scale-105 z-10 border-2 border-transparent" style={{ backgroundClip: 'padding-box', borderImage: 'linear-gradient(45deg, var(--color-cyan), var(--color-violet-hot)) 1' }}>
                {/* Rotating background mesh effect */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                   <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent,var(--color-violet)_0deg,transparent_180deg)] opacity-20 blur-3xl animate-[spin_4s_linear_infinite]" />
                </div>

                <motion.div 
                  className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--color-violet-hot)] text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.8)] flex items-center gap-2"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                   <Zap size={14} /> Most Popular
                </motion.div>
                
                <h3 className="font-display text-2xl font-bold mb-2 pt-4">Professional</h3>
                <p className="text-slate-300 text-sm mb-8 h-10">For startups and autonomous squads requiring agility.</p>
                
                <AnimatedPrice price={proPrice} />

                <div className="flex flex-col gap-4 text-sm font-sans text-left mt-8 mb-auto">
                   <p className="flex items-center gap-3"><Check size={16} className="text-[var(--color-emerald)] shrink-0"/> 1,000 Scans per month</p>
                   <p className="flex items-center gap-3 font-bold"><Check size={16} className="text-[var(--color-emerald)] shrink-0"/> Deep Scanning Engine</p>
                   <p className="flex items-center gap-3 font-bold"><Check size={16} className="text-[var(--color-emerald)] shrink-0"/> CodeScan-v3-Ultra AI</p>
                   <p className="flex items-center gap-3"><Check size={16} className="text-[var(--color-emerald)] shrink-0"/> 5 Concurrent Pipelines</p>
                   <p className="flex items-center gap-3"><Check size={16} className="text-[var(--color-emerald)] shrink-0"/> Pipeline Webhooks & Slack</p>
                </div>

                <Button className="w-full h-14 rounded-xl mt-8 bg-[var(--color-text-main)] text-[var(--color-void)] hover:bg-white text-base font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                   Upgrade to Pro
                </Button>
             </div>

             {/* Enterprise Tier */}
             <div className="glass-panel p-8 text-center flex flex-col min-h-[500px]">
                <h3 className="font-display text-xl font-bold mb-2">Enterprise</h3>
                <p className="text-[var(--color-muted)] text-sm mb-8 h-10">Zero-compromise security for global organizations.</p>
                
                <AnimatedPrice price={entPrice} />
                
                <div className="flex flex-col gap-4 text-sm font-sans text-left mt-8 mb-auto">
                   <p className="flex items-center gap-3"><Check size={16} className="text-[var(--color-cyan)] shrink-0"/> Unlimited Scans</p>
                   <p className="flex items-center gap-3"><Check size={16} className="text-[var(--color-cyan)] shrink-0"/> Dedicated Agent Instances</p>
                   <p className="flex items-center gap-3"><Check size={16} className="text-[var(--color-cyan)] shrink-0"/> Custom AI Fine-Tuning</p>
                   <p className="flex items-center gap-3"><Check size={16} className="text-[var(--color-cyan)] shrink-0"/> Bring Your Own Key (BYOK)</p>
                   <p className="flex items-center gap-3"><Check size={16} className="text-[var(--color-cyan)] shrink-0"/> Priority SLA & Support</p>
                </div>
                
                <Button variant="outline" className="w-full h-12 rounded-xl mt-8 border-[var(--color-cyan)] text-[var(--color-cyan)] hover:bg-[var(--color-cyan)] hover:text-black">
                   Contact Sales
                </Button>
             </div>
          </div>

          {/* FAQ Accordion */}
          <div className="max-w-3xl mx-auto mt-32 space-y-4">
             <div className="text-center mb-12">
               <h2 className="font-display text-3xl font-bold">Frequently Asked Questions</h2>
             </div>
             {faqs.map((faq, i) => (
                <div key={i} className="glass-panel border-x-0 border-t-0 rounded-none border-b border-[var(--color-border-glass)]/50 bg-transparent mb-2">
                   <button 
                     className="w-full text-left py-6 px-4 flex justify-between items-center bg-transparent group"
                     onClick={() => setOpenFaq(openFaq === i ? null : i)}
                   >
                     <span className={`font-bold font-sans transition-colors ${openFaq === i ? 'text-[var(--color-cyan)]' : 'text-slate-200 group-hover:text-white'}`}>{faq.q}</span>
                     <motion.div
                       animate={{ rotate: openFaq === i ? 45 : 0 }}
                       transition={{ duration: 0.2 }}
                       className={`shrink-0 ${openFaq === i ? 'text-[var(--color-cyan)]' : 'text-[var(--color-muted)]'}`}
                     >
                        <Plus size={20} />
                     </motion.div>
                   </button>
                   <AnimatePresence>
                     {openFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden px-4"
                        >
                           <p className="text-[var(--color-muted)] pb-6 leading-relaxed text-sm font-sans">
                              {faq.a}
                           </p>
                        </motion.div>
                     )}
                   </AnimatePresence>
                </div>
             ))}
          </div>

       </div>
       <style jsx>{`
          @keyframes gradient {
             0% { background-position: 0% 50%; }
             100% { background-position: 200% 50%; }
          }
       `}</style>
    </DashboardLayout>
  )
}
