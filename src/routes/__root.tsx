import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { useEffect, useState } from 'react'
import { ThemeProvider } from '../contexts/ThemeContext'
import { SidebarProvider, SidebarTrigger, SidebarInset } from '../components/ui/sidebar'
import { AppSidebar } from '../components/AppSidebar'
import { ThemeToggle } from '../components/ThemeToggle'
import { Toaster } from '../components/ui/sonner'
import { ensureDatabaseInitialized } from '../lib/db/init'
import { validateCalculations } from '../utils/financialCalculations.test'
import { useBusinessStore } from '../lib/stores/businessStore'
import { initializeBusinessContext } from '../lib/services/businessContext'
import { BusinessSwitchingLoader } from '../components/BusinessSwitchingLoader'
import { KwaciAcronymCompact } from '../components/KwaciAcronymAnimation'

function RootComponent() {
  const [dbInitialized, setDbInitialized] = useState(false)
  // Remove custom sidebar state management - use built-in shadcn/ui state
  const { initializeStore, getCurrentBusinessId } = useBusinessStore()

  // Initialize database and business store on app start
  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize database first
        await ensureDatabaseInitialized()

        // Then initialize business store
        await initializeStore()

        // Initialize business context for all services
        initializeBusinessContext(() => getCurrentBusinessId())

        setDbInitialized(true)

        // Run financial calculations validation in development
        if (import.meta.env.DEV) {
          console.log('Running financial calculations validation...')
          validateCalculations()
        }
      } catch (error) {
        console.error('Failed to initialize application:', error)
      }
    }

    initialize()
  }, [initializeStore])

  if (!dbInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Initializing database...</div>
      </div>
    )
  }

  return (
    <ThemeProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h1 className="text-xl md:text-2xl font-bold text-foreground truncate">
                  KWACI Grow
                </h1>
                <div className="hidden sm:block">
                  <KwaciAcronymCompact acronymIndex={0} />
                </div>
              </div>
              <ThemeToggle />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="max-w-7xl mx-auto w-full">
              <Outlet />
            </div>
          </div>
        </SidebarInset>
        <Toaster position="top-right" />
        <BusinessSwitchingLoader />
        {import.meta.env.DEV && <TanStackRouterDevtools />}
      </SidebarProvider>
    </ThemeProvider>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
