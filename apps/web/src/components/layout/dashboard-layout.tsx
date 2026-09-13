import * as React from "react"
import { Link, useRouterState } from "@tanstack/react-router"
import {
  SquaresFourIcon,
  UsersIcon,
  CalculatorIcon,
  CalendarCheckIcon,
  ShieldCheckIcon,
  GearIcon,
  SparkleIcon,
  CaretRightIcon,
  SignOutIcon,
} from "@phosphor-icons/react"
import { Button, ThemeToggle } from "@hris/ui"
import { authApi } from "../../libs/api/auth"
import { useAuth, clearAuthSession } from "../../libs/store/auth.store"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouterState()
  const currentPath = router.location.pathname
  const { user } = useAuth()
  const displayUser = user || { name: "Admin", role: "Super Admin" }

  const navItems = [
    { label: "Overview", href: "/", icon: SquaresFourIcon },
    { label: "Employees", href: "/employees", icon: UsersIcon },
    { label: "Payroll & Tax PPh 21", href: "/payroll", icon: CalculatorIcon },
    { label: "Attendance & Leave", href: "/attendance", icon: CalendarCheckIcon },
    { label: "User & RBAC", href: "/users", icon: ShieldCheckIcon },
    { label: "Settings", href: "/settings", icon: GearIcon },
  ]

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch {
      // Ignore network errors during logout
    } finally {
      clearAuthSession()
      window.location.href = "/login"
    }
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 border-r border-sidebar-border bg-sidebar/90 backdrop-blur-xl flex flex-col fixed inset-y-0 z-30 transition-colors duration-200">
        {/* Brand Header */}
        <div className="h-18 flex items-center px-6 border-b border-sidebar-border gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20 text-primary-foreground">
            <SparkleIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold tracking-tight text-foreground flex items-center gap-1.5 text-base">
              HRIS
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                Core
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground">Deterministic & Intelligent</div>
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
                    ? "bg-sidebar-accent text-sidebar-accent-foreground border border-sidebar-border shadow-xs font-semibold"
                    : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 transition-colors ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-sidebar-foreground"}`} />
                <span className="flex-1">{item.label}</span>
                {isActive && <CaretRightIcon className="h-4 w-4 text-primary" />}
              </Link>
            )
          })}
        </nav>

        {/* Tax Compliance Tag */}
        <div className="px-4 py-3 mx-3 mb-4 rounded-xl border border-primary/20 bg-primary/10 text-xs text-primary flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium">PMK 168/2023 TER Active</span>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-sidebar-border bg-sidebar/50 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-semibold text-sm text-primary">
              {displayUser.name ? displayUser.name[0].toUpperCase() : "U"}
            </div>
            <div className="overflow-hidden text-left">
              <div className="text-xs font-semibold text-foreground truncate">{displayUser.name || "Admin"}</div>
              <div className="text-[10px] text-muted-foreground capitalize">{displayUser.role || "Super Admin"}</div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} title="Logout" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
            <SignOutIcon className="h-4 w-4" />
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 min-h-screen flex flex-col">
        <header className="h-18 border-b border-border bg-card/70 backdrop-blur-xl px-8 flex items-center justify-between sticky top-0 z-20 transition-colors duration-200">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Enterprise Workspace</span>
            <span className="opacity-40">/</span>
            <span className="text-foreground font-medium capitalize">
              {currentPath === "/" ? "Dashboard" : currentPath.slice(1)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg border border-border">
              Single-Tenant Mode
            </div>
            <ThemeToggle showLabel={false} />
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
