import { createFileRoute } from '@tanstack/react-router'
import { ShieldCheck } from '@phosphor-icons/react'
import { useRbacData } from './_hooks/use-rbac-data'
import { RolesCard } from './_components/roles-card'
import { PermissionsMatrix } from './_components/permissions-matrix'

export const Route = createFileRoute('/_authenticated/users/')({
  component: UsersRbacPage,
})

function UsersRbacPage() {
  const { roles, permissions } = useRbacData()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          <ShieldCheck className="h-6 w-6 text-primary" />
          User Management & RBAC Security Matrix
        </h1>
        <p className="text-sm text-muted-foreground">
          Single-tenant role-based access controls and UU PDP No. 27/2022 compliant permissions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RolesCard roles={roles} />
        <PermissionsMatrix permissions={permissions} />
      </div>
    </div>
  )
}
