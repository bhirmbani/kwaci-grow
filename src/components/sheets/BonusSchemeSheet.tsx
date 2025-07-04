import { ConfigurationSheet } from "./ConfigurationSheet"
import { BonusSchemeCard } from "../BonusSchemeCard"
import { Users } from "lucide-react"
import type { BonusScheme } from "@/types"

interface BonusSchemeSheetProps {
  bonusScheme: BonusScheme
  onUpdate: (scheme: BonusScheme) => void
}

export function BonusSchemeSheet({ bonusScheme, onUpdate }: BonusSchemeSheetProps) {
  return (
    <ConfigurationSheet
      title="Bonus Scheme Configuration"
      description="Configure the bonus scheme for baristas based on sales targets"
      triggerLabel="Configure Bonus"
      triggerIcon={<Users className="h-4 w-4" />}
      side="right"
    >
      <div className="space-y-4">
        <BonusSchemeCard 
          bonusScheme={bonusScheme}
          onUpdate={onUpdate}
        />
      </div>
    </ConfigurationSheet>
  )
}
