import { DataInputSheet } from "./DataInputSheet"
import { FinancialItemsTable } from "../FinancialItemsTable"
import { Calendar } from "lucide-react"
import type { FinancialItem } from "@/types"

interface FixedCostsSheetProps {
  items: FinancialItem[]
  onUpdate: (items: FinancialItem[]) => void
}

export function FixedCostsSheet({ items, onUpdate }: FixedCostsSheetProps) {
  return (
    <DataInputSheet
      title="Fixed Costs / Month"
      description="Manage your monthly fixed costs like salaries, rent, and other recurring expenses"
      triggerLabel="Manage Fixed Costs"
      triggerIcon={<Calendar className="h-4 w-4" />}
      buttonColor="green"
      side="right"
    >
      <div className="space-y-4">
        <FinancialItemsTable
          title="Fixed Costs Items"
          items={items}
          onUpdate={onUpdate}
        />
      </div>
    </DataInputSheet>
  )
}
