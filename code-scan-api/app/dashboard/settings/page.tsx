'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { RouteGuard } from '@/components/route-guard'
import { useAuth } from '@/components/providers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Github, Slack, Bell, Lock } from 'lucide-react'

function SettingsContent() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    company: user?.company || '',
    password: '',
    confirmPassword: '',
  })

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'organization', label: 'Organization' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'security', label: 'Security' },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-slate-400 mt-2">Manage your account and preferences</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-800 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-violet-500 text-violet-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="max-w-2xl">
          {activeTab === 'profile' && (
            <Card className="bg-slate-900/50 border-slate-800 p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-6">Profile Settings</h2>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Company</label>
                <Input
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div className="border-t border-slate-800 pt-6">
                <Button className="bg-violet-600 hover:bg-violet-700">Save Changes</Button>
              </div>
            </Card>
          )}

          {activeTab === 'organization' && (
            <div className="space-y-6">
              <Card className="bg-slate-900/50 border-slate-800 p-8">
                <h2 className="text-xl font-bold mb-6">Organization Members</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded">
                    <div>
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-sm text-slate-400">{user?.email}</p>
                    </div>
                    <span className="text-xs px-3 py-1 bg-violet-600 rounded">Owner</span>
                  </div>
                </div>

                <div className="border-t border-slate-800 mt-6 pt-6">
                  <h3 className="font-semibold mb-4">Invite Team Member</h3>
                  <div className="flex gap-2">
                    <Input
                      placeholder="teammate@example.com"
                      type="email"
                      className="bg-slate-800 border-slate-700 text-white flex-1"
                    />
                    <Button className="bg-violet-600 hover:bg-violet-700">Send Invite</Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <Card className="bg-slate-900/50 border-slate-800 p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Github className="w-8 h-8 text-slate-400" />
                  <div>
                    <p className="font-medium">GitHub</p>
                    <p className="text-sm text-slate-400">Connect to scan repositories</p>
                  </div>
                </div>
                <Button variant="outline" className="border-slate-700">
                  Connect
                </Button>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800 p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Slack className="w-8 h-8 text-slate-400" />
                  <div>
                    <p className="font-medium">Slack</p>
                    <p className="text-sm text-slate-400">Get scan notifications</p>
                  </div>
                </div>
                <Button variant="outline" className="border-slate-700">
                  Connect
                </Button>
              </Card>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <Card className="bg-slate-900/50 border-slate-800 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Lock className="w-5 h-5 text-cyan-500" />
                  <h2 className="text-xl font-bold">Change Password</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Current Password</label>
                    <Input
                      type="password"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">New Password</label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Confirm Password</label>
                    <Input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>

                  <Button className="bg-violet-600 hover:bg-violet-700">Update Password</Button>
                </div>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Bell className="w-5 h-5 text-cyan-500" />
                  <h2 className="text-xl font-bold">Notifications</h2>
                </div>

                <div className="space-y-4">
                  {[
                    'Critical vulnerabilities',
                    'Weekly security report',
                    'Team invitations',
                    'Product updates',
                  ].map((notif, i) => (
                    <label key={i} className="flex items-center gap-3 p-3 hover:bg-slate-800/30 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 rounded bg-slate-800 border-slate-700"
                      />
                      <span>{notif}</span>
                    </label>
                  ))}
                </div>

                <Button className="mt-6 bg-violet-600 hover:bg-violet-700">Save Preferences</Button>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function Settings() {
  return (
    <RouteGuard>
      <SettingsContent />
    </RouteGuard>
  )
}
