'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/providers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Shield, Github, Settings, Users, Code2 } from 'lucide-react'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [projectName, setProjectName] = useState('')
  const [selectedFramework, setSelectedFramework] = useState('react')
  const [teamEmail, setTeamEmail] = useState('')
  const router = useRouter()
  const { user } = useAuth()

  if (!user) {
    router.push('/auth/signin')
    return null
  }

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1)
    } else {
      router.push('/dashboard')
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Shield className="w-7 h-7 text-violet-500" />
            <span className="text-2xl font-bold">CodeScan</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome, {user.name}!</h1>
          <p className="text-slate-400">Let's set up your CodeScan workspace</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded transition-colors ${
                s <= step ? 'bg-violet-500' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Content Card */}
        <Card className="bg-slate-900/50 border-slate-800 p-12">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Shield className="w-12 h-12 text-cyan-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Set Up Your First Project</h2>
                <p className="text-slate-400 mb-6">Give your project a name to get started</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Project Name</label>
                <Input
                  type="text"
                  placeholder="My Awesome Project"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <Code2 className="w-12 h-12 text-cyan-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Select Your Technology</h2>
                <p className="text-slate-400 mb-6">Choose the primary framework you use</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'react', name: 'React', icon: '⚛️' },
                  { id: 'nextjs', name: 'Next.js', icon: '▲' },
                  { id: 'vue', name: 'Vue', icon: '💚' },
                  { id: 'nodejs', name: 'Node.js', icon: '🟢' },
                ].map((fw) => (
                  <button
                    key={fw.id}
                    onClick={() => setSelectedFramework(fw.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedFramework === fw.id
                        ? 'border-violet-500 bg-violet-500/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-2xl mb-2">{fw.icon}</div>
                    <div className="font-medium">{fw.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <Github className="w-12 h-12 text-cyan-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Connect Your Repository</h2>
                <p className="text-slate-400 mb-6">Link your GitHub account to scan repositories</p>
              </div>

              <Button className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white h-12 flex items-center justify-center gap-3">
                <Github className="w-5 h-5" />
                Connect GitHub
              </Button>

              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 text-sm text-slate-300">
                <p>You can also scan code locally or add repositories later.</p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <Users className="w-12 h-12 text-cyan-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Invite Team Members</h2>
                <p className="text-slate-400 mb-6">Add your team to collaborate on security</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Team Member Email</label>
                <Input
                  type="email"
                  placeholder="teammate@example.com"
                  value={teamEmail}
                  onChange={(e) => setTeamEmail(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>

              <Button variant="outline" className="w-full border-slate-700">
                Add Team Member
              </Button>

              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 text-sm text-slate-300">
                <p>You can invite team members later from Settings.</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <Button onClick={handleBack} variant="outline" className="flex-1 border-slate-700">
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              className={`${step === 1 ? 'w-full' : 'flex-1'} bg-violet-600 hover:bg-violet-700 text-white`}
            >
              {step === 4 ? 'Complete Setup' : 'Next'}
            </Button>
          </div>
        </Card>

        {/* Skip Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-slate-400 hover:text-slate-300 text-sm"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}
