import { memo } from 'react'
import { TrendingDown, Package, DollarSign, Calculator } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/utils/formatters'

interface FixedAssetSummaryProps {
  summary: {
    totalAssets: number
    totalPurchaseCost: number
    totalCurrentValue: number
    totalDepreciation: number
  }
  loading?: boolean
}

export const FixedAssetSummary = memo(function FixedAssetSummary({
  summary,
  loading = false
}: FixedAssetSummaryProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted animate-pulse rounded w-24" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded w-32 mb-1" />
              <div className="h-3 bg-muted animate-pulse rounded w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const depreciationRate = summary.totalPurchaseCost > 0 
    ? (summary.totalDepreciation / summary.totalPurchaseCost) * 100 
    : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalAssets}</div>
          <p className="text-xs text-muted-foreground">
            Fixed assets in inventory
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Purchase Cost</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.totalPurchaseCost)}</div>
          <p className="text-xs text-muted-foreground">
            Original investment value
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Value</CardTitle>
          <Calculator className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.totalCurrentValue)}</div>
          <p className="text-xs text-muted-foreground">
            After depreciation calculation
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Depreciation</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.totalDepreciation)}</div>
          <p className="text-xs text-muted-foreground">
            {depreciationRate.toFixed(1)}% of original value
          </p>
        </CardContent>
      </Card>
    </div>
  )
})

// Explanatory component for non-financial users
export const DepreciationExplanation = memo(function DepreciationExplanation() {
  return (
    <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
          Understanding Fixed Assets & Depreciation
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
        <p>
          <strong>Fixed Assets</strong> are long-term items your business owns, like equipment, furniture, or technology.
        </p>
        <p>
          <strong>Depreciation</strong> spreads the cost of these assets over their useful life. For example, 
          a ₹60,000 coffee machine used for 5 years costs ₹12,000 per year (₹1,000 per month) in depreciation.
        </p>
        <p>
          <strong>Current Value</strong> shows what the asset is worth today after accounting for wear and age.
        </p>
        <p className="text-xs">
          This system automatically creates monthly depreciation entries in your Fixed Costs to accurately 
          reflect your business expenses.
        </p>
      </CardContent>
    </Card>
  )
})
