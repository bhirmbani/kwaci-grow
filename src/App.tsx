import { useEffect, useState, useMemo } from 'react'
import { ProjectionTable } from './components/ProjectionTable'
import { ThemeToggle } from './components/ThemeToggle'
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


function App() {
  const [dbInitialized, setDbInitialized] = useState(false)

  // Initialize database on app start
  useEffect(() => {
    ensureDatabaseInitialized()
      .then(() => setDbInitialized(true))
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
        onDaysChange={setDaysPerMonth}
        onPriceChange={setPricePerCup}
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-foreground">
            Coffee Cart Financial Dashboard
          </h1>
          <ThemeToggle />
        </div>

        {/* Navigation Bar with Sheet Triggers */}
        <div className="mb-8 p-4 sm:p-6 bg-card rounded-lg border shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-center sm:text-left">Configuration & Data Management</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
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

        {/* Main Financial Table - The Primary Focus */}
        {memoizedProjectionTable}
      </div>
    </div>
  )
}

export default App
