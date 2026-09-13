import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { authStore, setAuthSession } from '../libs/store/auth.store'
import { authApi } from '../libs/api/auth'

export const Route = createFileRoute('/_public')({
  beforeLoad: async () => {
    if (authStore.state.isAuthenticated && authStore.state.accessToken) {
      throw redirect({ to: '/' })
    }

    try {
      const authData = await authApi.refresh()
      setAuthSession(authData.access_token, authData.user)
      throw redirect({ to: '/' })
    } catch (err) {
      if (err && typeof err === 'object' && 'to' in err) {
        throw err
      }
      // Not authenticated, allow viewing login page
    }
  },
  component: () => <Outlet />,
})
