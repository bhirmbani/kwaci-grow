import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
      setError(t('dashboard.errorLoading'))
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
    return t(`dashboard.salesAnalytics.periods.${period}`)
  }



  if (!currentBusinessId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {t('dashboard.salesAnalytics.title')}
          </CardTitle>
          <CardDescription>{t('dashboard.noBusinessSelected')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('dashboard.selectBusinessToView')} {t('dashboard.salesAnalytics.title').toLowerCase()}.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t('dashboard.salesAnalytics.title')}</h2>
          <p className="text-muted-foreground">
            {t('dashboard.salesAnalytics.description', { period: getPeriodLabel(selectedPeriod).toLowerCase() })}
          </p>
        </div>
        <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('dashboard.salesAnalytics.selectPeriod')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">{t('dashboard.salesAnalytics.periods.today')}</SelectItem>
            <SelectItem value="week">{t('dashboard.salesAnalytics.periods.week')}</SelectItem>
            <SelectItem value="month">{t('dashboard.salesAnalytics.periods.month')}</SelectItem>
            <SelectItem value="quarter">{t('dashboard.salesAnalytics.periods.quarter')}</SelectItem>
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
                <p className="text-sm font-medium text-muted-foreground">{t('dashboard.salesAnalytics.metrics.totalRevenue')}</p>
                {loading ? (
                  <div className="h-8 w-24 bg-muted animate-pulse rounded mt-2" />
                ) : error ? (
                  <p className="text-sm text-destructive">{t('dashboard.errorLoading')}</p>
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
                <p className="text-sm font-medium text-muted-foreground">{t('dashboard.salesAnalytics.metrics.transactions')}</p>
                {loading ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded mt-2" />
                ) : error ? (
                  <p className="text-sm text-destructive">{t('dashboard.errorLoading')}</p>
                ) : (
                  <p className="text-2xl font-bold">{salesData?.totalTransactions || 0}</p>
                )}
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-500" />
            </div>
            {salesData && (
              <div className="mt-4 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {salesData.totalTransactions > 0 ? t('dashboard.salesAnalytics.metrics.active') : t('dashboard.salesAnalytics.metrics.noSales')}
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
                <p className="text-sm font-medium text-muted-foreground">{t('dashboard.salesAnalytics.metrics.avgOrderValue')}</p>
                {loading ? (
                  <div className="h-8 w-20 bg-muted animate-pulse rounded mt-2" />
                ) : error ? (
                  <p className="text-sm text-destructive">{t('dashboard.errorLoading')}</p>
                ) : (
                  <p className="text-2xl font-bold">{formatCurrency(salesData?.averageOrderValue || 0)}</p>
                )}
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
            {salesData && salesData.totalTransactions > 0 && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground">
                  {t('dashboard.salesAnalytics.metrics.perTransactionAverage')}
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
                <p className="text-sm font-medium text-muted-foreground">{t('dashboard.salesAnalytics.metrics.topProduct')}</p>
                {loading ? (
                  <div className="h-8 w-full bg-muted animate-pulse rounded mt-2" />
                ) : error ? (
                  <p className="text-sm text-destructive">{t('dashboard.errorLoading')}</p>
                ) : salesData?.topProduct ? (
                  <div className="mt-2">
                    <p className="text-lg font-bold truncate">{salesData.topProduct.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {salesData.topProduct.quantity} {t('dashboard.salesAnalytics.metrics.sold')} • {formatCurrency(salesData.topProduct.revenue)}
                    </p>
                  </div>
                ) : (
                  <p className="text-lg font-bold text-muted-foreground">{t('dashboard.salesAnalytics.metrics.noSales')}</p>
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
              {t('dashboard.salesAnalytics.hourlyChart.title')}
            </CardTitle>
            <CardDescription>
              {t('dashboard.salesAnalytics.hourlyChart.description')}
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
                <span>{t('dashboard.salesAnalytics.hourlyChart.peakHours')}</span>
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
            <h3 className="text-lg font-semibold mb-2 mt-4">{t('dashboard.salesAnalytics.noData.title')}</h3>
            <p className="text-muted-foreground">
              {t('dashboard.salesAnalytics.noData.description', { period: getPeriodLabel(selectedPeriod).toLowerCase() })}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
