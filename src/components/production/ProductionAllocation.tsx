import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Factory, CheckCircle, AlertCircle, Package } from 'lucide-react'
import { useStockLevels } from '@/hooks/useStock'
import { useFinancialItems } from '@/hooks/useFinancialItems'
import { useProduction } from '@/hooks/useProduction'
import { FINANCIAL_ITEM_CATEGORIES } from '@/lib/db/schema'
import type { FinancialItem } from '@/types'
import { ProductionBatchStatusManager } from './ProductionBatchStatusManager'

export function ProductionAllocation() {
  const [cupsToAllocate, setCupsToAllocate] = useState<number>(0)
  const [note, setNote] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  const { stockLevels, loading: stockLoading } = useStockLevels()
  const { items: cogsItems, loading: cogsLoading } = useFinancialItems(FINANCIAL_ITEM_CATEGORIES.VARIABLE_COGS)
  const { createBatchWithItems } = useProduction()

  // Filter COGS items that have complete data for stock allocation
  const validIngredients = cogsItems.filter((item: FinancialItem) =>
    item.usagePerCup !== undefined &&
    item.unit !== undefined &&
    item.usagePerCup > 0
  )

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
      setMessage({ type: 'error', text: 'Please enter a valid number of cups to allocate' })
      return
    }

    if (validIngredients.length === 0) {
      setMessage({ type: 'error', text: 'No valid ingredients found for production allocation' })
      return
    }

    // Pre-allocation stock validation
    if (!stockValidation.isValid) {
      const insufficientList = stockValidation.insufficientIngredients
        .map(ing => `${ing.name}: need ${ing.required.toFixed(1)} ${ing.unit}, have ${ing.available.toFixed(1)} ${ing.unit} (short ${ing.shortage.toFixed(1)} ${ing.unit})`)
        .join('; ')

      const maxCupsMessage = stockValidation.maxPossibleCups > 0
        ? ` You can produce up to ${stockValidation.maxPossibleCups} cups with current stock.`
        : ' No production possible with current stock levels.'

      setMessage({
        type: 'error',
        text: `Insufficient stock for production: ${insufficientList}.${maxCupsMessage}`
      })
      return
    }

    setIsProcessing(true)
    setMessage(null)

    try {
      // Prepare batch data
      const batchData = {
        dateCreated: new Date().toISOString(),
        status: 'Pending' as const,
        note: note || `Production allocation for ${cupsToAllocate} cups`
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
          text: `Successfully created Production Batch #${result.batch?.batchNumber} for ${cupsToAllocate} cups. Ingredients allocated from stock.`
        })
        setCupsToAllocate(0)
        setNote('')
      } else {
        setMessage({
          type: 'error',
          text: `Failed to create production batch: ${result.error}`
        })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred while creating the production batch'
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
            <p className="text-muted-foreground">Loading production allocation...</p>
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
            Quick Production Allocation
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Allocate ingredients for production batches and reserve stock
          </p>
        </CardHeader>
      <CardContent className="space-y-4">
        {/* Production Input */}
        <div className="space-y-2">
          <Label htmlFor="cups-to-allocate">Number of Cups to Produce</Label>
          <Input
            id="cups-to-allocate"
            type="number"
            min="0"
            value={cupsToAllocate || ''}
            onChange={(e) => setCupsToAllocate(Number(e.target.value))}
            placeholder="Enter number of cups to produce"
            className="w-full"
          />
          {/* Real-time stock availability hint */}
          {validIngredients.length > 0 && stockValidation.maxPossibleCups >= 0 && (
            <p className="text-xs text-muted-foreground">
              {stockValidation.maxPossibleCups > 0
                ? `Maximum possible with current stock: ${stockValidation.maxPossibleCups} cups`
                : 'No production possible - insufficient stock for all ingredients'
              }
            </p>
          )}
        </div>

        {/* Note Input */}
        <div className="space-y-2">
          <Label htmlFor="production-note">Production Note (Optional)</Label>
          <Textarea
            id="production-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note about this production batch..."
            className="w-full"
            rows={2}
          />
        </div>

        {/* Ingredient Preview */}
        {validIngredients.length > 0 && cupsToAllocate > 0 && (
          <div className="space-y-2">
            <Label>Ingredients to be allocated:</Label>
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
                    <p className="font-medium">Insufficient stock for {cupsToAllocate} cups</p>
                    {stockValidation.maxPossibleCups > 0 ? (
                      <p className="mt-1">
                        Maximum possible with current stock: <strong>{stockValidation.maxPossibleCups} cups</strong>
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 ml-2 text-yellow-700 dark:text-yellow-300"
                          onClick={() => setCupsToAllocate(stockValidation.maxPossibleCups)}
                        >
                          Use maximum
                        </Button>
                      </p>
                    ) : (
                      <p className="mt-1">Add more stock to warehouse before creating production batch.</p>
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
            ? 'Creating Production Batch...'
            : !stockValidation.isValid && cupsToAllocate > 0
            ? 'Insufficient Stock for Production'
            : `Allocate for ${cupsToAllocate} Cups`
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
              <span>
                No valid ingredients found. Please add ingredients with usage per cup data in the COGS Calculator.
              </span>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <p className="font-medium mb-1">How it works:</p>
          <ul className="space-y-1">
            <li>• Enter the number of cups to produce</li>
            <li>• System validates stock availability for all ingredients</li>
            <li>• Calculates ingredient requirements based on COGS data</li>
            <li>• Creates production batch and reserves stock (if sufficient)</li>
            <li>• Stock shows as "Reserved" until production is completed</li>
            <li>• Manage production batches in the Production page</li>
          </ul>
          <p className="font-medium mt-2 mb-1">Stock validation:</p>
          <ul className="space-y-1">
            <li>• Red highlighting indicates insufficient stock</li>
            <li>• System suggests maximum possible production quantity</li>
            <li>• Button disabled when stock is insufficient</li>
          </ul>
        </div>
      </CardContent>
    </Card>

    {/* Production Batch Status Management */}
    <ProductionBatchStatusManager
      showTitle={true}
      maxItems={3}
      compact={true}
    />
  </div>
  )
}
