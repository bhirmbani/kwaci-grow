import { memo } from "react"
import { DataInputSheet } from "./DataInputSheet"
import { FinancialItemsTable } from "../FinancialItemsTable"
import { Package } from "lucide-react"
import type { FinancialItem } from "@/types"

interface VariableCOGSSheetProps {
  items: FinancialItem[]
  onUpdate: (items: FinancialItem[]) => void
}

export const VariableCOGSSheet = memo(function VariableCOGSSheet({ items, onUpdate }: VariableCOGSSheetProps) {
  return (
    <DataInputSheet
      title="Variable COGS per Cup"
      description="Manage your variable cost of goods sold - ingredients and materials per cup"
      triggerLabel="Manage Variable COGS"
      triggerIcon={<Package className="h-4 w-4" />}
      buttonColor="yellow"
      side="right"
    >
      <div className="space-y-4">
        <FinancialItemsTable
          title="Variable COGS Items"
          items={items}
          onUpdate={onUpdate}
          currency={false}
        />
      </div>
    </DataInputSheet>
  )
})
