import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { Wallet, TrendingUp, TrendingDown, AlertTriangle, DollarSign, CreditCard, Clock } from 'lucide-react'
import { DashboardService, type FinancialOverview } from '../../lib/services/dashboardService'
import { formatCurrency } from '../../utils/formatters'
import { useCurrentBusinessId, useCurrentBusinessCurrency } from '../../lib/stores/businessStore'

export function FinancialOverviewSection() {
  const { t } = useTranslation()
  const currentBusinessId = useCurrentBusinessId()
  const currentCurrency = useCurrentBusinessCurrency()
  const [financialData, setFinancialData] = useState<FinancialOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load financial overview data
  const loadFinancialData = async () => {
    if (!currentBusinessId) {
      setFinancialData(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await DashboardService.getFinancialOverview()
      setFinancialData(data)
    } catch (err) {
      console.error('Failed to load financial overview:', err)
      setError(t('dashboard.errorLoading'))
    } finally {
      setLoading(false)
    }
  }

  // Load data when business context changes
  useEffect(() => {
    loadFinancialData()
  }, [currentBusinessId])

  const getFinancialHealthStatus = (data: FinancialOverview) => {
    if (data.netPosition > 0) {
      return { status: 'healthy', color: 'text-green-600', bgColor: 'bg-green-100', label: t('dashboard.financialOverview.healthStatus.healthy') }
    } else if (data.netPosition > -data.monthlyBurnRate * 0.5) {
      return { status: 'warning', color: 'text-yellow-600', bgColor: 'bg-yellow-100', label: t('dashboard.financialOverview.healthStatus.caution') }
    } else {
      return { status: 'critical', color: 'text-red-600', bgColor: 'bg-red-100', label: t('dashboard.financialOverview.healthStatus.critical') }
    }
  }

  const calculateRunwayMonths = (data: FinancialOverview): number => {
    if (data.monthlyBurnRate <= 0 || data.availableCash <= 0) return 0
    return Math.floor(data.availableCash / data.monthlyBurnRate)
  }

  if (!currentBusinessId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            {t('dashboard.financialOverview.title')}
          </CardTitle>
          <CardDescription>{t('dashboard.noBusinessSelected')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('dashboard.selectBusinessToView')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">{t('dashboard.financialOverview.title')}</h2>
        <p className="text-muted-foreground">
          {t('dashboard.financialOverview.description')}
        </p>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Available Cash */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('dashboard.financialOverview.metrics.availableCash')}</p>
                {loading ? (
                  <div className="h-8 w-24 bg-muted animate-pulse rounded mt-2" />
                ) : error ? (
                  <p className="text-sm text-destructive">{t('dashboard.errorLoading')}</p>
                ) : (
                  <p className="text-2xl font-bold">{formatCurrency(financialData?.availableCash || 0, currentCurrency)}</p>
                )}
              </div>
              <Wallet className="h-8 w-8 text-green-500" />
            </div>
            {financialData && (
              <div className="mt-4">
                <Badge 
                  variant={financialData.availableCash > 0 ? "default" : "destructive"}
                  className="text-xs"
                >
                  {financialData.availableCash > 0 ? t('dashboard.financialOverview.metrics.positive') : t('dashboard.financialOverview.metrics.negative')}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total Expenses */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('dashboard.financialOverview.metrics.monthlyExpenses')}</p>
                {loading ? (
                  <div className="h-8 w-24 bg-muted animate-pulse rounded mt-2" />
                ) : error ? (
                  <p className="text-sm text-destructive">{t('dashboard.errorLoading')}</p>
                ) : (
                  <p className="text-2xl font-bold">{formatCurrency(financialData?.totalExpenses || 0, currentCurrency)}</p>
                )}
              </div>
              <CreditCard className="h-8 w-8 text-red-500" />
            </div>
            {financialData && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground">
                  {t('dashboard.financialOverview.metrics.burnRate')}: {formatCurrency(financialData.monthlyBurnRate, currentCurrency)}/month
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Net Position */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('dashboard.financialOverview.metrics.netPosition')}</p>
                {loading ? (
                  <div className="h-8 w-24 bg-muted animate-pulse rounded mt-2" />
                ) : error ? (
                  <p className="text-sm text-destructive">{t('dashboard.errorLoading')}</p>
                ) : (
                  <p className="text-2xl font-bold">{formatCurrency(financialData?.netPosition || 0, currentCurrency)}</p>
                )}
              </div>
              {financialData && financialData.netPosition >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-500" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-500" />
              )}
            </div>
            {financialData && (
              <div className="mt-4">
                {(() => {
                  const health = getFinancialHealthStatus(financialData)
                  return (
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${health.color} ${health.bgColor}`}
                    >
                      {health.label}
                    </Badge>
                  )
                })()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cash Runway */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('dashboard.financialOverview.metrics.cashRunway')}</p>
                {loading ? (
                  <div className="h-8 w-24 bg-muted animate-pulse rounded mt-2" />
                ) : error ? (
                  <p className="text-sm text-destructive">{t('dashboard.errorLoading')}</p>
                ) : (
                  <p className="text-2xl font-bold">
                    {calculateRunwayMonths(financialData)} {t('dashboard.financialOverview.metrics.months')}
                  </p>
                )}
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
            {financialData && (
              <div className="mt-4">
                {(() => {
                  const months = calculateRunwayMonths(financialData)
                  let variant: "default" | "secondary" | "destructive" = "default"
                  let label = "Good"
                  
                  if (months < 3) {
                    variant = "destructive"
                    label = "Critical"
                  } else if (months < 6) {
                    variant = "secondary"
                    label = "Caution"
                  }
                  
                  return (
                    <Badge variant={variant} className="text-xs">
                      {label}
                    </Badge>
                  )
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Financial Health Summary */}
      {financialData && !loading && !error && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {t('dashboard.financialOverview.summary.title')}
            </CardTitle>
            <CardDescription>
              {t('dashboard.financialOverview.summary.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Cash Flow Indicator */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{t('dashboard.financialOverview.summary.cashFlowStatus')}</span>
                {(() => {
                  const health = getFinancialHealthStatus(financialData)
                  return (
                    <Badge variant="secondary" className={`${health.color} ${health.bgColor}`}>
                      {health.label}
                    </Badge>
                  )
                })()}
              </div>
              <Progress 
                value={Math.max(0, Math.min(100, (financialData.netPosition / Math.abs(financialData.netPosition || 1)) * 50 + 50))}
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {financialData.netPosition >= 0 
                  ? t('dashboard.financialOverview.summary.positiveCashFlow')
                  : t('dashboard.financialOverview.summary.negativeCashFlow')
                }
              </p>
            </div>

            {/* Key Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">{t('dashboard.financialOverview.summary.revenueVsExpenses')}</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('dashboard.financialOverview.summary.monthlyRevenue')}</span>
                    <span className="font-medium">
                      {formatCurrency(financialData.netPosition + financialData.totalExpenses, currentCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('dashboard.financialOverview.summary.monthlyExpenses')}</span>
                    <span className="font-medium">{formatCurrency(financialData.totalExpenses, currentCurrency)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold border-t pt-1">
                    <span>{t('dashboard.financialOverview.summary.netResult')}</span>
                    <span className={financialData.netPosition >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(financialData.netPosition, currentCurrency)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">{t('dashboard.financialOverview.summary.recommendations')}</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {financialData.netPosition < 0 && (
                    <p>{t('dashboard.financialOverview.summary.focusOnRevenue')}</p>
                  )}
                  {calculateRunwayMonths(financialData) < 3 && financialData.availableCash > 0 && (
                    <p>{t('dashboard.financialOverview.summary.considerOptimization')}</p>
                  )}
                  {financialData.netPosition > 0 && (
                    <p>{t('dashboard.financialOverview.summary.considerReinvestment')}</p>
                  )}
                  {financialData.availableCash <= 0 && (
                    <p>{t('dashboard.financialOverview.summary.immediateAttention')}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Unable to Load Financial Data</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button 
              onClick={loadFinancialData}
              className="text-sm text-primary hover:underline"
            >
              Try again
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
