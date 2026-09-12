import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_public')({
  beforeLoad: () => {
    const token = localStorage.getItem('hris_access_token')
    if (token) {
      throw redirect({ to: '/' })
    }
  },
  component: () => <Outlet />,
})
