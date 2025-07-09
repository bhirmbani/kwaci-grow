import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Target, TrendingUp, TrendingDown, Clock, AlertTriangle, CheckCircle } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { SalesRecordService } from '@/lib/services/salesRecordService'
import { DailyProductSalesTargetService, type ProductTargetForDate } from '@/lib/services/dailyProductSalesTargetService'
import { BranchService } from '@/lib/services/branchService'
import { formatCurrency } from '@/utils/formatters'
import { calculateBusinessTimeProgress, calculateExpectedProgress } from '@/lib/utils/operationsUtils'
import type { Branch, Menu } from '@/lib/db/schema'

// Menu-level target aggregated from product targets
interface MenuTarget {
  id: string
  menuId: string
  branchId: string
  targetDate: string
  targetAmount: number
  menu: Menu
  branch: Branch
}

interface TargetAnalysis {
  target: MenuTarget
  actualSales: number
  actualRevenue: number
  variance: number
  variancePercentage: number
  progressPercentage: number
  status: 'ahead' | 'on-track' | 'behind' | 'at-risk'
  timeProgress: number // Percentage of day elapsed
  expectedProgress: number // Expected progress based on time
}

// Helper function to aggregate product targets into menu-level targets
function aggregateProductTargetsToMenuTargets(productTargets: ProductTargetForDate[]): MenuTarget[] {
  const menuTargetsMap = new Map<string, MenuTarget>()

  productTargets.forEach(productTarget => {
    const key = `${productTarget.menuId}-${productTarget.branchId}`

    if (!menuTargetsMap.has(key)) {
      // Create new menu target
      menuTargetsMap.set(key, {
        id: `menu-${productTarget.menuId}-${productTarget.branchId}-${productTarget.targetDate}`,
        menuId: productTarget.menuId,
        branchId: productTarget.branchId,
        targetDate: productTarget.targetDate,
        targetAmount: 0,
        menu: productTarget.menu,
        branch: productTarget.branch
      })
    }

    // Add this product's target amount to the menu total
    const menuTarget = menuTargetsMap.get(key)!
    menuTarget.targetAmount += productTarget.targetQuantity * productTarget.menuProduct.price
  })

  return Array.from(menuTargetsMap.values())
}

export function TargetVsActualAnalysis() {
  const [analyses, setAnalyses] = useState<TargetAnalysis[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [selectedBranch, setSelectedBranch] = useState<string>('')
  const [loading, setLoading] = useState(true)

  // Load initial data
  useEffect(() => {
    const loadBranches = async () => {
      try {
        const branchesData = await BranchService.getAllBranches()
        setBranches(branchesData.filter(branch => branch.isActive))
      } catch (error) {
        console.error('Failed to load branches:', error)
      }
    }

    loadBranches()
  }, [])

  // Load analysis data when date or branch changes
  useEffect(() => {
    const loadAnalysisData = async () => {
      setLoading(true)
      try {
        // Get all product targets for the selected date
        // We need to get targets for all branches first, then filter
        const allBranches = await BranchService.getAllBranches()
        const activeBranches = allBranches.filter(branch => branch.isActive)

        let allProductTargets: ProductTargetForDate[] = []

        // Get product targets for each branch
        for (const branch of activeBranches) {
          try {
            const branchTargets = await DailyProductSalesTargetService.getMenusWithProductTargets(
              selectedDate,
              branch.id
            )
            allProductTargets.push(...branchTargets)
          } catch (error) {
            console.warn(`Failed to load targets for branch ${branch.id}:`, error)
          }
        }

        // Filter by branch if selected
        const filteredProductTargets = selectedBranch
          ? allProductTargets.filter(target => target.branchId === selectedBranch)
          : allProductTargets

        // Aggregate product targets into menu-level targets
        const targets = aggregateProductTargetsToMenuTargets(filteredProductTargets)

        const analysisPromises = targets.map(async (target) => {
          // Get actual sales for this target
          const salesRecords = await SalesRecordService.getRecordsForDate(
            selectedDate, 
            target.branchId
          )

          // Filter sales records by menu if needed
          const relevantSales = salesRecords.filter(record => record.menuId === target.menuId)
          
          const actualRevenue = relevantSales.reduce((sum, record) => sum + record.totalAmount, 0)
          const actualSales = relevantSales.reduce((sum, record) => sum + record.quantity, 0)
          
          const variance = actualRevenue - target.targetAmount
          const variancePercentage = target.targetAmount > 0 
            ? (variance / target.targetAmount) * 100 
            : 0
          
          const progressPercentage = target.targetAmount > 0 
            ? Math.min((actualRevenue / target.targetAmount) * 100, 100)
            : 0

          // Calculate time progress based on business hours
          const now = new Date()
          const isToday = selectedDate === format(now, 'yyyy-MM-dd')

          // Use business hours from the branch if available, otherwise use defaults
          const businessHoursStart = target.branch?.businessHoursStart || '06:00'
          const businessHoursEnd = target.branch?.businessHoursEnd || '22:00'

          // Calculate time progress based on business hours
          const timeProgress = isToday
            ? calculateBusinessTimeProgress(selectedDate, businessHoursStart, businessHoursEnd)
            : 100 // If not today, consider full day

          // Calculate expected progress using realistic coffee shop curve
          const expectedProgress = calculateExpectedProgress(timeProgress, 'coffee-shop')

          // Determine status
          let status: TargetAnalysis['status'] = 'on-track'
          if (progressPercentage >= expectedProgress + 10) {
            status = 'ahead'
          } else if (progressPercentage < expectedProgress - 20) {
            status = 'at-risk'
          } else if (progressPercentage < expectedProgress - 10) {
            status = 'behind'
          }

          return {
            target,
            actualSales,
            actualRevenue,
            variance,
            variancePercentage,
            progressPercentage,
            status,
            timeProgress,
            expectedProgress
          }
        })

        const analysisResults = await Promise.all(analysisPromises)
        setAnalyses(analysisResults)
      } catch (error) {
        console.error('Failed to load analysis data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAnalysisData()
  }, [selectedDate, selectedBranch])

  const getStatusIcon = (status: TargetAnalysis['status']) => {
    switch (status) {
      case 'ahead':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'on-track':
        return <Target className="h-5 w-5 text-blue-500" />
      case 'behind':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'at-risk':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
    }
  }

  const getStatusBadge = (status: TargetAnalysis['status']) => {
    const variants = {
      ahead: 'default',
      'on-track': 'secondary',
      behind: 'outline',
      'at-risk': 'destructive'
    } as const

    const labels = {
      ahead: 'Ahead',
      'on-track': 'On Track',
      behind: 'Behind',
      'at-risk': 'At Risk'
    }

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    )
  }

  const getVarianceIcon = (variance: number) => {
    return variance >= 0 
      ? <TrendingUp className="h-4 w-4 text-green-500" />
      : <TrendingDown className="h-4 w-4 text-red-500" />
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Target vs Actual Analysis</CardTitle>
          <CardDescription>
            Real-time comparison between daily sales targets and actual performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date-filter">Date</Label>
              <Input
                id="date-filter"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch-filter">Branch</Label>
              <Select value={selectedBranch || "all"} onValueChange={(value) => setSelectedBranch(value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All branches</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name} - {branch.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="text-muted-foreground">Loading analysis...</div>
            </div>
          </CardContent>
        </Card>
      ) : analyses.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="text-muted-foreground">No targets found for this date</div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {analyses.map((analysis) => (
            <Card key={`${analysis.target.id}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {analysis.target.menu?.name || 'Unknown Menu'}
                    </CardTitle>
                    <CardDescription>
                      {analysis.target.branch?.name || 'Unknown Branch'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(analysis.status)}
                    {getStatusBadge(analysis.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{analysis.progressPercentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={analysis.progressPercentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Expected: {analysis.expectedProgress.toFixed(1)}%</span>
                    <span>Time: {analysis.timeProgress.toFixed(1)}%</span>
                  </div>
                </div>

                {/* Financial Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Target</p>
                    <p className="text-lg font-semibold">{formatCurrency(analysis.target.targetAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Actual</p>
                    <p className="text-lg font-semibold">{formatCurrency(analysis.actualRevenue)}</p>
                  </div>
                </div>

                {/* Variance */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    {getVarianceIcon(analysis.variance)}
                    <span className="text-sm font-medium">Variance</span>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${analysis.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {analysis.variance >= 0 ? '+' : ''}{formatCurrency(analysis.variance)}
                    </p>
                    <p className={`text-xs ${analysis.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {analysis.variancePercentage >= 0 ? '+' : ''}{analysis.variancePercentage.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="text-xs text-muted-foreground">
                  <p>Sales Count: {analysis.actualSales} items</p>
                  {analysis.target.note && <p>Note: {analysis.target.note}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
