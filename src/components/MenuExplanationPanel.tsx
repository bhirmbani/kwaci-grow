import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/utils/formatters"

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
  if (!selectedProduct) {
    return (
      <>
        <CardHeader>
          <CardTitle className="text-lg">Menu Analytics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Click on a product row to see detailed calculations and analysis.
          </div>
          
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm mb-2">Understanding Menu-Based Analytics</h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div><strong>Menu Structure:</strong> Analytics organized by menu with products underneath</div>
                <div><strong>Menu Price:</strong> Actual price set for this product in this specific menu</div>
                <div><strong>COGS/Unit:</strong> Cost of Goods Sold per unit (ingredients cost)</div>
                <div><strong>Revenue:</strong> Total income from sales (Menu Price × Quantity)</div>
                <div><strong>Profit:</strong> Revenue minus COGS (excludes fixed costs)</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-sm mb-2">Menu-Centric Benefits</h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div>• See how the same product performs in different menus</div>
                <div>• Compare pricing strategies across menus</div>
                <div>• Identify which menus are most profitable</div>
                <div>• Optimize product placement and pricing</div>
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
          in {selectedProduct.menuName}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Menu Context */}
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-sm mb-2">Menu Context</h4>
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
            <h4 className="font-medium text-sm mb-2">Unit Economics</h4>
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
            <h4 className="font-medium text-sm mb-2">Daily Projections</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target Quantity:</span>
                <span className="font-medium">{selectedProduct.targetQuantityPerDay} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Revenue:</span>
                <span className="font-medium">{formatCurrency(selectedProduct.dailyRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Profit:</span>
                <span className={`font-medium ${isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(selectedProduct.dailyProfit)}
                </span>
              </div>
            </div>
          </div>

          {/* Monthly Calculations */}
          <div>
            <h4 className="font-medium text-sm mb-2">Monthly Projections</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Days per Month:</span>
                <span className="font-medium">{daysPerMonth} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Quantity:</span>
                <span className="font-medium">{selectedProduct.targetQuantityPerDay * daysPerMonth} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Revenue:</span>
                <span className="font-medium">{formatCurrency(selectedProduct.monthlyRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Profit:</span>
                <span className={`font-medium ${isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(selectedProduct.monthlyProfit)}
                </span>
              </div>
            </div>
          </div>

          {/* Calculation Formula */}
          <div>
            <h4 className="font-medium text-sm mb-2">Calculation Formula</h4>
            <div className="space-y-1 text-xs text-muted-foreground bg-muted/50 p-3 rounded">
              <div>Revenue = Menu Price × Quantity × Days</div>
              <div>Profit = (Menu Price - COGS) × Quantity × Days</div>
              <div>Margin = (Profit ÷ Revenue) × 100%</div>
            </div>
          </div>

          {/* Performance Insights */}
          <div>
            <h4 className="font-medium text-sm mb-2">Performance Insights</h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              {profitMargin > 50 && (
                <div className="text-green-600 dark:text-green-400">✓ Excellent profit margin in this menu</div>
              )}
              {profitMargin > 30 && profitMargin <= 50 && (
                <div className="text-blue-600 dark:text-blue-400">✓ Good profit margin in this menu</div>
              )}
              {profitMargin > 10 && profitMargin <= 30 && (
                <div className="text-yellow-600 dark:text-yellow-400">⚠ Moderate profit margin in this menu</div>
              )}
              {profitMargin <= 10 && profitMargin > 0 && (
                <div className="text-orange-600 dark:text-orange-400">⚠ Low profit margin in this menu</div>
              )}
              {profitMargin <= 0 && (
                <div className="text-red-600 dark:text-red-400">⚠ Negative margin - review pricing for this menu</div>
              )}
              
              <div className="mt-2 pt-2 border-t border-muted">
                <div className="text-xs text-muted-foreground">
                  💡 Compare this product's performance across different menus to optimize pricing strategy
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </>
  )
}
