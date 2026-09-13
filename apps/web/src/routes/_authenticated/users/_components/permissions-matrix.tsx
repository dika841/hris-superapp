import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from '@hris/ui'
import type { PermissionScope } from '../_hooks/use-rbac-data'

interface PermissionsMatrixProps {
  permissions: PermissionScope[]
}

export function PermissionsMatrix({ permissions }: PermissionsMatrixProps) {
  return (
    <Card className="glass-panel">
      <CardHeader className="border-b border-border">
        <CardTitle>Permissions Catalog</CardTitle>
        <CardDescription>Granular permission scopes evaluated in Axum middleware</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {permissions.map((perm) => (
            <div key={perm.key} className="px-6 py-3.5 flex items-center justify-between">
              <div>
                <code className="text-xs font-mono text-primary font-semibold">{perm.key}</code>
                <p className="text-xs text-muted-foreground">{perm.desc}</p>
              </div>
              <Badge variant="success">Active</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
