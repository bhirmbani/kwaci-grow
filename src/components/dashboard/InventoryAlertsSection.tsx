import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { AlertTriangle, Package, CheckCircle, AlertCircle } from 'lucide-react'
import { DashboardService, type InventoryAlert } from '../../lib/services/dashboardService'
import { useCurrentBusinessId } from '../../lib/stores/businessStore'
import { useTranslation } from 'react-i18next'

export function InventoryAlertsSection() {
  const { t } = useTranslation()
  const currentBusinessId = useCurrentBusinessId()
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load inventory alerts data
  const loadInventoryAlerts = async () => {
    if (!currentBusinessId) {
      setInventoryAlerts([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await DashboardService.getInventoryAlerts()
      setInventoryAlerts(data)
    } catch (err) {
      console.error('Failed to load inventory alerts:', err)
      setError(t('dashboard.inventoryAlerts.error.loading'))
    } finally {
      setLoading(false)
    }
  }

  // Load data when business context changes
  useEffect(() => {
    loadInventoryAlerts()
  }, [currentBusinessId])

  const getAlertBadge = (alertLevel: InventoryAlert['alertLevel']) => {
    switch (alertLevel) {
      case 'critical':
        return <Badge variant="destructive" className="text-xs">{t('dashboard.inventoryAlerts.alertLevels.critical')}</Badge>
      case 'low':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800 text-xs">{t('dashboard.inventoryAlerts.alertLevels.lowStock')}</Badge>
      case 'normal':
        return <Badge variant="secondary" className="text-xs">{t('dashboard.inventoryAlerts.alertLevels.normal')}</Badge>
      default:
        return <Badge variant="outline" className="text-xs">{alertLevel}</Badge>
    }
  }

  const getAlertIcon = (alertLevel: InventoryAlert['alertLevel']) => {
    switch (alertLevel) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'low':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'normal':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Package className="h-4 w-4 text-gray-500" />
    }
  }



  // Calculate summary statistics
  const criticalCount = inventoryAlerts.filter(alert => alert.alertLevel === 'critical').length
  const lowStockCount = inventoryAlerts.filter(alert => alert.alertLevel === 'low').length
  const totalAlerts = inventoryAlerts.length

  if (!currentBusinessId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t('dashboard.inventoryAlerts.title')}
          </CardTitle>
          <CardDescription>{t('dashboard.inventoryAlerts.noBusinessSelected.title')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('dashboard.inventoryAlerts.noBusinessSelected.description')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">{t('dashboard.inventoryAlerts.title')}</h2>
        <p className="text-muted-foreground">
          {t('dashboard.inventoryAlerts.description')}
        </p>
      </div>

      {/* Inventory Overview Card */}
      <Card className="min-h-[280px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t('dashboard.inventoryAlerts.overview')}
          </CardTitle>
          <CardDescription>
            {t('dashboard.inventoryAlerts.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Critical Alerts */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('dashboard.inventoryAlerts.metrics.criticalAlerts')}</p>
                  {loading ? (
                    <div className="h-8 w-16 bg-muted animate-pulse rounded mt-2" />
                  ) : error ? (
                    <p className="text-sm text-destructive">{t('dashboard.inventoryAlerts.error.loading')}</p>
                  ) : (
                    <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
                  )}
                </div>
                <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0" />
              </div>
              {!loading && !error && (
                <Badge
                  variant={criticalCount > 0 ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {criticalCount > 0 ? t('dashboard.inventoryAlerts.badges.immediateAction') : t('dashboard.inventoryAlerts.badges.noCriticalIssues')}
                </Badge>
              )}
            </div>

            {/* Low Stock Alerts */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('dashboard.inventoryAlerts.metrics.lowStockAlerts')}</p>
                  {loading ? (
                    <div className="h-8 w-16 bg-muted animate-pulse rounded mt-2" />
                  ) : error ? (
                    <p className="text-sm text-destructive">{t('dashboard.inventoryAlerts.error.loading')}</p>
                  ) : (
                    <p className="text-2xl font-bold text-yellow-600">{lowStockCount}</p>
                  )}
                </div>
                <AlertCircle className="h-6 w-6 text-yellow-500 flex-shrink-0" />
              </div>
              {!loading && !error && (
                <Badge
                  variant={lowStockCount > 0 ? "default" : "secondary"}
                  className={`text-xs ${lowStockCount > 0 ? 'bg-yellow-100 text-yellow-800' : ''}`}
                >
                  {lowStockCount > 0 ? t('dashboard.inventoryAlerts.badges.monitorClosely') : t('dashboard.inventoryAlerts.badges.stockLevelsGood')}
                </Badge>
              )}
            </div>

            {/* Total Items Monitored */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('dashboard.inventoryAlerts.metrics.itemsBelowThreshold')}</p>
                  {loading ? (
                    <div className="h-8 w-16 bg-muted animate-pulse rounded mt-2" />
                  ) : error ? (
                    <p className="text-sm text-destructive">{t('dashboard.inventoryAlerts.error.loading')}</p>
                  ) : (
                    <p className="text-2xl font-bold">{totalAlerts}</p>
                  )}
                </div>
                <Package className="h-6 w-6 text-blue-500 flex-shrink-0" />
              </div>
              {!loading && !error && (
                <Badge
                  variant={totalAlerts > 0 ? "secondary" : "default"}
                  className="text-xs"
                >
                  {totalAlerts > 0 ? t('dashboard.inventoryAlerts.badges.requireAttention') : t('dashboard.inventoryAlerts.badges.allWellStocked')}
                </Badge>
              )}
            </div>

            {/* Stock Health Rate */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('dashboard.inventoryAlerts.metrics.stockHealth')}</p>
                  {loading ? (
                    <div className="h-8 w-20 bg-muted animate-pulse rounded mt-2" />
                  ) : error ? (
                    <p className="text-sm text-destructive">{t('dashboard.inventoryAlerts.error.loading')}</p>
                  ) : (
                    <p className="text-2xl font-bold text-green-600">
                      {totalAlerts === 0 ? '100' : Math.max(0, Math.round(((inventoryAlerts.length - criticalCount) / Math.max(1, inventoryAlerts.length)) * 100))}%
                    </p>
                  )}
                </div>
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
              </div>
              {!loading && !error && (
                <Badge
                  variant={totalAlerts === 0 ? "default" : "secondary"}
                  className="text-xs"
                >
                  {totalAlerts === 0 ? t('dashboard.inventoryAlerts.badges.excellentHealth') : t('dashboard.inventoryAlerts.badges.goodOverall')}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Alerts Table */}
      {!loading && !error && (
        <Card className="min-h-[400px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t('dashboard.inventoryAlerts.lowStockIngredients.title')}
            </CardTitle>
            <CardDescription>
              {t('dashboard.inventoryAlerts.lowStockIngredients.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {inventoryAlerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t('dashboard.inventoryAlerts.emptyState.title')}</h3>
                <p className="text-muted-foreground">
                  {t('dashboard.inventoryAlerts.emptyState.description')}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('dashboard.inventoryAlerts.columns.ingredient')}</TableHead>
                      <TableHead>{t('dashboard.inventoryAlerts.columns.currentStock')}</TableHead>
                      <TableHead>{t('dashboard.inventoryAlerts.columns.threshold')}</TableHead>
                      <TableHead>{t('dashboard.inventoryAlerts.columns.stockLevel')}</TableHead>
                      <TableHead>{t('dashboard.inventoryAlerts.columns.alertLevel')}</TableHead>
                      <TableHead>{t('dashboard.inventoryAlerts.columns.actionNeeded')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryAlerts
                      .sort((a, b) => {
                        // Sort by alert level: critical first, then low, then normal
                        const alertOrder = { critical: 0, low: 1, normal: 2 }
                        if (alertOrder[a.alertLevel] !== alertOrder[b.alertLevel]) {
                          return alertOrder[a.alertLevel] - alertOrder[b.alertLevel]
                        }
                        // Then by percentage remaining (lowest first)
                        return a.percentageRemaining - b.percentageRemaining
                      })
                      .map((alert, index) => (
                        <TableRow key={index} className="hover:bg-muted/50">
                          <TableCell className="font-medium py-3">
                            <div className="flex items-center gap-2">
                              {getAlertIcon(alert.alertLevel)}
                              <span>{alert.ingredientName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            <span className="font-medium">
                              {alert.currentStock} {alert.unit}
                            </span>
                          </TableCell>
                          <TableCell className="py-3">
                            <span className="text-muted-foreground">
                              {alert.threshold} {alert.unit}
                            </span>
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="space-y-2 min-w-[120px]">
                              <Progress 
                                value={Math.min(100, alert.percentageRemaining)}
                                className="h-2"
                              />
                              <span className="text-xs text-muted-foreground">
                                {Math.round(alert.percentageRemaining)}{t('dashboard.inventoryAlerts.progress.ofThreshold')}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            {getAlertBadge(alert.alertLevel)}
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="text-sm">
                              {alert.alertLevel === 'critical' && (
                                <span className="text-red-600 font-medium">
                                  {alert.currentStock === 0 ? t('dashboard.inventoryAlerts.actions.outOfStock') : t('dashboard.inventoryAlerts.actions.reorderUrgently')}
                                </span>
                              )}
                              {alert.alertLevel === 'low' && (
                                <span className="text-yellow-600 font-medium">
                                  {t('dashboard.inventoryAlerts.actions.planReorderSoon')}
                                </span>
                              )}
                              {alert.alertLevel === 'normal' && (
                                <span className="text-muted-foreground">
                                  {t('dashboard.inventoryAlerts.actions.monitorLevels')}
                                </span>
                              )}
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
            <h3 className="text-lg font-semibold mb-2">Unable to Load Inventory Data</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button 
              onClick={loadInventoryAlerts}
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
