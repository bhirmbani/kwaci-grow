import { memo } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
          <CardTitle className="text-sm font-medium">{t('fixedAssets.summary.totalAssets')}</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalAssets}</div>
          <p className="text-xs text-muted-foreground">
            {t('fixedAssets.summary.assetsDesc')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('fixedAssets.summary.totalPurchaseCost')}</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.totalPurchaseCost)}</div>
          <p className="text-xs text-muted-foreground">
            {t('fixedAssets.summary.purchaseCostDesc')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('fixedAssets.summary.currentValue')}</CardTitle>
          <Calculator className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.totalCurrentValue)}</div>
          <p className="text-xs text-muted-foreground">
            {t('fixedAssets.summary.currentValueDesc')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('fixedAssets.summary.totalDepreciation')}</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.totalDepreciation)}</div>
          <p className="text-xs text-muted-foreground">
            {t('fixedAssets.summary.totalDepreciationDesc', { rate: depreciationRate.toFixed(1) })}
          </p>
        </CardContent>
      </Card>
    </div>
  )
})

// Explanatory component for non-financial users
export const DepreciationExplanation = memo(function DepreciationExplanation() {
  const { t } = useTranslation()
  return (
    <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
          {t('fixedAssets.summary.explanationTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
        <p dangerouslySetInnerHTML={{ __html: t('fixedAssets.summary.explanation.p1') }} />
        <p dangerouslySetInnerHTML={{ __html: t('fixedAssets.summary.explanation.p2') }} />
        <p dangerouslySetInnerHTML={{ __html: t('fixedAssets.summary.explanation.p3') }} />
        <p className="text-xs" dangerouslySetInnerHTML={{ __html: t('fixedAssets.summary.explanation.p4') }} />
      </CardContent>
    </Card>
  )
})
