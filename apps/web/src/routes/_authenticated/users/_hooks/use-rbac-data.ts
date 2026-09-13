export interface RoleInfo {
  name: string
  label: string
  badgeVariant: 'info' | 'default'
  description: string
}

export interface PermissionScope {
  key: string
  desc: string
  active: boolean
}

export function useRbacData() {
  const roles: RoleInfo[] = [
    {
      name: 'admin',
      label: 'Full Access',
      badgeVariant: 'info',
      description: 'Full administrative authorization, bypassing granular checks.',
    },
    {
      name: 'employee',
      label: 'Standard',
      badgeVariant: 'default',
      description: 'Self-service access to personal profile, attendance, and payslip.',
    },
  ]

  const permissions: PermissionScope[] = [
    { key: 'users:read', desc: 'View user accounts & security audit', active: true },
    { key: 'users:write', desc: 'Create, modify, and deactivate accounts', active: true },
    { key: 'employees:read', desc: 'Access employee directory & profiles', active: true },
    { key: 'employees:write', desc: 'Register hires and modify employee data', active: true },
    { key: 'payroll:read', desc: 'Inspect monthly payroll history', active: true },
    { key: 'payroll:calculate', desc: 'Execute PMK 168/2023 TER calculations', active: true },
    { key: 'rbac:manage', desc: 'Configure system roles & permissions', active: true },
  ]

  return { roles, permissions }
}
