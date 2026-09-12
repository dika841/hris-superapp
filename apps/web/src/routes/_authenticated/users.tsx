import { createFileRoute } from '@tanstack/react-router'
import { ShieldCheck, UserCheck, Key } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'

export const Route = createFileRoute('/_authenticated/users')({
  component: UsersRbacPage,
})

function UsersRbacPage() {
  const permissionsList = [
    { key: 'users:read', desc: 'View user accounts & security audit' },
    { key: 'users:write', desc: 'Create, modify, and deactivate accounts' },
    { key: 'employees:read', desc: 'Access employee directory & profiles' },
    { key: 'employees:write', desc: 'Register hires and modify employee data' },
    { key: 'payroll:read', desc: 'Inspect monthly payroll history' },
    { key: 'payroll:calculate', desc: 'Execute PMK 168/2023 TER calculations' },
    { key: 'rbac:manage', desc: 'Configure system roles & permissions' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <ShieldCheck className="h-6 w-6 text-indigo-400" />
          User Management & RBAC Security Matrix
        </h1>
        <p className="text-sm text-slate-400">
          Single-tenant role-based access controls and UU PDP No. 27/2022 compliant permissions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Roles Card */}
        <Card className="glass-panel">
          <CardHeader className="border-b border-slate-800/80">
            <CardTitle>Configured Roles</CardTitle>
            <CardDescription>System access levels defined in SeaORM backend</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/20 flex items-start justify-between">
              <div>
                <div className="font-semibold text-white flex items-center gap-2">
                  <Key className="h-4 w-4 text-indigo-400" />
                  admin
                  <Badge variant="info">Full Access</Badge>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Full administrative authorization, bypassing granular checks.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex items-start justify-between">
              <div>
                <div className="font-semibold text-white flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-slate-400" />
                  employee
                  <Badge variant="default">Standard</Badge>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Self-service access to personal profile, attendance, and payslip.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permissions Matrix */}
        <Card className="glass-panel">
          <CardHeader className="border-b border-slate-800/80">
            <CardTitle>Permissions Catalog</CardTitle>
            <CardDescription>Granular permission scopes evaluated in Axum middleware</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-800/60">
              {permissionsList.map((perm) => (
                <div key={perm.key} className="px-6 py-3.5 flex items-center justify-between">
                  <div>
                    <code className="text-xs font-mono text-indigo-300 font-semibold">{perm.key}</code>
                    <p className="text-xs text-slate-400">{perm.desc}</p>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
