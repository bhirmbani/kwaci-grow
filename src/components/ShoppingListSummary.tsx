import { memo, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ShoppingCart, TrendingUp, CheckCircle, AlertCircle, Package } from "lucide-react"
import { formatCurrency } from "@/utils/formatters"
import { generateShoppingList, type ShoppingListSummary as ShoppingListSummaryType } from "@/utils/cogsCalculations"
import { useWarehouse } from "@/hooks/useWarehouse"
import type { FinancialItem } from "@/types"

interface IngredientRequirementsProps {
  items: FinancialItem[]
  dailyTarget: number
}

export const IngredientRequirementsCalculator = memo(function IngredientRequirementsCalculator({
  items,
  dailyTarget
}: IngredientRequirementsProps) {
  const [isAddingToWarehouse, setIsAddingToWarehouse] = useState(false)
  const [warehouseMessage, setWarehouseMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [batchNote, setBatchNote] = useState('')
  const { addFromShoppingList } = useWarehouse()

  const shoppingList: ShoppingListSummaryType = useMemo(() => {
    return generateShoppingList(items, dailyTarget)
  }, [items, dailyTarget])

  const handleAddToWarehouse = async () => {
    if (shoppingList.items.length === 0) return

    setIsAddingToWarehouse(true)
    setWarehouseMessage(null)

    try {
      const defaultNote = `Shopping list for ${dailyTarget} cups per day - Total: ${formatCurrency(shoppingList.grandTotal)}`
      const finalNote = batchNote.trim() ? `${batchNote.trim()} | ${defaultNote}` : defaultNote

      const result = await addFromShoppingList(
        shoppingList.items,
        finalNote
      )

      if (result.success) {
        setWarehouseMessage({
          type: 'success',
          text: `Successfully added ${shoppingList.items.length} ingredients to warehouse as Batch #${result.batch?.batchNumber}`
        })
        // Clear the note after successful addition
        setBatchNote('')
      } else {
        setWarehouseMessage({
          type: 'error',
          text: result.error || 'Failed to add items to warehouse'
        })
      }
    } catch (error) {
      setWarehouseMessage({
        type: 'error',
        text: 'An unexpected error occurred while adding items to warehouse'
      })
    } finally {
      setIsAddingToWarehouse(false)
      // Clear message after 5 seconds
      setTimeout(() => setWarehouseMessage(null), 5000)
    }
  }

  if (shoppingList.items.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="bg-card">
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <ShoppingCart className="h-5 w-5" />
            Ingredient Requirements Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-card">
          <p className="text-muted-foreground text-center py-8">
            No ingredients with complete COGS data found. Add ingredients with base cost, quantity, usage per cup, and unit to see the ingredient requirements.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="bg-card">
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <ShoppingCart className="h-5 w-5" />
          Ingredient Requirements Calculator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Cost per cup breakdown for {dailyTarget} cups per day
        </p>
      </CardHeader>
      <CardContent className="bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ingredient</TableHead>
              <TableHead className="text-right">Quantity Needed</TableHead>
              <TableHead className="text-right">Unit Cost</TableHead>
              <TableHead className="text-right">Total Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shoppingList.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-right">
                  <span className="font-mono">{item.formattedQuantity}</span>
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {formatCurrency(item.unitCost)}/{item.unit}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(item.totalCost)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="font-semibold">
                Total ({shoppingList.totalItems} ingredients)
              </TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell className="text-right font-bold text-lg">
                {formatCurrency(shoppingList.grandTotal)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
              <ShoppingCart className="h-4 w-4" />
              Total Ingredients
            </div>
            <div className="text-2xl font-bold">{shoppingList.totalItems}</div>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              Daily Target
            </div>
            <div className="text-2xl font-bold">{dailyTarget} cups</div>
          </div>
          
          <div className="bg-primary/10 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              Total Shopping Cost
            </div>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(shoppingList.grandTotal)}
            </div>
          </div>
        </div>

        {/* Cost per Cup Breakdown */}
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Cost Analysis
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700 dark:text-blue-300">Cost per cup:</span>
              <span className="font-semibold ml-2">
                {formatCurrency(shoppingList.grandTotal / dailyTarget)}
              </span>
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-300">Most expensive ingredient:</span>
              <span className="font-semibold ml-2">
                {shoppingList.items[0]?.name || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Warehouse Integration - Note Input */}
        {shoppingList.items.length > 0 && (
          <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/30 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="batch-note" className="text-sm font-medium flex items-center gap-2">
                📝 Batch Note (Optional)
              </Label>
              <Textarea
                id="batch-note"
                placeholder="Add a custom note for this warehouse batch (e.g., 'Morning rush preparation', 'Special event stock')..."
                value={batchNote}
                onChange={(e) => setBatchNote(e.target.value)}
                className="min-h-[60px] resize-none bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-colors"
                maxLength={200}
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  This note will be saved with your warehouse batch for future reference
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {batchNote.length}/200
                </p>
              </div>
            </div>

            {warehouseMessage && (
              <div className={`flex items-center gap-2 p-3 rounded-lg text-sm animate-in fade-in slide-in-from-top-2 duration-300 ${
                warehouseMessage.type === 'success'
                  ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
              }`}>
                {warehouseMessage.type === 'success' ? (
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                )}
                <span>{warehouseMessage.text}</span>
              </div>
            )}
          </div>
        )}

        {/* Floating Action Button for Add to Warehouse */}
        {shoppingList.items.length > 0 && (
          <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 group animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="relative">
              <Button
                onClick={handleAddToWarehouse}
                disabled={isAddingToWarehouse}
                size="lg"
                className="h-14 w-14 md:h-16 md:w-16 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-2 border-blue-400/20 hover:border-blue-300/30 hover:scale-110 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                title={isAddingToWarehouse ? "Adding to warehouse..." : "Add to Warehouse"}
              >
                {isAddingToWarehouse ? (
                  <div className="animate-spin rounded-full h-5 w-5 md:h-6 md:w-6 border-b-2 border-white"></div>
                ) : (
                  <Package className="h-6 w-6 md:h-7 md:w-7 text-white drop-shadow-sm" />
                )}
              </Button>

              {/* Item count badge */}
              {!isAddingToWarehouse && (
                <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full h-6 w-6 md:h-7 md:w-7 flex items-center justify-center shadow-lg border-2 border-white animate-in zoom-in duration-200">
                  {shoppingList.items.length}
                </div>
              )}
            </div>

            {/* Tooltip - Desktop */}
            <div className="hidden md:block absolute bottom-full right-0 mb-2 bg-popover text-popover-foreground px-3 py-1 rounded-md text-sm shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              {isAddingToWarehouse ? "Adding to warehouse..." : `Add ${shoppingList.items.length} ingredients to warehouse`}
              <div className="absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-popover"></div>
            </div>

            {/* Helper text for mobile */}
            <div className="md:hidden absolute bottom-full right-0 mb-2 bg-popover text-popover-foreground px-2 py-1 rounded text-xs shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              {isAddingToWarehouse ? "Adding..." : `Add ${shoppingList.items.length} items`}
              <div className="absolute top-full right-2 w-0 h-0 border-l-3 border-r-3 border-t-3 border-transparent border-t-popover"></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
})
