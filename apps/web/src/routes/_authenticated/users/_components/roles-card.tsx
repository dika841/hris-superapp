import { Key, UserCheck } from '@phosphor-icons/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from '@hris/ui'
import type { RoleInfo } from '../_hooks/use-rbac-data'

interface RolesCardProps {
  roles: RoleInfo[]
}

export function RolesCard({ roles }: RolesCardProps) {
  return (
    <Card className="glass-panel">
      <CardHeader className="border-b border-border">
        <CardTitle>Configured Roles</CardTitle>
        <CardDescription>System access levels defined in SeaORM backend</CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {roles.map((role) => (
          <div
            key={role.name}
            className={`p-4 rounded-xl border flex items-start justify-between ${
              role.name === 'admin'
                ? 'border-primary/20 bg-primary/10'
                : 'border-border bg-muted/40'
            }`}
          >
            <div>
              <div className="font-semibold text-foreground flex items-center gap-2">
                {role.name === 'admin' ? (
                  <Key className="h-4 w-4 text-primary" />
                ) : (
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                )}
                {role.name}
                <Badge variant={role.badgeVariant}>{role.label}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {role.description}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
