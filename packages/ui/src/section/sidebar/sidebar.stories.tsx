import type { Meta, StoryObj } from '@storybook/react'
import {
  SidebarProvider,
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
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from './sidebar'
import {
  ChartPieSlice,
  Users,
  CalendarCheck,
  Calculator,
  ShieldCheck,
  Gear,
  Snowflake,
} from '@phosphor-icons/react'
import { Avatar, AvatarFallback } from '../../primitives/avatar'

const meta: Meta = {
  title: 'Section/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
}

export default meta

export const DefaultSnowUIStyle: StoryObj = {
  render: () => (
    <SidebarProvider>
      <Sidebar>
        {/* User Header Profile */}
        <SidebarHeader>
          <div className="flex items-center gap-2.5 px-1 py-1">
            <Avatar className="h-8 w-8 rounded-full border border-border">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                BW
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-foreground">ByeWind</span>
              <span className="text-[10px] text-muted-foreground">Admin Workspace</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {/* Favorites Group */}
          <SidebarGroup>
            <div className="flex items-center justify-between px-2 text-[11px] text-muted-foreground">
              <span className="font-medium text-foreground">Favorites</span>
              <span className="text-muted-foreground/60">Recently</span>
            </div>
            <SidebarMenu className="mt-1">
              <SidebarMenuItem>
                <SidebarMenuButton size="sm" className="text-muted-foreground hover:text-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 ml-1" />
                  <span>Overview</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton size="sm" className="text-muted-foreground hover:text-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 ml-1" />
                  <span>Projects</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          {/* Dashboards Group */}
          <SidebarGroup>
            <SidebarGroupLabel>Dashboards</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive>
                    <ChartPieSlice className="h-4 w-4" />
                    <span>Overview</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Pages Group */}
          <SidebarGroup>
            <SidebarGroupLabel>Pages</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Users className="h-4 w-4" />
                    <span>Workforce</span>
                  </SidebarMenuButton>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton isActive>Directory</SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton>Onboarding</SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <CalendarCheck className="h-4 w-4" />
                    <span>Attendance</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Calculator className="h-4 w-4" />
                    <span>Payroll</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Security & RBAC</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Gear className="h-4 w-4" />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer Branding */}
        <SidebarFooter>
          <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
            <Snowflake className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">snowUI</span>
            <span className="text-[10px] text-muted-foreground ml-auto">v1.0</span>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b border-border px-6">
          <SidebarTrigger />
          <span className="text-sm font-medium">Dashboard Overview</span>
        </header>
        <div className="p-6">Content area</div>
      </SidebarInset>
    </SidebarProvider>
  ),
}
