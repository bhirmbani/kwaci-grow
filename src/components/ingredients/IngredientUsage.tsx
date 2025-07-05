import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Package, Calculator, ExternalLink } from 'lucide-react'
import { useIngredient } from '@/hooks/useIngredients'
import { formatCurrency } from '@/utils/formatters'

interface IngredientUsageProps {
  ingredientId: string
  ingredientName: string
  onClose: () => void
}

export function IngredientUsage({ ingredientId, ingredientName, onClose }: IngredientUsageProps) {
  const { ingredient, loading } = useIngredient(ingredientId)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading ingredient details...</p>
        </div>
      </div>
    )
  }

  if (!ingredient) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Ingredient not found</p>
        <Button onClick={onClose} className="mt-4">Close</Button>
      </div>
    )
  }

  const unitCost = ingredient.baseUnitQuantity > 0 
    ? ingredient.baseUnitCost / ingredient.baseUnitQuantity 
    : 0

  return (
    <div className="space-y-6 mt-6">
      {/* Ingredient Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {ingredientName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="font-medium">{ingredient.category || 'No category'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unit</p>
              <Badge variant="secondary">{ingredient.unit}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Base Unit Cost</p>
              <p className="font-medium">{formatCurrency(ingredient.baseUnitCost)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Base Unit Quantity</p>
              <p className="font-medium">{ingredient.baseUnitQuantity} {ingredient.unit}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cost per Unit</p>
              <p className="font-medium text-lg">{formatCurrency(unitCost)} per {ingredient.unit}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Supplier</p>
              <p className="font-medium">{ingredient.supplierInfo || 'No supplier info'}</p>
            </div>
          </div>
          {ingredient.note && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Notes</p>
              <p className="font-medium">{ingredient.note}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage in Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Product Usage ({ingredient.usageInProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ingredient.usageInProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Not used in any products</h3>
              <p className="text-muted-foreground">
                This ingredient is not currently used in any products
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Usage per Cup</TableHead>
                  <TableHead>Cost per Cup</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ingredient.usageInProducts.map((usage) => {
                  const product = usage.product
                  const costPerCup = unitCost * usage.usagePerCup

                  return (
                    <TableRow key={usage.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {product.name}
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {product.description}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {usage.usagePerCup} {ingredient.unit}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(costPerCup)}
                      </TableCell>
                      <TableCell>
                        {usage.note || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.isActive ? 'default' : 'secondary'}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Cost Analysis */}
      {ingredient.usageInProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Cost Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Products Using</p>
                <p className="text-2xl font-bold">{ingredient.usageInProducts.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Usage per Cup</p>
                <p className="text-2xl font-bold">
                  {ingredient.usageInProducts.length > 0 
                    ? (ingredient.usageInProducts.reduce((sum, usage) => sum + usage.usagePerCup, 0) / ingredient.usageInProducts.length).toFixed(2)
                    : '0'
                  } {ingredient.unit}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Cost per Cup</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    ingredient.usageInProducts.length > 0 
                      ? ingredient.usageInProducts.reduce((sum, usage) => sum + (unitCost * usage.usagePerCup), 0) / ingredient.usageInProducts.length
                      : 0
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
