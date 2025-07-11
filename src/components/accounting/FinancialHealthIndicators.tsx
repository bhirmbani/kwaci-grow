/**
 * Financial Health Indicators Component
 * 
 * Provides business health scoring and alerts based on financial metrics:
 * - Overall health score calculation
 * - Key performance indicators
 * - Risk alerts and recommendations
 * - Trend analysis and insights
 */

import { useMemo } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  AlertCircle,
  Info,
  Target,
  DollarSign
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatCurrency } from '@/utils/formatters'
import type { FinancialSummary } from '@/lib/types/accounting'

interface FinancialHealthIndicatorsProps {
  summary: FinancialSummary | null
  loading?: boolean
}

interface HealthScore {
  overall: number
  profitability: number
  liquidity: number
  efficiency: number
  growth: number
}

interface HealthAlert {
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
  recommendation?: string
}

export function FinancialHealthIndicators({ summary, loading }: FinancialHealthIndicatorsProps) {
  const healthMetrics = useMemo(() => {
    if (!summary) return null

    // Calculate health scores (0-100)
    const scores: HealthScore = {
      overall: 0,
      profitability: 0,
      liquidity: 0,
      efficiency: 0,
      growth: 0
    }

    // Profitability Score (40% weight)
    if (summary.totalIncome > 0) {
      const profitMargin = summary.profitMargin
      scores.profitability = Math.min(100, Math.max(0, 
        profitMargin >= 20 ? 100 :
        profitMargin >= 15 ? 85 :
        profitMargin >= 10 ? 70 :
        profitMargin >= 5 ? 55 :
        profitMargin >= 0 ? 40 : 0
      ))
    }

    // Liquidity Score (25% weight) - Based on cash flow
    const cashFlowRatio = summary.totalIncome > 0 ? summary.cashFlow / summary.totalIncome : 0
    scores.liquidity = Math.min(100, Math.max(0,
      cashFlowRatio >= 0.3 ? 100 :
      cashFlowRatio >= 0.2 ? 85 :
      cashFlowRatio >= 0.1 ? 70 :
      cashFlowRatio >= 0 ? 55 : 0
    ))

    // Efficiency Score (20% weight) - Based on cost ratios
    if (summary.totalIncome > 0) {
      const totalCostRatio = summary.totalExpenses / summary.totalIncome
      scores.efficiency = Math.min(100, Math.max(0,
        totalCostRatio <= 0.6 ? 100 :
        totalCostRatio <= 0.7 ? 85 :
        totalCostRatio <= 0.8 ? 70 :
        totalCostRatio <= 0.9 ? 55 : 40
      ))
    }

    // Growth Score (15% weight) - Simplified based on net income
    scores.growth = summary.netIncome > 0 ? 
      Math.min(100, 60 + (summary.netIncome / Math.max(summary.totalIncome, 1)) * 40) : 
      summary.netIncome === 0 ? 50 : 30

    // Overall Score (weighted average)
    scores.overall = Math.round(
      scores.profitability * 0.4 +
      scores.liquidity * 0.25 +
      scores.efficiency * 0.2 +
      scores.growth * 0.15
    )

    return scores
  }, [summary])

  const healthAlerts = useMemo(() => {
    if (!summary || !healthMetrics) return []

    const alerts: HealthAlert[] = []

    // Profitability alerts
    if (summary.profitMargin < 0) {
      alerts.push({
        type: 'error',
        title: 'Negative Profit Margin',
        message: `Your business is operating at a ${Math.abs(summary.profitMargin).toFixed(1)}% loss.`,
        recommendation: 'Review expenses and consider increasing prices or reducing costs.'
      })
    } else if (summary.profitMargin < 5) {
      alerts.push({
        type: 'warning',
        title: 'Low Profit Margin',
        message: `Profit margin of ${summary.profitMargin.toFixed(1)}% is below healthy levels.`,
        recommendation: 'Aim for at least 10-15% profit margin for sustainable growth.'
      })
    } else if (summary.profitMargin >= 20) {
      alerts.push({
        type: 'success',
        title: 'Excellent Profitability',
        message: `Strong profit margin of ${summary.profitMargin.toFixed(1)}%.`,
        recommendation: 'Consider reinvesting profits for growth opportunities.'
      })
    }

    // Cash flow alerts
    if (summary.cashFlow < 0) {
      alerts.push({
        type: 'error',
        title: 'Negative Cash Flow',
        message: `Cash outflow of ${formatCurrency(Math.abs(summary.cashFlow))}.`,
        recommendation: 'Focus on increasing income and managing expenses.'
      })
    } else if (summary.cashFlow < summary.burnRate * 3) {
      alerts.push({
        type: 'warning',
        title: 'Low Cash Reserves',
        message: 'Cash flow covers less than 3 months of expenses.',
        recommendation: 'Build cash reserves for financial stability.'
      })
    }

    // Cost structure alerts
    if (summary.totalIncome > 0) {
      const variableCostRatio = summary.variableCosts / summary.totalIncome
      const fixedCostRatio = summary.fixedCosts / summary.totalIncome

      if (variableCostRatio > 0.6) {
        alerts.push({
          type: 'warning',
          title: 'High Variable Costs',
          message: `Variable costs are ${(variableCostRatio * 100).toFixed(1)}% of income.`,
          recommendation: 'Review supplier costs and operational efficiency.'
        })
      }

      if (fixedCostRatio > 0.4) {
        alerts.push({
          type: 'warning',
          title: 'High Fixed Costs',
          message: `Fixed costs are ${(fixedCostRatio * 100).toFixed(1)}% of income.`,
          recommendation: 'Consider reducing fixed expenses or increasing revenue.'
        })
      }
    }

    // Growth opportunities
    if (summary.netIncome > 0 && summary.profitMargin > 15) {
      alerts.push({
        type: 'info',
        title: 'Growth Opportunity',
        message: 'Strong financial position enables expansion.',
        recommendation: 'Consider investing in marketing, inventory, or new locations.'
      })
    }

    return alerts
  }, [summary, healthMetrics])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Health</CardTitle>
          <CardDescription>Loading health indicators...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!summary || !healthMetrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Health</CardTitle>
          <CardDescription>No data available for health analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Record some transactions to see your business health indicators.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getHealthBadge = (score: number) => {
    if (score >= 80) return { variant: 'default' as const, label: 'Excellent' }
    if (score >= 60) return { variant: 'secondary' as const, label: 'Good' }
    if (score >= 40) return { variant: 'outline' as const, label: 'Fair' }
    return { variant: 'destructive' as const, label: 'Poor' }
  }

  const overallBadge = getHealthBadge(healthMetrics.overall)

  return (
    <div className="space-y-6">
      {/* Overall Health Score */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {healthMetrics.overall >= 60 ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                )}
                Financial Health Score
              </CardTitle>
              <CardDescription>
                Overall business financial health assessment
              </CardDescription>
            </div>
            <Badge variant={overallBadge.variant} className="text-lg px-3 py-1">
              {overallBadge.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {healthMetrics.overall}/100
              </span>
              <span className={`text-sm font-medium ${getHealthColor(healthMetrics.overall)}`}>
                {overallBadge.label} Health
              </span>
            </div>
            <Progress value={healthMetrics.overall} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Key Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Profitability</span>
              <div className="flex items-center gap-2">
                <Progress value={healthMetrics.profitability} className="w-16 h-2" />
                <span className={`text-sm font-medium ${getHealthColor(healthMetrics.profitability)}`}>
                  {healthMetrics.profitability}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Liquidity</span>
              <div className="flex items-center gap-2">
                <Progress value={healthMetrics.liquidity} className="w-16 h-2" />
                <span className={`text-sm font-medium ${getHealthColor(healthMetrics.liquidity)}`}>
                  {healthMetrics.liquidity}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Efficiency</span>
              <div className="flex items-center gap-2">
                <Progress value={healthMetrics.efficiency} className="w-16 h-2" />
                <span className={`text-sm font-medium ${getHealthColor(healthMetrics.efficiency)}`}>
                  {healthMetrics.efficiency}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Growth</span>
              <div className="flex items-center gap-2">
                <Progress value={healthMetrics.growth} className="w-16 h-2" />
                <span className={`text-sm font-medium ${getHealthColor(healthMetrics.growth)}`}>
                  {healthMetrics.growth}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Profit Margin</span>
              <span className={`text-sm font-medium ${summary.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {summary.profitMargin.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Monthly Burn Rate</span>
              <span className="text-sm font-medium">
                {formatCurrency(summary.burnRate)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Cash Flow</span>
              <span className={`text-sm font-medium ${summary.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(summary.cashFlow)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Net Income</span>
              <span className={`text-sm font-medium ${summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(summary.netIncome)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Alerts */}
      {healthAlerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Health Alerts & Recommendations</h3>
          {healthAlerts.map((alert, index) => (
            <Alert key={index} variant={alert.type === 'error' ? 'destructive' : 'default'}>
              {alert.type === 'success' && <CheckCircle className="h-4 w-4" />}
              {alert.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
              {alert.type === 'error' && <AlertCircle className="h-4 w-4" />}
              {alert.type === 'info' && <Info className="h-4 w-4" />}
              <AlertDescription>
                <div className="space-y-1">
                  <div className="font-medium">{alert.title}</div>
                  <div>{alert.message}</div>
                  {alert.recommendation && (
                    <div className="text-sm text-muted-foreground">
                      💡 {alert.recommendation}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </div>
  )
}
