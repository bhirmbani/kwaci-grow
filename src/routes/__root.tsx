import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { useEffect, useState } from 'react'
import { ThemeProvider } from '../contexts/ThemeContext'
import { SidebarProvider, SidebarTrigger, SidebarInset } from '../components/ui/sidebar'
import { AppSidebar } from '../components/AppSidebar'
import { ThemeToggle } from '../components/ThemeToggle'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { Toaster } from '../components/ui/sonner'
import { ensureDatabaseInitialized } from '../lib/db/init'
import { validateCalculations } from '../utils/financialCalculations.test'
import { useBusinessStore } from '../lib/stores/businessStore'
import { useLanguageStore } from '../lib/stores/languageStore'
import { initializeBusinessContext } from '../lib/services/businessContext'
import { BusinessSwitchingLoader } from '../components/BusinessSwitchingLoader'
import { KwaciAcronymCompact } from '../components/KwaciAcronymAnimation'

function RootComponent() {
  const [dbInitialized, setDbInitialized] = useState(false)
  // Remove custom sidebar state management - use built-in shadcn/ui state
  const { initializeStore, getCurrentBusinessId } = useBusinessStore()
  const { initializeLanguage } = useLanguageStore()

  // Initialize database and business store on app start
  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize language first (for proper UI display)
        await initializeLanguage()

        // Initialize database
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
  }, [initializeStore, initializeLanguage])

  if (!dbInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <img 
          src="/kwaci-grow-webp-transparent.webp" 
          alt="KWACI Grow Logo" 
          className="h-16 w-16 object-contain animate-pulse"
        />
        <div className="text-lg text-muted-foreground">Initializing database...</div>
      </div>
    )
  }

  return (
    <ThemeProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <img 
                    src="/kwaci-grow-webp-transparent.webp" 
                    alt="KWACI Grow Logo" 
                    className="h-8 w-8 md:h-10 md:w-10 object-contain"
                  />
                  <h1 className="text-xl md:text-2xl font-bold text-foreground truncate">
                    KWACI Grow
                  </h1>
                </div>
                <div className="hidden sm:block">
                  <KwaciAcronymCompact acronymIndex={0} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
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
