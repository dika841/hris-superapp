import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { DashboardLayout } from '../components/layout/dashboard-layout'
import { authApi } from '../libs/api/auth'
import { authStore, setAuthSession, clearAuthSession } from '../libs/store/auth.store'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    if (authStore.state.isAuthenticated && authStore.state.accessToken) {
      return
    }

    try {
      const authData = await authApi.refresh()
      setAuthSession(authData.access_token, authData.user)
    } catch {
      clearAuthSession()
      throw redirect({ to: '/login' })
    }
  },
  component: () => (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  ),
})
