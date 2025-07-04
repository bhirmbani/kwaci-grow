import { memo, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ShoppingCart, TrendingUp } from "lucide-react"
import { formatCurrency } from "@/utils/formatters"
import { generateShoppingList, type ShoppingListSummary as ShoppingListSummaryType } from "@/utils/cogsCalculations"
import type { FinancialItem } from "@/types"

interface ShoppingListSummaryProps {
  items: FinancialItem[]
  dailyTarget: number
}

export const ShoppingListSummary = memo(function ShoppingListSummary({
  items,
  dailyTarget
}: ShoppingListSummaryProps) {
  const shoppingList: ShoppingListSummaryType = useMemo(() => {
    return generateShoppingList(items, dailyTarget)
  }, [items, dailyTarget])

  if (shoppingList.items.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="bg-card">
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <ShoppingCart className="h-5 w-5" />
            Shopping List Summary
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
          Shopping List Summary
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Ingredients needed for {dailyTarget} cups per day
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
      </CardContent>
    </Card>
  )
})
