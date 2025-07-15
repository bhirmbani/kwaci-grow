import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { TrendingUp, DollarSign, ShoppingCart, Clock, Star } from 'lucide-react'
import { DashboardService, type TimePeriod, type SalesAnalytics } from '../../lib/services/dashboardService'
import { formatCurrency } from '../../utils/formatters'
import { useCurrentBusinessId } from '../../lib/stores/businessStore'

interface SalesAnalyticsSectionProps {
  onPeriodChange?: (period: TimePeriod) => void
  initialPeriod?: TimePeriod
}

export function SalesAnalyticsSection({ onPeriodChange, initialPeriod = 'today' }: SalesAnalyticsSectionProps) {
  const currentBusinessId = useCurrentBusinessId()
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(initialPeriod)
  const [salesData, setSalesData] = useState<SalesAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load sales analytics data
  const loadSalesData = async (period: TimePeriod) => {
    if (!currentBusinessId) {
      setSalesData(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await DashboardService.getSalesAnalytics(period)
      setSalesData(data)
    } catch (err) {
      console.error('Failed to load sales analytics:', err)
      setError('Failed to load sales data')
    } finally {
      setLoading(false)
    }
  }

  // Handle period change
  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period)
    onPeriodChange?.(period)
    loadSalesData(period)
  }

  // Load data when business context changes
  useEffect(() => {
    loadSalesData(selectedPeriod)
  }, [currentBusinessId, selectedPeriod])

  const getPeriodLabel = (period: TimePeriod): string => {
    switch (period) {
      case 'today': return 'Today'
      case 'week': return 'This Week'
      case 'month': return 'This Month'
      case 'quarter': return 'Last 3 Months'
      default: return 'Today'
    }
  }



  if (!currentBusinessId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Sales Analytics
          </CardTitle>
          <CardDescription>No business selected</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please select a business to view sales analytics.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Sales Analytics</h2>
          <p className="text-muted-foreground">
            Revenue and transaction insights for {getPeriodLabel(selectedPeriod).toLowerCase()}
          </p>
        </div>
        <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">Last 3 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sales Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                {loading ? (
                  <div className="h-8 w-24 bg-muted animate-pulse rounded mt-2" />
                ) : error ? (
                  <p className="text-sm text-destructive">Error loading</p>
                ) : (
                  <p className="text-2xl font-bold">{formatCurrency(salesData?.totalRevenue || 0)}</p>
                )}
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            {salesData && (
              <div className="mt-4 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {getPeriodLabel(selectedPeriod)}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total Transactions */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                {loading ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded mt-2" />
                ) : error ? (
                  <p className="text-sm text-destructive">Error loading</p>
                ) : (
                  <p className="text-2xl font-bold">{salesData?.totalTransactions || 0}</p>
                )}
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-500" />
            </div>
            {salesData && (
              <div className="mt-4 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {salesData.totalTransactions > 0 ? 'Active' : 'No sales'}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Average Order Value */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
                {loading ? (
                  <div className="h-8 w-20 bg-muted animate-pulse rounded mt-2" />
                ) : error ? (
                  <p className="text-sm text-destructive">Error loading</p>
                ) : (
                  <p className="text-2xl font-bold">{formatCurrency(salesData?.averageOrderValue || 0)}</p>
                )}
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
            {salesData && salesData.totalTransactions > 0 && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground">
                  Per transaction average
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Product */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-muted-foreground">Top Product</p>
                {loading ? (
                  <div className="h-8 w-full bg-muted animate-pulse rounded mt-2" />
                ) : error ? (
                  <p className="text-sm text-destructive">Error loading</p>
                ) : salesData?.topProduct ? (
                  <div className="mt-2">
                    <p className="text-lg font-bold truncate">{salesData.topProduct.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {salesData.topProduct.quantity} sold • {formatCurrency(salesData.topProduct.revenue)}
                    </p>
                  </div>
                ) : (
                  <p className="text-lg font-bold text-muted-foreground">No sales</p>
                )}
              </div>
              <Star className="h-8 w-8 text-yellow-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Sales Chart (for today only) */}
      {selectedPeriod === 'today' && salesData?.salesByHour && salesData.salesByHour.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Hourly Sales Today
            </CardTitle>
            <CardDescription>
              Revenue and transaction distribution throughout the day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Simple bar chart representation */}
              <div className="grid grid-cols-12 gap-1 h-32">
                {salesData.salesByHour
                  .filter(hour => parseInt(hour.hour.split(':')[0]) >= 6 && parseInt(hour.hour.split(':')[0]) <= 22) // Show business hours
                  .map((hourData) => {
                    const maxRevenue = Math.max(...salesData.salesByHour.map(h => h.revenue))
                    const height = maxRevenue > 0 ? (hourData.revenue / maxRevenue) * 100 : 0
                    
                    return (
                      <div key={hourData.hour} className="flex flex-col items-center justify-end h-full">
                        <div 
                          className="w-full bg-blue-500 rounded-t-sm min-h-[2px] transition-all duration-300 hover:bg-blue-600"
                          style={{ height: `${height}%` }}
                          title={`${hourData.hour}: ${formatCurrency(hourData.revenue)} (${hourData.transactions} transactions)`}
                        />
                        <span className="text-xs text-muted-foreground mt-1 transform -rotate-45 origin-bottom-left">
                          {hourData.hour.split(':')[0]}
                        </span>
                      </div>
                    )
                  })}
              </div>
              
              {/* Legend */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>6 AM</span>
                <span>Peak Hours</span>
                <span>10 PM</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Data State */}
      {!loading && !error && salesData && salesData.totalTransactions === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <img 
                src="/kwaci-grow-webp-transparent.webp" 
                alt="KWACI Grow Logo" 
                className="h-16 w-16 opacity-50"
              />
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2 mt-4">No Sales Data</h3>
            <p className="text-muted-foreground">
              No sales recorded for {getPeriodLabel(selectedPeriod).toLowerCase()}. 
              Start recording sales to see analytics here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
