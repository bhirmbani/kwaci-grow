import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Button } from '../ui/button'
import { Building2, TrendingUp, TrendingDown, ArrowUpDown, Crown, MapPin } from 'lucide-react'
import { DashboardService, type BranchPerformance, type TimePeriod } from '../../lib/services/dashboardService'
import { formatCurrency } from '../../utils/formatters'
import { useCurrentBusinessId } from '../../lib/stores/businessStore'

interface BranchPerformanceSectionProps {
  selectedPeriod: TimePeriod
}

type SortField = 'name' | 'revenue' | 'transactions' | 'averageOrderValue' | 'rank'
type SortDirection = 'asc' | 'desc'

export function BranchPerformanceSection({ selectedPeriod }: BranchPerformanceSectionProps) {
  const currentBusinessId = useCurrentBusinessId()
  const [branchData, setBranchData] = useState<BranchPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField>('revenue')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Load branch performance data
  const loadBranchData = async (period: TimePeriod) => {
    if (!currentBusinessId) {
      setBranchData([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await DashboardService.getBranchPerformance(period)
      setBranchData(data)
    } catch (err) {
      console.error('Failed to load branch performance:', err)
      setError('Failed to load branch data')
    } finally {
      setLoading(false)
    }
  }

  // Load data when business context or period changes
  useEffect(() => {
    loadBranchData(selectedPeriod)
  }, [currentBusinessId, selectedPeriod])

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  // Sort data
  const sortedBranchData = [...branchData].sort((a, b) => {
    let aValue: number | string
    let bValue: number | string

    switch (sortField) {
      case 'name':
        aValue = a.branchName
        bValue = b.branchName
        break
      case 'revenue':
        aValue = a.totalRevenue
        bValue = b.totalRevenue
        break
      case 'transactions':
        aValue = a.totalTransactions
        bValue = b.totalTransactions
        break
      case 'averageOrderValue':
        aValue = a.averageOrderValue
        bValue = b.averageOrderValue
        break
      case 'rank':
        aValue = a.performanceRank
        bValue = b.performanceRank
        break
      default:
        aValue = a.totalRevenue
        bValue = b.totalRevenue
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }

    return sortDirection === 'asc' 
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number)
  })

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
    }
    return sortDirection === 'asc' 
      ? <TrendingUp className="h-4 w-4" />
      : <TrendingDown className="h-4 w-4" />
  }

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
          <Crown className="h-3 w-3" />
          #1
        </Badge>
      case 2:
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">#2</Badge>
      case 3:
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">#3</Badge>
      default:
        return <Badge variant="outline">#{rank}</Badge>
    }
  }

  const getPeriodLabel = (period: TimePeriod): string => {
    switch (period) {
      case 'today': return 'Today'
      case 'week': return 'This Week'
      case 'month': return 'This Month'
      case 'quarter': return 'Last 3 Months'
      default: return 'Today'
    }
  }

  // Calculate summary statistics
  const totalRevenue = branchData.reduce((sum, branch) => sum + branch.totalRevenue, 0)
  const totalTransactions = branchData.reduce((sum, branch) => sum + branch.totalTransactions, 0)
  const averageRevenuePerBranch = branchData.length > 0 ? totalRevenue / branchData.length : 0
  const topPerformer = branchData.find(branch => branch.performanceRank === 1)

  if (!currentBusinessId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Branch Performance
          </CardTitle>
          <CardDescription>No business selected</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please select a business to view branch performance.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Branch Performance</h2>
        <p className="text-muted-foreground">
          Sales performance comparison across branches for {getPeriodLabel(selectedPeriod).toLowerCase()}
        </p>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Branches */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Branches</p>
                {loading ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded mt-2" />
                ) : error ? (
                  <p className="text-sm text-destructive">Error loading</p>
                ) : (
                  <p className="text-2xl font-bold">{branchData.length}</p>
                )}
              </div>
              <Building2 className="h-8 w-8 text-blue-500" />
            </div>
            {!loading && !error && (
              <div className="mt-4">
                <Badge variant="secondary" className="text-xs">
                  {branchData.length > 0 ? 'Operational' : 'No branches'}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

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
                  <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                )}
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            {!loading && !error && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground">
                  Across all branches
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Average per Branch */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg per Branch</p>
                {loading ? (
                  <div className="h-8 w-24 bg-muted animate-pulse rounded mt-2" />
                ) : error ? (
                  <p className="text-sm text-destructive">Error loading</p>
                ) : (
                  <p className="text-2xl font-bold">{formatCurrency(averageRevenuePerBranch)}</p>
                )}
              </div>
              <Building2 className="h-8 w-8 text-purple-500" />
            </div>
            {!loading && !error && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground">
                  Revenue per branch
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Performer */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-muted-foreground">Top Performer</p>
                {loading ? (
                  <div className="h-8 w-full bg-muted animate-pulse rounded mt-2" />
                ) : error ? (
                  <p className="text-sm text-destructive">Error loading</p>
                ) : topPerformer ? (
                  <div className="mt-2">
                    <p className="text-lg font-bold truncate">{topPerformer.branchName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(topPerformer.totalRevenue)}
                    </p>
                  </div>
                ) : (
                  <p className="text-lg font-bold text-muted-foreground">No data</p>
                )}
              </div>
              <Crown className="h-8 w-8 text-yellow-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Branch Performance Table */}
      {!loading && !error && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Branch Performance Comparison
            </CardTitle>
            <CardDescription>
              Detailed performance metrics for each branch ({getPeriodLabel(selectedPeriod)})
            </CardDescription>
          </CardHeader>
          <CardContent>
            {branchData.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Branch Data</h3>
                <p className="text-muted-foreground">
                  No branches found or no sales data available for the selected period.
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleSort('rank')}
                          className="h-auto p-0 font-semibold"
                        >
                          Rank {getSortIcon('rank')}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleSort('name')}
                          className="h-auto p-0 font-semibold"
                        >
                          Branch {getSortIcon('name')}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleSort('revenue')}
                          className="h-auto p-0 font-semibold"
                        >
                          Revenue {getSortIcon('revenue')}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleSort('transactions')}
                          className="h-auto p-0 font-semibold"
                        >
                          Transactions {getSortIcon('transactions')}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleSort('averageOrderValue')}
                          className="h-auto p-0 font-semibold"
                        >
                          Avg Order {getSortIcon('averageOrderValue')}
                        </Button>
                      </TableHead>
                      <TableHead>Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedBranchData.map((branch) => (
                      <TableRow key={branch.branchId}>
                        <TableCell>
                          {getRankBadge(branch.performanceRank)}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{branch.branchName}</span>
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {branch.location}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {formatCurrency(branch.totalRevenue)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {branch.totalTransactions}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {formatCurrency(branch.averageOrderValue)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {branch.totalRevenue > averageRevenuePerBranch ? (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-sm text-muted-foreground">
                              {branch.totalRevenue > averageRevenuePerBranch ? 'Above' : 'Below'} average
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="p-8 text-center">
            <Building2 className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Unable to Load Branch Data</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button 
              onClick={() => loadBranchData(selectedPeriod)}
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
