import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle, Database, Package, Beaker } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'
import { calculateCostPerCup } from '@/utils/cogsCalculations'
import { tempIngredientToFinancialItem } from './types'
import { IngredientService } from '@/lib/services/ingredientService'
import { ProductService } from '@/lib/services/productService'
import type { TempIngredient, TempProduct } from './types'

interface SaveToDatabaseDialogProps {
  isOpen: boolean
  onClose: () => void
  ingredients: TempIngredient[]
  products: TempProduct[]
  onSaveComplete: () => void
}

export function SaveToDatabaseDialog({ 
  isOpen, 
  onClose, 
  ingredients, 
  products, 
  onSaveComplete 
}: SaveToDatabaseDialogProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [saveResult, setSaveResult] = useState<{
    success: boolean
    message: string
    details?: string
  } | null>(null)

  const activeIngredients = ingredients.filter(ing => ing.isActive)
  const activeProducts = products.filter(prod => prod.isActive)

  const calculateProductCOGS = (product: TempProduct) => {
    return product.ingredients.reduce((total, pi) => {
      const ingredient = ingredients.find(ing => ing.id === pi.ingredientId)
      if (!ingredient) return total
      
      const financialItem = tempIngredientToFinancialItem(ingredient, pi.usagePerCup)
      return total + calculateCostPerCup(financialItem)
    }, 0)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveResult(null)

    try {
      const savedIngredients: { [tempId: string]: string } = {}
      
      // Save ingredients first
      for (const ingredient of activeIngredients) {
        const savedIngredient = await IngredientService.create({
          name: ingredient.name,
          baseUnitCost: ingredient.baseUnitCost,
          baseUnitQuantity: ingredient.baseUnitQuantity,
          unit: ingredient.unit,
          supplierInfo: ingredient.supplierInfo || '',
          category: ingredient.category || '',
          note: ingredient.note
        })

        savedIngredients[ingredient.id] = savedIngredient.id
      }

      // Save products with ingredient relationships
      for (const product of activeProducts) {
        // Create the product first
        const savedProduct = await ProductService.create({
          name: product.name,
          description: product.description,
          note: product.note
        })

        // Add ingredients to the product
        for (const productIngredient of product.ingredients) {
          const realIngredientId = savedIngredients[productIngredient.ingredientId]
          if (realIngredientId) {
            await ProductService.addIngredient(
              savedProduct.id,
              realIngredientId,
              productIngredient.usagePerCup,
              productIngredient.note
            )
          }
        }
      }

      setSaveResult({
        success: true,
        message: 'Successfully saved to database!',
        details: `Saved ${activeIngredients.length} ingredients and ${activeProducts.length} products.`
      })

      // Auto-close after success and clear data
      setTimeout(() => {
        onSaveComplete()
        onClose()
      }, 2000)

    } catch (error) {
      setSaveResult({
        success: false,
        message: 'Failed to save to database',
        details: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    if (!isSaving) {
      setSaveResult(null)
      onClose()
    }
  }

  const hasDataToSave = activeIngredients.length > 0 || activeProducts.length > 0

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Save to Database
          </DialogTitle>
          <DialogDescription>
            This will permanently save your temporary ingredients and products to the database. 
            Only active items will be saved.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {saveResult && (
            <Alert className={saveResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <div className="flex items-center gap-2">
                {saveResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={saveResult.success ? "text-green-800" : "text-red-800"}>
                  <div>
                    <p className="font-medium">{saveResult.message}</p>
                    {saveResult.details && (
                      <p className="text-sm mt-1">{saveResult.details}</p>
                    )}
                  </div>
                </AlertDescription>
              </div>
            </Alert>
          )}

          {!hasDataToSave ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No active data to save</p>
              <p className="text-sm text-muted-foreground mt-2">
                Create some active ingredients or products first.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Ingredients Summary */}
              {activeIngredients.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Beaker className="h-4 w-4" />
                    <h4 className="font-medium">Ingredients to Save ({activeIngredients.length})</h4>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {activeIngredients.map((ingredient) => (
                      <div key={ingredient.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div>
                          <p className="font-medium text-sm">{ingredient.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(ingredient.baseUnitCost)} per {ingredient.baseUnitQuantity} {ingredient.unit}
                          </p>
                        </div>
                        {ingredient.category && (
                          <Badge variant="outline" className="text-xs">
                            {ingredient.category}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Products Summary */}
              {activeProducts.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <h4 className="font-medium">Products to Save ({activeProducts.length})</h4>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {activeProducts.map((product) => {
                      const cogsPerCup = calculateProductCOGS(product)
                      return (
                        <div key={product.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <div>
                            <p className="font-medium text-sm">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {product.ingredients.length} ingredients • COGS: {formatCurrency(cogsPerCup)}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {product.ingredients.length} ingredients
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Summary Stats */}
              <div className="p-4 bg-primary/5 rounded-lg border">
                <h4 className="font-medium mb-2">Save Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Ingredients</p>
                    <p className="font-medium">{activeIngredients.length}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Products</p>
                    <p className="font-medium">{activeProducts.length}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !hasDataToSave || saveResult?.success}
          >
            {isSaving ? 'Saving...' : 'Save to Database'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
