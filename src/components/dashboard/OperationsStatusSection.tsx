import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Factory, Clock, AlertTriangle, CheckCircle, Package } from 'lucide-react'
import { DashboardService, type OperationsStatus } from '../../lib/services/dashboardService'
import { useCurrentBusinessId } from '../../lib/stores/businessStore'
import { formatDistanceToNow } from 'date-fns'

export function OperationsStatusSection() {
  const currentBusinessId = useCurrentBusinessId()
  const [operationsData, setOperationsData] = useState<OperationsStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load operations status data
  const loadOperationsData = async () => {
    if (!currentBusinessId) {
      setOperationsData(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await DashboardService.getOperationsStatus()
      setOperationsData(data)
    } catch (err) {
      console.error('Failed to load operations status:', err)
      setError('Failed to load operations data')
    } finally {
      setLoading(false)
    }
  }

  // Load data when business context changes
  useEffect(() => {
    loadOperationsData()
  }, [currentBusinessId])

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge variant="secondary" className="whitespace-nowrap">Pending</Badge>
      case 'in progress':
      case 'in-progress':
        return <Badge variant="default" className="bg-blue-100 text-blue-800 whitespace-nowrap">In Progress</Badge>
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800 whitespace-nowrap">Completed</Badge>
      case 'cancelled':
        return <Badge variant="destructive" className="whitespace-nowrap">Cancelled</Badge>
      default:
        return <Badge variant="outline" className="whitespace-nowrap">{status}</Badge>
    }
  }

  const getPriorityBadge = (isOverdue: boolean, isUrgent: boolean) => {
    if (isOverdue) {
      return <Badge variant="destructive" className="text-xs">Overdue</Badge>
    }
    if (isUrgent) {
      return <Badge variant="default" className="bg-yellow-100 text-yellow-800 text-xs">Urgent</Badge>
    }
    return <Badge variant="outline" className="text-xs">Normal</Badge>
  }

  if (!currentBusinessId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5" />
            Operations Status
          </CardTitle>
          <CardDescription>No business selected</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please select a business to view operations status.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Operations Status</h2>
        <p className="text-muted-foreground">
          Production batches and operational workflow status
        </p>
      </div>

      {/* Operations Overview Card */}
      <Card className="min-h-[280px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5" />
            Operations Overview
          </CardTitle>
          <CardDescription>
            Production batches and operational workflow status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Total Incomplete */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Incomplete Batches</p>
                  {loading ? (
                    <div className="h-8 w-16 bg-muted animate-pulse rounded mt-2" />
                  ) : error ? (
                    <p className="text-sm text-destructive">Error loading</p>
                  ) : (
                    <p className="text-2xl font-bold">{operationsData?.totalIncomplete || 0}</p>
                  )}
                </div>
                <Package className="h-6 w-6 text-blue-500 flex-shrink-0" />
              </div>
              {operationsData && (
                <Badge
                  variant={operationsData.totalIncomplete > 0 ? "secondary" : "default"}
                  className="text-xs"
                >
                  {operationsData.totalIncomplete > 0 ? 'Active' : 'All Complete'}
                </Badge>
              )}
            </div>

            {/* Overdue Count */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Overdue Batches</p>
                  {loading ? (
                    <div className="h-8 w-16 bg-muted animate-pulse rounded mt-2" />
                  ) : error ? (
                    <p className="text-sm text-destructive">Error loading</p>
                  ) : (
                    <p className="text-2xl font-bold text-red-600">{operationsData?.overdueCount || 0}</p>
                  )}
                </div>
                <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0" />
              </div>
              {operationsData && (
                <Badge
                  variant={operationsData.overdueCount > 0 ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {operationsData.overdueCount > 0 ? 'Attention Needed' : 'On Track'}
                </Badge>
              )}
            </div>

            {/* Urgent Count */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Urgent Batches</p>
                  {loading ? (
                    <div className="h-8 w-16 bg-muted animate-pulse rounded mt-2" />
                  ) : error ? (
                    <p className="text-sm text-destructive">Error loading</p>
                  ) : (
                    <p className="text-2xl font-bold text-yellow-600">{operationsData?.urgentCount || 0}</p>
                  )}
                </div>
                <Clock className="h-6 w-6 text-yellow-500 flex-shrink-0" />
              </div>
              {operationsData && (
                <Badge
                  variant={operationsData.urgentCount > 0 ? "default" : "secondary"}
                  className={`text-xs ${operationsData.urgentCount > 0 ? 'bg-yellow-100 text-yellow-800' : ''}`}
                >
                  {operationsData.urgentCount > 0 ? 'Monitor Closely' : 'Normal'}
                </Badge>
              )}
            </div>

            {/* On-Time Rate */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">On-Time Rate</p>
                  {loading ? (
                    <div className="h-8 w-20 bg-muted animate-pulse rounded mt-2" />
                  ) : error ? (
                    <p className="text-sm text-destructive">Error loading</p>
                  ) : operationsData ? (
                    <p className="text-2xl font-bold">
                      {operationsData.totalIncomplete > 0
                        ? Math.round(((operationsData.totalIncomplete - operationsData.overdueCount) / operationsData.totalIncomplete) * 100)
                        : 100
                      }%
                    </p>
                  ) : (
                    <p className="text-2xl font-bold">100%</p>
                  )}
                </div>
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
              </div>
              {operationsData && (
                <p className="text-xs text-muted-foreground">
                  Batches completed on time
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Incomplete Batches Table */}
      {operationsData && !loading && !error && (
        <Card className="min-h-[400px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Factory className="h-5 w-5" />
              Incomplete Production Batches
            </CardTitle>
            <CardDescription>
              Production batches that require attention or completion
            </CardDescription>
          </CardHeader>
          <CardContent>
            {operationsData.incompleteBatches.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">All Batches Complete</h3>
                <p className="text-muted-foreground">
                  No incomplete production batches. Great job keeping up with production!
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="h-12">
                      <TableHead className="w-[120px]">Batch #</TableHead>
                      <TableHead className="max-w-[200px]">Product</TableHead>
                      <TableHead className="w-[120px]">Quantity</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead className="w-[100px]">Priority</TableHead>
                      <TableHead className="w-[100px]">Created</TableHead>
                      <TableHead className="w-[120px]">Age</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {operationsData.incompleteBatches
                      .sort((a, b) => {
                        // Sort by priority: overdue first, then urgent, then normal
                        if (a.isOverdue && !b.isOverdue) return -1
                        if (!a.isOverdue && b.isOverdue) return 1
                        if (a.isUrgent && !b.isUrgent) return -1
                        if (!a.isUrgent && b.isUrgent) return 1
                        return new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime()
                      })
                      .map((batch) => (
                        <TableRow key={batch.id} className="hover:bg-muted/50 h-16">
                          <TableCell className="font-medium py-3 h-16">
                            <div className="truncate" title={batch.batchNumber}>
                              {batch.batchNumber}
                            </div>
                          </TableCell>
                          <TableCell className="py-3 h-16 max-w-[200px]">
                            <div className="truncate font-medium" title={batch.productName}>
                              {batch.productName}
                            </div>
                            {batch.quantity > 0 && (
                              <div className="truncate text-sm text-muted-foreground" title={`Target: ${batch.quantity} ${batch.unit}`}>
                                Target: {batch.quantity} {batch.unit}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="py-3 h-16">
                            <div className="truncate font-medium" title={batch.quantity > 0 ? `${batch.quantity} ${batch.unit}` : 'Not specified'}>
                              {batch.quantity > 0 ? `${batch.quantity} ${batch.unit}` : 'Not specified'}
                            </div>
                          </TableCell>
                          <TableCell className="py-3 h-16 whitespace-nowrap">
                            {getStatusBadge(batch.status)}
                          </TableCell>
                          <TableCell className="py-3 h-16">
                            {getPriorityBadge(batch.isOverdue, batch.isUrgent)}
                          </TableCell>
                          <TableCell className="py-3 h-16">
                            <div className="truncate text-sm" title={new Date(batch.dateCreated).toLocaleDateString()}>
                              {new Date(batch.dateCreated).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground py-3 h-16">
                            <div className="truncate" title={formatDistanceToNow(new Date(batch.dateCreated), { addSuffix: true })}>
                              {formatDistanceToNow(new Date(batch.dateCreated), { addSuffix: true })}
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
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Unable to Load Operations Data</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button 
              onClick={loadOperationsData}
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
