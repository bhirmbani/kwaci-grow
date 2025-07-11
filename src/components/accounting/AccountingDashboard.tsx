/**
 * Accounting Dashboard
 * 
 * Main dashboard component for the unified accounting system.
 * Provides financial overview, transaction management, and quick actions.
 */

import { useState, useEffect, useMemo } from 'react'
import { Plus, Filter, Download, TrendingUp, TrendingDown, DollarSign, Receipt, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAccounting } from '@/hooks/useAccounting'
import { useCurrentBusiness } from '@/lib/stores/businessStore'
import { formatCurrency } from '@/utils/formatters'
import { exportTransactions, exportFinancialSummary, exportFinancialReport } from '@/utils/exportUtils'
import { TransactionList } from './TransactionList'
import { FinancialSummaryCards } from './FinancialSummaryCards'
import { FinancialHealthIndicators } from './FinancialHealthIndicators'
import { QuickActions } from './QuickActions'
import type { TransactionFilters } from '@/lib/types/accounting'

export function AccountingDashboard() {
  const currentBusiness = useCurrentBusiness()
  const [showFilters, setShowFilters] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // Always call useAccounting hook to prevent unmounting issues
  const {
    transactions,
    financialSummary,
    loading,
    summaryLoading,
    error,
    summaryError,
    applyFilters,
    clearFilters,
    currentFilters,
    refetch,
    getTotalsByType
  } = useAccounting({
    autoRefresh: true,
    refreshInterval: 60000, // 1 minute
    enableRealTimeUpdates: true
  })



  // Memoize totals to prevent unnecessary recalculations
  const totals = useMemo(() => getTotalsByType(), [getTotalsByType])

  // Temporary debugging to verify loading states
  useEffect(() => {
    console.log('AccountingDashboard - Loading states:', {
      loading,
      summaryLoading,
      transactionCount: transactions.length,
      hasFinancialSummary: !!financialSummary
    })
  }, [loading, summaryLoading, transactions.length, financialSummary])

  // Update last refresh time when data changes
  useEffect(() => {
    if (!loading && !summaryLoading) {
      setLastRefresh(new Date())
    }
  }, [transactions, financialSummary, loading, summaryLoading])

  const handleManualRefresh = async () => {
    await refetch()
    setLastRefresh(new Date())
  }

  const handleExport = () => {
    if (currentBusiness && transactions.length > 0 && financialSummary) {
      exportFinancialReport(transactions, financialSummary, currentBusiness.name)
    }
  }

  // Handle business not selected - render within the same component to prevent unmounting
  if (!currentBusiness) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Accounting</h1>
            <p className="text-muted-foreground">
              Comprehensive financial transaction management
            </p>
          </div>
        </div>

        <Alert>
          <Receipt className="h-4 w-4" />
          <AlertDescription>
            Please select a business to view accounting information.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Handle errors
  if (error && !loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Accounting</h1>
            <p className="text-muted-foreground">
              Financial management for {currentBusiness.name}
            </p>
          </div>
        </div>
        
        <Alert variant="destructive">
          <Receipt className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        
        <Button onClick={refetch} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounting</h1>
          <p className="text-muted-foreground">
            Financial management for {currentBusiness.name}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={loading || summaryLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading || summaryLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={!currentBusiness || transactions.length === 0 || !financialSummary}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          {/* Last refresh indicator */}
          <div className="text-xs text-muted-foreground">
            Updated: {lastRefresh.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <FinancialSummaryCards 
        summary={financialSummary}
        loading={summaryLoading}
        error={summaryError}
      />

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{transactions.length}</div>
            )}
            <p className="text-xs text-muted-foreground">
              All transaction types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totals.SALES_INCOME)}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Revenue from sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operating Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totals.OPERATING_EXPENSE + totals.RECURRING_EXPENSE)}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Operational costs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Position</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading || summaryLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className={`text-2xl font-bold ${
                financialSummary && financialSummary.netIncome >= 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {financialSummary ? formatCurrency(financialSummary.netIncome) : '—'}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Income minus expenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Health Indicators */}
      <FinancialHealthIndicators
        summary={financialSummary}
        loading={summaryLoading}
      />

      {/* Quick Actions */}
      <QuickActions />

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                All financial transactions across your business
              </CardDescription>
            </div>
            
            {currentFilters && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  Filtered
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <TransactionList 
            transactions={transactions}
            loading={loading}
            error={error}
            showFilters={showFilters}
            onApplyFilters={applyFilters}
            onClearFilters={clearFilters}
            currentFilters={currentFilters}
          />
        </CardContent>
      </Card>
    </div>
  )
}
