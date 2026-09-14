import * as React from "react"
import { Link } from "@tanstack/react-router"
import {
  ChartPieSliceIcon,
  IdentificationCardIcon,
  CalculatorIcon,
  CalendarCheckIcon,
  ShieldCheckIcon,
  GearIcon,
  CaretDownIcon,
  CaretRightIcon,
  UsersIcon,
} from "@phosphor-icons/react"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarRail,
  Avatar,
  AvatarFallback,
} from "@hris/ui"

export interface NavSidebarProps {
  open: boolean
  currentPath: string
  user: {
    name?: string
    role?: string
  }
}

export function NavSidebar({ open, currentPath, user }: NavSidebarProps) {
  const [activeTab, setActiveTab] = React.useState<"favorites" | "recently">("favorites")
  const [workforceOpen, setWorkforceOpen] = React.useState(true)
  const [financeOpen, setFinanceOpen] = React.useState(true)
  const [securityOpen, setSecurityOpen] = React.useState(true)

  return (
    <Sidebar side="left" collapsible="icon" open={open}>
      {/* User Profile Header */}
      <SidebarHeader>
        <div className="flex items-center gap-3 px-1.5 py-0.5">
          <Avatar className="h-8 w-8 shrink-0 rounded-full border border-sidebar-border shadow-xs">
            <AvatarFallback className="bg-linear-to-tr from-indigo-500 to-violet-600 text-white text-xs font-semibold">
              {user.name ? user.name.slice(0, 2).toUpperCase() : "BW"}
            </AvatarFallback>
          </Avatar>
          {open && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-sidebar-foreground truncate">
                {user.name || "ByeWind"}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">
                {user.role || "Admin Workspace"}
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* Navigation Items */}
      <SidebarContent>
        {/* Favorites / Recently Section */}
        {open && (
          <SidebarGroup className="px-1">
            <div className="flex items-center gap-4 text-xs font-medium pb-1.5">
              <button
                type="button"
                onClick={() => setActiveTab("favorites")}
                className={`cursor-pointer transition-colors ${
                  activeTab === "favorites"
                    ? "text-sidebar-foreground font-semibold"
                    : "text-muted-foreground/60 hover:text-muted-foreground"
                }`}
              >
                Favorites
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("recently")}
                className={`cursor-pointer transition-colors ${
                  activeTab === "recently"
                    ? "text-sidebar-foreground font-semibold"
                    : "text-muted-foreground/60 hover:text-muted-foreground"
                }`}
              >
                Recently
              </button>
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild size="sm">
                  <Link to="/">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 shrink-0" />
                    <span>Overview</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild size="sm">
                  <Link to="/employees">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 shrink-0" />
                    <span>Workforce</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild size="sm">
                  <Link to="/payroll">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 shrink-0" />
                    <span>Payroll</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}

        {/* Dashboards Group */}
        <SidebarGroup>
          {open && <SidebarGroupLabel>Dashboards</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={currentPath === "/"}
                  title="Overview"
                >
                  <Link to="/">
                    <ChartPieSliceIcon className="h-4 w-4 shrink-0" />
                    {open && <span>Overview</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Pages / Modules Group */}
        <SidebarGroup>
          {open && <SidebarGroupLabel>Pages</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Workforce Submenu */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => open && setWorkforceOpen(!workforceOpen)}
                  isActive={currentPath === "/employees" || currentPath === "/attendance"}
                  title="Workforce"
                  className="justify-between"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <IdentificationCardIcon className="h-4 w-4 shrink-0" />
                    {open && <span>Workforce</span>}
                  </div>
                  {open && (
                    workforceOpen ? (
                      <CaretDownIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                    ) : (
                      <CaretRightIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                    )
                  )}
                </SidebarMenuButton>
                {open && workforceOpen && (
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={currentPath === "/employees"}>
                        <Link to="/employees">
                          <UsersIcon className="h-3.5 w-3.5" />
                          <span>Directory</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={currentPath === "/attendance"}>
                        <Link to="/attendance">
                          <CalendarCheckIcon className="h-3.5 w-3.5" />
                          <span>Attendance</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>

              {/* Finance & Tax Submenu */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => open && setFinanceOpen(!financeOpen)}
                  isActive={currentPath === "/payroll"}
                  title="Finance & Tax"
                  className="justify-between"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CalculatorIcon className="h-4 w-4 shrink-0" />
                    {open && <span>Finance & Tax</span>}
                  </div>
                  {open && (
                    financeOpen ? (
                      <CaretDownIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                    ) : (
                      <CaretRightIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                    )
                  )}
                </SidebarMenuButton>
                {open && financeOpen && (
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={currentPath === "/payroll"}>
                        <Link to="/payroll">
                          <CalculatorIcon className="h-3.5 w-3.5" />
                          <span>Payroll & PPh 21</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>

              {/* Governance & RBAC Submenu */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => open && setSecurityOpen(!securityOpen)}
                  isActive={currentPath === "/users" || currentPath === "/settings"}
                  title="Governance"
                  className="justify-between"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ShieldCheckIcon className="h-4 w-4 shrink-0" />
                    {open && <span>Governance</span>}
                  </div>
                  {open && (
                    securityOpen ? (
                      <CaretDownIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                    ) : (
                      <CaretRightIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                    )
                  )}
                </SidebarMenuButton>
                {open && securityOpen && (
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={currentPath === "/users"}>
                        <Link to="/users">
                          <ShieldCheckIcon className="h-3.5 w-3.5" />
                          <span>RBAC Matrix</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={currentPath === "/settings"}>
                        <Link to="/settings">
                          <GearIcon className="h-3.5 w-3.5" />
                          <span>Settings</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Statutory Compliance Pill */}
        {open && (
          <div className="pt-2 px-1">
            <div className="px-3 py-2 rounded-xl border border-primary/20 bg-primary/5 text-[11px] text-primary flex items-center gap-2">
              <span className="font-medium truncate">PMK 168/2023 TER Active</span>
            </div>
          </div>
        )}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
