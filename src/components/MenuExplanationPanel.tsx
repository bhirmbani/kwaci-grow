import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/utils/formatters"
import { useTranslation } from 'react-i18next'

interface MenuProductProjection {
  menuId: string
  menuName: string
  productId: string
  productName: string
  cogsPerCup: number
  menuPrice: number
  grossProfitPerCup: number
  dailyRevenue: number
  weeklyRevenue: number
  monthlyRevenue: number
  dailyProfit: number
  weeklyProfit: number
  monthlyProfit: number
  targetQuantityPerDay: number
}

interface MenuExplanationPanelProps {
  selectedProduct?: MenuProductProjection
  daysPerMonth: number
}

export function MenuExplanationPanel({
  selectedProduct,
  daysPerMonth
}: MenuExplanationPanelProps) {
  const { t } = useTranslation()
  if (!selectedProduct) {
    return (
      <>
        <CardHeader>
          <CardTitle className="text-lg">{t('analytics.explanation.defaultTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {t('analytics.explanation.clickPrompt')}
          </div>
          
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm mb-2">{t('analytics.explanation.understandingTitle')}</h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div><strong>{t('analytics.explanation.understanding.menuStructure')}</strong></div>
                <div><strong>{t('analytics.explanation.understanding.menuPrice')}</strong></div>
                <div><strong>{t('analytics.explanation.understanding.cogs')}</strong></div>
                <div><strong>{t('analytics.explanation.understanding.revenue')}</strong></div>
                <div><strong>{t('analytics.explanation.understanding.profit')}</strong></div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm mb-2">{t('analytics.explanation.benefitsTitle')}</h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div>{t('analytics.explanation.benefits.seePerformance')}</div>
                <div>{t('analytics.explanation.benefits.comparePricing')}</div>
                <div>{t('analytics.explanation.benefits.identifyProfitable')}</div>
                <div>{t('analytics.explanation.benefits.optimizePlacement')}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </>
    )
  }

  const isProfit = selectedProduct.grossProfitPerCup >= 0
  const profitMargin = selectedProduct.menuPrice > 0 
    ? (selectedProduct.grossProfitPerCup / selectedProduct.menuPrice) * 100 
    : 0

  return (
    <>
      <CardHeader>
        <CardTitle className="text-lg">{selectedProduct.productName}</CardTitle>
        <div className="text-sm text-muted-foreground">
          {t('analytics.explanation.inMenu', { menuName: selectedProduct.menuName })}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Menu Context */}
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-sm mb-2">{t('analytics.explanation.menuContext')}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Menu:</span>
                <span className="font-medium">{selectedProduct.menuName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product:</span>
                <span className="font-medium">{selectedProduct.productName}</span>
              </div>
            </div>
          </div>

          {/* Unit Economics */}
          <div>
            <h4 className="font-medium text-sm mb-2">{t('analytics.explanation.unitEconomics')}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">COGS per Unit:</span>
                <span className="font-medium">{formatCurrency(selectedProduct.cogsPerCup)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Menu Price:</span>
                <span className="font-medium">{formatCurrency(selectedProduct.menuPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gross Profit/Unit:</span>
                <span className={`font-medium ${isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(selectedProduct.grossProfitPerCup)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Profit Margin:</span>
                <span className={`font-medium ${isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {profitMargin.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Daily Calculations */}
          <div>
            <h4 className="font-medium text-sm mb-2">{t('analytics.explanation.dailyProjections')}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('analytics.explanation.targetQuantity')}</span>
                <span className="font-medium">{selectedProduct.targetQuantityPerDay} {t('analytics.table.units')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('analytics.explanation.revenueLabel')}</span>
                <span className="font-medium">{formatCurrency(selectedProduct.dailyRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('analytics.explanation.profitLabel')}</span>
                <span className={`font-medium ${isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(selectedProduct.dailyProfit)}
                </span>
              </div>
            </div>
          </div>

          {/* Monthly Calculations */}
          <div>
            <h4 className="font-medium text-sm mb-2">{t('analytics.explanation.monthlyProjections')}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('analytics.explanation.daysPerMonth')}</span>
                <span className="font-medium">{daysPerMonth} {t('analytics.table.units')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('analytics.explanation.totalQuantity')}</span>
                <span className="font-medium">{selectedProduct.targetQuantityPerDay * daysPerMonth} {t('analytics.table.units')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('analytics.explanation.revenueLabel')}</span>
                <span className="font-medium">{formatCurrency(selectedProduct.monthlyRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('analytics.explanation.profitLabel')}</span>
                <span className={`font-medium ${isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(selectedProduct.monthlyProfit)}
                </span>
              </div>
            </div>
          </div>

          {/* Calculation Formula */}
          <div>
            <h4 className="font-medium text-sm mb-2">{t('analytics.explanation.calculationFormula')}</h4>
            <div className="space-y-1 text-xs text-muted-foreground bg-muted/50 p-3 rounded">
              <div>{t('analytics.explanation.formula.revenue')}</div>
              <div>{t('analytics.explanation.formula.profit')}</div>
              <div>{t('analytics.explanation.formula.margin')}</div>
            </div>
          </div>

          {/* Performance Insights */}
          <div>
            <h4 className="font-medium text-sm mb-2">{t('analytics.explanation.performanceInsights')}</h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              {profitMargin > 50 && (
                <div className="text-green-600 dark:text-green-400">{t('analytics.explanation.insights.excellent')}</div>
              )}
              {profitMargin > 30 && profitMargin <= 50 && (
                <div className="text-blue-600 dark:text-blue-400">{t('analytics.explanation.insights.good')}</div>
              )}
              {profitMargin > 10 && profitMargin <= 30 && (
                <div className="text-yellow-600 dark:text-yellow-400">{t('analytics.explanation.insights.moderate')}</div>
              )}
              {profitMargin <= 10 && profitMargin > 0 && (
                <div className="text-orange-600 dark:text-orange-400">{t('analytics.explanation.insights.low')}</div>
              )}
              {profitMargin <= 0 && (
                <div className="text-red-600 dark:text-red-400">{t('analytics.explanation.insights.negative')}</div>
              )}
              
              <div className="mt-2 pt-2 border-t border-muted">
                <div className="text-xs text-muted-foreground">
                  {t('analytics.explanation.compareHint')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </>
  )
}
