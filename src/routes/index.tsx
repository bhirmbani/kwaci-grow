import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { ProjectionTable } from '../components/ProjectionTable'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { FinancialTermsSheet } from '../components/sheets/FinancialTermsSheet'
import { BonusSchemeSheet } from '../components/sheets/BonusSchemeSheet'
import { InitialCapitalSheet } from '../components/sheets/InitialCapitalSheet'
import { FixedCostsSheet } from '../components/sheets/FixedCostsSheet'
import { VariableCOGSSheet } from '../components/sheets/VariableCOGSSheet'
import { useFinancialItems } from '../hooks/useFinancialItems'
import { useBonusScheme } from '../hooks/useBonusScheme'
import { useAppSetting } from '../hooks/useAppSetting'
import { FINANCIAL_ITEM_CATEGORIES, APP_SETTING_KEYS } from '../lib/db/schema'

function Dashboard() {
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
  } = useAppSetting(APP_SETTING_KEYS.DAYS_PER_MONTH, 30)

  const {
    value: pricePerCup,
    loading: priceLoading,
    updateValue: setPricePerCup
  } = useAppSetting(APP_SETTING_KEYS.PRICE_PER_CUP, 5)

  // Loading state
  const isLoading = fixedLoading || cogsLoading || bonusLoading || daysLoading || priceLoading

  // Memoized projection table to prevent unnecessary re-renders
  const memoizedProjectionTable = useMemo(() => (
    <ProjectionTable
      fixedItems={fixedItems}
      cogsItems={cogsItems}
      bonusScheme={bonusScheme}
      daysPerMonth={daysPerMonth}
      pricePerCup={pricePerCup}
    />
  ), [fixedItems, cogsItems, bonusScheme, daysPerMonth, pricePerCup])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <>
      {/* Configuration & Data Management - Compact Layout */}
      <div className="mb-6 p-3 bg-card rounded-lg border shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Configuration & Data Management</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Financial Parameters - Compact */}
          <div className="lg:col-span-1">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Financial Parameters</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="days-per-month" className="text-xs">Days/Month</Label>
                <Input
                  id="days-per-month"
                  type="number"
                  value={daysPerMonth}
                  onChange={(e) => setDaysPerMonth(Number(e.target.value))}
                  min="1"
                  max="31"
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="price-per-cup" className="text-xs">Price/Cup ($)</Label>
                <Input
                  id="price-per-cup"
                  type="number"
                  value={pricePerCup}
                  onChange={(e) => setPricePerCup(Number(e.target.value))}
                  step="0.01"
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
  )
}

export const Route = createFileRoute('/')({
  component: Dashboard,
})
