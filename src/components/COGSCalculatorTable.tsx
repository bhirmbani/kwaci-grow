import { useState, memo, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Plus, Calculator, ShoppingCart } from "lucide-react"
import { formatCurrency } from "@/utils/formatters"
import {
  calculateCostPerCup,
  calculateTotalCOGSPerCup,
  updateCalculatedValue,
  calculateIngredientQuantities,
  getFormattedQuantity,
  UNIT_OPTIONS,
  type UnitOption
} from "@/utils/cogsCalculations"
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
  const ingredientQuantities = useMemo(() => calculateIngredientQuantities(items, dailyTarget), [items, dailyTarget])

  return (
    <div className="space-y-6">
      {/* Daily Target Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            COGS Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="dailyTarget" className="block text-sm font-medium mb-2">
                Daily Target (cups)
              </label>
              <Input
                id="dailyTarget"
                type="number"
                value={dailyTarget}
                onChange={(e) => onDailyTargetChange(Number(e.target.value))}
                min="0"
                placeholder="Enter daily target..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Total COGS per Cup
              </label>
              <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center font-semibold">
                {formatCurrency(totalCOGSPerCup)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Total Daily COGS
              </label>
              <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center font-semibold text-primary">
                {formatCurrency(totalDailyCOGS)}
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
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ingredient</TableHead>
                <TableHead className="text-right">Base Cost (IDR)</TableHead>
                <TableHead className="text-right">Base Qty</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">Usage/Cup</TableHead>
                <TableHead className="text-right">Cost/Cup</TableHead>
                <TableHead className="text-right">Total Needed</TableHead>
                <TableHead>Note</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const costPerCup = calculateCostPerCup(item)
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Input
                        value={item.name}
                        onChange={(e) => updateItem(item.id, "name", e.target.value)}
                        placeholder="Ingredient name"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        value={item.baseUnitCost || 0}
                        onChange={(e) => updateItem(item.id, "baseUnitCost", Number(e.target.value))}
                        className="text-right"
                        min="0"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        value={item.baseUnitQuantity || 1}
                        onChange={(e) => updateItem(item.id, "baseUnitQuantity", Number(e.target.value))}
                        className="text-right"
                        min="0.01"
                        step="0.01"
                      />
                    </TableCell>
                    <TableCell>
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
                    <TableCell className="text-right">
                      <div className="relative">
                        <Input
                          type="number"
                          value={item.usagePerCup || 0}
                          onChange={(e) => updateItem(item.id, "usagePerCup", Number(e.target.value))}
                          className="text-right pr-12"
                          min="0"
                          step="0.01"
                          placeholder={`per cup`}
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                          {item.unit || 'ml'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(costPerCup)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-blue-600">
                      {item.usagePerCup && item.unit
                        ? getFormattedQuantity(item.usagePerCup * dailyTarget, item.unit)
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.note || ""}
                        onChange={(e) => updateItem(item.id, "note", e.target.value)}
                        placeholder="Add note..."
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
              
              {/* Add new item row */}
              <TableRow className="border-t-2">
                <TableCell>
                  <Input
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="Add new ingredient..."
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    value={newItem.baseUnitCost}
                    onChange={(e) => setNewItem({ ...newItem, baseUnitCost: Number(e.target.value) })}
                    className="text-right"
                    min="0"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    value={newItem.baseUnitQuantity}
                    onChange={(e) => setNewItem({ ...newItem, baseUnitQuantity: Number(e.target.value) })}
                    className="text-right"
                    min="0.01"
                    step="0.01"
                  />
                </TableCell>
                <TableCell>
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
                <TableCell className="text-right">
                  <div className="relative">
                    <Input
                      type="number"
                      value={newItem.usagePerCup}
                      onChange={(e) => setNewItem({ ...newItem, usagePerCup: Number(e.target.value) })}
                      className="text-right pr-12"
                      min="0"
                      step="0.01"
                      placeholder="per cup"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                      {newItem.unit}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(
                    newItem.baseUnitCost && newItem.baseUnitQuantity && newItem.usagePerCup
                      ? Math.round((newItem.baseUnitCost / newItem.baseUnitQuantity) * newItem.usagePerCup)
                      : 0
                  )}
                </TableCell>
                <TableCell className="text-right font-medium text-blue-600">
                  {newItem.usagePerCup && newItem.unit
                    ? getFormattedQuantity(newItem.usagePerCup * dailyTarget, newItem.unit)
                    : '-'
                  }
                </TableCell>
                <TableCell>
                  <Input
                    value={newItem.note}
                    onChange={(e) => setNewItem({ ...newItem, note: e.target.value })}
                    placeholder="Add note..."
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={addItem}
                    className="text-green-500 hover:text-green-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell className="font-semibold" colSpan={5}>Total COGS per Cup</TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(totalCOGSPerCup)}
                </TableCell>
                <TableCell colSpan={3}></TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      {/* Shopping List Summary */}
      {ingredientQuantities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Shopping List for {dailyTarget} Cups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ingredientQuantities.map((ingredient) => (
                <div key={ingredient.id} className="p-4 bg-muted rounded-lg">
                  <div className="font-semibold text-sm text-muted-foreground mb-1">
                    {ingredient.name}
                  </div>
                  <div className="text-lg font-bold text-primary">
                    {ingredient.formattedQuantity}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {ingredient.usagePerCup} {ingredient.unit} per cup
                  </div>
                </div>
              ))}
            </div>

            {ingredientQuantities.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Add ingredients with usage amounts to see shopping list</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
})
