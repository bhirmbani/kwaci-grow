import { memo } from "react"
import { DataInputSheet } from "./DataInputSheet"
import { COGSCalculatorTable } from "../COGSCalculatorTable"
import { Package } from "lucide-react"
import { useAppSetting } from "@/hooks/useAppSetting"
import { APP_SETTING_KEYS } from "@/lib/db/schema"
import type { FinancialItem } from "@/types"

interface VariableCOGSSheetProps {
  items: FinancialItem[]
  onUpdate: (items: FinancialItem[]) => void
}

export const VariableCOGSSheet = memo(function VariableCOGSSheet({ items, onUpdate }: VariableCOGSSheetProps) {
  const {
    value: dailyTarget,
    updateValue: setDailyTarget
  } = useAppSetting(APP_SETTING_KEYS.DAILY_TARGET_CUPS, 60)

  return (
    <DataInputSheet
      title="COGS Calculator"
      description="Calculate cost of goods sold with dynamic ingredient parameters and daily targets"
      triggerLabel="COGS Calculator"
      triggerIcon={<Package className="h-4 w-4" />}
      buttonColor="yellow"
      side="right"
    >
      <COGSCalculatorTable
        title="Ingredient Cost Calculator"
        items={items}
        onUpdate={onUpdate}
        dailyTarget={dailyTarget}
        onDailyTargetChange={setDailyTarget}
      />
    </DataInputSheet>
  )
})
