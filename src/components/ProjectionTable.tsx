import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { BonusScheme, FinancialItem } from "@/types"

import { formatCurrency } from "@/utils/formatters"

interface ProjectionTableProps {
  daysPerMonth: number
  pricePerCup: number
  fixedItems: FinancialItem[]
  cogsItems: FinancialItem[]
  bonusScheme: BonusScheme
  onDaysChange: (days: number) => void
  onPriceChange: (price: number) => void
}

export function ProjectionTable({
  daysPerMonth,
  pricePerCup,
  fixedItems,
  cogsItems,
  bonusScheme,
  onDaysChange,
  onPriceChange
}: ProjectionTableProps) {
  const fixedTotal = fixedItems.reduce((sum, item) => sum + item.value, 0)
  const cogsTotal = cogsItems.reduce((sum, item) => sum + item.value, 0)

  const generateProjections = () => {
    const projections = []
    for (let cupsPerDay = 10; cupsPerDay <= 200; cupsPerDay += 10) {
      const monthlyCups = cupsPerDay * daysPerMonth
      const revenue = monthlyCups * pricePerCup
      const variableCogs = monthlyCups * cogsTotal
      const grossProfit = revenue - variableCogs
      
      let bonus = 0
      if (monthlyCups > bonusScheme.target) {
        bonus = (monthlyCups - bonusScheme.target) * bonusScheme.perCup * bonusScheme.baristaCount
      }
      
      const netProfit = grossProfit - fixedTotal - bonus

      projections.push({
        cupsPerDay,
        revenue,
        variableCogs,
        grossProfit,
        fixedCosts: fixedTotal,
        bonus,
        netProfit
      })
    }
    return projections
  }

  const projections = generateProjections()

  return (
    <Card>
      <CardHeader>
        <CardTitle>2. Income Projection & Profits</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <Label htmlFor="daysPerMonth">Days/Month</Label>
            <Input
              id="daysPerMonth"
              type="number"
              value={daysPerMonth}
              onChange={(e) => onDaysChange(Number(e.target.value))}
              min="1"
              max="31"
            />
          </div>
          <div>
            <Label htmlFor="pricePerCup">Price/Cup (IDR)</Label>
            <Input
              id="pricePerCup"
              type="number"
              value={pricePerCup}
              onChange={(e) => onPriceChange(Number(e.target.value))}
              min="0"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cups/Day</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Variable COGS</TableHead>
                <TableHead className="text-right">Gross Profit</TableHead>
                <TableHead className="text-right">Fixed Costs</TableHead>
                <TableHead className="text-right">Bonus</TableHead>
                <TableHead className="text-right">Net Profit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projections.map((projection) => (
                <TableRow key={projection.cupsPerDay}>
                  <TableCell className="font-medium">{projection.cupsPerDay}</TableCell>
                  <TableCell className="text-right">{formatCurrency(projection.revenue)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(projection.variableCogs)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(projection.grossProfit)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(projection.fixedCosts)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(projection.bonus)}</TableCell>
                  <TableCell className={`text-right font-semibold ${projection.netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency(projection.netProfit)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}