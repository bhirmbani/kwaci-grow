import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Edit, Trash2, Plus, Package, Calculator } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'
import { calculateCostPerCup } from '@/utils/cogsCalculations'
import { tempIngredientToFinancialItem } from './types'
import { TempProductForm } from './TempProductForm'
import type { TempProduct, TempIngredient } from './types'

interface TempProductListProps {
  products: TempProduct[]
  ingredients: TempIngredient[]
  onAdd: (product: Omit<TempProduct, 'id'>) => void
  onEdit: (id: string, product: Omit<TempProduct, 'id'>) => void
  onDelete: (id: string) => void
}

export function TempProductList({ products, ingredients, onAdd, onEdit, onDelete }: TempProductListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<TempProduct | undefined>()

  const handleAdd = (product: Omit<TempProduct, 'id'>) => {
    onAdd(product)
    setIsFormOpen(false)
  }

  const handleEdit = (product: Omit<TempProduct, 'id'>) => {
    if (editingProduct) {
      onEdit(editingProduct.id, product)
      setEditingProduct(undefined)
    }
  }

  const startEdit = (product: TempProduct) => {
    setEditingProduct(product)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingProduct(undefined)
  }

  const calculateProductCOGS = (product: TempProduct) => {
    return product.ingredients.reduce((total, pi) => {
      const ingredient = ingredients.find(ing => ing.id === pi.ingredientId)
      if (!ingredient) return total
      
      const financialItem = tempIngredientToFinancialItem(ingredient, pi.usagePerCup)
      return total + calculateCostPerCup(financialItem)
    }, 0)
  }

  const getProductIngredientCount = (product: TempProduct) => {
    return product.ingredients.length
  }

  const hasActiveIngredients = ingredients.some(ing => ing.isActive)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Temporary Products
            </CardTitle>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              Sandbox
            </Badge>
          </div>
          <Button 
            onClick={() => setIsFormOpen(true)} 
            size="sm"
            disabled={!hasActiveIngredients}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Create products with ingredient compositions for COGS experimentation. These won't be saved to the database until you choose to save them.
        </p>
        {!hasActiveIngredients && (
          <p className="text-sm text-amber-600">
            Create some active ingredients first before adding products.
          </p>
        )}
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No temporary products yet</p>
            {hasActiveIngredients ? (
              <Button onClick={() => setIsFormOpen(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Product
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Create some ingredients first to get started
              </p>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Ingredients</TableHead>
                <TableHead>COGS per Cup</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const cogsPerCup = calculateProductCOGS(product)
                const ingredientCount = getProductIngredientCount(product)

                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        {product.note && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {product.note}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {product.description || '-'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {ingredientCount} ingredient{ingredientCount !== 1 ? 's' : ''}
                        </Badge>
                        {ingredientCount > 0 && (
                          <Calculator className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-primary">
                          {formatCurrency(cogsPerCup)}
                        </span>
                        {ingredientCount === 0 && (
                          <Badge variant="secondary" className="text-xs">
                            No ingredients
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.isActive ? "default" : "secondary"}>
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}

        {/* Summary Section */}
        {products.length > 0 && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Playground Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Products</p>
                <p className="font-medium">{products.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Active Products</p>
                <p className="font-medium">{products.filter(p => p.isActive).length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Avg COGS per Cup</p>
                <p className="font-medium">
                  {formatCurrency(
                    products.length > 0 
                      ? products.reduce((sum, p) => sum + calculateProductCOGS(p), 0) / products.length 
                      : 0
                  )}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Ingredients Used</p>
                <p className="font-medium">
                  {new Set(products.flatMap(p => p.ingredients.map(i => i.ingredientId))).size}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <TempProductForm
        isOpen={isFormOpen || !!editingProduct}
        onClose={handleFormClose}
        onSave={editingProduct ? handleEdit : handleAdd}
        product={editingProduct}
        availableIngredients={ingredients}
      />
    </Card>
  )
}
