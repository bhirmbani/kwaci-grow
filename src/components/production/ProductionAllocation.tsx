import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Factory, CheckCircle, AlertCircle, Package } from 'lucide-react'
import { useStockLevels } from '@/hooks/useStock'
import { useFinancialItems } from '@/hooks/useFinancialItems'
import { useProduction } from '@/hooks/useProduction'
import { useProducts, useProduct } from '@/hooks/useProducts'
import { FINANCIAL_ITEM_CATEGORIES } from '@/lib/db/schema'
import { convertProductToFinancialItems } from '@/utils/cogsCalculations'
import type { FinancialItem } from '@/types'
import { ProductionBatchStatusManager } from './ProductionBatchStatusManager'

interface ProductionAllocationProps {
  onStockLevelsChanged?: () => void
}

export function ProductionAllocation({ onStockLevelsChanged }: ProductionAllocationProps = {}) {
  const { t } = useTranslation()
  const [cupsToAllocate, setCupsToAllocate] = useState<number>(0)
  const [note, setNote] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [selectedProductId, setSelectedProductId] = useState<string>('legacy')

  const { stockLevels, loading: stockLoading } = useStockLevels()
  const { items: cogsItems, loading: cogsLoading } = useFinancialItems(FINANCIAL_ITEM_CATEGORIES.VARIABLE_COGS)
  const { createBatchWithItems, batches, loading: productionLoading, error: productionError } = useProduction()
  const { products, loading: productsLoading } = useProducts()
  const { product: selectedProduct, loading: selectedProductLoading } = useProduct(
    selectedProductId !== 'legacy' ? selectedProductId : ''
  )
  const productSuffix = selectedProductId !== 'legacy' && selectedProduct ? t('production.allocation.productSuffix', { name: selectedProduct.name }) : ''

  // Get ingredients based on selected mode (product or legacy COGS)
  const validIngredients = useMemo(() => {
    if (selectedProductId === 'legacy') {
      // Use legacy COGS items
      return cogsItems.filter((item: FinancialItem) =>
        item.usagePerCup !== undefined &&
        item.unit !== undefined &&
        item.usagePerCup > 0
      )
    } else if (selectedProduct) {
      // Convert product ingredients to FinancialItem format
      return convertProductToFinancialItems(selectedProduct)
    }
    return []
  }, [selectedProductId, selectedProduct, cogsItems])

  // Calculate stock validation for current allocation
  const stockValidation = useMemo(() => {
    if (cupsToAllocate <= 0 || validIngredients.length === 0) {
      return { isValid: true, insufficientIngredients: [], maxPossibleCups: 0 }
    }

    const insufficientIngredients: Array<{
      name: string
      unit: string
      required: number
      available: number
      shortage: number
    }> = []

    let maxPossibleCups = Infinity

    validIngredients.forEach(item => {
      const totalNeeded = item.usagePerCup! * cupsToAllocate
      const stockLevel = stockLevels.find(s => s.ingredientName === item.name && s.unit === item.unit)
      const availableStock = stockLevel ? stockLevel.currentStock - stockLevel.reservedStock : 0

      // Calculate max possible cups for this ingredient
      const maxCupsForIngredient = Math.floor(availableStock / item.usagePerCup!)
      maxPossibleCups = Math.min(maxPossibleCups, maxCupsForIngredient)

      if (availableStock < totalNeeded) {
        insufficientIngredients.push({
          name: item.name,
          unit: item.unit!,
          required: totalNeeded,
          available: availableStock,
          shortage: totalNeeded - availableStock
        })
      }
    })

    return {
      isValid: insufficientIngredients.length === 0,
      insufficientIngredients,
      maxPossibleCups: maxPossibleCups === Infinity ? 0 : Math.max(0, maxPossibleCups)
    }
  }, [cupsToAllocate, validIngredients, stockLevels])

  const handleAllocateProduction = async () => {
    if (cupsToAllocate <= 0) {
      setMessage({ type: 'error', text: t('production.allocation.messages.invalidCups') })
      return
    }

    if (validIngredients.length === 0) {
      setMessage({ type: 'error', text: t('production.allocation.messages.noValidIngredients') })
      return
    }

    // Pre-allocation stock validation
    if (!stockValidation.isValid) {
      const insufficientList = stockValidation.insufficientIngredients
        .map(ing => `${ing.name}: need ${ing.required.toFixed(1)} ${ing.unit}, have ${ing.available.toFixed(1)} ${ing.unit} (short ${ing.shortage.toFixed(1)} ${ing.unit})`)
        .join('; ')

      const maxCupsMessage = stockValidation.maxPossibleCups > 0
        ? ` ${t('production.allocation.hints.maxPossible', { count: stockValidation.maxPossibleCups })}`
        : ` ${t('production.allocation.hints.noProduction')}`

      setMessage({
        type: 'error',
        text: t('production.allocation.messages.insufficientStock', { details: insufficientList, maxCupsMessage })
      })
      return
    }

    setIsProcessing(true)
    setMessage(null)

    try {
      // Prepare batch data
      const productInfo = selectedProductId === 'legacy'
        ? t('production.allocation.legacy')
        : selectedProduct?.name || 'Unknown Product'

      const batchData = {
        dateCreated: new Date().toISOString(),
        status: 'Pending' as const,
        note: note || t('production.allocation.messages.noteDefault', { cups: cupsToAllocate, product: productInfo })
      }

      // Prepare items data
      const items = validIngredients.map(item => ({
        ingredientName: item.name,
        quantity: item.usagePerCup! * cupsToAllocate,
        unit: item.unit!,
        note: `${item.usagePerCup} ${item.unit} per cup × ${cupsToAllocate} cups`
      }))

      const result = await createBatchWithItems(batchData, items)

      if (result.success) {
        setMessage({
          type: 'success',
          text: t('production.allocation.messages.success', { batch: result.batch?.batchNumber, cups: cupsToAllocate, product: productInfo })
        })
        setCupsToAllocate(0)
        setNote('')
        // Keep product selection for next batch
      } else {
        setMessage({
          type: 'error',
          text: t('production.allocation.messages.failed', { error: result.error })
        })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: t('production.allocation.messages.unexpected')
      })
    } finally {
      setIsProcessing(false)
      // Clear message after 5 seconds
      setTimeout(() => setMessage(null), 5000)
    }
  }

  if (stockLoading || cogsLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('production.allocation.loading')}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5" />
            {t('production.allocation.title')}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t('production.allocation.description')}
          </p>
        </CardHeader>
      <CardContent className="space-y-4">
        {/* Product Selection */}
        <div className="space-y-2">
          <Label htmlFor="product-selection">{t('production.allocation.fields.product')}</Label>
          <Select value={selectedProductId} onValueChange={setSelectedProductId}>
            <SelectTrigger>
              <SelectValue placeholder={t('production.allocation.placeholders.selectProduct')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="legacy">{t('production.allocation.legacy')}</SelectItem>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedProductId !== 'legacy' && selectedProduct && (
            <div className="p-2 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>{selectedProduct.name}</strong>: {selectedProduct.description}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {t('production.allocation.selectedProductInfo', { count: selectedProduct.ingredients.length })}
              </p>
            </div>
          )}
        </div>

        {/* Production Input */}
        <div className="space-y-2">
          <Label htmlFor="cups-to-allocate">{t('production.allocation.fields.cups')}</Label>
          <Input
            id="cups-to-allocate"
            type="number"
            min="0"
            value={cupsToAllocate || ''}
            onChange={(e) => setCupsToAllocate(Number(e.target.value))}
            placeholder={t('production.allocation.placeholders.cups')}
            className="w-full"
          />
          {/* Real-time stock availability hint */}
          {validIngredients.length > 0 && stockValidation.maxPossibleCups >= 0 && (
            <p className="text-xs text-muted-foreground">
              {stockValidation.maxPossibleCups > 0
                ? t('production.allocation.hints.maxPossible', { count: stockValidation.maxPossibleCups })
                : t('production.allocation.hints.noProduction')
              }
            </p>
          )}
        </div>

        {/* Note Input */}
        <div className="space-y-2">
          <Label htmlFor="production-note">{t('production.allocation.fields.note')}</Label>
          <Textarea
            id="production-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('production.allocation.placeholders.note')}
            className="w-full"
            rows={2}
          />
        </div>

        {/* Ingredient Preview */}
        {validIngredients.length > 0 && cupsToAllocate > 0 && (
          <div className="space-y-2">
            <Label>{t('production.allocation.ingredientsTitle')}</Label>
            <div className={`rounded-lg p-3 space-y-2 ${
              stockValidation.isValid
                ? 'bg-muted/50'
                : 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800'
            }`}>
              {validIngredients.map((item) => {
                const totalNeeded = item.usagePerCup! * cupsToAllocate
                const stockLevel = stockLevels.find(s => s.ingredientName === item.name && s.unit === item.unit)
                const availableStock = stockLevel ? stockLevel.currentStock - stockLevel.reservedStock : 0
                const hasEnoughStock = availableStock >= totalNeeded
                const shortage = totalNeeded - availableStock

                return (
                  <div key={item.id} className={`flex items-center justify-between text-sm p-2 rounded ${
                    !hasEnoughStock ? 'bg-red-100 dark:bg-red-900/30' : ''
                  }`}>
                    <span className="font-medium">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={!hasEnoughStock ? 'text-red-700 dark:text-red-300' : ''}>
                        {totalNeeded.toFixed(1)} {item.unit}
                        {!hasEnoughStock && (
                          <span className="text-xs ml-1">
                            (short {shortage.toFixed(1)} {item.unit})
                          </span>
                        )}
                      </span>
                      <Badge variant={hasEnoughStock ? "secondary" : "destructive"}>
                        {hasEnoughStock ? "✓" : "⚠️"} {availableStock.toFixed(1)} available
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Stock validation summary */}
            {!stockValidation.isValid && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
                  <div>
                    <p className="font-medium">{t('production.allocation.stockSummary.insufficient', { cups: cupsToAllocate })}</p>
                    {stockValidation.maxPossibleCups > 0 ? (
                      <p className="mt-1">
                        {t('production.allocation.hints.maxPossible', { count: stockValidation.maxPossibleCups })}
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 ml-2 text-yellow-700 dark:text-yellow-300"
                          onClick={() => setCupsToAllocate(stockValidation.maxPossibleCups)}
                        >
                          {t('production.allocation.stockSummary.useMaximum')}
                        </Button>
                      </p>
                    ) : (
                      <p className="mt-1">{t('production.allocation.stockSummary.addStock')}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Allocate Production Button */}
        <Button
          onClick={handleAllocateProduction}
          disabled={
            isProcessing ||
            cupsToAllocate <= 0 ||
            validIngredients.length === 0 ||
            !stockValidation.isValid
          }
          className="w-full"
          size="lg"
        >
          <Package className="h-4 w-4 mr-2" />
          {isProcessing
            ? t('production.allocation.buttons.creating')
            : !stockValidation.isValid && cupsToAllocate > 0
            ? t('production.allocation.buttons.insufficient')
            : t('production.allocation.buttons.allocate', { count: cupsToAllocate, product: productSuffix })
          }
        </Button>

        {/* Status Message */}
        {message && (
          <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Warning for missing ingredients */}
        {validIngredients.length === 0 && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{t('production.allocation.warningNoIngredients')}</span>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <p className="font-medium mb-1">{t('production.allocation.info.howTitle')}</p>
          <ul className="space-y-1">
            <li>• {t('production.allocation.info.step1')}</li>
            <li>• {t('production.allocation.info.step2')}</li>
            <li>• {t('production.allocation.info.step3')}</li>
            <li>• {t('production.allocation.info.step4')}</li>
            <li>• {t('production.allocation.info.step5')}</li>
            <li>• {t('production.allocation.info.step6')}</li>
          </ul>
          <p className="font-medium mt-2 mb-1">{t('production.allocation.info.stockTitle')}</p>
          <ul className="space-y-1">
            <li>• {t('production.allocation.info.stockStep1')}</li>
            <li>• {t('production.allocation.info.stockStep2')}</li>
            <li>• {t('production.allocation.info.stockStep3')}</li>
          </ul>
        </div>
      </CardContent>
    </Card>

    {/* Production Batch Status Management */}
    <ProductionBatchStatusManager
      showTitle={true}
      maxItems={3}
      compact={true}
      batches={batches}
      loading={productionLoading}
      error={productionError}
      onStockLevelsChanged={onStockLevelsChanged}
    />
  </div>
  )
}
