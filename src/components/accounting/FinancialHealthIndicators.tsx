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
import { useTranslation } from 'react-i18next'
import { 
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
import { FinancialHealthScoreExplanation } from './FinancialExplanationSheets3'
import { KeyMetricsExplanation, QuickStatsExplanation } from './FinancialExplanationSheets4'

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
  const { t } = useTranslation()
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
        title: t('accounting.health.alerts.negativeProfitMargin.title'),
        message: t("accounting.health.alerts.negativeProfitMargin.message", { value: Math.abs(summary.profitMargin).toFixed(1) }),
        recommendation: t('accounting.health.alerts.negativeProfitMargin.recommendation')
      })
    } else if (summary.profitMargin < 5) {
      alerts.push({
        type: 'warning',
        title: t('accounting.health.alerts.lowProfitMargin.title'),
        message: t("accounting.health.alerts.lowProfitMargin.message", { value: summary.profitMargin.toFixed(1) }),
        recommendation: t('accounting.health.alerts.lowProfitMargin.recommendation')
      })
    } else if (summary.profitMargin >= 20) {
      alerts.push({
        type: 'success',
        title: t('accounting.health.alerts.excellentProfitability.title'),
        message: t("accounting.health.alerts.excellentProfitability.message", { value: summary.profitMargin.toFixed(1) }),
        recommendation: t('accounting.health.alerts.excellentProfitability.recommendation')
      })
    }

    // Cash flow alerts
    if (summary.cashFlow < 0) {
      alerts.push({
        type: 'error',
        title: t('accounting.health.alerts.negativeCashFlow.title'),
        message: t("accounting.health.alerts.negativeCashFlow.message", { value: formatCurrency(Math.abs(summary.cashFlow)) }),
        recommendation: t('accounting.health.alerts.negativeCashFlow.recommendation')
      })
    } else if (summary.cashFlow < summary.burnRate * 3) {
      alerts.push({
        type: 'warning',
        title: t('accounting.health.alerts.lowCashReserves.title'),
        message: t('accounting.health.alerts.lowCashReserves.message'),
        recommendation: t('accounting.health.alerts.lowCashReserves.recommendation')
      })
    }

    // Cost structure alerts
    if (summary.totalIncome > 0) {
      const variableCostRatio = summary.variableCosts / summary.totalIncome
      const fixedCostRatio = summary.fixedCosts / summary.totalIncome

      if (variableCostRatio > 0.6) {
        alerts.push({
          type: 'warning',
          title: t('accounting.health.alerts.highVariableCosts.title'),
          message: t("accounting.health.alerts.highVariableCosts.message", { value: (variableCostRatio * 100).toFixed(1) }),
          recommendation: t('accounting.health.alerts.highVariableCosts.recommendation')
        })
      }

      if (fixedCostRatio > 0.4) {
        alerts.push({
          type: 'warning',
          title: t('accounting.health.alerts.highFixedCosts.title'),
          message: t("accounting.health.alerts.highFixedCosts.message", { value: (fixedCostRatio * 100).toFixed(1) }),
          recommendation: t('accounting.health.alerts.highFixedCosts.recommendation')
        })
      }
    }

    // Growth opportunities
    if (summary.netIncome > 0 && summary.profitMargin > 15) {
      alerts.push({
        type: 'info',
        title: t('accounting.health.alerts.growthOpportunity.title'),
        message: t('accounting.health.alerts.growthOpportunity.message'),
        recommendation: t('accounting.health.alerts.growthOpportunity.recommendation')
      })
    }

    return alerts
  }, [summary, healthMetrics])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('accounting.health.title')}</CardTitle>
          <CardDescription>{t('accounting.health.loading')}</CardDescription>
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
          <CardTitle>{t('accounting.health.title')}</CardTitle>
          <CardDescription>{t('accounting.health.noData')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {t('accounting.health.noDataPrompt')}
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
    if (score >= 80) return { variant: 'default' as const, label: t('accounting.health.badges.excellent') }
    if (score >= 60) return { variant: 'secondary' as const, label: t('accounting.health.badges.good') }
    if (score >= 40) return { variant: 'outline' as const, label: t('accounting.health.badges.fair') }
    return { variant: 'destructive' as const, label: t('accounting.health.badges.poor') }
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
                {t('accounting.health.score')}
                <FinancialHealthScoreExplanation 
                  summary={summary} 
                  healthScore={healthMetrics.overall}
                  profitabilityScore={healthMetrics.profitability}
                  liquidityScore={healthMetrics.liquidity}
                  efficiencyScore={healthMetrics.efficiency}
                  growthScore={healthMetrics.growth}
                />
              </CardTitle>
              <CardDescription>
                {t('accounting.health.overallAssessment')}
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
                {Math.round(healthMetrics.overall * 10) / 10}/100
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
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                {t('accounting.health.keyMetrics')}
              </CardTitle>
              <KeyMetricsExplanation summary={summary} />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">{t('accounting.health.profitability')}</span>
              <div className="flex items-center gap-2">
                <Progress value={healthMetrics.profitability} className="w-16 h-2" />
                <span className={`text-sm font-medium ${getHealthColor(healthMetrics.profitability)}`}>
                  {Math.round(healthMetrics.profitability * 10) / 10}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">{t('accounting.health.liquidity')}</span>
              <div className="flex items-center gap-2">
                <Progress value={healthMetrics.liquidity} className="w-16 h-2" />
                <span className={`text-sm font-medium ${getHealthColor(healthMetrics.liquidity)}`}>
                  {Math.round(healthMetrics.liquidity * 10) / 10}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">{t('accounting.health.efficiency')}</span>
              <div className="flex items-center gap-2">
                <Progress value={healthMetrics.efficiency} className="w-16 h-2" />
                <span className={`text-sm font-medium ${getHealthColor(healthMetrics.efficiency)}`}>
                  {Math.round(healthMetrics.efficiency * 10) / 10}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">{t('accounting.health.growth')}</span>
              <div className="flex items-center gap-2">
                <Progress value={healthMetrics.growth} className="w-16 h-2" />
                <span className={`text-sm font-medium ${getHealthColor(healthMetrics.growth)}`}>
                  {Math.round(healthMetrics.growth * 10) / 10}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                {t('accounting.health.quickStats')}
              </CardTitle>
              <QuickStatsExplanation summary={summary} />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">{t('accounting.health.profitMargin')}</span>
              <span className={`text-sm font-medium ${summary.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {summary.profitMargin.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">{t('accounting.health.burnRate')}</span>
              <span className="text-sm font-medium">
                {formatCurrency(summary.burnRate)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">{t('accounting.health.cashFlow')}</span>
              <span className={`text-sm font-medium ${summary.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(summary.cashFlow)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">{t('accounting.health.netIncome')}</span>
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
          <h3 className="text-sm font-medium text-muted-foreground">{t('accounting.health.alertsTitle')}</h3>
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
