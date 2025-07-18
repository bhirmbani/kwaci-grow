import { memo, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { BonusScheme } from "@/types"

import { formatNumber, formatCurrency } from "@/utils/formatters"
import { useCurrentBusinessCurrency } from "@/lib/stores/businessStore"
import { getCurrency } from "@/lib/utils/currencyUtils"

interface BonusSchemeCardProps {
  bonusScheme: BonusScheme
  onUpdate: (scheme: BonusScheme) => void
}

export const BonusSchemeCard = memo(function BonusSchemeCard({ bonusScheme, onUpdate }: BonusSchemeCardProps) {
  const currentCurrency = useCurrentBusinessCurrency()
  const currencyInfo = getCurrency(currentCurrency)

  const handleBaristaCountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...bonusScheme, baristaCount: Number(e.target.value) })
  }, [bonusScheme, onUpdate])

  const handleTargetChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...bonusScheme, target: Number(e.target.value) })
  }, [bonusScheme, onUpdate])

  const handlePerCupChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...bonusScheme, perCup: Number(e.target.value) })
  }, [bonusScheme, onUpdate])

  const handleNoteChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...bonusScheme, note: e.target.value })
  }, [bonusScheme, onUpdate])

  return (
    <Card className="bg-card border-border">
      <CardHeader className="bg-card">
        <CardTitle className="text-card-foreground">Bonus Scheme</CardTitle>
      </CardHeader>
      <CardContent className="bg-card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <Label htmlFor="baristaCount">Number of Baristas</Label>
            <Input
              id="baristaCount"
              type="number"
              min="1"
              value={bonusScheme.baristaCount}
              onChange={handleBaristaCountChange}
              className="text-right"
            />
          </div>
          <div>
            <Label htmlFor="bonusTarget">Sales Target (cups/month)</Label>
            <Input
              id="bonusTarget"
              type="number"
              value={bonusScheme.target}
              onChange={handleTargetChange}
              className="text-right"
            />
          </div>
          <div>
            <Label htmlFor="bonusPerCup">Bonus per cup above target ({currencyInfo.code})</Label>
            <Input
              id="bonusPerCup"
              type="number"
              value={bonusScheme.perCup}
              onChange={handlePerCupChange}
              className="text-right"
            />
          </div>
        </div>
        <div className="mt-4">
          <Label htmlFor="bonusNote">Notes</Label>
          <Input
            id="bonusNote"
            value={bonusScheme.note || ""}
            onChange={handleNoteChange}
            placeholder="Add notes about the bonus scheme..."
          />
        </div>
        <CardDescription>
          Contoh: {bonusScheme.baristaCount} barista{bonusScheme.baristaCount > 1 ? 's' : ''} mendapat bonus {formatCurrency(bonusScheme.perCup, currentCurrency)} per cup
          untuk setiap penjualan di atas {formatNumber(bonusScheme.target)} cup per bulan.
          Total bonus maksimal per bulan: {formatCurrency(bonusScheme.perCup * bonusScheme.baristaCount, currentCurrency)} per cup di atas target.
        </CardDescription>
      </CardContent>
    </Card>
  )
})