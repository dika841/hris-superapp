import * as React from "react"
import { Link } from "@tanstack/react-router"
import {
  MagnifyingGlassIcon,
  StarIcon,
  ClockClockwiseIcon,
  BellIcon,
  SidebarSimpleIcon,
  GearIcon,
  ShieldCheckIcon,
  SignOutIcon,
} from "@phosphor-icons/react"
import {
  SidebarTrigger,
  Avatar,
  AvatarFallback,
  ThemeToggle,
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@hris/ui"

export interface DashboardHeaderProps {
  currentPath: string
  onToggleLeft: () => void
  rightOpen: boolean
  onToggleRight: () => void
  user: {
    name?: string
    role?: string
    email?: string
  }
  onLogout: () => void
}

function getPageTitle(path: string) {
  switch (path) {
    case "/":
      return "Default"
    case "/employees":
      return "Employee Directory"
    case "/attendance":
      return "Daily Attendance"
    case "/payroll":
      return "Payroll & Tax PPh 21"
    case "/users":
      return "User & RBAC Matrix"
    case "/settings":
      return "System Settings"
    default:
      return path.replace("/", "")
  }
}

export function DashboardHeader({
  currentPath,
  onToggleLeft,
  rightOpen,
  onToggleRight,
  user,
  onLogout,
}: DashboardHeaderProps) {
  const [isStarred, setIsStarred] = React.useState(false)

  return (
    <header className="h-16 border-b border-border/70 bg-card/60 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between shrink-0 z-10 transition-colors">
      {/* Left: Sidebar trigger, star bookmark, breadcrumbs */}
      <div className="flex items-center gap-3">
        <SidebarTrigger onClick={onToggleLeft} />

        <button
          type="button"
          onClick={() => setIsStarred(!isStarred)}
          className="p-1 rounded-md text-muted-foreground hover:text-amber-400 cursor-pointer transition-colors"
          aria-label="Star page"
        >
          <StarIcon
            className={`h-4 w-4 ${isStarred ? "text-amber-400 fill-amber-400" : ""}`}
          />
        </button>

        <nav className="flex items-center gap-2 text-xs text-muted-foreground font-medium truncate">
          <span className="hover:text-foreground cursor-pointer transition-colors">Dashboards</span>
          <span className="opacity-40">/</span>
          <span className="text-foreground font-semibold truncate">
            {getPageTitle(currentPath)}
          </span>
        </nav>
      </div>

      {/* Right: Search, ThemeToggle, History, Notifications, Right Panel Toggle */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Search with '/' hint */}
        <div className="relative hidden md:block w-44 lg:w-56">
          <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search"
            className="w-full h-8 pl-8 pr-7 rounded-lg border border-border bg-muted/40 text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-background transition-all"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-4 select-none items-center justify-center rounded border border-border bg-card px-1 font-mono text-[10px] text-muted-foreground shadow-2xs">
            /
          </kbd>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle showLabel={false} />

        {/* History Button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hidden sm:flex"
          title="Recent Activity"
        >
          <ClockClockwiseIcon className="h-4 w-4" />
        </Button>

        {/* Notifications Button */}
        <Button
          variant="ghost"
          size="sm"
          className="relative h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          title="Toggle Notifications"
          onClick={onToggleRight}
        >
          <BellIcon className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
        </Button>

        {/* Toggle Right Panel (Collapsible to right) */}
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 cursor-pointer transition-colors ${
            rightOpen ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={onToggleRight}
          title="Toggle Right Activity Panel"
        >
          <SidebarSimpleIcon className="h-4 w-4 rotate-180" />
        </Button>

        {/* User Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 ml-1 transition-transform hover:scale-105 active:scale-95"
              aria-label="Open user menu"
            >
              <Avatar className="h-7 w-7 rounded-full border border-border shadow-2xs">
                <AvatarFallback className="bg-linear-to-tr from-indigo-500 to-violet-600 text-white text-[11px] font-semibold">
                  {user.name ? user.name.slice(0, 2).toUpperCase() : "BW"}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-1">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-xs font-semibold leading-none text-foreground">
                  {user.name || "ByeWind"}
                </p>
                <p className="text-[11px] leading-none text-muted-foreground">
                  {user.email || "admin@snowui.hris"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings" className="cursor-pointer flex items-center gap-2">
                <GearIcon className="h-3.5 w-3.5" />
                <span>Account & Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/users" className="cursor-pointer flex items-center gap-2">
                <ShieldCheckIcon className="h-3.5 w-3.5" />
                <span>Security & RBAC</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onLogout}
              className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer flex items-center gap-2"
            >
              <SignOutIcon className="h-3.5 w-3.5" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
