import { createRootRoute, Outlet } from '@tanstack/react-router'
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <NuqsAdapter>
      <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
        <Outlet />
      </div>
    </NuqsAdapter>
  )
}
