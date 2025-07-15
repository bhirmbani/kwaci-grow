import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { Wallet, TrendingUp, TrendingDown, AlertTriangle, DollarSign, CreditCard } from 'lucide-react'
import { DashboardService, type FinancialOverview } from '../../lib/services/dashboardService'
import { formatCurrency } from '../../utils/formatters'
import { useCurrentBusinessId } from '../../lib/stores/businessStore'

export function FinancialOverviewSection() {
  const { t } = useTranslation()
  const currentBusinessId = useCurrentBusinessId()
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
            Financial Overview
          </CardTitle>
          <CardDescription>No business selected</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please select a business to view financial overview.</p>
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
                <p className="text-sm font-medium text-muted-foreground">Available Cash</p>
                {loading ? (
                  <div className="h-8 w-24 bg-muted animate-pulse rounded mt-2" />
                ) : error ? (
                  <p className="text-sm text-destructive">Error loading</p>
                ) : (
                  <p className="text-2xl font-bold">{formatCurrency(financialData?.availableCash || 0)}</p>
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
                  {financialData.availableCash > 0 ? 'Positive' : 'Negative'}
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
                <p className="text-sm font-medium text-muted-foreground">Monthly Expenses</p>
                {loading ? (
                  <div className="h-8 w-24 bg-muted animate-pulse rounded mt-2" />
                ) : error ? (
                  <p className="text-sm text-destructive">Error loading</p>
                ) : (
                  <p className="text-2xl font-bold">{formatCurrency(financialData?.totalExpenses || 0)}</p>
                )}
              </div>
              <CreditCard className="h-8 w-8 text-red-500" />
            </div>
            {financialData && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground">
                  Burn rate: {formatCurrency(financialData.monthlyBurnRate)}/month
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
                <p className="text-sm font-medium text-muted-foreground">Net Position</p>
                {loading ? (
                  <div className="h-8 w-24 bg-muted animate-pulse rounded mt-2" />
                ) : error ? (
                  <p className="text-sm text-destructive">Error loading</p>
                ) : (
                  <p className="text-2xl font-bold">{formatCurrency(financialData?.netPosition || 0)}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Cash Runway</p>
                {loading ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded mt-2" />
                ) : error ? (
                  <p className="text-sm text-destructive">Error loading</p>
                ) : financialData ? (
                  <p className="text-2xl font-bold">
                    {calculateRunwayMonths(financialData)} 
                    <span className="text-sm font-normal text-muted-foreground ml-1">months</span>
                  </p>
                ) : (
                  <p className="text-2xl font-bold">0</p>
                )}
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
            {financialData && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground">
                  At current burn rate
                </p>
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
              Financial Health Summary
            </CardTitle>
            <CardDescription>
              Overview of your business financial position
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Cash Flow Indicator */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Cash Flow Status</span>
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
                  ? 'Positive cash flow - business is generating more revenue than expenses'
                  : 'Negative cash flow - expenses exceed revenue, monitor closely'
                }
              </p>
            </div>

            {/* Key Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Revenue vs Expenses</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Monthly Revenue</span>
                    <span className="font-medium">
                      {formatCurrency(financialData.netPosition + financialData.totalExpenses)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Monthly Expenses</span>
                    <span className="font-medium">{formatCurrency(financialData.totalExpenses)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold border-t pt-1">
                    <span>Net Result</span>
                    <span className={financialData.netPosition >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(financialData.netPosition)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Financial Recommendations</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {financialData.netPosition < 0 && (
                    <p>• Focus on increasing revenue or reducing expenses</p>
                  )}
                  {calculateRunwayMonths(financialData) < 3 && financialData.availableCash > 0 && (
                    <p>• Consider cost optimization - runway is less than 3 months</p>
                  )}
                  {financialData.netPosition > 0 && (
                    <p>• Consider reinvesting profits for business growth</p>
                  )}
                  {financialData.availableCash <= 0 && (
                    <p>• Immediate attention needed - negative cash position</p>
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
