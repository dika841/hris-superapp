import * as React from "react"
import { useRouterState } from "@tanstack/react-router"
import { SidebarProvider, SidebarInset } from "@hris/ui"
import { authApi } from "../../libs/api/auth"
import { useAuth, clearAuthSession } from "../../libs/store/auth.store"
import { NavSidebar } from "./nav-sidebar"
import { DashboardHeader } from "./dashboard-header"
import { ActivitySidebar } from "./activity-sidebar"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouterState()
  const currentPath = router.location.pathname
  const { user } = useAuth()
  const displayUser = user || { name: "ByeWind", role: "Super Admin", email: "admin@snowui.hris" }

  // State controls for Left & Right sidebars
  const [leftOpen, setLeftOpen] = React.useState(true)
  const [rightOpen, setRightOpen] = React.useState(true)

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
    <SidebarProvider defaultOpen={leftOpen} open={leftOpen} onOpenChange={setLeftOpen}>
      <div className="flex h-screen w-full bg-background text-foreground overflow-hidden selection:bg-primary/20 transition-colors duration-200">
        {/* Left Navigation Sidebar */}
        <NavSidebar open={leftOpen} currentPath={currentPath} user={displayUser} />

        {/* Center Main Inset */}
        <SidebarInset>
          <DashboardHeader
            currentPath={currentPath}
            onToggleLeft={() => setLeftOpen((prev) => !prev)}
            rightOpen={rightOpen}
            onToggleRight={() => setRightOpen((prev) => !prev)}
            user={displayUser}
            onLogout={handleLogout}
          />

          {/* Main Children Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
              {children}
            </div>
          </div>
        </SidebarInset>

        {/* Right Activity & Notification Sidebar */}
        <ActivitySidebar open={rightOpen} />
      </div>
    </SidebarProvider>
  )
}
