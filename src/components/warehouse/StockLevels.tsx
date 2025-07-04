import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Package, TrendingUp, TrendingDown, Settings } from 'lucide-react'
import { useStockLevels, useLowStockAlerts } from '@/hooks/useStock'
import { formatCurrency } from '@/utils/formatters'

export function StockLevels() {
  const { stockLevels, loading, error, updateLowStockThreshold } = useStockLevels()
  const { alerts } = useLowStockAlerts()
  const [editingThreshold, setEditingThreshold] = useState<string | null>(null)
  const [newThreshold, setNewThreshold] = useState<number>(0)

  const handleThresholdEdit = (stockId: string, currentThreshold: number) => {
    setEditingThreshold(stockId)
    setNewThreshold(currentThreshold)
  }

  const handleThresholdSave = async (ingredientName: string, unit: string) => {
    const result = await updateLowStockThreshold(ingredientName, unit, newThreshold)
    if (result.success) {
      setEditingThreshold(null)
    }
  }

  const handleThresholdCancel = () => {
    setEditingThreshold(null)
    setNewThreshold(0)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading stock levels...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Error loading stock levels: {error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (stockLevels.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Current Stock Levels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Stock Data</h3>
            <p className="text-muted-foreground">
              Stock levels will appear here after you add items to the warehouse.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Low Stock Alerts */}
      {alerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="bg-white dark:bg-orange-950/40 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="font-medium text-orange-900 dark:text-orange-100">
                    {alert.ingredientName}
                  </div>
                  <div className="text-sm text-orange-700 dark:text-orange-300">
                    {alert.currentStock.toFixed(1)} {alert.unit} remaining
                  </div>
                  <div className="text-xs text-orange-600 dark:text-orange-400">
                    Threshold: {alert.lowStockThreshold} {alert.unit}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stock Levels Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Current Stock Levels
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Real-time inventory levels and low stock thresholds
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ingredient</TableHead>
                <TableHead className="text-right">Current Stock</TableHead>
                <TableHead className="text-right">Reserved</TableHead>
                <TableHead className="text-right">Available</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Low Stock Alert</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockLevels.map((stock) => {
                const availableStock = stock.currentStock - stock.reservedStock
                const isLowStock = stock.currentStock <= stock.lowStockThreshold
                const isEditing = editingThreshold === stock.id

                return (
                  <TableRow key={stock.id}>
                    <TableCell>
                      <div className="font-medium">{stock.ingredientName}</div>
                      <div className="text-xs text-muted-foreground">
                        Unit: {stock.unit}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium">
                        {stock.currentStock.toFixed(1)} {stock.unit}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {stock.reservedStock > 0 ? (
                        <span className="text-orange-600">
                          {stock.reservedStock.toFixed(1)} {stock.unit}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium">
                        {availableStock.toFixed(1)} {stock.unit}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={isLowStock ? "destructive" : availableStock > stock.lowStockThreshold * 2 ? "default" : "secondary"}>
                        {isLowStock ? (
                          <>
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Low Stock
                          </>
                        ) : availableStock > stock.lowStockThreshold * 2 ? (
                          <>
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Good
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-3 w-3 mr-1" />
                            Moderate
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            value={newThreshold}
                            onChange={(e) => setNewThreshold(Number(e.target.value))}
                            className="w-16 h-8 text-xs"
                            min="0"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleThresholdSave(stock.ingredientName, stock.unit)}
                            className="h-8 px-2"
                          >
                            ✓
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleThresholdCancel}
                            className="h-8 px-2"
                          >
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <div className="text-sm">
                          {stock.lowStockThreshold} {stock.unit}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {!isEditing && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleThresholdEdit(stock.id, stock.lowStockThreshold)}
                          className="h-8 px-2"
                        >
                          <Settings className="h-3 w-3" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {/* Summary */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                <Package className="h-4 w-4" />
                Total Ingredients
              </div>
              <div className="text-2xl font-bold">{stockLevels.length}</div>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                <AlertTriangle className="h-4 w-4" />
                Low Stock Items
              </div>
              <div className="text-2xl font-bold text-orange-600">{alerts.length}</div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                Well Stocked
              </div>
              <div className="text-2xl font-bold text-green-600">
                {stockLevels.filter(s => s.currentStock > s.lowStockThreshold * 2).length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
