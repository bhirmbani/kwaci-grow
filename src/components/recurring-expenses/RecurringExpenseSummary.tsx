import { useMemo } from 'react'
import { TrendingUp, TrendingDown, Calendar, DollarSign, PieChart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatCurrency } from '@/utils/formatters'
import { type RecurringExpense } from '@/lib/db/schema'

interface RecurringExpenseSummaryProps {
  expenses: RecurringExpense[]
  monthlyTotal: number
  yearlyTotal: number
  categoryTotals: { category: string; monthly: number; yearly: number }[]
  loading?: boolean
}

export function RecurringExpenseSummary({ 
  expenses, 
  monthlyTotal, 
  yearlyTotal, 
  categoryTotals,
  loading = false 
}: RecurringExpenseSummaryProps) {
  
  const summary = useMemo(() => {
    const activeExpenses = expenses.filter(expense => expense.isActive)
    const inactiveExpenses = expenses.filter(expense => !expense.isActive)
    
    const monthlyExpenses = activeExpenses.filter(expense => expense.frequency === 'monthly')
    const yearlyExpenses = activeExpenses.filter(expense => expense.frequency === 'yearly')
    
    const totalExpenses = expenses.length
    const activeCount = activeExpenses.length
    const inactiveCount = inactiveExpenses.length
    
    // Calculate average expense amounts
    const avgMonthlyAmount = monthlyExpenses.length > 0 
      ? monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0) / monthlyExpenses.length 
      : 0
    
    const avgYearlyAmount = yearlyExpenses.length > 0 
      ? yearlyExpenses.reduce((sum, exp) => sum + exp.amount, 0) / yearlyExpenses.length 
      : 0

    return {
      totalExpenses,
      activeCount,
      inactiveCount,
      monthlyExpenses: monthlyExpenses.length,
      yearlyExpenses: yearlyExpenses.length,
      avgMonthlyAmount,
      avgYearlyAmount,
      activePercentage: totalExpenses > 0 ? (activeCount / totalExpenses) * 100 : 0
    }
  }, [expenses])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border !important">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-card !important">
            <CardTitle className="text-sm font-medium text-card-foreground">Monthly Total</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="bg-card !important">
            <div className="text-2xl font-bold text-card-foreground">{formatCurrency(monthlyTotal)}</div>
            <p className="text-xs text-muted-foreground">
              {summary.monthlyExpenses} monthly + {summary.yearlyExpenses} yearly expenses
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border !important">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-card !important">
            <CardTitle className="text-sm font-medium text-card-foreground">Yearly Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="bg-card !important">
            <div className="text-2xl font-bold text-card-foreground">{formatCurrency(yearlyTotal)}</div>
            <p className="text-xs text-muted-foreground">
              Annual recurring expenses
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border !important">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-card !important">
            <CardTitle className="text-sm font-medium text-card-foreground">Active Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="bg-card !important">
            <div className="text-2xl font-bold text-card-foreground">{summary.activeCount}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Progress value={summary.activePercentage} className="flex-1" />
              <span>{summary.activePercentage.toFixed(0)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border !important">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-card !important">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Expenses</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="bg-card !important">
            <div className="text-2xl font-bold text-card-foreground">{summary.totalExpenses}</div>
            <p className="text-xs text-muted-foreground">
              {summary.inactiveCount} inactive
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      {categoryTotals.length > 0 && (
        <Card className="bg-card border-border !important">
          <CardHeader className="bg-card !important">
            <CardTitle className="text-card-foreground">Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent className="bg-card !important">
            <div className="space-y-4">
              {categoryTotals.map((categoryTotal) => {
                const monthlyPercentage = monthlyTotal > 0 ? (categoryTotal.monthly / monthlyTotal) * 100 : 0
                
                return (
                  <div key={categoryTotal.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{categoryTotal.category}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {monthlyPercentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(categoryTotal.monthly)}/mo</div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(categoryTotal.yearly)}/yr
                        </div>
                      </div>
                    </div>
                    <Progress value={monthlyPercentage} className="h-2" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Frequency Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card border-border !important">
          <CardHeader className="bg-card !important">
            <CardTitle className="text-sm font-medium text-card-foreground">Monthly Expenses</CardTitle>
          </CardHeader>
          <CardContent className="bg-card !important">
            <div className="text-2xl font-bold text-card-foreground">{summary.monthlyExpenses}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatCurrency(summary.avgMonthlyAmount)} per expense
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border !important">
          <CardHeader className="bg-card !important">
            <CardTitle className="text-sm font-medium text-card-foreground">Yearly Expenses</CardTitle>
          </CardHeader>
          <CardContent className="bg-card !important">
            <div className="text-2xl font-bold text-card-foreground">{summary.yearlyExpenses}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatCurrency(summary.avgYearlyAmount)} per expense
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      {summary.totalExpenses > 0 && (
        <Card className="bg-card border-border !important">
          <CardHeader className="bg-card !important">
            <CardTitle className="text-card-foreground">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="bg-card !important">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(monthlyTotal * 12)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Annual cost (monthly × 12)
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(monthlyTotal / 30)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Daily average cost
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {categoryTotals.length}
                </div>
                <p className="text-sm text-muted-foreground">
                  Expense categories
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
