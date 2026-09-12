import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { DashboardLayout } from '../components/layout/dashboard-layout'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: () => {
    const token = localStorage.getItem('hris_access_token')
    if (!token) {
      throw redirect({ to: '/login' })
    }
  },
  component: () => (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  ),
})
