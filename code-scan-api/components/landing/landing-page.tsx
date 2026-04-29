'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { HeroScene } from '@/components/hero-scene'
import { Card } from '@/components/ui/card'
import { Shield, Zap, BarChart3, Lock } from 'lucide-react'
import { motion } from 'framer-motion'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="bg-background border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity">
            <Shield className="w-6 h-6 text-violet-500" />
            <span>CodeScan</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing</a>
            <a href="#docs" className="hover:text-cyan-400 transition-colors">Docs</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/auth/signin">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20">
        <div className="absolute inset-0 z-0">
          <HeroScene />
          <div className="absolute inset-0 bg-linear-to-br from-violet-500/5 to-cyan-500/5" />
        </div>

        <motion.div
          className="relative z-10 text-center px-4 max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">Advanced Code Security</h1>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Automated vulnerability scanning and security analysis for your codebase. Detect threats before they become problems.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-white px-8">
                Start Free Trial
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-slate-600 hover:bg-slate-900/50 px-8">
              View Demo
            </Button>
          </div>
        </motion.div>
      </section>

      <section id="features" className="py-24 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Powerful Security Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'Threat Detection', desc: 'Real-time vulnerability identification' },
              { icon: Zap, title: 'Fast Scanning', desc: 'Analyze codebases in seconds' },
              { icon: BarChart3, title: 'Detailed Reports', desc: 'Comprehensive security insights' },
              { icon: Lock, title: 'Compliance', desc: 'Meet industry security standards' },
            ].map((feature, i) => (
              <Card key={i} className="bg-slate-900/50 border-slate-800 p-6 hover:border-slate-700 hover:bg-slate-900/70 transition-all h-full">
                <feature.icon className="w-10 h-10 text-violet-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Simple, Transparent Pricing</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Pro', price: '$99', desc: 'Perfect for growing teams', features: ['Up to 10 repositories', 'Daily scans', 'Email support'] },
              { name: 'Enterprise', price: 'Custom', desc: 'For large organizations', features: ['Unlimited repositories', 'Real-time scanning', 'Priority support', 'Custom integrations'], highlight: true },
              { name: 'Custom', price: '—', desc: 'Tailored solutions', features: ['Everything in Enterprise', 'Dedicated account manager', 'SLA guarantee'] },
            ].map((plan, i) => (
              <Card
                key={i}
                className={`p-8 flex flex-col transition-all ${plan.highlight ? 'bg-violet-600/10 border-violet-500/50' : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}`}
              >
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold mb-2">{plan.price}</div>
                <p className="text-slate-400 mb-6 text-sm">{plan.desc}</p>
                <ul className="flex-1 space-y-2 mb-6">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="text-sm text-slate-300">✓ {feature}</li>
                  ))}
                </ul>
                <Button className={plan.highlight ? 'bg-violet-600 hover:bg-violet-700 text-white' : 'bg-slate-800 hover:bg-slate-700'}>
                  Get Started
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-900/50 border-t border-slate-800 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4 font-bold text-lg">
                <Shield className="w-5 h-5 text-violet-500" />
                <span>CodeScan</span>
              </div>
              <p className="text-sm text-slate-400">Advanced code security for modern teams.</p>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
            <p>&copy; 2024 CodeScan. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}