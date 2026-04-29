'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { RouteGuard } from '@/components/route-guard'
import { useScans } from '@/components/providers'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, Search, Filter, Trash2 } from 'lucide-react'

function ScansContent() {
  const { scans, deleteScan } = useScans()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredScans = scans.filter((scan) => {
    const matchesSearch = scan.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || scan.status === filterStatus
    return matchesSearch && matchesFilter
  })

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Scans</h1>
            <p className="text-slate-400 mt-2">Manage all your code security scans</p>
          </div>
          <Link href="/dashboard/scans/new">
            <Button className="bg-violet-600 hover:bg-violet-700 text-white flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Scan
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
            <Input
              placeholder="Search scans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 pl-10"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'completed', 'running', 'failed'].map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus(status)}
                className={filterStatus === status ? 'bg-violet-600 border-violet-600' : 'border-slate-700'}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Scans List */}
        {filteredScans.length > 0 ? (
          <Card className="bg-slate-900/50 border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-800/30">
                    <th className="text-left p-4 font-medium text-slate-300">Scan Name</th>
                    <th className="text-left p-4 font-medium text-slate-300">Type</th>
                    <th className="text-left p-4 font-medium text-slate-300">Status</th>
                    <th className="text-left p-4 font-medium text-slate-300">Issues</th>
                    <th className="text-left p-4 font-medium text-slate-300">Critical</th>
                    <th className="text-left p-4 font-medium text-slate-300">Date</th>
                    <th className="text-left p-4 font-medium text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredScans.map((scan) => (
                    <tr key={scan.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 font-medium">
                        <Link href={`/dashboard/scans/${scan.id}`} className="hover:text-cyan-400">
                          {scan.name}
                        </Link>
                      </td>
                      <td className="p-4 text-slate-400">{scan.type}</td>
                      <td className="p-4">
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${
                            scan.status === 'completed'
                              ? 'bg-green-500/20 text-green-400'
                              : scan.status === 'running'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {scan.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold">{scan.issueCount}</span>
                      </td>
                      <td className="p-4">
                        {scan.critical > 0 ? (
                          <span className="text-red-400 font-semibold">{scan.critical}</span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="p-4 text-slate-400 text-sm">
                        {new Date(scan.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 flex gap-2">
                        <Link href={`/dashboard/scans/${scan.id}`} className="text-cyan-400 hover:text-cyan-300 text-sm">
                          View
                        </Link>
                        <button
                          onClick={() => deleteScan(scan.id)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <Card className="bg-slate-900/50 border-slate-800 p-12 text-center">
            <Filter className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm || filterStatus !== 'all' ? 'No scans found' : 'No scans yet'}
            </h3>
            <p className="text-slate-400 mb-6">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first scan to analyze your code security'}
            </p>
            <Link href="/dashboard/scans/new">
              <Button className="bg-violet-600 hover:bg-violet-700">Create Scan</Button>
            </Link>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

export default function Scans() {
  return (
    <RouteGuard>
      <ScansContent />
    </RouteGuard>
  )
}
