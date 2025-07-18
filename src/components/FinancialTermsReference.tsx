import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/utils/formatters"
import { useCurrentBusinessCurrency } from "@/lib/stores/businessStore"
import { Calculator, TrendingUp, TrendingDown, DollarSign, Target, Gift, Info } from "lucide-react"

export function FinancialTermsReference() {
  const currentCurrency = useCurrentBusinessCurrency()

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Complete Financial Terms Guide
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Understanding all financial metrics used in the KWACI Grow business dashboard
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Revenue Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-green-600">Revenue</h3>
            <Badge variant="outline" className="text-xs">Income</Badge>
          </div>
          <div className="pl-7 space-y-2">
            <p className="text-sm">
              <strong>Definition:</strong> Total income generated from coffee sales before any expenses.
            </p>
            <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
              <p className="text-sm font-mono">
                <strong>Formula:</strong> Cups per Day × Days per Month × Price per Cup
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Example: 50 cups/day × 22 days × {formatCurrency(8000, currentCurrency)} = {formatCurrency(8800000, currentCurrency)}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              This represents your gross sales before considering any costs or expenses.
            </p>
          </div>
        </div>

        {/* Variable COGS Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-orange-600">Variable COGS</h3>
            <Badge variant="outline" className="text-xs">Cost</Badge>
          </div>
          <div className="pl-7 space-y-2">
            <p className="text-sm">
              <strong>Definition:</strong> Cost of Goods Sold that varies directly with the number of cups sold.
            </p>
            <div className="bg-orange-50 dark:bg-orange-950 p-3 rounded-lg">
              <p className="text-sm font-mono">
                <strong>Formula:</strong> Total Cups × Cost per Cup
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Includes: Coffee beans, milk, sugar, cups, lids, stirrers, etc.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              These costs increase proportionally with sales volume. Higher sales = higher variable costs.
            </p>
          </div>
        </div>

        {/* Gross Profit Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-600">Gross Profit</h3>
            <Badge variant="outline" className="text-xs">Margin</Badge>
          </div>
          <div className="pl-7 space-y-2">
            <p className="text-sm">
              <strong>Definition:</strong> Profit after deducting variable costs but before fixed expenses.
            </p>
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
              <p className="text-sm font-mono">
                <strong>Formula:</strong> Revenue - Variable COGS
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                This shows how much money is left to cover fixed costs and generate profit.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              A positive gross profit means your selling price covers the direct costs of making each cup.
            </p>
          </div>
        </div>

        {/* Fixed Costs Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-purple-600">Fixed Costs</h3>
            <Badge variant="outline" className="text-xs">Overhead</Badge>
          </div>
          <div className="pl-7 space-y-2">
            <p className="text-sm">
              <strong>Definition:</strong> Monthly expenses that remain constant regardless of sales volume.
            </p>
            <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg">
              <p className="text-sm font-mono">
                <strong>Examples:</strong> Rent, salaries, insurance, equipment depreciation
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                These costs must be paid whether you sell 10 cups or 1000 cups per day.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Understanding fixed costs helps determine your break-even point and minimum sales targets.
            </p>
          </div>
        </div>

        {/* Bonus Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-amber-600">Bonus</h3>
            <Badge variant="outline" className="text-xs">Incentive</Badge>
          </div>
          <div className="pl-7 space-y-2">
            <p className="text-sm">
              <strong>Definition:</strong> Performance-based incentives paid to baristas for exceeding sales targets.
            </p>
            <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg">
              <p className="text-sm font-mono">
                <strong>Formula:</strong> (Actual Cups - Target) × Bonus per Cup × Number of Baristas
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Only applies when monthly sales exceed the predetermined target.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Bonus schemes motivate staff performance but reduce net profit when targets are exceeded.
            </p>
          </div>
        </div>

        {/* Net Profit Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-emerald-600" />
            <h3 className="text-lg font-semibold text-emerald-600">Net Profit</h3>
            <Badge variant="outline" className="text-xs">Bottom Line</Badge>
          </div>
          <div className="pl-7 space-y-2">
            <p className="text-sm">
              <strong>Definition:</strong> Final profit after all expenses, costs, and bonuses are deducted.
            </p>
            <div className="bg-emerald-50 dark:bg-emerald-950 p-3 rounded-lg">
              <p className="text-sm font-mono">
                <strong>Formula:</strong> Gross Profit - Fixed Costs - Bonuses
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                This is the actual money left over for business growth and owner compensation.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Positive net profit indicates a sustainable business. Negative values require cost reduction or price increases.
            </p>
          </div>
        </div>

        {/* Key Business Insights */}
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-3">Key Business Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">Break-even Analysis:</h4>
              <p className="text-muted-foreground text-xs">
                Find the minimum daily sales needed to cover all costs and achieve zero net profit.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Profit Margins:</h4>
              <p className="text-muted-foreground text-xs">
                Monitor the percentage of revenue that becomes net profit to assess business efficiency.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Cost Control:</h4>
              <p className="text-muted-foreground text-xs">
                Track variable costs per cup and fixed cost ratios to identify optimization opportunities.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Scaling Decisions:</h4>
              <p className="text-muted-foreground text-xs">
                Use projections to evaluate the impact of price changes, cost reductions, or volume increases.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
