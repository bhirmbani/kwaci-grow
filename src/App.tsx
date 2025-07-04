import { useState } from 'react'
import { FinancialTermsAlert } from './components/FinancialTermsAlert'
import { BonusSchemeCard } from './components/BonusSchemeCard'
import { FinancialItemsTable } from './components/FinancialItemsTable'
import { ProjectionTable } from './components/ProjectionTable'
import { ThemeToggle } from './components/ThemeToggle'
import type { BonusScheme, FinancialItem } from './types'

function App() {

  const [capitalItems, setCapitalItems] = useState<FinancialItem[]>([
    { id: '1', name: 'Electric Cargo Bike', value: 19500000 }
  ])

  const [fixedItems, setFixedItems] = useState<FinancialItem[]>([
    { id: '2', name: 'Depreciation (2-year)', value: 812500 },
    { id: '3', name: 'Warehouse Rent', value: 1000000 },
    { id: '4', name: 'Barista Salary', value: 2000000 }
  ])

  const [cogsItems, setCogsItems] = useState<FinancialItem[]>([
    { id: '5', name: 'Milk (100ml)', value: 2000 },
    { id: '6', name: 'Coffee Beans (5g)', value: 1000 },
    { id: '7', name: 'Palm Sugar (10ml)', value: 485 },
    { id: '8', name: 'Cup + Lid', value: 850 },
    { id: '9', name: 'Ice Cubes (100g)', value: 292 }
  ])

  const [bonusScheme, setBonusScheme] = useState<BonusScheme>({
    target: 1320,
    perCup: 500,
    baristaCount: 1
  })

  const [daysPerMonth, setDaysPerMonth] = useState(22)
  const [pricePerCup, setPricePerCup] = useState(8000)

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-foreground">
            Coffee Cart Financial Dashboard
          </h1>
          <ThemeToggle />
        </div>
        
        <FinancialTermsAlert />
        
        <BonusSchemeCard 
          bonusScheme={bonusScheme}
          onUpdate={setBonusScheme}
        />

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Initial Capital</h2>
          <FinancialItemsTable
            title="Initial Capital"
            items={capitalItems}
            onUpdate={setCapitalItems}
            buttonColor="blue"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <FinancialItemsTable
            title="Fixed Costs / Month"
            items={fixedItems}
            onUpdate={setFixedItems}
            buttonColor="green"
          />
          
          <FinancialItemsTable
            title="Variable COGS per Cup"
            items={cogsItems}
            onUpdate={setCogsItems}
            buttonColor="yellow"
            currency={false}
          />
        </div>

        <ProjectionTable
          daysPerMonth={daysPerMonth}
          pricePerCup={pricePerCup}
          fixedItems={fixedItems}
          cogsItems={cogsItems}
          bonusScheme={bonusScheme}
          onDaysChange={setDaysPerMonth}
          onPriceChange={setPricePerCup}
        />
      </div>
    </div>
  )
}

export default App
