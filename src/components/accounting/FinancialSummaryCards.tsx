/**
 * Financial Summary Cards Component
 * 
 * Displays key financial metrics in card format:
 * - Total income and expenses
 * - Net income and profit margins
 * - Cash flow indicators
 * - Business health metrics
 */

import { TrendingUp, TrendingDown, DollarSign, PieChart, AlertTriangle, CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatCurrency } from '@/utils/formatters'
import type { FinancialSummary } from '@/lib/types/accounting'
import { 
  TotalIncomeExplanation, 
  TotalExpensesExplanation, 
  NetIncomeExplanation, 
  CashFlowExplanation 
} from './FinancialExplanationSheets'
import { 
  CostStructureExplanation, 
  RevenueMixExplanation, 
  PerformanceExplanation 
} from './FinancialExplanationSheets2'

interface FinancialSummaryCardsProps {
  summary: FinancialSummary | null
  loading: boolean
  error: string | null
}

export function FinancialSummaryCards({ summary, loading, error }: FinancialSummaryCardsProps) {
  const { t } = useTranslation()
  // Loading state
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  // No data state
  if (!summary) {
    return (
      <Alert>
        <PieChart className="h-4 w-4" />
        <AlertDescription>
          No financial data available. Start by recording some transactions.
        </AlertDescription>
      </Alert>
    )
  }

  // Determine financial health
  const isHealthy = summary.netIncome >= 0
  const profitMarginStatus = summary.profitMargin >= 20 ? 'excellent' : 
                           summary.profitMargin >= 10 ? 'good' : 
                           summary.profitMargin >= 0 ? 'fair' : 'poor'

  return (
    <div className="space-y-4">
      {/* Financial Health Indicator */}
      <div className="flex items-center gap-2">
        {isHealthy ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-red-600" />
        )}
        <span className="font-medium">
          {t('accounting.summary.financialHealth')}
        </span>
        <Badge variant={isHealthy ? "default" : "destructive"}>
          {isHealthy ? t('accounting.summary.healthy') : t('accounting.summary.needsAttention')}
        </Badge>
        {summary.profitMargin !== 0 && (
          <Badge variant="outline">
            {summary.profitMargin.toFixed(1)}% {t('accounting.summary.profitMargin')}
          </Badge>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Income */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('accounting.summary.totalIncome')}
            </CardTitle>
            <div className="flex items-center gap-1">
              <TotalIncomeExplanation summary={summary} />
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.totalIncome)}
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>{t('accounting.summary.sales')}: {formatCurrency(summary.salesIncome)}</div>
              <div>{t('accounting.summary.capital')}: {formatCurrency(summary.capitalInvestments)}</div>
            </div>
          </CardContent>
        </Card>

        {/* Total Expenses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('accounting.summary.totalExpenses')}
            </CardTitle>
            <div className="flex items-center gap-1">
              <TotalExpensesExplanation summary={summary} />
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.totalExpenses)}
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>{t('accounting.summary.operating')}: {formatCurrency(summary.operatingExpenses)}</div>
              <div>{t('accounting.summary.fixed')}: {formatCurrency(summary.fixedCosts)}</div>
              <div>{t('accounting.summary.variable')}: {formatCurrency(summary.variableCosts)}</div>
            </div>
          </CardContent>
        </Card>

        {/* Net Income */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('accounting.summary.netIncome')}
            </CardTitle>
            <div className="flex items-center gap-1">
              <NetIncomeExplanation summary={summary} />
              <DollarSign className={`h-4 w-4 ${summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary.netIncome)}
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>{t('accounting.summary.grossProfit')}: {formatCurrency(summary.grossProfit)}</div>
              <div>{t('accounting.summary.operatingProfit')}: {formatCurrency(summary.operatingProfit)}</div>
            </div>
          </CardContent>
        </Card>

        {/* Cash Flow */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('accounting.summary.cashFlow')}
            </CardTitle>
            <div className="flex items-center gap-1">
              <CashFlowExplanation summary={summary} />
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary.cashFlow)}
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>{t('accounting.summary.burnRate')}: {formatCurrency(summary.burnRate)}/month</div>
              {summary.profitMargin !== 0 && (
                <div>{t('accounting.summary.margin')}: {summary.profitMargin.toFixed(1)}%</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      {summary.totalIncome > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {t('accounting.summary.costStructure')}
                </CardTitle>
                <CostStructureExplanation summary={summary} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{t('accounting.summary.variableCosts')}:</span>
                  <span>{((summary.variableCosts / summary.totalIncome) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('accounting.summary.fixedCosts')}:</span>
                  <span>{((summary.fixedCosts / summary.totalIncome) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('accounting.summary.operatingCosts')}:</span>
                  <span>{((summary.operatingExpenses / summary.totalIncome) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {t('accounting.summary.revenueMix')}
                </CardTitle>
                <RevenueMixExplanation summary={summary} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{t('accounting.summary.salesRevenue')}:</span>
                  <span>{((summary.salesIncome / summary.totalIncome) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('accounting.summary.capitalInvestment')}:</span>
                  <span>{((summary.capitalInvestments / summary.totalIncome) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {t('accounting.summary.performance')}
                </CardTitle>
                <PerformanceExplanation summary={summary} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{t('accounting.summary.profitMargin')}:</span>
                  <Badge variant={
                    profitMarginStatus === 'excellent' ? 'default' :
                    profitMarginStatus === 'good' ? 'secondary' :
                    profitMarginStatus === 'fair' ? 'outline' : 'destructive'
                  }>
                    {summary.profitMargin.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>{t('accounting.summary.status')}:</span>
                  <span className="capitalize">{profitMarginStatus}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
