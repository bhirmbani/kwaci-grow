import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { BonusScheme } from "@/types"

import { formatNumber } from "@/utils/formatters"

interface BonusSchemeCardProps {
  bonusScheme: BonusScheme
  onUpdate: (scheme: BonusScheme) => void
}

export function BonusSchemeCard({ bonusScheme, onUpdate }: BonusSchemeCardProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Bonus Scheme</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="bonusTarget">Sales Target (cups/month)</Label>
            <Input
              id="bonusTarget"
              type="number"
              value={bonusScheme.target}
              onChange={(e) => onUpdate({ ...bonusScheme, target: Number(e.target.value) })}
              className="text-right"
            />
          </div>
          <div>
            <Label htmlFor="bonusPerCup">Bonus per cup above target (IDR)</Label>
            <Input
              id="bonusPerCup"
              type="number"
              value={bonusScheme.perCup}
              onChange={(e) => onUpdate({ ...bonusScheme, perCup: Number(e.target.value) })}
              className="text-right"
            />
          </div>
        </div>
        <CardDescription>
          Contoh: Barista mendapat bonus Rp {formatNumber(bonusScheme.perCup)} per cup 
          untuk setiap penjualan di atas {formatNumber(bonusScheme.target)} cup per bulan.
        </CardDescription>
      </CardContent>
    </Card>
  )
}