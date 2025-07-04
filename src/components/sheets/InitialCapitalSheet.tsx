import { memo } from "react"
import { DataInputSheet } from "./DataInputSheet"
import { FinancialItemsTable } from "../FinancialItemsTable"
import { DollarSign } from "lucide-react"
import { useInitialCapitalItems } from "@/hooks/useInitialCapitalItems"

export const InitialCapitalSheet = memo(function InitialCapitalSheet() {
  const { items, updateItems, loading, error } = useInitialCapitalItems()
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
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}
        <FinancialItemsTable
          title="Initial Capital Items"
          items={items}
          onUpdate={updateItems}
          enableFixedAssets={true}
        />
        {loading && (
          <div className="text-center text-sm text-gray-500">
            Updating depreciation entries...
          </div>
        )}
      </div>
    </DataInputSheet>
  )
})
