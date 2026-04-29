"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import {
  backendStatusToUiStatus,
  backendTypeToUiType,
  createBackendScan,
  deleteBackendScan,
  deriveScanName,
  getBackendScans,
  parseResultsReport,
  type BackendScanResponse,
  type UiScanStatus,
  type UiScanType,
} from "@/lib/backend-api"

export interface User {
  id: string
  email: string
  name: string
  company?: string
  role: "user" | "admin"
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string, company: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

export interface Scan {
  id: string
  name: string
  status: UiScanStatus
  type: UiScanType
  createdAt: string
  updatedAt: string
  issueCount: number
  critical: number
  high: number
  medium: number
  low: number
  code?: string | null
  repoUrl?: string | null
  targetUrl?: string | null
  zapScanId?: string | null
  resultsJson?: string | null
  hasVulnerabilities?: boolean | null
  vulnerabilityType?: string | null
  confidenceScore?: number | null
  errorMessage?: string | null
}

export interface CreateScanInput {
  type: UiScanType
  code?: string
  repoUrl?: string
  targetUrl?: string
  branch?: string
  displayName?: string
}

export interface ScanContextType {
  scans: Scan[]
  isLoading: boolean
  refreshScans: () => Promise<void>
  createScan: (input: CreateScanInput) => Promise<Scan>
  updateScan: (id: string, updates: Partial<Scan>) => void
  deleteScan: (id: string) => Promise<void>
}

export const ScanContext = createContext<ScanContextType | undefined>(undefined)

export function useScans() {
  const context = useContext(ScanContext)
  if (!context) {
    throw new Error("useScans must be used within ScanProvider")
  }
  return context
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedAuth = localStorage.getItem("codescan_auth")
    if (storedAuth) {
      try {
        const auth = JSON.parse(storedAuth)
        setUser(auth.user)
      } catch {
        localStorage.removeItem("codescan_auth")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, _password: string) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const newUser: User = {
        id: Math.random().toString(36).slice(2, 11),
        email,
        name: email.split("@")[0],
        role: "user",
      }
      setUser(newUser)
      localStorage.setItem("codescan_auth", JSON.stringify({ user: newUser, token: "mock-token" }))
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, _password: string, name: string, company: string) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const newUser: User = {
        id: Math.random().toString(36).slice(2, 11),
        email,
        name,
        company,
        role: "user",
      }
      setUser(newUser)
      localStorage.setItem("codescan_auth", JSON.stringify({ user: newUser, token: "mock-token" }))
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("codescan_auth")
  }

  return <AuthContext.Provider value={{ user, isLoading, login, signup, logout, isAuthenticated: !!user }}>{children}</AuthContext.Provider>
}

function ScanProvider({ children }: { children: React.ReactNode }) {
  const [scans, setScans] = useState<Scan[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const mapBackendScan = useCallback((scan: BackendScanResponse, displayName?: string): Scan => {
    const report = parseResultsReport(scan.resultsJson)

    return {
      id: scan.id,
      name: displayName || deriveScanName(scan),
      status: backendStatusToUiStatus(scan.status),
      type: backendTypeToUiType(scan.type),
      createdAt: scan.createdAt,
      updatedAt: scan.completedAt || scan.createdAt,
      issueCount: report?.summary.total ?? 0,
      critical: 0,
      high: report?.summary.high ?? 0,
      medium: report?.summary.medium ?? 0,
      low: report?.summary.low ?? 0,
      code: scan.code,
      repoUrl: scan.repoUrl,
      targetUrl: scan.targetUrl,
      zapScanId: scan.zapScanId,
      resultsJson: scan.resultsJson,
      hasVulnerabilities: scan.hasVulnerabilities,
      vulnerabilityType: scan.vulnerabilityType,
      confidenceScore: scan.confidenceScore,
      errorMessage: scan.errorMessage,
    }
  }, [])

  const refreshScans = useCallback(async () => {
    setIsLoading(true)
    try {
      const backendScans = await getBackendScans()
      setScans(backendScans.map((scan) => mapBackendScan(scan)))
    } catch (error) {
      console.error("Failed to load scans from backend", error)
      setScans([])
    } finally {
      setIsLoading(false)
    }
  }, [mapBackendScan])

  useEffect(() => {
    void refreshScans()

    const interval = window.setInterval(() => {
      void refreshScans()
    }, 15000)

    return () => window.clearInterval(interval)
  }, [refreshScans])

  const createScan = useCallback(async (input: CreateScanInput) => {
    const created = await createBackendScan({
      type: input.type === "repository" ? 1 : input.type === "website" ? 2 : 0,
      code: input.code,
      repoUrl: input.repoUrl,
      targetUrl: input.targetUrl,
      branch: input.branch,
    })

    if (!created) {
      throw new Error("Backend did not return a scan record")
    }

    const mapped = mapBackendScan(created, input.displayName)
    setScans((prev: Scan[]) => [mapped, ...prev.filter((scan: Scan) => scan.id !== mapped.id)])
    return mapped
  }, [mapBackendScan])

  const updateScan = (id: string, updates: Partial<Scan>) => {
    setScans((prev: Scan[]) => prev.map((scan: Scan) => (scan.id === id ? { ...scan, ...updates } : scan)))
  }

  const deleteScan = useCallback(async (id: string) => {
    try {
      await deleteBackendScan(id)
    } catch (error) {
      console.warn("Backend delete failed; removing the item from the current view anyway.", error)
    } finally {
      setScans((prev: Scan[]) => prev.filter((scan: Scan) => scan.id !== id))
    }
  }, [])

  const value = useMemo<ScanContextType>(
    () => ({ scans, isLoading, refreshScans, createScan, updateScan, deleteScan }),
    [createScan, deleteScan, isLoading, refreshScans, scans],
  )

  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ScanProvider>{children}</ScanProvider>
    </AuthProvider>
  )
}
