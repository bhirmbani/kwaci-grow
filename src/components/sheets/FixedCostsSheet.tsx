import { memo } from "react"
import { DataInputSheet } from "./DataInputSheet"
import { FinancialItemsTable } from "../FinancialItemsTable"
import { Calendar } from "lucide-react"
import { useFixedCostsItems } from "@/hooks/useFixedCostsItems"

export const FixedCostsSheet = memo(function FixedCostsSheet() {
  const { items, updateItems, loading, error } = useFixedCostsItems()
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
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}
        <FinancialItemsTable
          title="Fixed Costs Items"
          items={items}
          onUpdate={updateItems}
        />
        {loading && (
          <div className="text-center text-sm text-gray-500">
            Refreshing fixed costs...
          </div>
        )}
      </div>
    </DataInputSheet>
  )
})
