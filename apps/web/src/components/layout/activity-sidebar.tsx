import {
  BugIcon,
  UserPlusIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  Badge,
  Avatar,
  AvatarFallback,
} from "@hris/ui"

export interface ActivitySidebarProps {
  open: boolean
}

// Mock data for Right Sidebar (SnowUI reference)
const notifications = [
  { id: 1, title: "You fixed a bug.", time: "Just now", icon: BugIcon, color: "text-indigo-500 bg-indigo-500/10" },
  { id: 2, title: "New user registered.", time: "59 minutes ago", icon: UserPlusIcon, color: "text-emerald-500 bg-emerald-500/10" },
  { id: 3, title: "You fixed a bug.", time: "12 hours ago", icon: BugIcon, color: "text-indigo-500 bg-indigo-500/10" },
  { id: 4, title: "Andi Lane subscribed.", time: "Today, 11:59 AM", icon: CheckCircleIcon, color: "text-amber-500 bg-amber-500/10" },
]

const activities = [
  { id: 1, title: "Changed the style.", time: "Just now", avatar: "CS" },
  { id: 2, title: "Released a new version.", time: "59 minutes ago", avatar: "NV" },
  { id: 3, title: "Submitted a bug.", time: "12 hours ago", avatar: "SB" },
  { id: 4, title: "Modified tax policy.", time: "Today, 11:59 AM", avatar: "TP" },
]

const contacts = [
  { name: "Natali Craig", role: "HR Lead", initials: "NC" },
  { name: "Drew Cano", role: "Frontend Eng", initials: "DC" },
  { name: "Andi Lane", role: "Tax Specialist", initials: "AL" },
  { name: "Koray Okumus", role: "Compliance", initials: "KO" },
  { name: "Kate Morrison", role: "Payroll Ops", initials: "KM" },
]

export function ActivitySidebar({ open }: ActivitySidebarProps) {
  return (
    <Sidebar
      side="right"
      collapsible="offcanvas"
      open={open}
      className="hidden lg:flex w-72 bg-card/40 backdrop-blur-xl border-l border-border/60"
    >
      <SidebarHeader className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground tracking-tight">Notifications</span>
          <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4">4</Badge>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4 space-y-6">
        {/* Notifications Section */}
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="space-y-2.5">
              {notifications.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.id} className="flex items-start gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-foreground truncate">{item.title}</div>
                      <div className="text-[10px] text-muted-foreground">{item.time}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Activities Section */}
        <SidebarGroup className="border-t border-border/60 pt-4">
          <SidebarGroupLabel className="px-0 mb-2 font-bold text-foreground">Activities</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-2.5">
              {activities.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors">
                  <Avatar className="h-7 w-7 rounded-full border border-border shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                      {item.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-foreground truncate">{item.title}</div>
                    <div className="text-[10px] text-muted-foreground">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Contacts Section */}
        <SidebarGroup className="border-t border-border/60 pt-4">
          <SidebarGroupLabel className="px-0 mb-2 font-bold text-foreground">Contacts</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-2">
              {contacts.map((contact) => (
                <div key={contact.name} className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
                  <Avatar className="h-7 w-7 rounded-full border border-border shrink-0">
                    <AvatarFallback className="bg-muted text-foreground text-[10px] font-medium">
                      {contact.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-foreground truncate">{contact.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{contact.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
