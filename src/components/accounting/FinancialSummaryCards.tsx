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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatCurrency } from '@/utils/formatters'
import type { FinancialSummary } from '@/lib/types/accounting'

interface FinancialSummaryCardsProps {
  summary: FinancialSummary | null
  loading: boolean
  error: string | null
}

export function FinancialSummaryCards({ summary, loading, error }: FinancialSummaryCardsProps) {
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
          Financial Health: 
        </span>
        <Badge variant={isHealthy ? "default" : "destructive"}>
          {isHealthy ? "Healthy" : "Needs Attention"}
        </Badge>
        {summary.profitMargin !== 0 && (
          <Badge variant="outline">
            {summary.profitMargin.toFixed(1)}% Profit Margin
          </Badge>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Income */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.totalIncome)}
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Sales: {formatCurrency(summary.salesIncome)}</div>
              <div>Capital: {formatCurrency(summary.capitalInvestments)}</div>
            </div>
          </CardContent>
        </Card>

        {/* Total Expenses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.totalExpenses)}
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Operating: {formatCurrency(summary.operatingExpenses)}</div>
              <div>Fixed: {formatCurrency(summary.fixedCosts)}</div>
              <div>Variable: {formatCurrency(summary.variableCosts)}</div>
            </div>
          </CardContent>
        </Card>

        {/* Net Income */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <DollarSign className={`h-4 w-4 ${summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary.netIncome)}
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Gross Profit: {formatCurrency(summary.grossProfit)}</div>
              <div>Operating Profit: {formatCurrency(summary.operatingProfit)}</div>
            </div>
          </CardContent>
        </Card>

        {/* Cash Flow */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Flow</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary.cashFlow)}
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Burn Rate: {formatCurrency(summary.burnRate)}/month</div>
              {summary.profitMargin !== 0 && (
                <div>Margin: {summary.profitMargin.toFixed(1)}%</div>
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
              <CardTitle className="text-sm font-medium">Cost Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Variable Costs:</span>
                  <span>{((summary.variableCosts / summary.totalIncome) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Fixed Costs:</span>
                  <span>{((summary.fixedCosts / summary.totalIncome) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Operating:</span>
                  <span>{((summary.operatingExpenses / summary.totalIncome) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Revenue Mix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Sales Revenue:</span>
                  <span>{((summary.salesIncome / summary.totalIncome) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Capital Investment:</span>
                  <span>{((summary.capitalInvestments / summary.totalIncome) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Profit Margin:</span>
                  <Badge variant={
                    profitMarginStatus === 'excellent' ? 'default' :
                    profitMarginStatus === 'good' ? 'secondary' :
                    profitMarginStatus === 'fair' ? 'outline' : 'destructive'
                  }>
                    {summary.profitMargin.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
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
