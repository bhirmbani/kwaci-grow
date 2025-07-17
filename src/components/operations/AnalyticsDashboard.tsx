import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { BarChart3, PieChart, Calendar, Filter, Download } from 'lucide-react'

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { 
  HourlyProfitabilityChart, 
  ProductPopularityChart, 
  SalesProgressChart,
  type HourlyData,
  type ProductData,
  type ProgressData
} from '@/components/charts'
import { SalesRecordService } from '@/lib/services/salesRecordService'
import { DailyProductSalesTargetService, type MenuTargetSummary } from '@/lib/services/dailyProductSalesTargetService'
import { BranchService } from '@/lib/services/branchService'
import { formatCurrency } from '@/utils/formatters'
import { calculateBusinessTimeProgress, calculateExpectedProgress, getCurrentTimeInfo, getSalesTargetStatus } from '@/lib/utils/operationsUtils'
import { useCurrentBusinessId } from '@/lib/stores/businessStore'
import type { Branch, SalesRecordWithDetails } from '@/lib/db/schema'

interface AnalyticsFilters {
  startDate: string
  endDate: string
  branchId: string
  timeRange: 'today' | 'week' | 'month' | 'custom'
}

export function AnalyticsDashboard() {
  const { t } = useTranslation()
  const currentBusinessId = useCurrentBusinessId()
  const [filters, setFilters] = useState<AnalyticsFilters>({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    branchId: '',
    timeRange: 'today'
  })

  const [branches, setBranches] = useState<Branch[]>([])
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([])
  const [productData, setProductData] = useState<ProductData[]>([])
  const [progressData, setProgressData] = useState<ProgressData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('hourly')

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

  // Update date range when time range preset changes
  useEffect(() => {
    const today = new Date()
    let startDate: string
    let endDate: string

    switch (filters.timeRange) {
      case 'today':
        startDate = endDate = format(today, 'yyyy-MM-dd')
        break
      case 'week':
        startDate = format(subDays(today, 6), 'yyyy-MM-dd')
        endDate = format(today, 'yyyy-MM-dd')
        break
      case 'month':
        startDate = format(subDays(today, 29), 'yyyy-MM-dd')
        endDate = format(today, 'yyyy-MM-dd')
        break
      case 'custom':
        // Keep existing dates
        return
    }

    setFilters(prev => ({ ...prev, startDate, endDate }))
  }, [filters.timeRange])

  // Load analytics data when filters change
  useEffect(() => {
    const loadAnalyticsData = async () => {
      if (!currentBusinessId) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        // Get sales records for the date range
        const salesRecords = await SalesRecordService.getRecordsForDateRange(
          filters.startDate,
          filters.endDate,
          filters.branchId || undefined,
          currentBusinessId
        )

        // Process hourly data
        const hourlyMap = new Map<string, { revenue: number; profit: number; sales: number }>()
        
        // Initialize hours
        for (let hour = 0; hour < 24; hour++) {
          const hourStr = hour.toString().padStart(2, '0') + ':00'
          hourlyMap.set(hourStr, { revenue: 0, profit: 0, sales: 0 })
        }

        // Aggregate sales by hour
        salesRecords.forEach(record => {
          const hour = record.saleTime.substring(0, 2) + ':00'
          const existing = hourlyMap.get(hour) || { revenue: 0, profit: 0, sales: 0 }
          existing.revenue += record.totalAmount
          existing.sales += record.quantity
          // Simplified profit calculation (revenue - estimated COGS)
          existing.profit += record.totalAmount * 0.6 // Assume 60% profit margin
          hourlyMap.set(hour, existing)
        })

        const hourlyChartData: HourlyData[] = Array.from(hourlyMap.entries()).map(([hour, data]) => ({
          hour,
          revenue: data.revenue,
          profit: data.profit,
          sales: data.sales
        }))

        // Process product popularity data
        const productMap = new Map<string, { name: string; quantity: number; revenue: number }>()
        
        salesRecords.forEach(record => {
          const existing = productMap.get(record.productId)
          if (existing) {
            existing.quantity += record.quantity
            existing.revenue += record.totalAmount
          } else {
            productMap.set(record.productId, {
              name: record.product.name,
              quantity: record.quantity,
              revenue: record.totalAmount
            })
          }
        })

        const totalQuantity = Array.from(productMap.values()).reduce((sum, p) => sum + p.quantity, 0)
        const productChartData: ProductData[] = Array.from(productMap.values())
          .map(product => ({
            ...product,
            percentage: totalQuantity > 0 ? (product.quantity / totalQuantity) * 100 : 0
          }))
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 10) // Top 10 products

        // Process progress data (for any single date)
        let progressChartData: ProgressData[] = []
        if (filters.startDate === filters.endDate) {
          // Get menu target summaries for the selected date
          const menuTargets = await DailyProductSalesTargetService.getMenuTargetSummariesForDate(
            filters.startDate,
            filters.branchId || undefined
          )

          const relevantTarget = filters.branchId
            ? menuTargets.find(t => t.branchId === filters.branchId)
            : menuTargets[0] // Use first target if no branch filter

          if (relevantTarget) {
            const dateRecords = salesRecords.filter(r => r.saleDate === filters.startDate)

            // Group by hour and calculate cumulative progress
            const hourlyProgress = new Map<string, number>()
            let cumulativeRevenue = 0

            for (let hour = 0; hour < 24; hour++) {
              const hourStr = hour.toString().padStart(2, '0') + ':00'
              const hourRecords = dateRecords.filter(r => r.saleTime.startsWith(hour.toString().padStart(2, '0')))
              cumulativeRevenue += hourRecords.reduce((sum, r) => sum + r.totalAmount, 0)
              hourlyProgress.set(hourStr, cumulativeRevenue)
            }

            progressChartData = Array.from(hourlyProgress.entries()).map(([time, actual]) => {
              const hour = parseInt(time.split(':')[0])
              const expectedProgress = (hour / 24) * relevantTarget.targetAmount
              const percentage = relevantTarget.targetAmount > 0 ? (actual / relevantTarget.targetAmount) * 100 : 0

              return {
                time,
                actual,
                target: expectedProgress,
                percentage
              }
            })
          }
        }

        setHourlyData(hourlyChartData)
        setProductData(productChartData)
        setProgressData(progressChartData)
      } catch (error) {
        console.error('Failed to load analytics data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAnalyticsData()
  }, [filters, currentBusinessId])

  const handleTimeRangeChange = (timeRange: AnalyticsFilters['timeRange']) => {
    setFilters(prev => ({ ...prev, timeRange }))
  }

  const handleBranchChange = (branchId: string) => {
    setFilters(prev => ({ ...prev, branchId: branchId === 'all' ? '' : branchId }))
  }

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setFilters(prev => ({ ...prev, [field]: value, timeRange: 'custom' }))
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t('operations.analytics.filtersTitle')}
          </CardTitle>
          <CardDescription>
            {t('operations.analytics.filtersDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Time Range Presets */}
            <div className="space-y-2">
              <Label>{t('operations.analytics.timeRange')}</Label>
              <Select value={filters.timeRange} onValueChange={handleTimeRangeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">{t('operations.analytics.range.today')}</SelectItem>
                  <SelectItem value="week">{t('operations.analytics.range.week')}</SelectItem>
                  <SelectItem value="month">{t('operations.analytics.range.month')}</SelectItem>
                  <SelectItem value="custom">{t('operations.analytics.range.custom')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label>{t('operations.analytics.startDate')}</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                max={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label>{t('operations.analytics.endDate')}</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                min={filters.startDate}
                max={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>

            {/* Branch Filter */}
            <div className="space-y-2">
              <Label>{t('operations.analytics.branch')}</Label>
              <Select value={filters.branchId || "all"} onValueChange={handleBranchChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t('operations.analytics.allBranches')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('operations.analytics.allBranches')}</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hourly">{t('operations.analytics.tabs.hourly')}</TabsTrigger>
          <TabsTrigger value="products">{t('operations.analytics.tabs.products')}</TabsTrigger>
          <TabsTrigger value="progress">{t('operations.analytics.tabs.progress')}</TabsTrigger>
        </TabsList>

        <TabsContent value="hourly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t('operations.analytics.hourly.title')}
              </CardTitle>
              <CardDescription>
                {t('operations.analytics.hourly.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-muted-foreground">{t('operations.analytics.loadingChart')}</div>
                </div>
              ) : (
                <HourlyProfitabilityChart data={hourlyData} height={400} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            {t('operations.analytics.products.title')}
          </CardTitle>
          <CardDescription>
            {t('operations.analytics.products.description')}
          </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-muted-foreground">{t('operations.analytics.loadingChart')}</div>
                </div>
              ) : productData.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-muted-foreground">{t('operations.analytics.products.noData')}</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium mb-4">{t('operations.analytics.products.byQuantity')}</h4>
                    <ProductPopularityChart data={productData} height={300} showRevenue={false} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-4">{t('operations.analytics.products.byRevenue')}</h4>
                    <ProductPopularityChart data={productData} height={300} showRevenue={true} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t('operations.analytics.progress.title')}
              </CardTitle>
              <CardDescription>
                {t('operations.analytics.progress.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-muted-foreground">{t('operations.analytics.loadingChart')}</div>
                </div>
              ) : progressData.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center text-muted-foreground space-y-2">
                    <div>
                      {filters.startDate !== filters.endDate
                        ? t('operations.analytics.progress.requireSingleDate')
                        : t('operations.analytics.progress.noTargets', { date: filters.startDate })
                      }
                    </div>
                    <div className="text-sm">
                      {filters.startDate !== filters.endDate
                        ? t('operations.analytics.progress.selectSpecificDate')
                        : t('operations.analytics.progress.createTargets', { date: filters.startDate })
                      }
                    </div>
                  </div>
                </div>
              ) : (
                <SalesProgressChart 
                  data={progressData} 
                  height={400} 
                  targetAmount={Math.max(...progressData.map(d => d.target))}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
