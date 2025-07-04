import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Package, TrendingUp, TrendingDown, Settings, Check, X, Edit3 } from 'lucide-react'
import { useStockLevels, useLowStockAlerts } from '@/hooks/useStock'
import { formatCurrency } from '@/utils/formatters'

export function StockLevels() {
  const {
    stockLevels,
    loading,
    error,
    updateLowStockThreshold,
    reserveStock,
    unreserveStock,
    updateReservation
  } = useStockLevels()
  const { alerts } = useLowStockAlerts()
  const [editingThreshold, setEditingThreshold] = useState<string | null>(null)
  const [newThreshold, setNewThreshold] = useState<number>(0)
  const [editingReservation, setEditingReservation] = useState<string | null>(null)
  const [newReservation, setNewReservation] = useState<number>(0)
  const [reservationMessage, setReservationMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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

  const handleReservationEdit = (stockId: string, currentReservation: number) => {
    setEditingReservation(stockId)
    setNewReservation(currentReservation)
    setReservationMessage(null)
  }

  const handleReservationSave = async (ingredientName: string, unit: string, currentReservation: number) => {
    if (newReservation < 0) {
      setReservationMessage({
        type: 'error',
        text: 'Reservation quantity cannot be negative'
      })
      return
    }

    try {
      const result = await updateReservation(
        ingredientName,
        unit,
        newReservation,
        `Manual reservation update via Stock Levels`
      )

      if (result.success) {
        setEditingReservation(null)
        setReservationMessage({
          type: 'success',
          text: `Reservation updated successfully. Available stock: ${result.availableStock?.toFixed(1) || 0}`
        })
        // Clear success message after 3 seconds
        setTimeout(() => setReservationMessage(null), 3000)
      } else {
        setReservationMessage({
          type: 'error',
          text: result.error || 'Failed to update reservation'
        })
      }
    } catch (error) {
      setReservationMessage({
        type: 'error',
        text: 'An unexpected error occurred while updating reservation'
      })
    }
  }

  const handleReservationCancel = () => {
    setEditingReservation(null)
    setNewReservation(0)
    setReservationMessage(null)
  }

  const handleQuickReserve = async (ingredientName: string, unit: string, quantity: number) => {
    try {
      const result = await reserveStock(
        ingredientName,
        unit,
        quantity,
        `Quick reserve ${quantity} ${unit} via Stock Levels`
      )

      if (result.success) {
        setReservationMessage({
          type: 'success',
          text: `Reserved ${quantity} ${unit} successfully. Available stock: ${result.availableStock?.toFixed(1) || 0}`
        })
        setTimeout(() => setReservationMessage(null), 3000)
      } else {
        setReservationMessage({
          type: 'error',
          text: result.error || 'Failed to reserve stock'
        })
      }
    } catch (error) {
      setReservationMessage({
        type: 'error',
        text: 'An unexpected error occurred while reserving stock'
      })
    }
  }

  const handleQuickUnreserve = async (ingredientName: string, unit: string, quantity: number) => {
    try {
      const result = await unreserveStock(
        ingredientName,
        unit,
        quantity,
        `Quick unreserve ${quantity} ${unit} via Stock Levels`
      )

      if (result.success) {
        setReservationMessage({
          type: 'success',
          text: `Unreserved ${quantity} ${unit} successfully. Available stock: ${result.availableStock?.toFixed(1) || 0}`
        })
        setTimeout(() => setReservationMessage(null), 3000)
      } else {
        setReservationMessage({
          type: 'error',
          text: result.error || 'Failed to unreserve stock'
        })
      }
    } catch (error) {
      setReservationMessage({
        type: 'error',
        text: 'An unexpected error occurred while unreserving stock'
      })
    }
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

      {/* Reservation Messages */}
      {reservationMessage && (
        <Card className={`border-2 ${
          reservationMessage.type === 'success'
            ? 'border-green-200 bg-green-50 dark:bg-green-950/20'
            : 'border-red-200 bg-red-50 dark:bg-red-950/20'
        }`}>
          <CardContent className="p-4">
            <div className={`text-sm font-medium ${
              reservationMessage.type === 'success'
                ? 'text-green-700 dark:text-green-300'
                : 'text-red-700 dark:text-red-300'
            }`}>
              {reservationMessage.text}
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
                const currentStock = typeof stock.currentStock === 'number' && !isNaN(stock.currentStock) ? stock.currentStock : 0
                const reservedStock = typeof stock.reservedStock === 'number' && !isNaN(stock.reservedStock) ? stock.reservedStock : 0
                const lowStockThreshold = typeof stock.lowStockThreshold === 'number' && !isNaN(stock.lowStockThreshold) ? stock.lowStockThreshold : 0
                const availableStock = currentStock - reservedStock
                const isLowStock = currentStock <= lowStockThreshold
                const isEditing = editingThreshold === stock.id
                const isEditingReservation = editingReservation === stock.id

                return (
                  <TableRow key={stock.id} className="group">
                    <TableCell>
                      <div className="font-medium">{stock.ingredientName}</div>
                      <div className="text-xs text-muted-foreground">
                        Unit: {stock.unit}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium">
                        {currentStock.toFixed(1)} {stock.unit}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditingReservation ? (
                        <div className="flex items-center gap-1 justify-end">
                          <Input
                            type="number"
                            value={newReservation}
                            onChange={(e) => setNewReservation(Math.max(0, Number(e.target.value)))}
                            className="w-20 h-8 text-sm"
                            min="0"
                            max={currentStock}
                            step="0.1"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => handleReservationSave(stock.ingredientName, stock.unit, reservedStock)}
                          >
                            <Check className="h-3 w-3 text-green-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={handleReservationCancel}
                          >
                            <X className="h-3 w-3 text-red-600" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 justify-end">
                          <span className={reservedStock > 0 ? "text-orange-600 font-medium" : "text-muted-foreground"}>
                            {reservedStock.toFixed(1)} {stock.unit}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleReservationEdit(stock.id, reservedStock)}
                            title="Edit reservation"
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                        </div>
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
                      <div className="flex items-center gap-1 justify-center">
                        {!isEditing && !isEditingReservation && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleThresholdEdit(stock.id, stock.lowStockThreshold)}
                              className="h-8 px-2"
                              title="Edit low stock threshold"
                            >
                              <Settings className="h-3 w-3" />
                            </Button>
                            {reservedStock > 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleQuickUnreserve(stock.ingredientName, stock.unit, reservedStock)}
                                className="h-8 px-2 text-orange-600 hover:text-orange-700"
                                title="Release all reservations"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                            {availableStock > 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleQuickReserve(stock.ingredientName, stock.unit, Math.min(10, availableStock))}
                                className="h-8 px-2 text-blue-600 hover:text-blue-700"
                                title={`Quick reserve ${Math.min(10, availableStock)} ${stock.unit}`}
                              >
                                +{Math.min(10, availableStock)}
                              </Button>
                            )}
                          </>
                        )}
                      </div>
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
