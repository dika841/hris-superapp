import * as React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  DataTable,
  DataTableColumnHeader,
  type ColumnDef,
} from '@hris/ui'
import type { PermissionScope } from '../_hooks/use-rbac-data'

interface PermissionsMatrixProps {
  permissions: PermissionScope[]
}

export function PermissionsMatrix({ permissions }: PermissionsMatrixProps) {
  const columns = React.useMemo<ColumnDef<PermissionScope>[]>(
    () => [
      {
        accessorKey: 'key',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Scope Key" />,
        cell: ({ row }) => (
          <div>
            <code className="text-xs font-mono text-primary font-semibold">{row.original.key}</code>
            <p className="text-xs text-muted-foreground mt-0.5">{row.original.desc}</p>
          </div>
        ),
      },
      {
        accessorKey: 'active',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: () => <Badge variant="success">Active</Badge>,
      },
    ],
    []
  )

  return (
    <Card className="glass-panel">
      <CardHeader className="border-b border-border">
        <CardTitle>Permissions Catalog</CardTitle>
        <CardDescription>Granular permission scopes evaluated in Axum middleware</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <DataTable
          columns={columns}
          data={permissions}
          searchPlaceholder="Search permission scope..."
          pageSize={5}
          pageSizeOptions={[5, 10, 20]}
          emptyMessage="No permissions configured."
        />
      </CardContent>
    </Card>
  )
}
