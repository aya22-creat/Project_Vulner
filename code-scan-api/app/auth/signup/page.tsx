'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/providers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Shield, ChevronRight } from 'lucide-react'

export default function SignUpPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    company: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signup } = useAuth()
  const router = useRouter()

  const handleNext = () => {
    if (step === 1) {
      if (!formData.email || !formData.password) {
        setError('Please fill in all fields')
        return
      }
      setError('')
      setStep(2)
    } else if (step === 2) {
      if (!formData.name || !formData.company) {
        setError('Please fill in all fields')
        return
      }
      handleSubmit()
    }
  }

  const handleSubmit = async () => {
    setError('')
    setIsLoading(true)

    try {
      await signup(formData.email, formData.password, formData.name, formData.company)
      router.push('/onboarding')
    } catch (err) {
      setError('Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Shield className="w-7 h-7 text-violet-500" />
            <span className="text-2xl font-bold">CodeScan</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-slate-400">Join CodeScan and secure your code</p>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded transition-colors ${
                s <= step ? 'bg-violet-500' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Form Card */}
        <Card className="bg-slate-900/50 border-slate-800 p-8">
          <form className="space-y-6">
            {step === 1 ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>

                <p className="text-xs text-slate-500">
                  Password must be at least 8 characters
                </p>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <Input
                    type="text"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Company</label>
                  <Input
                    type="text"
                    placeholder="Your Company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    required
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
              </>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              {step === 2 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 border-slate-700"
                >
                  Back
                </Button>
              )}
              <Button
                type="button"
                onClick={handleNext}
                disabled={isLoading}
                className={`flex-1 ${step === 1 ? 'w-full' : ''} bg-violet-600 hover:bg-violet-700 text-white`}
              >
                {isLoading ? (
                  'Creating...'
                ) : step === 1 ? (
                  <>
                    Next <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </div>

            {/* Links */}
            <div className="text-center text-sm text-slate-400">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-cyan-400 hover:text-cyan-300 font-medium">
                Sign in
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
