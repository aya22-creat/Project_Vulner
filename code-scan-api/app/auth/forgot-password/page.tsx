'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Shield, ArrowLeft, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    setIsSubmitted(true)
    setIsLoading(false)
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
          <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
          <p className="text-slate-400">
            {isSubmitted ? 'Check your email for reset link' : 'Enter your email to receive a password reset link'}
          </p>
        </div>

        {/* Form Card */}
        <Card className="bg-slate-900/50 border-slate-800 p-8">
          {isSubmitted ? (
            <div className="space-y-6">
              <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-green-400 font-medium mb-2">Check your email</p>
                <p className="text-sm text-green-300">
                  We've sent password reset instructions to {email}
                </p>
              </div>

              <div className="space-y-3 text-sm text-slate-400">
                <p>• The reset link will expire in 1 hour</p>
                <p>• Check your spam folder if you don't see the email</p>
                <p>• Contact support if you need help</p>
              </div>

              <Link href="/auth/signin">
                <Button className="w-full bg-violet-600 hover:bg-violet-700">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>

              <Link href="/auth/signin" className="flex items-center justify-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm">
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
