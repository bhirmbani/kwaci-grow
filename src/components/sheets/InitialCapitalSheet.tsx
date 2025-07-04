import { memo } from "react"
import { DataInputSheet } from "./DataInputSheet"
import { FinancialItemsTable } from "../FinancialItemsTable"
import { DollarSign } from "lucide-react"
import type { FinancialItem } from "@/types"

interface InitialCapitalSheetProps {
  items: FinancialItem[]
  onUpdate: (items: FinancialItem[]) => void
}

export const InitialCapitalSheet = memo(function InitialCapitalSheet({ items, onUpdate }: InitialCapitalSheetProps) {
  return (
    <DataInputSheet
      title="Initial Capital"
      description="Manage your initial capital investments and startup costs"
      triggerLabel="Manage Initial Capital"
      triggerIcon={<DollarSign className="h-4 w-4" />}
      buttonColor="blue"
      side="right"
    >
      <div className="space-y-4">
        <FinancialItemsTable
          title="Initial Capital Items"
          items={items}
          onUpdate={onUpdate}
        />
      </div>
    </DataInputSheet>
  )
})
