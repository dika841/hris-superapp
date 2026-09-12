import * as React from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Users,
  Calculator,
  CalendarCheck,
  ShieldCheck,
  Settings,
  LogOut,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import { Button } from '../ui/button'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouterState()
  const currentPath = router.location.pathname
  const user = JSON.parse(localStorage.getItem('hris_user') || '{"name":"Admin","role":"admin"}')

  const navItems = [
    { label: 'Overview', href: '/', icon: LayoutDashboard },
    { label: 'Employees', href: '/employees', icon: Users },
    { label: 'Payroll & Tax PPh 21', href: '/payroll', icon: Calculator },
    { label: 'Attendance & Leave', href: '/attendance', icon: CalendarCheck },
    { label: 'User & RBAC', href: '/users', icon: ShieldCheck },
    { label: 'Settings', href: '/settings', icon: Settings },
  ]

  const handleLogout = () => {
    localStorage.removeItem('hris_access_token')
    localStorage.removeItem('hris_user')
    window.location.href = '/login'
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800/80 bg-slate-900/60 backdrop-blur-xl flex flex-col fixed inset-y-0 z-30">
        {/* Brand Header */}
        <div className="h-18 flex items-center px-6 border-b border-slate-800/80 gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-sky-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="font-bold tracking-tight text-white flex items-center gap-1.5 text-base">
              Kana HRIS
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Core
              </span>
            </div>
            <div className="text-[11px] text-slate-400">Deterministic & Intelligent</div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPath === item.href

            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="h-4 w-4 text-indigo-400" />}
              </Link>
            )
          })}
        </nav>

        {/* Tax Compliance Tag */}
        <div className="px-4 py-3 mx-3 mb-4 rounded-xl border border-indigo-500/20 bg-indigo-950/20 text-xs text-indigo-300 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>PMK 168/2023 TER Active</span>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-semibold text-sm text-indigo-400">
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden text-left">
              <div className="text-xs font-semibold text-slate-200 truncate">{user.name || 'Admin'}</div>
              <div className="text-[10px] text-slate-500 capitalize">{user.role || 'Super Admin'}</div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} title="Logout" className="text-slate-400 hover:text-rose-400">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 min-h-screen flex flex-col">
        <header className="h-18 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-xl px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Enterprise Workspace</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-200 font-medium capitalize">
              {currentPath === '/' ? 'Dashboard' : currentPath.slice(1)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/60">
              Single-Tenant Mode
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
