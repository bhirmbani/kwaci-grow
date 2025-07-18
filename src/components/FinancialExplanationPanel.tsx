import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/utils/formatters"
import { useCurrentBusinessCurrency } from "@/lib/stores/businessStore"
import { Calculator, TrendingUp, TrendingDown, DollarSign, Target, Gift, X } from "lucide-react"

interface FinancialData {
  cupsPerDay: number
  revenue: number
  variableCogs: number
  grossProfit: number
  fixedCosts: number
  bonus: number
  netProfit: number
  daysPerMonth: number
  pricePerCup: number
  cogsPerCup: number
}

interface FinancialExplanationPanelProps {
  selectedData?: FinancialData
  className?: string
  onClearSelection?: () => void
}

export function FinancialExplanationPanel({
  selectedData,
  className = "",
  onClearSelection
}: FinancialExplanationPanelProps) {
  const currentCurrency = useCurrentBusinessCurrency()

  if (!selectedData) {
    return (
      <Card className={`h-full flex flex-col ${className}`}>
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calculator className="h-5 w-5" />
            Financial Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <div className="text-center py-8 space-y-4">
            <p className="text-muted-foreground">
              Click on a table row to see detailed calculations
            </p>
            <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
              💡 <strong>Tip:</strong> Click any row to select it and see calculations. Click again to deselect.
            </div>

            {/* Default Financial Terms Explanation */}
            <div className="text-left space-y-4 mt-6">
              <h3 className="font-semibold text-sm">Financial Terms Guide:</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-green-600">Revenue:</span>
                  <p className="text-muted-foreground text-xs mt-1">
                    Total income from coffee sales (Cups × Price × Days)
                  </p>
                </div>
                <div>
                  <span className="font-medium text-orange-600">Variable COGS:</span>
                  <p className="text-muted-foreground text-xs mt-1">
                    Cost of ingredients per cup that varies with sales volume
                  </p>
                </div>
                <div>
                  <span className="font-medium text-blue-600">Gross Profit:</span>
                  <p className="text-muted-foreground text-xs mt-1">
                    Revenue minus variable costs (before fixed expenses)
                  </p>
                </div>
                <div>
                  <span className="font-medium text-purple-600">Fixed Costs:</span>
                  <p className="text-muted-foreground text-xs mt-1">
                    Monthly expenses that don't change with sales (rent, salaries)
                  </p>
                </div>
                <div>
                  <span className="font-medium text-green-600">Net Profit:</span>
                  <p className="text-muted-foreground text-xs mt-1">
                    Final profit after all expenses and bonuses
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const monthlyCups = selectedData.cupsPerDay * selectedData.daysPerMonth

  return (
    <Card className={`h-full flex flex-col ${className}`}>
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="h-5 w-5" />
              Financial Breakdown
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Analysis for <span className="font-medium text-primary">{selectedData.cupsPerDay} cups/day</span> scenario
            </p>
          </div>
          {onClearSelection && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Clear selection"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-6">
        
        {/* Revenue Calculation */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-semibold text-green-600">
            <DollarSign className="h-4 w-4" />
            Revenue
          </div>
          <div className="text-sm space-y-1 pl-6">
            <div className="flex justify-between">
              <span>Cups per day:</span>
              <span>{selectedData.cupsPerDay}</span>
            </div>
            <div className="flex justify-between">
              <span>Days per month:</span>
              <span>{selectedData.daysPerMonth}</span>
            </div>
            <div className="flex justify-between">
              <span>Price per cup:</span>
              <span>{formatCurrency(selectedData.pricePerCup, currentCurrency)}</span>
            </div>
            <div className="border-t pt-1 flex justify-between font-medium">
              <span>Monthly cups:</span>
              <span>{monthlyCups.toLocaleString()}</span>
            </div>
            <div className="bg-green-50 dark:bg-green-950 p-2 rounded">
              <div className="flex justify-between font-semibold">
                <span>Total Revenue:</span>
                <span className="text-green-600">{formatCurrency(selectedData.revenue, currentCurrency)}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {monthlyCups.toLocaleString()} × {formatCurrency(selectedData.pricePerCup, currentCurrency)}
              </div>
            </div>
          </div>
        </div>

        {/* Variable COGS Calculation */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-semibold text-orange-600">
            <TrendingDown className="h-4 w-4" />
            Variable COGS
          </div>
          <div className="text-sm space-y-1 pl-6">
            <div className="flex justify-between">
              <span>Cost per cup:</span>
              <span>{formatCurrency(selectedData.cogsPerCup, currentCurrency)}</span>
            </div>
            <div className="flex justify-between">
              <span>Monthly cups:</span>
              <span>{monthlyCups.toLocaleString()}</span>
            </div>
            <div className="bg-orange-50 dark:bg-orange-950 p-2 rounded">
              <div className="flex justify-between font-semibold">
                <span>Total Variable COGS:</span>
                <span className="text-orange-600">{formatCurrency(selectedData.variableCogs, currentCurrency)}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {monthlyCups.toLocaleString()} × {formatCurrency(selectedData.cogsPerCup, currentCurrency)}
              </div>
            </div>
          </div>
        </div>

        {/* Gross Profit Calculation */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-semibold text-blue-600">
            <TrendingUp className="h-4 w-4" />
            Gross Profit
          </div>
          <div className="text-sm space-y-1 pl-6">
            <div className="flex justify-between">
              <span>Revenue:</span>
              <span>{formatCurrency(selectedData.revenue, currentCurrency)}</span>
            </div>
            <div className="flex justify-between">
              <span>Variable COGS:</span>
              <span>-{formatCurrency(selectedData.variableCogs, currentCurrency)}</span>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950 p-2 rounded">
              <div className="flex justify-between font-semibold">
                <span>Gross Profit:</span>
                <span className="text-blue-600">{formatCurrency(selectedData.grossProfit, currentCurrency)}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Revenue - Variable COGS
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Costs */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-semibold text-purple-600">
            <Target className="h-4 w-4" />
            Fixed Costs
          </div>
          <div className="text-sm space-y-1 pl-6">
            <div className="bg-purple-50 dark:bg-purple-950 p-2 rounded">
              <div className="flex justify-between font-semibold">
                <span>Monthly Fixed Costs:</span>
                <span className="text-purple-600">{formatCurrency(selectedData.fixedCosts, currentCurrency)}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Rent, salaries, depreciation, etc.
              </div>
            </div>
          </div>
        </div>

        {/* Bonus */}
        {selectedData.bonus > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-semibold text-amber-600">
              <Gift className="h-4 w-4" />
              Bonus
            </div>
            <div className="text-sm space-y-1 pl-6">
              <div className="bg-amber-50 dark:bg-amber-950 p-2 rounded">
                <div className="flex justify-between font-semibold">
                  <span>Barista Bonus:</span>
                  <span className="text-amber-600">{formatCurrency(selectedData.bonus, currentCurrency)}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Performance incentive for exceeding targets
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Net Profit Calculation */}
        <div className="space-y-2 border-t pt-4">
          <div className={`flex items-center gap-2 font-semibold ${
            selectedData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {selectedData.netProfit >= 0 ? 
              <TrendingUp className="h-4 w-4" /> : 
              <TrendingDown className="h-4 w-4" />
            }
            Net Profit
          </div>
          <div className="text-sm space-y-1 pl-6">
            <div className="flex justify-between">
              <span>Gross Profit:</span>
              <span>{formatCurrency(selectedData.grossProfit, currentCurrency)}</span>
            </div>
            <div className="flex justify-between">
              <span>Fixed Costs:</span>
              <span>-{formatCurrency(selectedData.fixedCosts, currentCurrency)}</span>
            </div>
            {selectedData.bonus > 0 && (
              <div className="flex justify-between">
                <span>Bonus:</span>
                <span>-{formatCurrency(selectedData.bonus, currentCurrency)}</span>
              </div>
            )}
            <div className={`p-3 rounded font-semibold text-lg ${
              selectedData.netProfit >= 0
                ? 'bg-green-50 dark:bg-green-950 text-green-600'
                : 'bg-red-50 dark:bg-red-950 text-red-600'
            }`}>
              <div className="flex justify-between">
                <span>Net Profit:</span>
                <span>{formatCurrency(selectedData.netProfit, currentCurrency)}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-normal">
                {selectedData.netProfit >= 0 ? 'Profitable scenario' : 'Loss scenario'}
              </div>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-muted/50 p-3 rounded-lg">
          <h4 className="font-semibold mb-2">Key Insights</h4>
          <div className="text-sm space-y-1">
            <div>• Profit margin: {((selectedData.netProfit / selectedData.revenue) * 100).toFixed(1)}%</div>
            <div>• Break-even: {selectedData.netProfit >= 0 ? 'Achieved' : 'Not achieved'}</div>
            <div>• COGS ratio: {((selectedData.variableCogs / selectedData.revenue) * 100).toFixed(1)}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
