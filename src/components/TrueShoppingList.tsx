import { memo, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Package, AlertTriangle } from "lucide-react"
import { formatCurrency } from "@/utils/formatters"
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
function calculateWaste(totalNeeded: number, baseUnitQuantity: number, unitsToBy: number): number {
  const totalPurchased = unitsToBy * baseUnitQuantity
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
      const unitsToBy = calculatePurchaseQuantity(totalNeeded, item.baseUnitQuantity!)
      const wasteAmount = calculateWaste(totalNeeded, item.baseUnitQuantity!, unitsToBy)
      const wastePercentage = totalNeeded > 0 ? (wasteAmount / (totalNeeded + wasteAmount)) * 100 : 0
      const totalCost = unitsToBy * item.baseUnitCost!

      return {
        id: item.id,
        name: item.name,
        totalNeeded,
        baseUnitQuantity: item.baseUnitQuantity!,
        baseUnitCost: item.baseUnitCost!,
        unit: item.unit!,
        unitsToBy,
        totalCost,
        wasteAmount,
        wastePercentage
      }
    })

  const totalCost = shoppingItems.reduce((sum, item) => sum + item.totalCost, 0)
  const totalItems = shoppingItems.reduce((sum, item) => sum + item.unitsToBy, 0)
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
  const shoppingList: ShoppingListSummary = useMemo(() => {
    return generateTrueShoppingList(items, dailyTarget)
  }, [items, dailyTarget])

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
                    {item.unitsToBy} units
                  </div>
                  <div className="text-xs text-muted-foreground">
                    = {(item.unitsToBy * item.baseUnitQuantity).toFixed(1)} {item.unit}
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
      </CardContent>
    </Card>
  )
})
