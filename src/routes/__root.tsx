import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { useEffect, useState } from 'react'
import { ThemeProvider } from '../contexts/ThemeContext'
import { SidebarProvider, SidebarTrigger } from '../components/ui/sidebar'
import { AppSidebar } from '../components/AppSidebar'
import { ThemeToggle } from '../components/ThemeToggle'
import { useSidebarState } from '../hooks/useSidebarState'
import { ensureDatabaseInitialized } from '../lib/db/init'
import { validateCalculations } from '../utils/financialCalculations.test'

function RootComponent() {
  const [dbInitialized, setDbInitialized] = useState(false)
  const { defaultOpen, onOpenChange } = useSidebarState()

  // Initialize database on app start
  useEffect(() => {
    ensureDatabaseInitialized()
      .then(() => {
        setDbInitialized(true)
        // Run financial calculations validation in development
        if (import.meta.env.DEV) {
          console.log('Running financial calculations validation...')
          validateCalculations()
        }
      })
      .catch(console.error)
  }, [])

  if (!dbInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Initializing database...</div>
      </div>
    )
  }

  return (
    <ThemeProvider>
      <SidebarProvider defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        <AppSidebar />
        <main className="flex-1 min-h-screen bg-background">
          <div className="flex items-center gap-2 p-4 border-b">
            <SidebarTrigger />
            <div className="flex-1 flex justify-between items-center">
              <h1 className="text-xl md:text-2xl font-bold text-foreground truncate">
                Coffee Cart Financial Dashboard
              </h1>
              <ThemeToggle />
            </div>
          </div>

          <div className="p-4">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </div>
        </main>
        {import.meta.env.DEV && <TanStackRouterDevtools />}
      </SidebarProvider>
    </ThemeProvider>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
