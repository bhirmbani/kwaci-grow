import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Factory, Clock, AlertTriangle, CheckCircle, Package } from 'lucide-react'
import { DashboardService, type OperationsStatus } from '../../lib/services/dashboardService'
import { useCurrentBusinessId } from '../../lib/stores/businessStore'
import { formatDistanceToNow } from 'date-fns'
import { useTranslation } from 'react-i18next'

export function OperationsStatusSection() {
  const { t } = useTranslation()
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
      setError(t('dashboard.operationsStatus.error.loading'))
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
        return <Badge variant="secondary" className="whitespace-nowrap">{t('dashboard.operationsStatus.status.pending')}</Badge>
      case 'in progress':
      case 'in-progress':
        return <Badge variant="default" className="bg-blue-100 text-blue-800 whitespace-nowrap">{t('dashboard.operationsStatus.status.inProgress')}</Badge>
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800 whitespace-nowrap">{t('dashboard.operationsStatus.status.completed')}</Badge>
      case 'cancelled':
        return <Badge variant="destructive" className="whitespace-nowrap">{t('dashboard.operationsStatus.status.cancelled')}</Badge>
      default:
        return <Badge variant="outline" className="whitespace-nowrap">{status}</Badge>
    }
  }

  const getPriorityBadge = (isOverdue: boolean, isUrgent: boolean) => {
    if (isOverdue) {
      return <Badge variant="destructive" className="text-xs">{t('dashboard.operationsStatus.priority.overdue')}</Badge>
    }
    if (isUrgent) {
      return <Badge variant="default" className="bg-yellow-100 text-yellow-800 text-xs">{t('dashboard.operationsStatus.priority.urgent')}</Badge>
    }
    return <Badge variant="outline" className="text-xs">{t('dashboard.operationsStatus.priority.normal')}</Badge>
  }

  if (!currentBusinessId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5" />
            {t('dashboard.operationsStatus.title')}
          </CardTitle>
          <CardDescription>{t('dashboard.operationsStatus.noBusinessSelected.title')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('dashboard.operationsStatus.noBusinessSelected.description')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">{t('dashboard.operationsStatus.title')}</h2>
        <p className="text-muted-foreground">
          {t('dashboard.operationsStatus.description')}
        </p>
      </div>

      {/* Operations Overview Card */}
      <Card className="min-h-[280px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5" />
            {t('dashboard.operationsStatus.overview')}
          </CardTitle>
          <CardDescription>
            {t('dashboard.operationsStatus.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Total Incomplete */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('dashboard.operationsStatus.metrics.incompleteBatches')}</p>
                  {loading ? (
                    <div className="h-8 w-16 bg-muted animate-pulse rounded mt-2" />
                  ) : error ? (
                    <p className="text-sm text-destructive">{t('dashboard.operationsStatus.error.loading')}</p>
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
                  {operationsData.totalIncomplete > 0 ? t('dashboard.operationsStatus.badges.active') : t('dashboard.operationsStatus.badges.allComplete')}
                </Badge>
              )}
            </div>

            {/* Overdue Count */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('dashboard.operationsStatus.metrics.overdueBatches')}</p>
                  {loading ? (
                    <div className="h-8 w-16 bg-muted animate-pulse rounded mt-2" />
                  ) : error ? (
                    <p className="text-sm text-destructive">{t('dashboard.operationsStatus.error.loading')}</p>
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
                  {operationsData.overdueCount > 0 ? t('dashboard.operationsStatus.badges.attentionNeeded') : t('dashboard.operationsStatus.badges.onTrack')}
                </Badge>
              )}
            </div>

            {/* Urgent Count */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('dashboard.operationsStatus.metrics.urgentBatches')}</p>
                  {loading ? (
                    <div className="h-8 w-16 bg-muted animate-pulse rounded mt-2" />
                  ) : error ? (
                    <p className="text-sm text-destructive">{t('dashboard.operationsStatus.error.loading')}</p>
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
                  {operationsData.urgentCount > 0 ? t('dashboard.operationsStatus.badges.monitorClosely') : t('dashboard.operationsStatus.priority.normal')}
                </Badge>
              )}
            </div>

            {/* On-Time Rate */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('dashboard.operationsStatus.metrics.onTimeRate')}</p>
                  {loading ? (
                    <div className="h-8 w-20 bg-muted animate-pulse rounded mt-2" />
                  ) : error ? (
                    <p className="text-sm text-destructive">{t('dashboard.operationsStatus.error.loading')}</p>
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
                  {t('dashboard.operationsStatus.metrics.batchesCompletedOnTime')}
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
              {t('dashboard.operationsStatus.incompleteBatches.title')}
            </CardTitle>
            <CardDescription>
              {t('dashboard.operationsStatus.incompleteBatches.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {operationsData.incompleteBatches.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t('dashboard.operationsStatus.emptyState.title')}</h3>
                <p className="text-muted-foreground">
                  {t('dashboard.operationsStatus.emptyState.description')}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="h-12">
                      <TableHead className="w-[120px]">{t('dashboard.operationsStatus.columns.batchNumber')}</TableHead>
                      <TableHead className="max-w-[200px]">{t('dashboard.operationsStatus.columns.product')}</TableHead>
                      <TableHead className="w-[120px]">{t('dashboard.operationsStatus.columns.quantity')}</TableHead>
                      <TableHead className="w-[100px]">{t('dashboard.operationsStatus.columns.status')}</TableHead>
                      <TableHead className="w-[100px]">{t('dashboard.operationsStatus.columns.priority')}</TableHead>
                      <TableHead className="w-[100px]">{t('dashboard.operationsStatus.columns.created')}</TableHead>
                      <TableHead className="w-[120px]">{t('dashboard.operationsStatus.columns.age')}</TableHead>
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
                              <div className="truncate text-sm text-muted-foreground" title={`${t('dashboard.operationsStatus.columns.target')}: ${batch.quantity} ${batch.unit}`}>
                                {t('dashboard.operationsStatus.columns.target')}: {batch.quantity} {batch.unit}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="py-3 h-16">
                            <div className="truncate font-medium" title={batch.quantity > 0 ? `${batch.quantity} ${batch.unit}` : t('dashboard.operationsStatus.columns.notSpecified')}>
                              {batch.quantity > 0 ? `${batch.quantity} ${batch.unit}` : t('dashboard.operationsStatus.columns.notSpecified')}
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
                            <div className="truncate" title={batch.dateCreated && !isNaN(new Date(batch.dateCreated).getTime()) ? formatDistanceToNow(new Date(batch.dateCreated), { addSuffix: true }) : t('dashboard.operationsStatus.columns.invalidDate')}>
                              {batch.dateCreated && !isNaN(new Date(batch.dateCreated).getTime())
                                ? formatDistanceToNow(new Date(batch.dateCreated), { addSuffix: true })
                                : t('dashboard.operationsStatus.columns.invalidDate')}
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
            <h3 className="text-lg font-semibold mb-2">{t('dashboard.operationsStatus.error.title')}</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={loadOperationsData}
              className="text-sm text-primary hover:underline"
            >
              {t('dashboard.operationsStatus.error.tryAgain')}
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
