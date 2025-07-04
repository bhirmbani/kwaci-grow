import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FinancialExplanationPanel } from "./FinancialExplanationPanel"
import type { BonusScheme, FinancialItem } from "@/types"

import { formatCurrency } from "@/utils/formatters"

interface ProjectionTableProps {
  daysPerMonth: number
  pricePerCup: number
  fixedItems: FinancialItem[]
  cogsItems: FinancialItem[]
  bonusScheme: BonusScheme
}

export function ProjectionTable({
  daysPerMonth,
  pricePerCup,
  fixedItems,
  cogsItems,
  bonusScheme
}: ProjectionTableProps) {
  const fixedTotal = fixedItems.reduce((sum, item) => sum + item.value, 0)
  const cogsTotal = cogsItems.reduce((sum, item) => sum + item.value, 0)

  // State for selected row to show detailed calculations
  const [selectedRowData, setSelectedRowData] = useState<{
    cupsPerDay: number
    revenue: number
    variableCogs: number
    grossProfit: number
    fixedCosts: number
    bonus: number
    netProfit: number
    daysPerMonth: number
    pricePerCup: number
    cogsPerCup: number
  } | undefined>(undefined)

  // State to track which row is currently selected (by cupsPerDay value)
  const [selectedRowId, setSelectedRowId] = useState<number | undefined>(undefined)

  // Ref for the scrollable table container
  const tableScrollRef = useRef<HTMLDivElement>(null)

  // Ensure proper scroll event handling
  useEffect(() => {
    const scrollContainer = tableScrollRef.current
    if (!scrollContainer) return

    // Prevent page scroll when scrolling inside table
    const handleWheel = (e: WheelEvent) => {
      // Check if we can scroll in the direction of the wheel
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer
      const canScrollUp = scrollTop > 0
      const canScrollDown = scrollTop < scrollHeight - clientHeight

      // If we can scroll in the wheel direction, prevent page scroll
      if ((e.deltaY < 0 && canScrollUp) || (e.deltaY > 0 && canScrollDown)) {
        e.preventDefault()
        e.stopPropagation()
        scrollContainer.scrollTop += e.deltaY
      }
    }

    // Add event listener with passive: false to allow preventDefault
    scrollContainer.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      scrollContainer.removeEventListener('wheel', handleWheel)
    }
  }, [])

  // Handle row selection with click
  const handleRowClick = (projection: any) => {
    const isCurrentlySelected = selectedRowId === projection.cupsPerDay

    if (isCurrentlySelected) {
      // Clicking the same row deselects it
      setSelectedRowId(undefined)
      setSelectedRowData(undefined)
    } else {
      // Select the new row
      setSelectedRowId(projection.cupsPerDay)
      setSelectedRowData({
        cupsPerDay: projection.cupsPerDay,
        revenue: projection.revenue,
        variableCogs: projection.variableCogs,
        grossProfit: projection.grossProfit,
        fixedCosts: projection.fixedCosts,
        bonus: projection.bonus,
        netProfit: projection.netProfit,
        daysPerMonth,
        pricePerCup,
        cogsPerCup: cogsTotal
      })
    }
  }

  // Handle clearing selection
  const handleClearSelection = () => {
    setSelectedRowId(undefined)
    setSelectedRowData(undefined)
  }

  const generateProjections = () => {
    const projections = []
    for (let cupsPerDay = 10; cupsPerDay <= 200; cupsPerDay += 10) {
      const monthlyCups = cupsPerDay * daysPerMonth
      const revenue = monthlyCups * pricePerCup
      const variableCogs = monthlyCups * cogsTotal
      const grossProfit = revenue - variableCogs
      
      let bonus = 0
      if (monthlyCups > bonusScheme.target) {
        bonus = (monthlyCups - bonusScheme.target) * bonusScheme.perCup * bonusScheme.baristaCount
      }
      
      const netProfit = grossProfit - fixedTotal - bonus

      projections.push({
        cupsPerDay,
        revenue,
        variableCogs,
        grossProfit,
        fixedCosts: fixedTotal,
        bonus,
        netProfit
      })
    }
    return projections
  }

  const projections = generateProjections()

  return (
    <div className="space-y-6">
      {/* Financial Projections Table */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Income Projection & Profits</h2>
        <p className="text-sm text-muted-foreground">
          Click on table rows to see detailed calculation breakdowns. Click again to deselect.
        </p>
      </div>

      {/* Two-Panel Layout: Table + Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Main Table Panel */}
        <Card className="lg:col-span-2 xl:col-span-3">
          <CardContent className="p-0">
            <div
              className="relative h-[600px] border rounded-md"
              role="region"
              aria-label="Financial projections table. Click rows to see detailed calculations."
            >
              <div
                ref={tableScrollRef}
                className="overflow-x-auto overflow-y-auto h-full focus:outline-none"
                tabIndex={0}
                style={{ scrollBehavior: 'smooth' }}
              >
                <Table>
                  <TableHeader sticky>
                    <TableRow>
                    <TableHead sticky className="min-w-[100px]" scope="col">
                      Cups/Day
                    </TableHead>
                    <TableHead sticky className="text-right min-w-[120px]" scope="col">
                      Revenue (IDR)
                    </TableHead>
                    <TableHead sticky className="text-right min-w-[120px]" scope="col">
                      Variable COGS (IDR)
                    </TableHead>
                    <TableHead sticky className="text-right min-w-[120px]" scope="col">
                      Gross Profit (IDR)
                    </TableHead>
                    <TableHead sticky className="text-right min-w-[120px]" scope="col">
                      Fixed Costs (IDR)
                    </TableHead>
                    <TableHead sticky className="text-right min-w-[100px]" scope="col">
                      Bonus (IDR)
                    </TableHead>
                    <TableHead sticky className="text-right min-w-[120px]" scope="col">
                      Net Profit (IDR)
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projections.map((projection) => {
                    const isSelected = selectedRowId === projection.cupsPerDay
                    return (
                      <TableRow
                        key={projection.cupsPerDay}
                        className={`
                          hover:bg-muted/30 cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                          ${isSelected
                            ? 'bg-primary/10 border-l-4 border-l-primary shadow-sm ring-1 ring-primary/20'
                            : 'border-l-4 border-l-transparent hover:border-l-muted-foreground/20'
                          }
                        `}
                        aria-label={`Financial projection for ${projection.cupsPerDay} cups per day`}
                        aria-selected={isSelected}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleRowClick(projection)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            handleRowClick(projection)
                          }
                        }}
                      >
                        <TableCell className="font-medium">{projection.cupsPerDay}</TableCell>
                        <TableCell className="text-right">{formatCurrency(projection.revenue)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(projection.variableCogs)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(projection.grossProfit)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(projection.fixedCosts)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(projection.bonus)}</TableCell>
                        <TableCell className={`text-right font-semibold ${projection.netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {formatCurrency(projection.netProfit)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Explanation Panel */}
        <div className="lg:col-span-1 xl:col-span-1">
          <div className="sticky top-6 h-[600px]">
            <FinancialExplanationPanel
              selectedData={selectedRowData}
              onClearSelection={handleClearSelection}
              className="h-full"
            />
          </div>
        </div>
      </div>
    </div>
  )
}