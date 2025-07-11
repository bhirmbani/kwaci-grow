import { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { TrendingUp, Calculator, Target, DollarSign } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'

import { SalesRecordService } from '@/lib/services/salesRecordService'
import { SalesTargetService } from '@/lib/services/salesTargetService'
import { DailyProductSalesTargetService } from '@/lib/services/dailyProductSalesTargetService'
import { BranchService } from '@/lib/services/branchService'
import { MenuService } from '@/lib/services/menuService'
import { formatCurrency } from '@/utils/formatters'
import { useCurrentBusinessId } from '@/lib/stores/businessStore'
import type { Branch, MenuWithProducts, SalesRecordWithDetails } from '@/lib/db/schema'

interface ProductProjection {
  productId: string
  productName: string
  currentTarget: number // Daily target quantity
  actualSales: number // Actual sales for reference date
  projectedPrice: number // Price per unit
  projectedCOGS: number // COGS per unit
  projectedRevenue: number // Daily revenue projection
  projectedProfit: number // Daily profit projection
  monthlyRevenue: number // Monthly revenue projection
  monthlyProfit: number // Monthly profit projection
  performance: number // Actual vs target percentage
}

interface ProjectionSummary {
  totalDailyRevenue: number
  totalDailyProfit: number
  totalMonthlyRevenue: number
  totalMonthlyProfit: number
  averagePerformance: number
}

export function EnhancedProjectionTable() {
  const currentBusinessId = useCurrentBusinessId()
  const [branches, setBranches] = useState<Branch[]>([])
  const [menus, setMenus] = useState<MenuWithProducts[]>([])
  const [selectedBranch, setSelectedBranch] = useState<string>('')
  const [selectedMenu, setSelectedMenu] = useState<string>('')
  const [referenceDate, setReferenceDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [daysPerMonth, setDaysPerMonth] = useState(30)
  const [useActualData, setUseActualData] = useState(true)

  const [projections, setProjections] = useState<ProductProjection[]>([])
  const [summary, setSummary] = useState<ProjectionSummary>({
    totalDailyRevenue: 0,
    totalDailyProfit: 0,
    totalMonthlyRevenue: 0,
    totalMonthlyProfit: 0,
    averagePerformance: 0
  })
  const [loading, setLoading] = useState(true)

  const tableScrollRef = useRef<HTMLDivElement>(null)

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      if (!currentBusinessId) return

      try {
        const [branchesData, menusData] = await Promise.all([
          BranchService.getAllBranches(),
          MenuService.getAllMenusWithProducts()
        ])

        setBranches(branchesData.filter(branch => branch.isActive))
        setMenus(menusData.filter(menu => menu.status === 'active'))
      } catch (error) {
        console.error('Failed to load initial data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [currentBusinessId])

  // Calculate projections when parameters change
  useEffect(() => {
    const calculateProjections = async () => {
      if (!currentBusinessId || !selectedBranch || !selectedMenu) {
        setProjections([])
        setSummary({
          totalDailyRevenue: 0,
          totalDailyProfit: 0,
          totalMonthlyRevenue: 0,
          totalMonthlyProfit: 0,
          averagePerformance: 0
        })
        return
      }

      setLoading(true)
      try {
        const selectedMenuData = menus.find(menu => menu.id === selectedMenu)
        if (!selectedMenuData) return

        const projectionPromises = selectedMenuData.products.map(async (menuProduct) => {
          const product = menuProduct.product
          
          // Get product target for the reference date
          const productTargets = await DailyProductSalesTargetService.getTargetsForDate(
            referenceDate,
            selectedBranch
          )
          
          const productTarget = productTargets.find(
            target => target.productId === product.id && target.menuId === selectedMenu
          )

          // Get actual sales data if using actual data
          let actualSales = 0
          if (useActualData) {
            const salesRecords = await SalesRecordService.getRecordsForDate(
              referenceDate,
              selectedBranch
            )
            actualSales = salesRecords
              .filter(record => record.productId === product.id && record.menuId === selectedMenu)
              .reduce((sum, record) => sum + record.quantity, 0)
          }

          const currentTarget = productTarget?.targetQuantity || 0
          const projectedPrice = menuProduct.price
          const projectedCOGS = projectedPrice * 0.4 // Assume 40% COGS
          const projectedRevenue = currentTarget * projectedPrice
          const projectedProfit = currentTarget * (projectedPrice - projectedCOGS)
          const monthlyRevenue = projectedRevenue * daysPerMonth
          const monthlyProfit = projectedProfit * daysPerMonth
          const performance = currentTarget > 0 ? (actualSales / currentTarget) * 100 : 0

          return {
            productId: product.id,
            productName: product.name,
            currentTarget,
            actualSales,
            projectedPrice,
            projectedCOGS,
            projectedRevenue,
            projectedProfit,
            monthlyRevenue,
            monthlyProfit,
            performance
          }
        })

        const calculatedProjections = await Promise.all(projectionPromises)
        
        // Calculate summary
        const totalDailyRevenue = calculatedProjections.reduce((sum, p) => sum + p.projectedRevenue, 0)
        const totalDailyProfit = calculatedProjections.reduce((sum, p) => sum + p.projectedProfit, 0)
        const totalMonthlyRevenue = totalDailyRevenue * daysPerMonth
        const totalMonthlyProfit = totalDailyProfit * daysPerMonth
        const averagePerformance = calculatedProjections.length > 0
          ? calculatedProjections.reduce((sum, p) => sum + p.performance, 0) / calculatedProjections.length
          : 0

        setProjections(calculatedProjections)
        setSummary({
          totalDailyRevenue,
          totalDailyProfit,
          totalMonthlyRevenue,
          totalMonthlyProfit,
          averagePerformance
        })
      } catch (error) {
        console.error('Failed to calculate projections:', error)
      } finally {
        setLoading(false)
      }
    }

    calculateProjections()
  }, [selectedBranch, selectedMenu, referenceDate, daysPerMonth, useActualData, menus, currentBusinessId])

  const getPerformanceColor = (performance: number) => {
    if (performance >= 100) return 'text-green-600'
    if (performance >= 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Enhanced Income Projections
          </CardTitle>
          <CardDescription>
            Multi-product projections based on actual sales performance and targets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Branch Selection */}
            <div className="space-y-2">
              <Label>Branch</Label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Menu Selection */}
            <div className="space-y-2">
              <Label>Menu</Label>
              <Select value={selectedMenu} onValueChange={setSelectedMenu}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a menu" />
                </SelectTrigger>
                <SelectContent>
                  {menus.map((menu) => (
                    <SelectItem key={menu.id} value={menu.id}>
                      {menu.name} ({menu.products.length} products)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reference Date */}
            <div className="space-y-2">
              <Label>Reference Date</Label>
              <Input
                type="date"
                value={referenceDate}
                onChange={(e) => setReferenceDate(e.target.value)}
                max={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>

            {/* Days Per Month */}
            <div className="space-y-2">
              <Label>Days Per Month</Label>
              <Input
                type="number"
                min="1"
                max="31"
                value={daysPerMonth}
                onChange={(e) => setDaysPerMonth(parseInt(e.target.value) || 30)}
              />
            </div>

            {/* Use Actual Data Toggle */}
            <div className="space-y-2">
              <Label>Use Actual Sales Data</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={useActualData}
                  onCheckedChange={setUseActualData}
                />
                <span className="text-sm text-muted-foreground">
                  {useActualData ? 'Using actual sales' : 'Using targets only'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {projections.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Daily Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(summary.totalDailyRevenue)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Daily Profit</p>
                  <p className="text-2xl font-bold">{formatCurrency(summary.totalDailyProfit)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(summary.totalMonthlyRevenue)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Performance</p>
                  <p className={`text-2xl font-bold ${getPerformanceColor(summary.averagePerformance)}`}>
                    {summary.averagePerformance.toFixed(1)}%
                  </p>
                </div>
                <Target className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Projections Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Projections</CardTitle>
          <CardDescription>
            Individual product performance and revenue projections
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading projections...</div>
            </div>
          ) : !selectedBranch || !selectedMenu ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Please select a branch and menu to view projections</div>
            </div>
          ) : projections.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">No products found for the selected menu</div>
            </div>
          ) : (
            <div
              ref={tableScrollRef}
              className="relative h-[500px] overflow-auto border rounded-md"
            >
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Target Qty</TableHead>
                    {useActualData && <TableHead className="text-right">Actual Sales</TableHead>}
                    {useActualData && <TableHead className="text-right">Performance</TableHead>}
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Daily Revenue</TableHead>
                    <TableHead className="text-right">Daily Profit</TableHead>
                    <TableHead className="text-right">Monthly Revenue</TableHead>
                    <TableHead className="text-right">Monthly Profit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projections.map((projection) => (
                    <TableRow key={projection.productId}>
                      <TableCell className="font-medium">
                        {projection.productName}
                      </TableCell>
                      <TableCell className="text-right">
                        {projection.currentTarget}
                      </TableCell>
                      {useActualData && (
                        <TableCell className="text-right">
                          {projection.actualSales}
                        </TableCell>
                      )}
                      {useActualData && (
                        <TableCell className={`text-right font-medium ${getPerformanceColor(projection.performance)}`}>
                          {projection.performance.toFixed(1)}%
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        {formatCurrency(projection.projectedPrice)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(projection.projectedRevenue)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(projection.projectedProfit)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(projection.monthlyRevenue)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(projection.monthlyProfit)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
