import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Info, Calculator } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'
import { useProductCOGS } from '@/hooks/useProducts'

interface COGSBreakdownProps {
  productId: string
  productName: string
  showExplanation?: boolean
}

export const COGSBreakdown = memo(function COGSBreakdown({
  productId,
  productName,
  showExplanation = true
}: COGSBreakdownProps) {
  const { t } = useTranslation()
  const { cogsData, loading, error } = useProductCOGS(productId)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {t('products.cogs.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">{t('products.cogs.loading')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {t('products.cogs.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!cogsData || cogsData.ingredients.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {t('products.cogs.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              {t('products.cogs.noIngredients')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('products.cogs.addIngredientsPrompt')}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          {t('products.cogs.titleFor', { name: productName })}
        </CardTitle>
        {showExplanation && (
          <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">{t('products.cogs.whatIs.title')}</p>
              <p>
                {t('products.cogs.whatIs.text')}
              </p>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total COGS Display */}
        <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('products.cogs.totalCogsPerCup')}</p>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(cogsData.totalCostPerCup)}
            </p>
          </div>
          <Badge variant="secondary" className="text-xs">
            {t('products.cogs.ingredientCount', { count: cogsData.ingredients.length })}
          </Badge>
        </div>

        {/* Ingredient Breakdown */}
        <div>
          <h4 className="text-sm font-medium mb-3">{t('products.cogs.ingredientBreakdown')}</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('products.cogs.table.ingredient')}</TableHead>
                <TableHead className="text-right">{t('products.cogs.table.usagePerCup')}</TableHead>
                <TableHead className="text-right">{t('products.cogs.table.costPerCup')}</TableHead>
                <TableHead className="text-right">{t('products.cogs.table.percentOfTotal')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cogsData.ingredients.map((ingredient) => (
                <TableRow key={ingredient.id}>
                  <TableCell className="font-medium">
                    {ingredient.name}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {ingredient.usagePerCup} {ingredient.unit}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(ingredient.costPerCup)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="text-xs">
                      {ingredient.percentage.toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Calculation Formula */}
        {showExplanation && (
          <div className="text-xs text-muted-foreground p-3 bg-muted/20 rounded-lg">
            <p className="font-medium mb-1">{t('products.cogs.formula.title')}</p>
            <p>{t('products.cogs.formula.formula')}</p>
            <p className="mt-1">{t('products.cogs.formula.example')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
})
