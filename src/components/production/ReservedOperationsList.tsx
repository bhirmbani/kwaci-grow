import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Package, Plus, Trash2, Factory, User, AlertCircle } from 'lucide-react'
import { useReservations } from '@/hooks/useReservations'
import { useStockLevels } from '@/hooks/useStock'

export function ReservedOperationsList() {
  const { t } = useTranslation()
  const [purposeFilter, setPurposeFilter] = useState<'all' | 'manual' | 'production'>('all')
  const [newReservation, setNewReservation] = useState({
    selectedStockId: '',
    ingredientName: '',
    unit: '',
    quantity: 0,
    reason: ''
  })
  const [isCreatingReservation, setIsCreatingReservation] = useState(false)
  
  const {
    reservations,
    loading,
    error,
    releaseReservation,
    createManualReservation,
    groupedReservations,
    getReservationStats
  } = useReservations()

  const { stockLevels, loading: stockLoading } = useStockLevels()

  // Filter reservations based on purpose
  const filteredReservations = reservations.filter(reservation => {
    if (purposeFilter === 'all') return true
    if (purposeFilter === 'manual') return reservation.purpose === 'Manual Reservation'
    if (purposeFilter === 'production') return reservation.purpose.startsWith('Production Batch')
    return true
  })

  const stats = getReservationStats()
  const grouped = groupedReservations()

  // Get available stock items for selection
  const availableStockItems = stockLevels.filter(stock => {
    const availableStock = stock.currentStock - stock.reservedStock
    return availableStock > 0
  })

  // Get selected stock item details
  const selectedStock = stockLevels.find(stock =>
    `${stock.ingredientName}-${stock.unit}` === newReservation.selectedStockId
  )
  const selectedAvailableStock = selectedStock
    ? selectedStock.currentStock - selectedStock.reservedStock
    : 0

  // Handle stock selection
  const handleStockSelection = (stockId: string) => {
    // Ignore placeholder value
    if (stockId === "no-items-available") {
      return
    }

    const stock = stockLevels.find(s => `${s.ingredientName}-${s.unit}` === stockId)
    if (stock) {
      setNewReservation(prev => ({
        ...prev,
        selectedStockId: stockId,
        ingredientName: stock.ingredientName,
        unit: stock.unit,
        quantity: 0 // Reset quantity when changing stock
      }))
    }
  }

  // Validate reservation quantity
  const isValidQuantity = newReservation.quantity > 0 &&
    newReservation.quantity <= selectedAvailableStock

  const handleReleaseReservation = async (reservation: typeof reservations[0]) => {
    const result = await releaseReservation(
      reservation.ingredientName,
      reservation.unit,
      reservation.quantity,
      reservation.reservationId,
      reservation.purpose,
      reservation.productionBatchId
    )
    
    if (!result.success) {
      console.error('Failed to release reservation:', result.error)
    }
  }

  const handleCreateReservation = async () => {
    if (!newReservation.ingredientName || !newReservation.unit || !isValidQuantity) {
      return
    }

    setIsCreatingReservation(true)
    const result = await createManualReservation(
      newReservation.ingredientName,
      newReservation.unit,
      newReservation.quantity,
      newReservation.reason || `Manual reservation of ${newReservation.quantity} ${newReservation.unit}`
    )

    if (result.success) {
      setNewReservation({
        selectedStockId: '',
        ingredientName: '',
        unit: '',
        quantity: 0,
        reason: ''
      })
    } else {
      console.error('Failed to create reservation:', result.error)
    }
    setIsCreatingReservation(false)
  }

  const getPurposeIcon = (purpose: string) => {
    if (purpose === 'Manual Reservation') {
      return <User className="h-4 w-4" />
    } else if (purpose.startsWith('Production Batch')) {
      return <Factory className="h-4 w-4" />
    }
    return <Package className="h-4 w-4" />
  }

  const getPurposeColor = (purpose: string) => {
    if (purpose === 'Manual Reservation') {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    } else if (purpose.startsWith('Production Batch')) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <p className="text-muted-foreground">{t('common.error')} {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('production.reservations.stats.total')}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReservations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('production.reservations.stats.manual')}</CardTitle>
            <User className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.manualReservations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('production.reservations.stats.production')}</CardTitle>
            <Factory className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.productionReservations}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Reservations Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {t('production.reservations.title')}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {t('production.reservations.description')}
              </p>
            </div>
            
            {/* Create Manual Reservation */}
            <Sheet>
              <SheetTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('production.reservations.create')}
                </Button>
              </SheetTrigger>
              <SheetContent className="h-full overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>{t('production.reservations.createTitle')}</SheetTitle>
                  <SheetDescription>
                    {t('production.reservations.createDescription')}
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-4 mt-6">
                  {stockLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="stock-selection">{t('production.reservations.selectStock')}</Label>
                        <Select
                          value={newReservation.selectedStockId}
                          onValueChange={handleStockSelection}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('production.reservations.chooseStock')} />
                          </SelectTrigger>
                          <SelectContent>
                            {availableStockItems.length === 0 ? (
                              <SelectItem value="no-items-available" disabled>
                                {t('production.reservations.noStockItems')}
                              </SelectItem>
                            ) : (
                              availableStockItems.map((stock) => {
                                const availableStock = stock.currentStock - stock.reservedStock
                                return (
                                  <SelectItem
                                    key={`${stock.ingredientName}-${stock.unit}`}
                                    value={`${stock.ingredientName}-${stock.unit}`}
                                  >
                                    {stock.ingredientName} ({availableStock.toFixed(1)} {stock.unit} available)
                                  </SelectItem>
                                )
                              })
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Show selected stock details */}
                      {selectedStock && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{t('production.reservations.selected', { ingredient: selectedStock.ingredientName })}</span>
                            <span className="text-muted-foreground">
                              {t('production.reservations.unit')}: {selectedStock.unit}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm mt-1">
                            <span>{t('production.reservations.available')}</span>
                            <span className="font-medium text-green-600">
                              {selectedAvailableStock.toFixed(1)} {selectedStock.unit}
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="quantity">{t('production.reservations.quantity')}</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="0"
                      max={selectedAvailableStock}
                      step="0.1"
                      value={newReservation.quantity || ''}
                      onChange={(e) => setNewReservation(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                      placeholder={selectedStock ? `Enter quantity (max: ${selectedAvailableStock.toFixed(1)} ${selectedStock.unit})` : t('production.reservations.selectFirst')}
                      disabled={!selectedStock}
                      className={!isValidQuantity && newReservation.quantity > 0 ? 'border-red-500' : ''}
                    />
                    {newReservation.quantity > 0 && !isValidQuantity && (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <span>
                          {t('production.reservations.invalidQuantity', { available: selectedAvailableStock.toFixed(1), unit: selectedStock?.unit })}
                        </span>
                      </div>
                    )}
                    {selectedStock && newReservation.quantity > 0 && isValidQuantity && (
                      <div className="text-sm text-green-600">
                        {t('production.reservations.validQuantity')}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">{t('production.reservations.reason')}</Label>
                    <Textarea
                      id="reason"
                      value={newReservation.reason}
                      onChange={(e) => setNewReservation(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder={t('production.reservations.reasonPlaceholder')}
                      rows={3}
                    />
                  </div>
                  <Button
                    onClick={handleCreateReservation}
                    disabled={
                      isCreatingReservation ||
                      !selectedStock ||
                      !isValidQuantity ||
                      stockLoading
                    }
                    className="w-full"
                  >
                    {isCreatingReservation
                      ? t('production.reservations.creating')
                      : !selectedStock
                      ? t('production.reservations.selectFirst')
                      : !isValidQuantity && newReservation.quantity > 0
                      ? t('production.reservations.invalidQuantityButton')
                      : t('production.reservations.createAction')
                    }
                  </Button>

                  {availableStockItems.length === 0 && !stockLoading && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        <span>
                          {t('production.reservations.noStockWarning')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Filter Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="purpose-filter">{t('production.reservations.filter')}</Label>
              <Select value={purposeFilter} onValueChange={(value) => setPurposeFilter(value as typeof purposeFilter)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('production.reservations.allPurposes')}</SelectItem>
                  <SelectItem value="manual">{t('production.reservations.manual')}</SelectItem>
                  <SelectItem value="production">{t('production.reservations.productionPurpose')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              {t('production.reservations.showing', { shown: filteredReservations.length, total: reservations.length })}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredReservations.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {purposeFilter === 'all'
                  ? t('production.reservations.noReservations.all')
                  : t('production.reservations.noReservations.purpose', { purpose: purposeFilter })
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('production.reservations.table.ingredient')}</TableHead>
                  <TableHead>{t('production.reservations.table.quantity')}</TableHead>
                  <TableHead>{t('production.reservations.table.purpose')}</TableHead>
                  <TableHead>{t('production.reservations.table.date')}</TableHead>
                  <TableHead>{t('production.reservations.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReservations.map((reservation, index) => (
                  <TableRow key={`${reservation.ingredientName}-${reservation.unit}-${index}`}>
                    <TableCell>
                      <div className="font-medium">{reservation.ingredientName}</div>
                      <div className="text-xs text-muted-foreground">{t('production.reservations.unit')}: {reservation.unit}</div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {reservation.quantity} {reservation.unit}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getPurposeColor(reservation.purpose)} flex items-center gap-1 w-fit`}>
                        {getPurposeIcon(reservation.purpose)}
                        {reservation.purpose}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(reservation.transactionDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('production.reservations.releaseTitle')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('production.reservations.releaseConfirm', { quantity: reservation.quantity, unit: reservation.unit, ingredient: reservation.ingredientName })}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('production.batchList.cancel')}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleReleaseReservation(reservation)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {t('production.reservations.release')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
