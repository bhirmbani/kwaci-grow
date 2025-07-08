import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { ProductExplanationPanel } from "./ProductExplanationPanel"
import { useProductAnalytics } from "@/hooks/useProductAnalytics"
import { formatCurrency } from "@/utils/formatters"

interface ProductProjection {
  productId: string
  productName: string
  cogsPerCup: number
  averagePrice: number
  grossProfitPerCup: number
  dailyRevenue: number
  weeklyRevenue: number
  monthlyRevenue: number
  dailyProfit: number
  weeklyProfit: number
  monthlyProfit: number
  targetQuantityPerDay: number
}

interface ProductAnalyticsTableProps {
  daysPerMonth: number
}

export function ProductAnalyticsTable({
  daysPerMonth
}: ProductAnalyticsTableProps) {
  // State for selected row to show detailed calculations
  const [selectedRowData, setSelectedRowData] = useState<ProductProjection | undefined>(undefined)

  // State to track which row is currently selected (by productId)
  const [selectedRowId, setSelectedRowId] = useState<string | undefined>(undefined)

  // State for individual target quantities per product
  const [targetQuantities, setTargetQuantities] = useState<Map<string, number>>(new Map())

  // Ref for the scrollable table container
  const tableScrollRef = useRef<HTMLDivElement>(null)

  // Fetch product analytics data with individual target quantities
  const { projections, loading, error, refetch, lastRefresh } = useProductAnalytics(daysPerMonth, targetQuantities)

  // Handle target quantity change for a specific product
  const handleTargetQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      setTargetQuantities(prev => new Map(prev.set(productId, newQuantity)))
    }
  }

  // Get target quantity for a product (default to 10 if not set)
  const getTargetQuantity = (productId: string): number => {
    return targetQuantities.get(productId) || 10
  }

  // Handle row selection
  const handleRowClick = (projection: ProductProjection) => {
    setSelectedRowData(projection)
    setSelectedRowId(projection.productId)
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!tableScrollRef.current) return

      const currentIndex = projections.findIndex(p => p.productId === selectedRowId)
      let newIndex = currentIndex

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          newIndex = Math.min(currentIndex + 1, projections.length - 1)
          break
        case 'ArrowUp':
          event.preventDefault()
          newIndex = Math.max(currentIndex - 1, 0)
          break
        case 'Home':
          event.preventDefault()
          newIndex = 0
          break
        case 'End':
          event.preventDefault()
          newIndex = projections.length - 1
          break
        default:
          return
      }

      if (newIndex !== currentIndex && projections[newIndex]) {
        handleRowClick(projections[newIndex])
      }
    }

    const tableElement = tableScrollRef.current
    if (tableElement) {
      tableElement.addEventListener('keydown', handleKeyDown)
      return () => tableElement.removeEventListener('keydown', handleKeyDown)
    }
  }, [projections, selectedRowId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading product analytics...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    )
  }

  if (projections.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="text-lg text-muted-foreground">No products found with pricing data</div>
          <div className="text-sm text-muted-foreground">
            Make sure you have:
            <br />• Products with ingredients and COGS data
            <br />• Menus with product pricing
            <br />• Try seeding data from the test-menus page
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Product Income Projections & Profits</h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {projections.length} products • Individual target quantities
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Two-Panel Layout: Table + Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Main Table Panel */}
        <Card className="lg:col-span-2 xl:col-span-3">
          <CardContent className="p-0">
            <div
              className="relative h-[600px] border rounded-md"
              role="region"
              aria-label="Product analytics table. Click rows to see detailed calculations."
            >
              <div
                ref={tableScrollRef}
                className="table-container overflow-x-auto overflow-y-auto h-full focus:outline-none"
                tabIndex={0}
                style={{ scrollBehavior: 'smooth' }}
              >
                <Table noWrapper>
                  <TableHeader sticky>
                    <TableRow>
                      <TableHead sticky className="min-w-[180px]" scope="col">
                        Product & Target
                      </TableHead>
                      <TableHead sticky className="text-right min-w-[100px]" scope="col">
                        COGS/Unit
                      </TableHead>
                      <TableHead sticky className="text-right min-w-[100px]" scope="col">
                        Avg Price
                      </TableHead>
                      <TableHead sticky className="text-right min-w-[120px]" scope="col">
                        Daily Revenue
                      </TableHead>
                      <TableHead sticky className="text-right min-w-[120px]" scope="col">
                        Weekly Revenue
                      </TableHead>
                      <TableHead sticky className="text-right min-w-[120px]" scope="col">
                        Monthly Revenue
                      </TableHead>
                      <TableHead sticky className="text-right min-w-[120px]" scope="col">
                        Daily Profit
                      </TableHead>
                      <TableHead sticky className="text-right min-w-[120px]" scope="col">
                        Weekly Profit
                      </TableHead>
                      <TableHead sticky className="text-right min-w-[120px]" scope="col">
                        Monthly Profit
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projections.map((projection) => {
                      const isSelected = selectedRowId === projection.productId
                      const isProfit = projection.grossProfitPerCup >= 0
                      
                      return (
                        <TableRow
                          key={projection.productId}
                          className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                            isSelected ? 'bg-muted' : ''
                          }`}
                          onClick={(e) => {
                            // Only handle row click if not clicking on the input
                            if (!(e.target as HTMLElement).closest('input')) {
                              handleRowClick(projection)
                            }
                          }}
                          role="button"
                          tabIndex={0}
                          aria-selected={isSelected}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              // Only handle if not focused on input
                              if (!(e.target as HTMLElement).closest('input')) {
                                e.preventDefault()
                                handleRowClick(projection)
                              }
                            }
                          }}
                        >
                          <TableCell className="font-medium">
                            <div className="space-y-2">
                              <div className="font-medium">{projection.productName}</div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Target/day:</span>
                                <Input
                                  type="number"
                                  min="1"
                                  max="1000"
                                  value={getTargetQuantity(projection.productId)}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value) || 1
                                    handleTargetQuantityChange(projection.productId, value)
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-16 h-6 text-xs px-2"
                                />
                                <span className="text-xs text-muted-foreground">units</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(projection.cogsPerCup)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(projection.averagePrice)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(projection.dailyRevenue)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(projection.weeklyRevenue)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(projection.monthlyRevenue)}</TableCell>
                          <TableCell className={`text-right font-semibold ${isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {formatCurrency(projection.dailyProfit)}
                          </TableCell>
                          <TableCell className={`text-right font-semibold ${isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {formatCurrency(projection.weeklyProfit)}
                          </TableCell>
                          <TableCell className={`text-right font-semibold ${isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {formatCurrency(projection.monthlyProfit)}
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

        {/* Explanation Panel */}
        <Card className="lg:col-span-1 xl:col-span-1">
          <ProductExplanationPanel
            selectedProduct={selectedRowData}
            daysPerMonth={daysPerMonth}
          />
        </Card>
      </div>
    </div>
  )
}
