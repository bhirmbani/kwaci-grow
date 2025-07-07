import { useState, useMemo } from "react"
import { ChevronDown, ChevronRight, Package, Target } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

import { ProductTargetRow } from "./ProductTargetRow"
import { formatCurrency } from "@/utils/formatters"
import type { ProductTargetForDate } from "@/lib/services/dailyProductSalesTargetService"

interface MenuTargetSectionProps {
  menuId: string
  menuName: string
  menuDescription?: string
  products: ProductTargetForDate[]
  onTargetUpdate: (
    menuId: string,
    productId: string,
    targetQuantity: number,
    note: string
  ) => Promise<void>
  isUpdating?: boolean
}

export function MenuTargetSection({
  menuId,
  menuName,
  menuDescription,
  products,
  onTargetUpdate,
  isUpdating = false
}: MenuTargetSectionProps) {
  const [isOpen, setIsOpen] = useState(true)

  // Calculate menu totals
  const menuStats = useMemo(() => {
    const totalTargets = products.reduce((sum, product) => sum + product.targetQuantity, 0)
    const totalRevenue = products.reduce((sum, product) => {
      return sum + (product.targetQuantity * product.menuProduct.price)
    }, 0)
    const activeTargets = products.filter(product => product.targetQuantity > 0).length

    return {
      totalTargets,
      totalRevenue,
      activeTargets,
      totalProducts: products.length
    }
  }, [products])

  const handleTargetUpdate = async (
    productId: string,
    targetQuantity: number,
    note: string
  ) => {
    await onTargetUpdate(menuId, productId, targetQuantity, note)
  }

  return (
    <Card className="w-full">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" className="p-0 h-auto">
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Package className="h-5 w-5" />
                    {menuName}
                  </CardTitle>
                  {menuDescription && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {menuDescription}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {menuStats.activeTargets}/{menuStats.totalProducts} products
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {menuStats.totalTargets} items
                </Badge>
                <Badge variant="default" className="text-xs">
                  {formatCurrency(menuStats.totalRevenue)}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            {products.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">No Products</h3>
                <p className="text-muted-foreground">
                  This menu doesn't have any products assigned yet.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Header Row */}
                <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b">
                  <div className="col-span-4">Product</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-2 text-center">Target Qty</div>
                  <div className="col-span-2 text-center">Est. Revenue</div>
                  <div className="col-span-2 text-center">Actions</div>
                </div>

                {/* Product Rows */}
                {products.map((product) => (
                  <ProductTargetRow
                    key={`${product.menuId}-${product.productId}`}
                    product={product}
                    onUpdate={handleTargetUpdate}
                    isUpdating={isUpdating}
                  />
                ))}

                {/* Summary Row */}
                <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/30 rounded-lg border-t mt-4">
                  <div className="col-span-4 font-medium">
                    Menu Total
                  </div>
                  <div className="col-span-2 text-center text-muted-foreground">
                    —
                  </div>
                  <div className="col-span-2 text-center font-medium">
                    {menuStats.totalTargets}
                  </div>
                  <div className="col-span-2 text-center font-medium">
                    {formatCurrency(menuStats.totalRevenue)}
                  </div>
                  <div className="col-span-2 text-center text-muted-foreground">
                    {menuStats.activeTargets} active
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
