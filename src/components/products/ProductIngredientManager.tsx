import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
          <p className="text-muted-foreground">{t('products.ingredients.loadingDetails')}</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{t('products.ingredients.notFound')}</p>
        <Button onClick={onClose} className="mt-4">{t('common.close')}</Button>
      </div>
    )
  }

  // Get available ingredients (not already in product)
  const availableIngredients = ingredients.filter(ingredient =>
    !product.ingredients.some(pi => pi.ingredientId === ingredient.id)
  )

  const handleAddIngredient = async () => {
    if (!selectedIngredientId || !usagePerCup) {
      setMessage({ type: 'error', text: t('products.ingredients.messages.selectIngredient') })
      return
    }

    const usage = parseFloat(usagePerCup)
    if (usage <= 0) {
      setMessage({ type: 'error', text: t('products.ingredients.messages.invalidUsage') })
      return
    }

    const result = await addIngredientToProduct(productId, selectedIngredientId, usage, note)
    if (result.success) {
      setMessage({ type: 'success', text: t('products.ingredients.messages.addSuccess') })
      setSelectedIngredientId('')
      setUsagePerCup('')
      setNote('')
      setIsAddingIngredient(false)
      // Reload product data
      window.location.reload() // Simple reload for now
    } else {
      setMessage({ type: 'error', text: result.error || t('products.ingredients.messages.addFailure') })
    }
  }

  const handleUpdateIngredient = async (ingredientId: string) => {
    const usage = parseFloat(editUsage)
    if (usage <= 0) {
      setMessage({ type: 'error', text: t('products.ingredients.messages.invalidUsage') })
      return
    }

    const result = await updateIngredientUsage(productId, ingredientId, usage, editNote)
    if (result.success) {
      setMessage({ type: 'success', text: t('products.ingredients.messages.updateSuccess') })
      setEditingIngredient(null)
      setEditUsage('')
      setEditNote('')
      // Reload product data
      window.location.reload() // Simple reload for now
    } else {
      setMessage({ type: 'error', text: result.error || t('products.ingredients.messages.updateFailure') })
    }
  }

  const handleRemoveIngredient = async (ingredientId: string) => {
    const result = await removeIngredientFromProduct(productId, ingredientId)
    if (result.success) {
      setMessage({ type: 'success', text: t('products.ingredients.messages.removeSuccess') })
      // Reload product data
      window.location.reload() // Simple reload for now
    } else {
      setMessage({ type: 'error', text: result.error || t('products.ingredients.messages.removeFailure') })
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
    // Add null checks for ingredient and its properties
    if (!ingredient || !ingredient.baseUnitCost || !ingredient.baseUnitQuantity || ingredient.baseUnitQuantity === 0) {
      // Only warn if ingredient is completely missing, not just missing cost data
      if (!ingredient) {
        console.warn('Missing ingredient record for product ingredient:', pi)
      }
      return sum
    }
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
              <p className="text-sm text-muted-foreground">{t('products.ingredients.productInfo.description')}</p>
              <p className="font-medium">{product.description || t('products.ingredients.productInfo.noDescription')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('products.ingredients.productInfo.totalCogsPerCup')}</p>
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
            <CardTitle className="text-lg">{t('products.ingredients.title')}</CardTitle>
            <Button
              onClick={() => setIsAddingIngredient(!isAddingIngredient)}
              disabled={availableIngredients.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('products.ingredients.buttons.addIngredient')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isAddingIngredient && (
            <div className="space-y-4 p-4 border rounded-lg mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('products.ingredients.form.ingredient')}</Label>
                  <Select value={selectedIngredientId} onValueChange={setSelectedIngredientId}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('products.ingredients.form.selectIngredient')} />
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
                  <Label>{t('products.ingredients.form.usagePerCup')}</Label>
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
                <Label>{t('products.ingredients.form.noteOptional')}</Label>
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t('products.ingredients.form.additionalNotes')}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddIngredient}>{t('products.ingredients.buttons.add')}</Button>
                <Button variant="outline" onClick={() => setIsAddingIngredient(false)}>
                  {t('common.cancel')}
                </Button>
              </div>
            </div>
          )}

          {/* Ingredients Table */}
          {product.ingredients.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">{t('products.ingredients.noIngredients')}</h3>
              <p className="text-muted-foreground">
                {t('products.ingredients.noIngredientsDescription')}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('products.ingredients.table.ingredient')}</TableHead>
                  <TableHead>{t('products.ingredients.table.usagePerCup')}</TableHead>
                  <TableHead>{t('products.ingredients.table.costPerCup')}</TableHead>
                  <TableHead>{t('products.ingredients.table.unitCost')}</TableHead>
                  <TableHead>{t('products.ingredients.table.note')}</TableHead>
                  <TableHead>{t('products.ingredients.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {product.ingredients.map((pi) => {
                  const ingredient = pi.ingredient

                  // Add null checks for ingredient and its properties
                  if (!ingredient) {
                    console.warn('Missing ingredient data for product ingredient:', pi)
                    return (
                      <TableRow key={pi.id}>
                        <TableCell className="font-medium text-red-500">
                          {t('products.ingredients.missingIngredient', { id: pi.ingredientId })}
                        </TableCell>
                        <TableCell>{pi.usagePerCup}</TableCell>
                        <TableCell>N/A</TableCell>
                        <TableCell>N/A</TableCell>
                        <TableCell>{pi.note || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveIngredient(pi.ingredientId)}
                              className="text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  }

                  // Calculate costs with null checks
                  const hasValidCostData = ingredient.baseUnitCost && ingredient.baseUnitQuantity && ingredient.baseUnitQuantity > 0
                  const costPerCup = hasValidCostData
                    ? (ingredient.baseUnitCost / ingredient.baseUnitQuantity) * pi.usagePerCup
                    : 0
                  const unitCost = hasValidCostData
                    ? ingredient.baseUnitCost / ingredient.baseUnitQuantity
                    : 0
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
                          `${pi.usagePerCup} ${ingredient.unit || ''}`
                        )}
                      </TableCell>
                      <TableCell>
                        {hasValidCostData ? formatCurrency(costPerCup) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {hasValidCostData ? formatCurrency(unitCost) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            value={editNote}
                            onChange={(e) => setEditNote(e.target.value)}
                            placeholder={t('products.ingredients.form.notePlaceholder')}
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
                                {t('common.save')}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEdit}
                              >
                                {t('common.cancel')}
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
                                    <AlertDialogTitle>{t('products.ingredients.removeDialog.title')}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {t('products.ingredients.removeDialog.description', { name: ingredient.name })}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleRemoveIngredient(pi.ingredientId)}
                                    >
                                      {t('products.ingredients.removeDialog.remove')}
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
