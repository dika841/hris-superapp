import { createFileRoute } from '@tanstack/react-router'
import { Settings, Shield, Database } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'

export const Route = createFileRoute('/_authenticated/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Settings className="h-6 w-6 text-indigo-400" />
          Workspace Configuration
        </h1>
        <p className="text-sm text-slate-400">
          Single-tenant system parameters, security policies, and tax regulation metadata.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-panel">
          <CardHeader className="border-b border-slate-800/80">
            <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold">
              <Shield className="h-4 w-4" />
              Tax & Statutory Compliance
            </div>
            <CardTitle>Indonesian Tax Configuration</CardTitle>
            <CardDescription>Regulatory standards applied across deterministic calculation engines</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-xs text-slate-300">
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">PPh 21 Mechanism:</span>
              <span className="font-semibold text-white">TER (PMK 168/2023)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Overtime Calculation:</span>
              <span className="font-semibold text-white">PP 35/2021 (Factor 1/173)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">BPJS Ketenagakerjaan:</span>
              <span className="font-semibold text-white">JHT (2%), JP (1% Capped 10.04m)</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">BPJS Kesehatan:</span>
              <span className="font-semibold text-white">1% Employee (Capped 12m)</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader className="border-b border-slate-800/80">
            <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold">
              <Database className="h-4 w-4" />
              Architecture & Data Sovereignty
            </div>
            <CardTitle>System Metadata</CardTitle>
            <CardDescription>Engine runtime and compliance standards</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-xs text-slate-300">
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Backend Framework:</span>
              <span className="font-semibold text-white font-mono">Rust 2024 / Axum 0.8 / Tokio</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">ORM & Migrations:</span>
              <span className="font-semibold text-white font-mono">SeaORM 1.1 / sea-orm-migration</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Privacy & Data Protection:</span>
              <span className="font-semibold text-white">UU PDP No. 27/2022 Compliant</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">Password Hashing:</span>
              <span className="font-semibold text-white font-mono">Argon2id (m_cost=19456, t_cost=2)</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
