import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RefreshCw, ChevronDown, ChevronRight, Loader2 } from "lucide-react"
import { MenuExplanationPanel } from "./MenuExplanationPanel"
import { useMenuAnalytics } from "@/hooks/useProductAnalytics"
import { formatCurrency } from "@/utils/formatters"
import { ProductTargetDefaultService } from "@/lib/services/productTargetDefaultService"
import { useTranslation } from 'react-i18next'

interface MenuProductProjection {
  menuId: string
  menuName: string
  productId: string
  productName: string
  cogsPerCup: number
  menuPrice: number
  grossProfitPerCup: number
  dailyRevenue: number
  weeklyRevenue: number
  monthlyRevenue: number
  dailyProfit: number
  weeklyProfit: number
  monthlyProfit: number
  targetQuantityPerDay: number
}

interface MenuAnalytics {
  menuId: string
  menuName: string
  products: MenuProductProjection[]
  totalDailyRevenue: number
  totalWeeklyRevenue: number
  totalMonthlyRevenue: number
  totalDailyProfit: number
  totalWeeklyProfit: number
  totalMonthlyProfit: number
}

interface MenuAnalyticsTableProps {
  daysPerMonth: number
}

export function MenuAnalyticsTable({
  daysPerMonth
}: MenuAnalyticsTableProps) {
  const { t } = useTranslation()

  // State for selected row to show detailed calculations
  const [selectedRowData, setSelectedRowData] = useState<MenuProductProjection | undefined>(undefined)

  // State to track which row is currently selected (by menuId-productId)
  const [selectedRowId, setSelectedRowId] = useState<string | undefined>(undefined)

  // State for individual target quantities per product
  const [targetQuantities, setTargetQuantities] = useState<Map<string, number>>(new Map())

  // State for expanded menus
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set())

  // State for loading and saving operations
  const [loadingTargets, setLoadingTargets] = useState(true)
  const [savingTargets, setSavingTargets] = useState<Set<string>>(new Set())

  // Ref for the scrollable table container
  const tableScrollRef = useRef<HTMLDivElement>(null)

  // Load target quantities from database on component mount
  useEffect(() => {
    const loadTargetQuantities = async () => {
      try {
        setLoadingTargets(true)
        const defaultTargets = await ProductTargetDefaultService.getAllDefaultTargetQuantities()
        setTargetQuantities(defaultTargets)
        console.log('✅ Target quantities loaded successfully')
      } catch (error) {
        console.error('❌ Error loading target quantities:', error)
        // Continue with empty map - will use defaults
      } finally {
        setLoadingTargets(false)
      }
    }

    loadTargetQuantities()
  }, [])

  // Fetch menu analytics data with individual target quantities
  const { menuAnalytics, loading, error, refetch, lastRefresh } = useMenuAnalytics(daysPerMonth, targetQuantities)

  // Handle target quantity change for a specific product
  const handleTargetQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      // Update local state immediately for responsive UI
      setTargetQuantities(prev => new Map(prev.set(productId, newQuantity)))

      // Save to database
      try {
        setSavingTargets(prev => new Set(prev.add(productId)))
        await ProductTargetDefaultService.setDefaultTargetQuantity(productId, newQuantity)
        console.log(`✅ Target quantity saved: ${newQuantity} units per day for product ${productId}`)
      } catch (error) {
        console.error('❌ Error saving target quantity:', error)

        // Revert local state on error
        setTargetQuantities(prev => {
          const newMap = new Map(prev)
          newMap.delete(productId)
          return newMap
        })
      } finally {
        setSavingTargets(prev => {
          const newSet = new Set(prev)
          newSet.delete(productId)
          return newSet
        })
      }
    }
  }

  // Get target quantity for a product (default to 10 if not set)
  const getTargetQuantity = (productId: string): number => {
    return targetQuantities.get(productId) || 10
  }

  // Handle row selection
  const handleRowClick = (projection: MenuProductProjection) => {
    setSelectedRowData(projection)
    setSelectedRowId(`${projection.menuId}-${projection.productId}`)
  }

  // Toggle menu expansion
  const toggleMenuExpansion = (menuId: string) => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev)
      if (newSet.has(menuId)) {
        newSet.delete(menuId)
      } else {
        newSet.add(menuId)
      }
      return newSet
    })
  }

  // Expand all menus by default
  useEffect(() => {
    if (menuAnalytics.length > 0) {
      setExpandedMenus(new Set(menuAnalytics.map(menu => menu.menuId)))
    }
  }, [menuAnalytics])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">{t('analytics.loading')}</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-red-600">{t('common.error')}: {error}</div>
      </div>
    )
  }

  if (menuAnalytics.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="text-lg text-muted-foreground">{t('analytics.table.noDataTitle')}</div>
          <div className="text-sm text-muted-foreground" style={{ whiteSpace: 'pre-line' }}>
            {t('analytics.table.noDataDescription')}
          </div>
        </div>
      </div>
    )
  }

  // Flatten all products for easier navigation
  const allProducts = menuAnalytics.flatMap(menu => menu.products)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t('analytics.table.title')}</h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {t('analytics.table.info', { menus: menuAnalytics.length, products: allProducts.length })}
            {loadingTargets && (
              <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                <Loader2 className="inline h-3 w-3 animate-spin mr-1" />
                {t('analytics.table.loadingTargets')}
              </span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={loading || loadingTargets}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
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
              aria-label="Menu analytics table. Click rows to see detailed calculations."
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
                      <TableHead sticky className="min-w-[200px]" scope="col">
                        {t('analytics.table.headers.menuProduct')}
                      </TableHead>
                      <TableHead sticky className="text-right min-w-[100px]" scope="col">
                        {t('analytics.table.headers.cogs')}
                      </TableHead>
                      <TableHead sticky className="text-right min-w-[100px]" scope="col">
                        {t('analytics.table.headers.price')}
                      </TableHead>
                      <TableHead sticky className="text-right min-w-[120px]" scope="col">
                        {t('analytics.table.headers.dailyRevenue')}
                      </TableHead>
                      <TableHead sticky className="text-right min-w-[120px]" scope="col">
                        {t('analytics.table.headers.weeklyRevenue')}
                      </TableHead>
                      <TableHead sticky className="text-right min-w-[120px]" scope="col">
                        {t('analytics.table.headers.monthlyRevenue')}
                      </TableHead>
                      <TableHead sticky className="text-right min-w-[120px]" scope="col">
                        {t('analytics.table.headers.dailyProfit')}
                      </TableHead>
                      <TableHead sticky className="text-right min-w-[120px]" scope="col">
                        {t('analytics.table.headers.weeklyProfit')}
                      </TableHead>
                      <TableHead sticky className="text-right min-w-[120px]" scope="col">
                        {t('analytics.table.headers.monthlyProfit')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {menuAnalytics.map((menu) => {
                      const isExpanded = expandedMenus.has(menu.menuId)
                      const menuTotalProfit = menu.totalDailyProfit >= 0
                      
                      return (
                        <React.Fragment key={menu.menuId}>
                          {/* Menu Header Row */}
                          <TableRow
                            className="bg-muted/30 hover:bg-muted/50 cursor-pointer font-medium"
                            onClick={() => toggleMenuExpansion(menu.menuId)}
                          >
                            <TableCell className="font-semibold">
                              <div className="flex items-center gap-2">
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                                {menu.menuName} ({menu.products.length} products)
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">—</TableCell>
                            <TableCell className="text-right text-muted-foreground">—</TableCell>
                            <TableCell className="text-right font-semibold">{formatCurrency(menu.totalDailyRevenue)}</TableCell>
                            <TableCell className="text-right font-semibold">{formatCurrency(menu.totalWeeklyRevenue)}</TableCell>
                            <TableCell className="text-right font-semibold">{formatCurrency(menu.totalMonthlyRevenue)}</TableCell>
                            <TableCell className={`text-right font-semibold ${menuTotalProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {formatCurrency(menu.totalDailyProfit)}
                            </TableCell>
                            <TableCell className={`text-right font-semibold ${menuTotalProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {formatCurrency(menu.totalWeeklyProfit)}
                            </TableCell>
                            <TableCell className={`text-right font-semibold ${menuTotalProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {formatCurrency(menu.totalMonthlyProfit)}
                            </TableCell>
                          </TableRow>

                          {/* Product Rows (shown when menu is expanded) */}
                          {isExpanded && menu.products.map((projection) => {
                            const isSelected = selectedRowId === `${projection.menuId}-${projection.productId}`
                            const isProfit = projection.grossProfitPerCup >= 0
                            
                            return (
                              <TableRow
                                key={`${projection.menuId}-${projection.productId}`}
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
                              >
                                <TableCell className="pl-8">
                                  <div className="space-y-2">
                                    <div className="font-medium">{projection.productName}</div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground">{t('analytics.table.targetPerDay')}</span>
                                      <div className="relative">
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
                                          disabled={savingTargets.has(projection.productId)}
                                        />
                                        {savingTargets.has(projection.productId) && (
                                          <Loader2 className="absolute right-1 top-1 h-3 w-3 animate-spin text-muted-foreground" />
                                        )}
                                      </div>
                                      <span className="text-xs text-muted-foreground">{t('analytics.table.units')}</span>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">{formatCurrency(projection.cogsPerCup)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(projection.menuPrice)}</TableCell>
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
                        </React.Fragment>
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
          <MenuExplanationPanel
            selectedProduct={selectedRowData}
            daysPerMonth={daysPerMonth}
          />
        </Card>
      </div>
    </div>
  )
}

// Import React for Fragment
import React from 'react'
