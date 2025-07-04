import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, CheckCircle, AlertCircle, TrendingDown } from 'lucide-react'
import { useStockLevels } from '@/hooks/useStock'
import { useFinancialItems } from '@/hooks/useFinancialItems'
import { FINANCIAL_ITEM_CATEGORIES } from '@/lib/db/schema'
import type { FinancialItem } from '@/types'

export function SalesProcessor() {
  const [cupsSold, setCupsSold] = useState<number>(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  const { stockLevels, processSale, loading: stockLoading } = useStockLevels()
  const { items: cogsItems, loading: cogsLoading } = useFinancialItems(FINANCIAL_ITEM_CATEGORIES.VARIABLE_COGS)

  // Filter COGS items that have complete data for stock deduction
  const validIngredients = cogsItems.filter((item: FinancialItem) => 
    item.usagePerCup !== undefined && 
    item.unit !== undefined && 
    item.usagePerCup > 0
  )

  const handleProcessSale = async () => {
    if (cupsSold <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid number of cups sold' })
      return
    }

    if (validIngredients.length === 0) {
      setMessage({ type: 'error', text: 'No valid ingredients found for stock deduction' })
      return
    }

    setIsProcessing(true)
    setMessage(null)

    try {
      const ingredients = validIngredients.map(item => ({
        name: item.name,
        unit: item.unit!,
        usagePerCup: item.usagePerCup!
      }))

      const result = await processSale(cupsSold, ingredients)

      if (result.success) {
        setMessage({
          type: 'success',
          text: `Successfully processed sale of ${cupsSold} cups. Stock levels updated.`
        })
        setCupsSold(0)
      } else {
        setMessage({
          type: 'error',
          text: `Failed to process sale: ${result.errors.join(', ')}`
        })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred while processing the sale'
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
            <p className="text-muted-foreground">Loading sales processor...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Sales Processor
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Process sales and automatically deduct ingredients from stock
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sales Input */}
        <div className="space-y-2">
          <Label htmlFor="cups-sold">Number of Cups Sold</Label>
          <Input
            id="cups-sold"
            type="number"
            min="0"
            value={cupsSold || ''}
            onChange={(e) => setCupsSold(Number(e.target.value))}
            placeholder="Enter number of cups sold"
            className="w-full"
          />
        </div>

        {/* Ingredient Preview */}
        {validIngredients.length > 0 && cupsSold > 0 && (
          <div className="space-y-2">
            <Label>Ingredients to be deducted:</Label>
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              {validIngredients.map((item) => {
                const totalNeeded = item.usagePerCup! * cupsSold
                const stockLevel = stockLevels.find(s => s.ingredientName === item.name && s.unit === item.unit)
                const availableStock = stockLevel ? stockLevel.currentStock - stockLevel.reservedStock : 0
                const hasEnoughStock = availableStock >= totalNeeded

                return (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span>
                        {totalNeeded.toFixed(1)} {item.unit}
                      </span>
                      <Badge variant={hasEnoughStock ? "secondary" : "destructive"}>
                        {hasEnoughStock ? "✓" : "⚠️"} {availableStock.toFixed(1)} available
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Process Sale Button */}
        <Button
          onClick={handleProcessSale}
          disabled={isProcessing || cupsSold <= 0 || validIngredients.length === 0}
          className="w-full"
          size="lg"
        >
          <TrendingDown className="h-4 w-4 mr-2" />
          {isProcessing ? 'Processing Sale...' : `Process Sale of ${cupsSold} Cups`}
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
            <li>• Enter the number of cups sold</li>
            <li>• System calculates ingredient usage based on COGS data</li>
            <li>• Stock levels are automatically deducted</li>
            <li>• Transaction history is recorded for tracking</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
