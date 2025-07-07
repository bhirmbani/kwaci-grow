import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Plus, Trash2, Edit, Package, Calculator } from 'lucide-react'
import { useProduct, useProducts } from '@/hooks/useProducts'
import { useIngredients } from '@/hooks/useIngredients'
import { formatCurrency } from '@/utils/formatters'
import { COGSBreakdown } from './COGSBreakdown'
import type { Ingredient } from '@/lib/db/schema'

interface ProductIngredientManagerProps {
  productId: string
  productName: string
  onClose: () => void
}

export function ProductIngredientManager({ productId, productName, onClose }: ProductIngredientManagerProps) {
  const { product, loading: productLoading } = useProduct(productId)
  const { ingredients, loading: ingredientsLoading } = useIngredients()
  const { addIngredientToProduct, updateIngredientUsage, removeIngredientFromProduct } = useProducts()
  
  const [isAddingIngredient, setIsAddingIngredient] = useState(false)
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>('')
  const [usagePerCup, setUsagePerCup] = useState<string>('')
  const [note, setNote] = useState('')
  const [editingIngredient, setEditingIngredient] = useState<string | null>(null)
  const [editUsage, setEditUsage] = useState<string>('')
  const [editNote, setEditNote] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  if (productLoading || ingredientsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Product not found</p>
        <Button onClick={onClose} className="mt-4">Close</Button>
      </div>
    )
  }

  // Get available ingredients (not already in product)
  const availableIngredients = ingredients.filter(ingredient =>
    !product.ingredients.some(pi => pi.ingredientId === ingredient.id)
  )

  const handleAddIngredient = async () => {
    if (!selectedIngredientId || !usagePerCup) {
      setMessage({ type: 'error', text: 'Please select an ingredient and enter usage amount' })
      return
    }

    const usage = parseFloat(usagePerCup)
    if (usage <= 0) {
      setMessage({ type: 'error', text: 'Usage per cup must be greater than 0' })
      return
    }

    const result = await addIngredientToProduct(productId, selectedIngredientId, usage, note)
    if (result.success) {
      setMessage({ type: 'success', text: 'Ingredient added successfully' })
      setSelectedIngredientId('')
      setUsagePerCup('')
      setNote('')
      setIsAddingIngredient(false)
      // Reload product data
      window.location.reload() // Simple reload for now
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to add ingredient' })
    }
  }

  const handleUpdateIngredient = async (ingredientId: string) => {
    const usage = parseFloat(editUsage)
    if (usage <= 0) {
      setMessage({ type: 'error', text: 'Usage per cup must be greater than 0' })
      return
    }

    const result = await updateIngredientUsage(productId, ingredientId, usage, editNote)
    if (result.success) {
      setMessage({ type: 'success', text: 'Ingredient updated successfully' })
      setEditingIngredient(null)
      setEditUsage('')
      setEditNote('')
      // Reload product data
      window.location.reload() // Simple reload for now
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update ingredient' })
    }
  }

  const handleRemoveIngredient = async (ingredientId: string) => {
    const result = await removeIngredientFromProduct(productId, ingredientId)
    if (result.success) {
      setMessage({ type: 'success', text: 'Ingredient removed successfully' })
      // Reload product data
      window.location.reload() // Simple reload for now
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to remove ingredient' })
    }
  }

  const startEdit = (productIngredient: any) => {
    setEditingIngredient(productIngredient.ingredientId)
    setEditUsage(productIngredient.usagePerCup.toString())
    setEditNote(productIngredient.note || '')
  }

  const cancelEdit = () => {
    setEditingIngredient(null)
    setEditUsage('')
    setEditNote('')
  }

  // Calculate total COGS
  const totalCOGS = product.ingredients.reduce((sum, pi) => {
    const ingredient = pi.ingredient
    const costPerCup = (ingredient.baseUnitCost / ingredient.baseUnitQuantity) * pi.usagePerCup
    return sum + costPerCup
  }, 0)

  return (
    <div className="space-y-6 mt-6">
      {/* Product Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {productName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="font-medium">{product.description || 'No description'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total COGS per Cup</p>
              <p className="font-medium text-lg">{formatCurrency(totalCOGS)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message */}
      {message && (
        <div className={`p-3 text-sm rounded-md ${
          message.type === 'success' 
            ? 'text-green-600 bg-green-50 border border-green-200' 
            : 'text-red-600 bg-red-50 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Add Ingredient */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Ingredients</CardTitle>
            <Button
              onClick={() => setIsAddingIngredient(!isAddingIngredient)}
              disabled={availableIngredients.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Ingredient
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isAddingIngredient && (
            <div className="space-y-4 p-4 border rounded-lg mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ingredient</Label>
                  <Select value={selectedIngredientId} onValueChange={setSelectedIngredientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ingredient" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableIngredients.map((ingredient) => (
                        <SelectItem key={ingredient.id} value={ingredient.id}>
                          {ingredient.name} ({ingredient.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Usage per Cup</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={usagePerCup}
                    onChange={(e) => setUsagePerCup(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <Label>Note (optional)</Label>
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Additional notes"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddIngredient}>Add</Button>
                <Button variant="outline" onClick={() => setIsAddingIngredient(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Ingredients Table */}
          {product.ingredients.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No ingredients yet</h3>
              <p className="text-muted-foreground">
                Add ingredients to define this product's composition
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingredient</TableHead>
                  <TableHead>Usage per Cup</TableHead>
                  <TableHead>Cost per Cup</TableHead>
                  <TableHead>Unit Cost</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {product.ingredients.map((pi) => {
                  const ingredient = pi.ingredient
                  const costPerCup = (ingredient.baseUnitCost / ingredient.baseUnitQuantity) * pi.usagePerCup
                  const unitCost = ingredient.baseUnitCost / ingredient.baseUnitQuantity
                  const isEditing = editingIngredient === pi.ingredientId

                  return (
                    <TableRow key={pi.id}>
                      <TableCell className="font-medium">
                        {ingredient.name}
                        <Badge variant="secondary" className="ml-2">
                          {ingredient.unit}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editUsage}
                            onChange={(e) => setEditUsage(e.target.value)}
                            className="w-24"
                          />
                        ) : (
                          `${pi.usagePerCup} ${ingredient.unit}`
                        )}
                      </TableCell>
                      <TableCell>{formatCurrency(costPerCup)}</TableCell>
                      <TableCell>{formatCurrency(unitCost)}</TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            value={editNote}
                            onChange={(e) => setEditNote(e.target.value)}
                            placeholder="Note"
                            className="w-32"
                          />
                        ) : (
                          pi.note || '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleUpdateIngredient(pi.ingredientId)}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEdit}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEdit(pi)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Ingredient</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Remove "{ingredient.name}" from this product?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleRemoveIngredient(pi.ingredientId)}
                                    >
                                      Remove
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* COGS Breakdown */}
      <COGSBreakdown
        productId={productId}
        productName={productName}
        showExplanation={true}
      />
    </div>
  )
}
