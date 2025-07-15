import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { AlertTriangle, Package, CheckCircle, AlertCircle } from 'lucide-react'
import { DashboardService, type InventoryAlert } from '../../lib/services/dashboardService'
import { useCurrentBusinessId } from '../../lib/stores/businessStore'

export function InventoryAlertsSection() {
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
      setError('Failed to load inventory data')
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
        return <Badge variant="destructive" className="text-xs">Critical</Badge>
      case 'low':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800 text-xs">Low Stock</Badge>
      case 'normal':
        return <Badge variant="secondary" className="text-xs">Normal</Badge>
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

  const getProgressColor = (alertLevel: InventoryAlert['alertLevel']) => {
    switch (alertLevel) {
      case 'critical':
        return 'bg-red-500'
      case 'low':
        return 'bg-yellow-500'
      case 'normal':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
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
            Inventory Alerts
          </CardTitle>
          <CardDescription>No business selected</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please select a business to view inventory alerts.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Inventory Alerts</h2>
        <p className="text-muted-foreground">
          Stock levels and low inventory warnings
        </p>
      </div>

      {/* Inventory Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Critical Alerts */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Alerts</p>
                {loading ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded mt-2" />
                ) : error ? (
                  <p className="text-sm text-destructive">Error loading</p>
                ) : (
                  <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
                )}
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            {!loading && !error && (
              <div className="mt-4">
                <Badge 
                  variant={criticalCount > 0 ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {criticalCount > 0 ? 'Immediate Action' : 'No Critical Issues'}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock Alerts</p>
                {loading ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded mt-2" />
                ) : error ? (
                  <p className="text-sm text-destructive">Error loading</p>
                ) : (
                  <p className="text-2xl font-bold text-yellow-600">{lowStockCount}</p>
                )}
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
            {!loading && !error && (
              <div className="mt-4">
                <Badge 
                  variant={lowStockCount > 0 ? "default" : "secondary"}
                  className={`text-xs ${lowStockCount > 0 ? 'bg-yellow-100 text-yellow-800' : ''}`}
                >
                  {lowStockCount > 0 ? 'Monitor Closely' : 'Stock Levels Good'}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total Items Monitored */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Items Below Threshold</p>
                {loading ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded mt-2" />
                ) : error ? (
                  <p className="text-sm text-destructive">Error loading</p>
                ) : (
                  <p className="text-2xl font-bold">{totalAlerts}</p>
                )}
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
            {!loading && !error && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground">
                  {totalAlerts > 0 ? 'Require attention' : 'All items well-stocked'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Inventory Alerts Table */}
      {!loading && !error && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Low Stock Ingredients
            </CardTitle>
            <CardDescription>
              Ingredients that are below their low stock threshold
            </CardDescription>
          </CardHeader>
          <CardContent>
            {inventoryAlerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">All Stock Levels Good</h3>
                <p className="text-muted-foreground">
                  No ingredients are below their low stock threshold. Keep up the good inventory management!
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ingredient</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Threshold</TableHead>
                      <TableHead>Stock Level</TableHead>
                      <TableHead>Alert Level</TableHead>
                      <TableHead>Action Needed</TableHead>
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
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {getAlertIcon(alert.alertLevel)}
                              <span>{alert.ingredientName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {alert.currentStock} {alert.unit}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-muted-foreground">
                              {alert.threshold} {alert.unit}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <Progress 
                                value={Math.min(100, alert.percentageRemaining)}
                                className="h-2"
                              />
                              <span className="text-xs text-muted-foreground">
                                {Math.round(alert.percentageRemaining)}% of threshold
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getAlertBadge(alert.alertLevel)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {alert.alertLevel === 'critical' && (
                                <span className="text-red-600 font-medium">
                                  {alert.currentStock === 0 ? 'Out of stock - Order immediately' : 'Reorder urgently'}
                                </span>
                              )}
                              {alert.alertLevel === 'low' && (
                                <span className="text-yellow-600 font-medium">
                                  Plan reorder soon
                                </span>
                              )}
                              {alert.alertLevel === 'normal' && (
                                <span className="text-muted-foreground">
                                  Monitor levels
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

      {/* Quick Actions Card */}
      {inventoryAlerts.length > 0 && !loading && !error && (
        <Card>
          <CardHeader>
            <CardTitle>Recommended Actions</CardTitle>
            <CardDescription>
              Suggested next steps based on current inventory status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {criticalCount > 0 && (
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-800">Critical Stock Shortage</h4>
                    <p className="text-sm text-red-700">
                      {criticalCount} ingredient{criticalCount > 1 ? 's are' : ' is'} critically low or out of stock. 
                      Place emergency orders immediately to avoid production disruption.
                    </p>
                  </div>
                </div>
              )}
              
              {lowStockCount > 0 && (
                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800">Low Stock Warning</h4>
                    <p className="text-sm text-yellow-700">
                      {lowStockCount} ingredient{lowStockCount > 1 ? 's are' : ' is'} below the recommended threshold. 
                      Plan reorders within the next few days to maintain optimal stock levels.
                    </p>
                  </div>
                </div>
              )}

              {criticalCount === 0 && lowStockCount === 0 && (
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-800">Inventory Status Good</h4>
                    <p className="text-sm text-green-700">
                      All monitored ingredients are above their low stock thresholds. 
                      Continue monitoring and maintain regular reorder schedules.
                    </p>
                  </div>
                </div>
              )}
            </div>
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
