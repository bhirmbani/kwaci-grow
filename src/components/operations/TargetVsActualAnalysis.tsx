import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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
import { DailyProductSalesTargetService, type MenuTargetSummary } from '@/lib/services/dailyProductSalesTargetService'
import { BranchService } from '@/lib/services/branchService'
import { formatCurrency } from '@/utils/formatters'
import { calculateBusinessTimeProgress, calculateExpectedProgress, getCurrentTimeInfo, getSalesTargetStatus } from '@/lib/utils/operationsUtils'
import { useCurrentBusinessId } from '@/lib/stores/businessStore'
import type { Branch } from '@/lib/db/schema'

// Use MenuTargetSummary from the service
type MenuTarget = MenuTargetSummary & {
  id: string // Add id for compatibility
}

interface TargetAnalysis {
  target: MenuTarget
  actualSales: number
  actualRevenue: number
  variance: number
  variancePercentage: number
  progressPercentage: number
  status: 'ahead' | 'on-track' | 'behind' | 'at-risk' | 'target-failed'
  timeProgress: number // Percentage of day elapsed
  expectedProgress: number // Expected progress based on time
  timeInfo: {
    currentTime: string
    timeDisplay: string
    isAfterBusinessHours: boolean
    timeRemaining: string | null
  }
}



export function TargetVsActualAnalysis() {
  const { t } = useTranslation()
  const currentBusinessId = useCurrentBusinessId()
  const [analyses, setAnalyses] = useState<TargetAnalysis[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [selectedBranch, setSelectedBranch] = useState<string>('')
  const [loading, setLoading] = useState(true)

  // Load initial data
  useEffect(() => {
    const loadBranches = async () => {
      if (!currentBusinessId) return

      try {
        const branchesData = await BranchService.getAllBranches()
        setBranches(branchesData.filter(branch => branch.isActive))
      } catch (error) {
        console.error('Failed to load branches:', error)
      }
    }

    loadBranches()
  }, [currentBusinessId])

  // Load analysis data when date or branch changes
  useEffect(() => {
    const loadAnalysisData = async () => {
      if (!currentBusinessId) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        // Get menu target summaries for the selected date
        const targets = await DailyProductSalesTargetService.getMenuTargetSummariesForDate(
          selectedDate,
          selectedBranch || undefined
        )

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

          // Get time information for display
          const timeInfo = getCurrentTimeInfo(selectedDate, businessHoursStart, businessHoursEnd)

          // Determine status with business hours awareness
          const status = getSalesTargetStatus(
            progressPercentage,
            expectedProgress,
            timeInfo.isAfterBusinessHours
          )

          return {
            target: {
              ...target,
              id: `menu-${target.menuId}-${target.branchId}-${target.targetDate}`
            },
            actualSales,
            actualRevenue,
            variance,
            variancePercentage,
            progressPercentage,
            status,
            timeProgress,
            expectedProgress,
            timeInfo
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
  }, [selectedDate, selectedBranch, currentBusinessId])

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
      case 'target-failed':
        return <AlertTriangle className="h-5 w-5 text-red-700" />
    }
  }

  const getStatusBadge = (status: TargetAnalysis['status']) => {
    const variants = {
      ahead: 'default',
      'on-track': 'secondary',
      behind: 'outline',
      'at-risk': 'destructive',
      'target-failed': 'destructive'
    } as const

    const labels = {
      ahead: 'Ahead',
      'on-track': 'On Track',
      behind: 'Behind',
      'at-risk': 'At Risk',
      'target-failed': 'Target Failed'
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
          <CardTitle>{t('operations.targetAnalysis.title')}</CardTitle>
          <CardDescription>
            {t('operations.targetAnalysis.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date-filter">{t('operations.targetAnalysis.date')}</Label>
              <Input
                id="date-filter"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch-filter">{t('operations.targetAnalysis.branch')}</Label>
              <Select value={selectedBranch || "all"} onValueChange={(value) => setSelectedBranch(value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('operations.targetAnalysis.allBranches')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('operations.targetAnalysis.allBranches')}</SelectItem>
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
              <div className="text-muted-foreground">{t('operations.targetAnalysis.loading')}</div>
            </div>
          </CardContent>
        </Card>
      ) : analyses.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="text-muted-foreground">{t('operations.targetAnalysis.noTargets')}</div>
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
                      {analysis.target.menu?.name || t('operations.targetAnalysis.unknownMenu')}
                    </CardTitle>
                    <CardDescription>
                      {analysis.target.branch?.name || t('operations.targetAnalysis.unknownBranch')}
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
                    <span>{t('operations.targetAnalysis.progress')}</span>
                    <span>{analysis.progressPercentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={analysis.progressPercentage} className="h-2" />
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{analysis.timeInfo.timeDisplay}</span>
                      <span>{t('operations.targetAnalysis.expected', { value: analysis.expectedProgress.toFixed(1) })}</span>
                    </div>
                    {analysis.timeInfo.timeRemaining && (
                      <div className="text-xs text-muted-foreground">
                        <span>{t('operations.targetAnalysis.timeRemaining', { value: analysis.timeInfo.timeRemaining })}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('operations.targetAnalysis.target')}</p>
                    <p className="text-lg font-semibold">{formatCurrency(analysis.target.targetAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('operations.targetAnalysis.actual')}</p>
                    <p className="text-lg font-semibold">{formatCurrency(analysis.actualRevenue)}</p>
                  </div>
                </div>

                {/* Variance */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    {getVarianceIcon(analysis.variance)}
                    <span className="text-sm font-medium">{t('operations.targetAnalysis.variance')}</span>
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
                  <p>{t('operations.targetAnalysis.salesCount', { count: analysis.actualSales })}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
