'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { RouteGuard } from '@/components/route-guard'
import { useAuth } from '@/components/providers'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Activity, BarChart3, AlertTriangle } from 'lucide-react'

function AdminContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('users')

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-slate-400">You don't have permission to access this page.</p>
        </div>
      </DashboardLayout>
    )
  }

  const mockUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', joinedDate: '2024-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user', joinedDate: '2024-02-20' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user', joinedDate: '2024-03-10' },
    { id: 4, name: 'Alice Williams', email: 'alice@example.com', role: 'user', joinedDate: '2024-03-25' },
  ]

  const tabs = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'activity', label: 'Activity Log', icon: Activity },
    { id: 'system', label: 'System', icon: BarChart3 },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-slate-400 mt-2">Manage users, organizations, and system settings</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-800">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-violet-500 text-violet-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">User Management</h2>
                <p className="text-slate-400 mt-1">Total users: {mockUsers.length}</p>
              </div>
              <Button className="bg-violet-600 hover:bg-violet-700">Add User</Button>
            </div>

            <Card className="bg-slate-900/50 border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-800/30">
                      <th className="text-left p-4 font-medium">Name</th>
                      <th className="text-left p-4 font-medium">Email</th>
                      <th className="text-left p-4 font-medium">Role</th>
                      <th className="text-left p-4 font-medium">Joined</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockUsers.map((user) => (
                      <tr key={user.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                        <td className="p-4 font-medium">{user.name}</td>
                        <td className="p-4 text-slate-400">{user.email}</td>
                        <td className="p-4">
                          <span
                            className={`text-xs px-3 py-1 rounded-full ${
                              user.role === 'admin'
                                ? 'bg-violet-500/20 text-violet-400'
                                : 'bg-slate-700 text-slate-300'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400 text-sm">{user.joinedDate}</td>
                        <td className="p-4 flex gap-2">
                          <button className="text-cyan-400 hover:text-cyan-300 text-sm">Edit</button>
                          <button className="text-red-400 hover:text-red-300 text-sm">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold">Activity Log</h2>
              <p className="text-slate-400 mt-1">Recent system activities and user actions</p>
            </div>

            <Card className="bg-slate-900/50 border-slate-800 p-6">
              <div className="space-y-4">
                {[
                  { action: 'User login', user: 'John Doe', time: '2 minutes ago' },
                  { action: 'New scan created', user: 'Jane Smith', time: '15 minutes ago' },
                  { action: 'User invited', user: 'Alice Williams', time: '1 hour ago' },
                  { action: 'Scan completed', user: 'Bob Johnson', time: '2 hours ago' },
                  { action: 'Settings updated', user: 'John Doe', time: '3 hours ago' },
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-800/30 rounded">
                    <div className="flex items-center gap-3">
                      <Activity className="w-4 h-4 text-cyan-500" />
                      <div>
                        <p className="font-medium">{log.action}</p>
                        <p className="text-xs text-slate-400">{log.user}</p>
                      </div>
                    </div>
                    <span className="text-sm text-slate-500">{log.time}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-900/50 border-slate-800 p-6">
              <h3 className="font-semibold mb-4">API Status</h3>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-green-400">Operational</span>
              </div>
              <p className="text-xs text-slate-400">All systems running normally</p>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800 p-6">
              <h3 className="font-semibold mb-4">Scan Queue</h3>
              <div className="text-2xl font-bold text-cyan-400 mb-2">12</div>
              <p className="text-xs text-slate-400">Scans in progress</p>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800 p-6">
              <h3 className="font-semibold mb-4">Storage Usage</h3>
              <div className="text-2xl font-bold text-violet-400 mb-2">42%</div>
              <p className="text-xs text-slate-400">of total capacity</p>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default function AdminPanel() {
  return (
    <RouteGuard>
      <AdminContent />
    </RouteGuard>
  )
}
