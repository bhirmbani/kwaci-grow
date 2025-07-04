import { memo, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ShoppingCart, TrendingUp, Package } from "lucide-react"
import { formatCurrency } from "@/utils/formatters"
import { generateShoppingList, type ShoppingListSummary as ShoppingListSummaryType } from "@/utils/cogsCalculations"
import type { FinancialItem } from "@/types"

interface IngredientRequirementsProps {
  items: FinancialItem[]
  dailyTarget: number
}

export const IngredientRequirementsCalculator = memo(function IngredientRequirementsCalculator({
  items,
  dailyTarget
}: IngredientRequirementsProps) {
  const shoppingList: ShoppingListSummaryType = useMemo(() => {
    return generateShoppingList(items, dailyTarget)
  }, [items, dailyTarget])

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
            Theoretical Cost Analysis
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
            <div>
              <span className="text-blue-700 dark:text-blue-300">Theoretical cost per cup:</span>
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
          <div className="text-xs text-blue-600 dark:text-blue-400 border-t border-blue-200 dark:border-blue-800 pt-2">
            <strong>Note:</strong> This shows theoretical costs based on exact daily usage amounts.
            For actual shopping costs (including packaging waste), see the True Shopping List below.
          </div>
        </div>



        {/* Note about warehouse integration */}
        {shoppingList.items.length > 0 && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2">
              <Package className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                  Warehouse Integration
                </p>
                <p className="text-amber-700 dark:text-amber-300">
                  This shows daily usage amounts. To add items to warehouse with actual purchase quantities,
                  use the <strong>True Shopping List</strong> section below.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
})
