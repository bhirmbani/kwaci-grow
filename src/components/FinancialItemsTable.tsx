import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Plus } from "lucide-react"
import { formatCurrency } from "@/utils/formatters"
import type { FinancialItem } from "@/types"

interface FinancialItemsTableProps {
  title: string
  items: FinancialItem[]
  onUpdate: (items: FinancialItem[]) => void
  currency?: boolean
}

export function FinancialItemsTable({
  title,
  items,
  onUpdate,
  currency = true
}: FinancialItemsTableProps) {
  const [newItem, setNewItem] = useState({ name: "", value: 0 })

  const updateItem = (id: string, field: "name" | "value", value: string | number) => {
    const updatedItems = items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    )
    onUpdate(updatedItems)
  }

  const removeItem = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id)
    onUpdate(updatedItems)
  }

  const addItem = () => {
    if (newItem.name.trim()) {
      const item: FinancialItem = {
        id: Date.now().toString(),
        name: newItem.name,
        value: newItem.value
      }
      onUpdate([...items, item])
      setNewItem({ name: "", value: 0 })
    }
  }

  const total = items.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="text-right">
                {currency ? "Amount (IDR)" : "Cost/Cup (IDR)"}
              </TableHead>
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
                {formatCurrency(total)}
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  )
}