import { memo, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShoppingCart, Package, AlertTriangle, TrendingUp } from "lucide-react"
import { formatCurrency } from "@/utils/formatters"
import { useWarehouse } from "@/hooks/useWarehouse"
import { generateShoppingList } from "@/utils/cogsCalculations"
import type { FinancialItem } from "@/types"

interface TrueShoppingListProps {
  items: FinancialItem[]
  dailyTarget: number
}

interface ShoppingListItem {
  id: string
  name: string
  totalNeeded: number
  baseUnitQuantity: number
  baseUnitCost: number
  unit: string
  unitsToBuy: number
  totalCost: number
  wasteAmount: number
  wastePercentage: number
}

// Interface for warehouse service compatibility
interface WarehouseShoppingListItem {
  id: string
  name: string
  totalNeeded: number // This will be the actual purchased quantity (unitsToBuy * baseUnitQuantity)
  formattedQuantity: string
  unit: string
  unitCost: number
  totalCost: number
  baseUnitQuantity: number
}

interface ShoppingListSummary {
  items: ShoppingListItem[]
  totalCost: number
  totalItems: number
  totalWaste: number
}

/**
 * Calculate how many base units need to be purchased for an ingredient
 */
function calculatePurchaseQuantity(totalNeeded: number, baseUnitQuantity: number): number {
  return Math.ceil(totalNeeded / baseUnitQuantity)
}

/**
 * Calculate waste amount when purchasing in base units
 */
function calculateWaste(totalNeeded: number, baseUnitQuantity: number, unitsToBuy: number): number {
  const totalPurchased = unitsToBuy * baseUnitQuantity
  return Math.max(0, totalPurchased - totalNeeded)
}

/**
 * Generate true shopping list with purchase quantities
 */
function generateTrueShoppingList(items: FinancialItem[], dailyTarget: number): ShoppingListSummary {
  const shoppingItems = items
    .filter(item => {
      // Only include items with complete COGS data
      return (
        item.baseUnitCost !== undefined &&
        item.baseUnitQuantity !== undefined &&
        item.usagePerCup !== undefined &&
        item.unit !== undefined &&
        item.baseUnitCost > 0 &&
        item.baseUnitQuantity > 0 &&
        item.usagePerCup > 0
      )
    })
    .map(item => {
      const totalNeeded = item.usagePerCup! * dailyTarget
      const unitsToBuy = calculatePurchaseQuantity(totalNeeded, item.baseUnitQuantity!)
      const wasteAmount = calculateWaste(totalNeeded, item.baseUnitQuantity!, unitsToBuy)
      const wastePercentage = totalNeeded > 0 ? (wasteAmount / (totalNeeded + wasteAmount)) * 100 : 0
      const totalCost = unitsToBuy * item.baseUnitCost!

      return {
        id: item.id,
        name: item.name,
        totalNeeded,
        baseUnitQuantity: item.baseUnitQuantity!,
        baseUnitCost: item.baseUnitCost!,
        unit: item.unit!,
        unitsToBuy,
        totalCost,
        wasteAmount,
        wastePercentage
      }
    })

  const totalCost = shoppingItems.reduce((sum, item) => sum + item.totalCost, 0)
  const totalItems = shoppingItems.reduce((sum, item) => sum + item.unitsToBuy, 0)
  const totalWaste = shoppingItems.reduce((sum, item) => sum + item.wasteAmount, 0)

  return {
    items: shoppingItems,
    totalCost,
    totalItems,
    totalWaste
  }
}

export const TrueShoppingList = memo(function TrueShoppingList({
  items,
  dailyTarget
}: TrueShoppingListProps) {
  const [isAddingToWarehouse, setIsAddingToWarehouse] = useState(false)
  const [warehouseMessage, setWarehouseMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [batchNote, setBatchNote] = useState('')
  const { addFromShoppingList } = useWarehouse()

  const shoppingList: ShoppingListSummary = useMemo(() => {
    return generateTrueShoppingList(items, dailyTarget)
  }, [items, dailyTarget])

  // Calculate theoretical costs for comparison
  const theoreticalShoppingList = useMemo(() => {
    return generateShoppingList(items, dailyTarget)
  }, [items, dailyTarget])

  // Convert True Shopping List items to warehouse-compatible format
  const warehouseShoppingListItems: WarehouseShoppingListItem[] = useMemo(() => {
    return shoppingList.items.map(item => ({
      id: item.id,
      name: item.name,
      totalNeeded: item.unitsToBuy * item.baseUnitQuantity, // Actual purchased quantity in base units
      formattedQuantity: `${item.unitsToBuy} units of ${item.baseUnitQuantity}${item.unit} containers`,
      unit: item.unit,
      unitCost: item.baseUnitCost / item.baseUnitQuantity, // Cost per base unit
      totalCost: item.totalCost,
      baseUnitQuantity: item.baseUnitQuantity
    }))
  }, [shoppingList.items])

  const handleAddToWarehouse = async () => {
    if (warehouseShoppingListItems.length === 0) return

    setIsAddingToWarehouse(true)
    setWarehouseMessage(null)

    try {
      const defaultNote = `True Shopping List for ${dailyTarget} cups per day - Total: ${formatCurrency(shoppingList.totalCost)} (${shoppingList.totalItems} units)`
      const finalNote = batchNote.trim() ? `${batchNote.trim()} | ${defaultNote}` : defaultNote

      const result = await addFromShoppingList(
        warehouseShoppingListItems,
        finalNote
      )

      if (result.success) {
        setWarehouseMessage({
          type: 'success',
          text: `Successfully added ${warehouseShoppingListItems.length} ingredients to warehouse as Batch #${result.batch?.batchNumber}`
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
    }
  }

  if (shoppingList.items.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="bg-card">
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <ShoppingCart className="h-5 w-5" />
            Shopping List
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-card">
          <p className="text-muted-foreground text-center py-8">
            No ingredients with complete COGS data found. Add ingredients with base cost, quantity, usage per cup, and unit to see the shopping list.
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
          Shopping List
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          What to buy for {dailyTarget} cups per day
        </p>
      </CardHeader>
      <CardContent className="bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ingredient</TableHead>
              <TableHead className="text-right">Need</TableHead>
              <TableHead className="text-right">Buy</TableHead>
              <TableHead className="text-right">Unit Cost</TableHead>
              <TableHead className="text-right">Total Cost</TableHead>
              <TableHead className="text-center">Waste</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shoppingList.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.baseUnitQuantity} {item.unit} per unit
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="font-medium">
                    {item.totalNeeded.toFixed(1)} {item.unit}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="font-medium text-blue-600">
                    {item.unitsToBuy} units
                  </div>
                  <div className="text-xs text-muted-foreground">
                    = {(item.unitsToBuy * item.baseUnitQuantity).toFixed(1)} {item.unit}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(item.baseUnitCost)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(item.totalCost)}
                </TableCell>
                <TableCell className="text-center">
                  {item.wasteAmount > 0 ? (
                    <div className="flex flex-col items-center">
                      <Badge variant="outline" className="text-xs">
                        {item.wastePercentage.toFixed(1)}%
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {item.wasteAmount.toFixed(1)} {item.unit}
                      </div>
                    </div>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      No waste
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="font-bold">Total</TableCell>
              <TableCell></TableCell>
              <TableCell className="text-right font-bold">
                {shoppingList.totalItems} units
              </TableCell>
              <TableCell></TableCell>
              <TableCell className="text-right font-bold text-lg text-green-600">
                {formatCurrency(shoppingList.totalCost)}
              </TableCell>
              <TableCell className="text-center">
                {shoppingList.totalWaste > 0 && (
                  <div className="flex items-center justify-center gap-1 text-orange-600">
                    <AlertTriangle className="h-3 w-3" />
                    <span className="text-xs font-medium">
                      {shoppingList.totalWaste.toFixed(1)} total waste
                    </span>
                  </div>
                )}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
              <Package className="h-4 w-4" />
              Total Units to Buy
            </div>
            <div className="text-2xl font-bold">{shoppingList.totalItems}</div>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
              <ShoppingCart className="h-4 w-4" />
              Total Shopping Cost
            </div>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(shoppingList.totalCost)}
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
              <AlertTriangle className="h-4 w-4" />
              Estimated Waste
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {shoppingList.totalWaste.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">
              units of ingredients
            </div>
          </div>
        </div>

        {/* Cost Comparison */}
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Cost Comparison: Actual vs Theoretical
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-green-700 dark:text-green-300">Actual Shopping Cost:</span>
                <span className="font-semibold">{formatCurrency(shoppingList.totalCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700 dark:text-green-300">Theoretical Daily Cost:</span>
                <span className="font-semibold">{formatCurrency(theoreticalShoppingList.grandTotal)}</span>
              </div>
              <div className="flex justify-between border-t border-green-200 dark:border-green-800 pt-2">
                <span className="text-green-700 dark:text-green-300 font-medium">Cost Difference:</span>
                <span className="font-bold text-orange-600">
                  {formatCurrency(shoppingList.totalCost - theoreticalShoppingList.grandTotal)}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-green-700 dark:text-green-300">Actual Cost per Cup:</span>
                <span className="font-semibold">{formatCurrency(shoppingList.totalCost / dailyTarget)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700 dark:text-green-300">Theoretical Cost per Cup:</span>
                <span className="font-semibold">{formatCurrency(theoreticalShoppingList.grandTotal / dailyTarget)}</span>
              </div>
              <div className="flex justify-between border-t border-green-200 dark:border-green-800 pt-2">
                <span className="text-green-700 dark:text-green-300 font-medium">Waste Impact:</span>
                <span className="font-bold text-orange-600">
                  +{formatCurrency((shoppingList.totalCost - theoreticalShoppingList.grandTotal) / dailyTarget)}/cup
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 text-xs text-green-600 dark:text-green-400 border-t border-green-200 dark:border-green-800 pt-2">
            <strong>Explanation:</strong> The difference comes from packaging constraints. You must buy whole units (e.g., 1L containers)
            even if you only need partial amounts, creating waste but reflecting real shopping costs.
          </div>
        </div>

        {/* Shopping Tips */}
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Shopping Tips
          </h4>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <p>• This list shows the actual number of base units (packages/containers) you need to buy</p>
            <p>• Waste occurs when you can't buy exact quantities needed</p>
            <p>• Consider buying larger base units to reduce waste percentage</p>
          </div>
        </div>

        {/* Warehouse Message */}
        {warehouseMessage && (
          <div className={`mt-4 p-4 rounded-lg ${
            warehouseMessage.type === 'success'
              ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300'
          }`}>
            <p className="text-sm font-medium">{warehouseMessage.text}</p>
          </div>
        )}

        {/* Optional Note Input for Warehouse */}
        {shoppingList.items.length > 0 && (
          <div className="mt-4 space-y-2">
            <label htmlFor="batch-note" className="text-sm font-medium text-muted-foreground">
              Optional note for warehouse batch:
            </label>
            <Input
              id="batch-note"
              placeholder="e.g., Weekly stock replenishment, Special order..."
              value={batchNote}
              onChange={(e) => setBatchNote(e.target.value)}
              className="text-sm"
            />
          </div>
        )}
      </CardContent>

      {/* Floating Action Button for Add to Warehouse */}
      {shoppingList.items.length > 0 && (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 group animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="relative">
            <Button
              onClick={handleAddToWarehouse}
              disabled={isAddingToWarehouse}
              size="lg"
              className="h-14 w-14 md:h-16 md:w-16 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 border-2 border-blue-400/20 hover:border-blue-300/30 dark:border-blue-500/30 dark:hover:border-blue-400/40 hover:scale-110 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              title={isAddingToWarehouse ? "Adding to warehouse..." : "Add to Warehouse"}
            >
              {isAddingToWarehouse ? (
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
              ) : (
                <Package className="h-6 w-6 text-white drop-shadow-sm" />
              )}
            </Button>

            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-popover text-popover-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-md border border-border">
              {isAddingToWarehouse ? "Adding to warehouse..." : `Add ${shoppingList.items.length} items to warehouse`}
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-popover"></div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
})
