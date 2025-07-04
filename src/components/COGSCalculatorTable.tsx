import { useState, memo, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Plus, Calculator } from "lucide-react"
import { formatCurrency } from "@/utils/formatters"
import {
  calculateCostPerCup,
  calculateTotalCOGSPerCup,
  updateCalculatedValue,
  getFormattedQuantity,
  generateShoppingList,
  UNIT_OPTIONS,
  type UnitOption
} from "@/utils/cogsCalculations"
import { ShoppingListSummary } from "./ShoppingListSummary"
import type { FinancialItem } from "@/types"

interface COGSCalculatorTableProps {
  title: string
  items: FinancialItem[]
  onUpdate: (items: FinancialItem[]) => void
  dailyTarget: number
  onDailyTargetChange: (target: number) => void
}

interface NewCOGSItem {
  name: string
  baseUnitCost: number
  baseUnitQuantity: number
  usagePerCup: number
  unit: UnitOption
  note: string
}

export const COGSCalculatorTable = memo(function COGSCalculatorTable({
  title,
  items,
  onUpdate,
  dailyTarget,
  onDailyTargetChange
}: COGSCalculatorTableProps) {
  const [newItem, setNewItem] = useState<NewCOGSItem>({
    name: "",
    baseUnitCost: 0,
    baseUnitQuantity: 1,
    usagePerCup: 0,
    unit: "ml",
    note: ""
  })

  const updateItem = useCallback((id: string, field: keyof FinancialItem, value: string | number) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value }
        // Recalculate the cost per cup when COGS fields change
        if (['baseUnitCost', 'baseUnitQuantity', 'usagePerCup'].includes(field)) {
          return updateCalculatedValue(updatedItem)
        }
        return updatedItem
      }
      return item
    })
    onUpdate(updatedItems)
  }, [items, onUpdate])

  const removeItem = useCallback((id: string) => {
    const updatedItems = items.filter(item => item.id !== id)
    onUpdate(updatedItems)
  }, [items, onUpdate])

  const addItem = useCallback(() => {
    if (newItem.name.trim()) {
      const item: FinancialItem = {
        id: Date.now().toString(),
        name: newItem.name,
        value: 0, // Will be calculated
        note: newItem.note || "",
        baseUnitCost: newItem.baseUnitCost,
        baseUnitQuantity: newItem.baseUnitQuantity,
        usagePerCup: newItem.usagePerCup,
        unit: newItem.unit
      }
      
      const itemWithCalculatedValue = updateCalculatedValue(item)
      onUpdate([...items, itemWithCalculatedValue])
      
      setNewItem({
        name: "",
        baseUnitCost: 0,
        baseUnitQuantity: 1,
        usagePerCup: 0,
        unit: "ml",
        note: ""
      })
    }
  }, [newItem, items, onUpdate])

  // Calculate totals
  const totalCOGSPerCup = useMemo(() => calculateTotalCOGSPerCup(items), [items])
  const totalDailyCOGS = useMemo(() => totalCOGSPerCup * dailyTarget, [totalCOGSPerCup, dailyTarget])

  // Calculate shopping list totals
  const shoppingListSummary = useMemo(() => {
    return generateShoppingList(items, dailyTarget)
  }, [items, dailyTarget])

  return (
    <div className="space-y-8">
      {/* Daily Target Input */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Calculator className="h-6 w-6" />
            COGS Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label htmlFor="dailyTarget" className="block text-sm font-medium mb-3 text-muted-foreground">
                Daily Target (cups)
              </label>
              <Input
                id="dailyTarget"
                type="number"
                value={dailyTarget}
                onChange={(e) => onDailyTargetChange(Number(e.target.value))}
                min="0"
                placeholder="Enter daily target..."
                className="text-lg font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-3 text-muted-foreground">
                Total COGS per Cup
              </label>
              <div className="h-12 px-4 py-3 bg-green-50 border border-green-200 rounded-md flex items-center font-bold text-lg text-green-700">
                {formatCurrency(totalCOGSPerCup)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-3 text-muted-foreground">
                Total Daily COGS
              </label>
              <div className="h-12 px-4 py-3 bg-blue-50 border border-blue-200 rounded-md flex items-center font-bold text-lg text-blue-700">
                {formatCurrency(totalDailyCOGS)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-3 text-muted-foreground">
                Shopping Cost
              </label>
              <div className="h-12 px-4 py-3 bg-purple-50 border border-purple-200 rounded-md flex items-center font-bold text-lg text-purple-700">
                {formatCurrency(shoppingListSummary.grandTotal)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ingredients Table */}
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-full table-fixed">
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead className="px-4 py-3 font-semibold w-[15%]">Ingredient</TableHead>
                  <TableHead className="px-4 py-3 text-right font-semibold w-[12%]">Base Cost (IDR)</TableHead>
                  <TableHead className="px-4 py-3 text-right font-semibold w-[10%]">Base Qty</TableHead>
                  <TableHead className="px-4 py-3 font-semibold w-[8%]">Unit</TableHead>
                  <TableHead className="px-4 py-3 text-right font-semibold w-[10%]">Usage/Cup</TableHead>
                  <TableHead className="px-4 py-3 text-right font-semibold w-[12%]">Cost/Cup</TableHead>
                  <TableHead className="px-4 py-3 text-right font-semibold w-[12%]">Total Needed</TableHead>
                  <TableHead className="px-4 py-3 font-semibold w-[16%]">Note</TableHead>
                  <TableHead className="px-4 py-3 w-[5%]"></TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {items.map((item) => {
                const costPerCup = calculateCostPerCup(item)
                return (
                  <TableRow key={item.id} className="hover:bg-muted/50 transition-colors border-b">
                    <TableCell className="px-4 py-4">
                      <Input
                        value={item.name}
                        onChange={(e) => updateItem(item.id, "name", e.target.value)}
                        placeholder="Ingredient name"
                        className="border-0 bg-transparent focus:bg-background focus:border-input focus:ring-2 focus:ring-ring transition-all"
                      />
                    </TableCell>
                    <TableCell className="px-4 py-4 text-right">
                      <Input
                        type="number"
                        value={item.baseUnitCost || 0}
                        onChange={(e) => updateItem(item.id, "baseUnitCost", Number(e.target.value))}
                        className="border-0 bg-transparent focus:bg-background focus:border-input focus:ring-2 focus:ring-ring text-right transition-all"
                        min="0"
                      />
                    </TableCell>
                    <TableCell className="px-4 py-4 text-right">
                      <Input
                        type="number"
                        value={item.baseUnitQuantity || 1}
                        onChange={(e) => updateItem(item.id, "baseUnitQuantity", Number(e.target.value))}
                        className="border-0 bg-transparent focus:bg-background focus:border-input focus:ring-2 focus:ring-ring text-right transition-all"
                        min="0.01"
                        step="0.01"
                      />
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <Select
                        value={item.unit || "ml"}
                        onChange={(e) => updateItem(item.id, "unit", e.target.value)}
                      >
                        {UNIT_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-right">
                      <div className="relative">
                        <Input
                          type="number"
                          value={item.usagePerCup || 0}
                          onChange={(e) => updateItem(item.id, "usagePerCup", Number(e.target.value))}
                          className="border-0 bg-transparent focus:bg-background focus:border-input focus:ring-2 focus:ring-ring text-right pr-12 transition-all"
                          min="0"
                          step="0.01"
                          placeholder={`per cup`}
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                          {item.unit || 'ml'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-right font-semibold text-green-600">
                      {formatCurrency(costPerCup)}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-right font-medium text-blue-600">
                      {(() => {
                        // More robust checking for Total Needed calculation
                        const hasValidUsage = (item.usagePerCup !== undefined && item.usagePerCup !== null && item.usagePerCup >= 0);
                        const hasValidUnit = (item.unit && item.unit.trim() !== '');
                        const hasValidTarget = (dailyTarget > 0);

                        if (hasValidUsage && hasValidUnit && hasValidTarget && item.usagePerCup !== undefined && item.unit) {
                          const totalNeeded = item.usagePerCup * dailyTarget;
                          return getFormattedQuantity(totalNeeded, item.unit);
                        }
                        return '-';
                      })()}
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <Input
                        value={item.note || ""}
                        onChange={(e) => updateItem(item.id, "note", e.target.value)}
                        placeholder="Add note..."
                        className="border-0 bg-transparent focus:bg-background focus:border-input focus:ring-2 focus:ring-ring transition-all"
                      />
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
              
              {/* Add new item row */}
              <TableRow className="border-t-2 bg-muted/20">
                <TableCell className="px-4 py-4">
                  <Input
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="Add new ingredient..."
                    className="border-dashed border-2 bg-background/50 focus:bg-background focus:border-solid focus:border-input focus:ring-2 focus:ring-ring transition-all"
                  />
                </TableCell>
                <TableCell className="px-4 py-4 text-right">
                  <Input
                    type="number"
                    value={newItem.baseUnitCost}
                    onChange={(e) => setNewItem({ ...newItem, baseUnitCost: Number(e.target.value) })}
                    className="border-dashed border-2 bg-background/50 focus:bg-background focus:border-solid focus:border-input focus:ring-2 focus:ring-ring text-right transition-all"
                    min="0"
                  />
                </TableCell>
                <TableCell className="px-4 py-4 text-right">
                  <Input
                    type="number"
                    value={newItem.baseUnitQuantity}
                    onChange={(e) => setNewItem({ ...newItem, baseUnitQuantity: Number(e.target.value) })}
                    className="border-dashed border-2 bg-background/50 focus:bg-background focus:border-solid focus:border-input focus:ring-2 focus:ring-ring text-right transition-all"
                    min="0.01"
                    step="0.01"
                  />
                </TableCell>
                <TableCell className="px-4 py-4">
                  <Select
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value as UnitOption })}
                  >
                    {UNIT_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </TableCell>
                <TableCell className="px-4 py-4 text-right">
                  <div className="relative">
                    <Input
                      type="number"
                      value={newItem.usagePerCup}
                      onChange={(e) => setNewItem({ ...newItem, usagePerCup: Number(e.target.value) })}
                      className="border-dashed border-2 bg-background/50 focus:bg-background focus:border-solid focus:border-input focus:ring-2 focus:ring-ring text-right pr-12 transition-all"
                      min="0"
                      step="0.01"
                      placeholder="per cup"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                      {newItem.unit}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4 text-right font-semibold text-green-600">
                  {formatCurrency(
                    newItem.baseUnitCost && newItem.baseUnitQuantity && newItem.usagePerCup
                      ? Math.round((newItem.baseUnitCost / newItem.baseUnitQuantity) * newItem.usagePerCup)
                      : 0
                  )}
                </TableCell>
                <TableCell className="px-4 py-4 text-right font-medium text-blue-600">
                  {newItem.usagePerCup && newItem.unit
                    ? getFormattedQuantity(newItem.usagePerCup * dailyTarget, newItem.unit)
                    : '-'
                  }
                </TableCell>
                <TableCell className="px-4 py-4">
                  <Input
                    value={newItem.note}
                    onChange={(e) => setNewItem({ ...newItem, note: e.target.value })}
                    placeholder="Add note..."
                    className="border-dashed border-2 bg-background/50 focus:bg-background focus:border-solid focus:border-input focus:ring-2 focus:ring-ring transition-all"
                  />
                </TableCell>
                <TableCell className="px-4 py-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={addItem}
                    className="text-green-500 hover:text-green-700 hover:bg-green-50 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
            <TableFooter>
              <TableRow className="bg-muted/30 border-t-2">
                <TableCell className="px-4 py-4 font-semibold text-lg" colSpan={5}>Total COGS per Cup</TableCell>
                <TableCell className="px-4 py-4 text-right font-bold text-lg text-green-600">
                  {formatCurrency(totalCOGSPerCup)}
                </TableCell>
                <TableCell colSpan={3}></TableCell>
              </TableRow>
            </TableFooter>
          </Table>
          </div>
        </CardContent>
      </Card>

      {/* Shopping List Summary */}
      <ShoppingListSummary
        items={items}
        dailyTarget={dailyTarget}
      />
    </div>
  )
})
