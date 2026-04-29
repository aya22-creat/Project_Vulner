'use client'

import React from 'react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { RouteGuard } from '@/components/route-guard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Github, Plus } from 'lucide-react'

function RepositoriesContent() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Repositories</h1>
            <p className="text-slate-400 mt-2">Connect and manage your code repositories</p>
          </div>
          <Button className="bg-violet-600 hover:bg-violet-700 text-white flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Connect Repository
          </Button>
        </div>

        {/* GitHub Connection Card */}
        <Card className="bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border-violet-500/30 p-12 text-center">
          <Github className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">Connect GitHub</h3>
          <p className="text-slate-400 mb-6">
            Connect your GitHub account to automatically scan your repositories
          </p>
          <Button className="bg-violet-600 hover:bg-violet-700">
            <Github className="w-4 h-4 mr-2" />
            Connect GitHub
          </Button>
        </Card>

        {/* Empty State */}
        <Card className="bg-slate-900/50 border-slate-800 p-12 text-center">
          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Github className="w-6 h-6 text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No repositories connected</h3>
          <p className="text-slate-400 mb-6">
            Connect your GitHub account to get started with automated scanning
          </p>
          <Button className="bg-violet-600 hover:bg-violet-700">Connect Repository</Button>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default function Repositories() {
  return (
    <RouteGuard>
      <RepositoriesContent />
    </RouteGuard>
  )
}
