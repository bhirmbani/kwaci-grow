import { useState, memo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Plus } from "lucide-react"
import { formatCurrency } from "@/utils/formatters"
import { useCurrentBusinessCurrency } from "@/lib/stores/businessStore"
import { getCurrency } from "@/lib/utils/currencyUtils"
import type { FinancialItem } from "@/types"

interface FinancialItemsTableProps {
  title: string
  items: FinancialItem[]
  onUpdate: (items: FinancialItem[]) => void
  currency?: boolean
  enableFixedAssets?: boolean
}

export const FinancialItemsTable = memo(function FinancialItemsTable({
  title,
  items,
  onUpdate,
  currency = true,
  enableFixedAssets = false
}: FinancialItemsTableProps) {
  const currentCurrency = useCurrentBusinessCurrency()
  const currencyInfo = getCurrency(currentCurrency)

  const [newItem, setNewItem] = useState({
    name: "",
    value: 0,
    note: "",
    isFixedAsset: false,
    estimatedUsefulLifeYears: undefined as number | undefined
  })

  const updateItem = useCallback((id: string, field: keyof FinancialItem, value: string | number | boolean) => {
    console.log('🔄 FinancialItemsTable: Updating item field:', { id, field, value })

    const updatedItems = items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value }

        // If unchecking fixed asset, clear useful life
        if (field === 'isFixedAsset' && !value) {
          updatedItem.estimatedUsefulLifeYears = undefined
        }

        console.log('✅ FinancialItemsTable: Updated item:', updatedItem)
        return updatedItem
      }
      return item
    })

    console.log('🔄 FinancialItemsTable: Calling onUpdate with items:', updatedItems)
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
        value: newItem.value,
        note: newItem.note || "",
        isFixedAsset: enableFixedAssets ? newItem.isFixedAsset : undefined,
        estimatedUsefulLifeYears: enableFixedAssets && newItem.isFixedAsset ? newItem.estimatedUsefulLifeYears : undefined
      }
      onUpdate([...items, item])
      setNewItem({
        name: "",
        value: 0,
        note: "",
        isFixedAsset: false,
        estimatedUsefulLifeYears: undefined
      })
    }
  }, [newItem, items, onUpdate, enableFixedAssets])

  const total = items.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className="bg-card border-border">
      <CardHeader className="bg-card">
        <CardTitle className="text-card-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="text-right">
                {currency ? `Amount (${currencyInfo.code})` : `Cost/Cup (${currencyInfo.code})`}
              </TableHead>
              {enableFixedAssets && (
                <>
                  <TableHead className="text-center">Fixed Asset</TableHead>
                  <TableHead className="text-center">Useful Life (years)</TableHead>
                </>
              )}
              <TableHead>Note</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Input
                    value={item.name}
                    onChange={(e) => updateItem(item.id, "name", e.target.value)}
                    placeholder="Item name"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    value={item.value}
                    onChange={(e) => updateItem(item.id, "value", Number(e.target.value))}
                    className="text-right"
                  />
                </TableCell>
                {enableFixedAssets && (
                  <>
                    <TableCell className="text-center">
                      <input
                        type="checkbox"
                        checked={item.isFixedAsset || false}
                        onChange={(e) => updateItem(item.id, "isFixedAsset", e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      {item.isFixedAsset && (
                        <Input
                          type="number"
                          min="1"
                          step="0.1"
                          value={item.estimatedUsefulLifeYears || ""}
                          onChange={(e) => updateItem(item.id, "estimatedUsefulLifeYears", Number(e.target.value))}
                          placeholder="Years"
                          className="text-center w-20"
                        />
                      )}
                    </TableCell>
                  </>
                )}
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
            ))}
            <TableRow className="border-t-2">
              <TableCell>
                <Input
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Add new item..."
                />
              </TableCell>
              <TableCell className="text-right">
                <Input
                  type="number"
                  value={newItem.value}
                  onChange={(e) => setNewItem({ ...newItem, value: Number(e.target.value) })}
                  className="text-right"
                />
              </TableCell>
              {enableFixedAssets && (
                <>
                  <TableCell className="text-center">
                    <input
                      type="checkbox"
                      checked={newItem.isFixedAsset}
                      onChange={(e) => setNewItem({
                        ...newItem,
                        isFixedAsset: e.target.checked,
                        estimatedUsefulLifeYears: e.target.checked ? newItem.estimatedUsefulLifeYears : undefined
                      })}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    {newItem.isFixedAsset && (
                      <Input
                        type="number"
                        min="1"
                        step="0.1"
                        value={newItem.estimatedUsefulLifeYears || ""}
                        onChange={(e) => setNewItem({ ...newItem, estimatedUsefulLifeYears: Number(e.target.value) })}
                        placeholder="Years"
                        className="text-center w-20"
                      />
                    )}
                  </TableCell>
                </>
              )}
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
              <TableCell className="font-semibold">Total</TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(total, currentCurrency)}
              </TableCell>
              {enableFixedAssets && (
                <>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                </>
              )}
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  )
})