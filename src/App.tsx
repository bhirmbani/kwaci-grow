import { useEffect, useState, useMemo } from 'react'
import { ProjectionTable } from './components/ProjectionTable'
import { ThemeToggle } from './components/ThemeToggle'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { FinancialTermsSheet } from './components/sheets/FinancialTermsSheet'
import { BonusSchemeSheet } from './components/sheets/BonusSchemeSheet'
import { InitialCapitalSheet } from './components/sheets/InitialCapitalSheet'
import { FixedCostsSheet } from './components/sheets/FixedCostsSheet'
import { VariableCOGSSheet } from './components/sheets/VariableCOGSSheet'
import { useFinancialItems } from './hooks/useFinancialItems'
import { useBonusScheme } from './hooks/useBonusScheme'
import { useAppSetting } from './hooks/useAppSetting'
import { ensureDatabaseInitialized } from './lib/db/init'
import { FINANCIAL_ITEM_CATEGORIES, APP_SETTING_KEYS } from './lib/db/schema'
import { validateCalculations } from './utils/financialCalculations.test'
import { SidebarProvider, SidebarTrigger } from './components/ui/sidebar'
import { AppSidebar } from './components/AppSidebar'
import { useSidebarState } from './hooks/useSidebarState'
import { WarehouseManagement } from './components/warehouse/WarehouseManagement'


function App() {
  const [dbInitialized, setDbInitialized] = useState(false)
  const [currentView, setCurrentView] = useState<'dashboard' | 'warehouse'>('dashboard')
  const { defaultOpen, onOpenChange } = useSidebarState()

  // Handle navigation from sidebar
  const handleNavigation = (url: string) => {
    if (url === '#warehouse') {
      setCurrentView('warehouse')
    } else {
      setCurrentView('dashboard')
    }
  }

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

  // Database hooks
  const {
    items: fixedItems,
    loading: fixedLoading
  } = useFinancialItems(FINANCIAL_ITEM_CATEGORIES.FIXED_COSTS)

  const {
    items: cogsItems,
    loading: cogsLoading,
    updateItems: setCogsItems
  } = useFinancialItems(FINANCIAL_ITEM_CATEGORIES.VARIABLE_COGS)

  const {
    scheme: bonusScheme,
    loading: bonusLoading,
    updateScheme: setBonusScheme
  } = useBonusScheme()

  const {
    value: daysPerMonth,
    loading: daysLoading,
    updateValue: setDaysPerMonth
  } = useAppSetting(APP_SETTING_KEYS.DAYS_PER_MONTH, 22)

  const {
    value: pricePerCup,
    loading: priceLoading,
    updateValue: setPricePerCup
  } = useAppSetting(APP_SETTING_KEYS.PRICE_PER_CUP, 8000)

  // Memoize loading state calculation
  const isLoading = useMemo(() =>
    !dbInitialized || fixedLoading || cogsLoading || bonusLoading || daysLoading || priceLoading,
    [dbInitialized, fixedLoading, cogsLoading, bonusLoading, daysLoading, priceLoading]
  )

  // Memoize the ProjectionTable component to prevent unnecessary re-renders
  const memoizedProjectionTable = useMemo(() => {
    // Only render if we have valid bonusScheme data
    if (!bonusScheme) return null

    return (
      <ProjectionTable
        daysPerMonth={daysPerMonth}
        pricePerCup={pricePerCup}
        fixedItems={fixedItems}
        cogsItems={cogsItems}
        bonusScheme={bonusScheme}
      />
    )
  }, [daysPerMonth, pricePerCup, fixedItems, cogsItems, bonusScheme, setDaysPerMonth, setPricePerCup])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading financial dashboard...</p>
        </div>
      </div>
    )
  }

  // Ensure we have valid data before rendering
  if (!bonusScheme) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Failed to load financial data. Please refresh the page.</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <AppSidebar onNavigate={handleNavigation} />
      <main className="flex-1 min-h-screen bg-background">
        <div className="flex items-center gap-2 p-4 border-b">
          <SidebarTrigger />
          <div className="flex-1 flex justify-between items-center">
            <h1 className="text-xl md:text-2xl font-bold text-foreground truncate">
              {currentView === 'warehouse' ? 'Warehouse Management' : 'Coffee Cart Financial Dashboard'}
            </h1>
            <ThemeToggle />
          </div>
        </div>

        <div className="p-4">
          <div className="max-w-7xl mx-auto">
            {currentView === 'warehouse' ? (
              <WarehouseManagement />
            ) : (
              <>
                {/* Configuration & Data Management - Compact Layout */}
                <div className="mb-6 p-3 bg-card rounded-lg border shadow-sm">
                  <h2 className="text-lg font-semibold mb-4">Configuration & Data Management</h2>

                  {/* Horizontal Layout for Input Controls and Sheet Triggers */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                    {/* Input Controls - Compact */}
                    <div className="lg:col-span-1">
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Financial Parameters</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="daysPerMonth" className="text-xs">Days/Month</Label>
                          <Input
                            id="daysPerMonth"
                            type="number"
                            value={daysPerMonth}
                            onChange={(e) => setDaysPerMonth(Number(e.target.value))}
                            min="1"
                            max="31"
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label htmlFor="pricePerCup" className="text-xs">Price/Cup (IDR)</Label>
                          <Input
                            id="pricePerCup"
                            type="number"
                            value={pricePerCup}
                            onChange={(e) => setPricePerCup(Number(e.target.value))}
                            min="0"
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Sheet Triggers - Compact */}
                    <div className="lg:col-span-2">
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Data Management</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                        <FinancialTermsSheet />
                        <BonusSchemeSheet
                          bonusScheme={bonusScheme}
                          onUpdate={setBonusScheme}
                        />
                        <InitialCapitalSheet />
                        <FixedCostsSheet />
                        <VariableCOGSSheet
                          items={cogsItems}
                          onUpdate={setCogsItems}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Financial Table - The Primary Focus */}
                {memoizedProjectionTable}
              </>
            )}
          </div>
        </div>
      </main>
    </SidebarProvider>
  )
}

export default App
