import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Package } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'
import { calculateCostPerCup } from '@/utils/cogsCalculations'
import { tempIngredientToFinancialItem } from './types'
import type { TempProduct, TempIngredient, TempProductIngredient } from './types'

interface FormData {
  name: string
  description: string
  note: string
  isActive: boolean
}

interface TempProductFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (product: Omit<TempProduct, 'id'>) => void
  product?: TempProduct
  availableIngredients: TempIngredient[]
}

export function TempProductForm({ isOpen, onClose, onSave, product, availableIngredients }: TempProductFormProps) {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      description: '',
      note: '',
      isActive: true
    }
  })

  const [productIngredients, setProductIngredients] = useState<TempProductIngredient[]>([])
  const [selectedIngredientId, setSelectedIngredientId] = useState('')
  const [usagePerCup, setUsagePerCup] = useState('')
  const [ingredientNote, setIngredientNote] = useState('')
  const [isAddingIngredient, setIsAddingIngredient] = useState(false)

  const isEditing = !!product

  // Initialize form data when editing
  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description,
        note: product.note,
        isActive: product.isActive
      })
      setProductIngredients(product.ingredients)
    } else {
      reset({
        name: '',
        description: '',
        note: '',
        isActive: true
      })
      setProductIngredients([])
    }
  }, [product, reset])

  const handleAddIngredient = () => {
    if (!selectedIngredientId || !usagePerCup) return

    const usage = parseFloat(usagePerCup)
    if (usage <= 0) return

    // Check if ingredient already exists
    const existingIndex = productIngredients.findIndex(pi => pi.ingredientId === selectedIngredientId)
    
    if (existingIndex >= 0) {
      // Update existing ingredient
      const updated = [...productIngredients]
      updated[existingIndex] = {
        ingredientId: selectedIngredientId,
        usagePerCup: usage,
        note: ingredientNote
      }
      setProductIngredients(updated)
    } else {
      // Add new ingredient
      setProductIngredients([...productIngredients, {
        ingredientId: selectedIngredientId,
        usagePerCup: usage,
        note: ingredientNote
      }])
    }

    // Reset form
    setSelectedIngredientId('')
    setUsagePerCup('')
    setIngredientNote('')
    setIsAddingIngredient(false)
  }

  const handleRemoveIngredient = (ingredientId: string) => {
    setProductIngredients(productIngredients.filter(pi => pi.ingredientId !== ingredientId))
  }

  const calculateTotalCOGS = () => {
    return productIngredients.reduce((total, pi) => {
      const ingredient = availableIngredients.find(ing => ing.id === pi.ingredientId)
      if (!ingredient) return total
      
      const financialItem = tempIngredientToFinancialItem(ingredient, pi.usagePerCup)
      return total + calculateCostPerCup(financialItem)
    }, 0)
  }

  const getAvailableIngredients = () => {
    return availableIngredients.filter(ing => ing.isActive)
  }

  const onSubmit = async (data: FormData) => {
    try {
      const productData: Omit<TempProduct, 'id'> = {
        name: data.name.trim(),
        description: data.description.trim(),
        note: data.note.trim(),
        isActive: data.isActive,
        ingredients: productIngredients
      }

      onSave(productData)
      onClose()
    } catch (error) {
      console.error('Error saving temporary product:', error)
    }
  }

  const handleCancel = () => {
    reset()
    setProductIngredients([])
    setSelectedIngredientId('')
    setUsagePerCup('')
    setIngredientNote('')
    setIsAddingIngredient(false)
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[800px] sm:w-[800px] h-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? t('cogs.tempProductForm.editTitle') : t('cogs.tempProductForm.addTitle')}
          </SheetTitle>
          <SheetDescription>
            {t('cogs.tempProductForm.description')}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="name">{t('cogs.tempProductForm.fields.name')}</Label>
            <Input
              id="name"
              {...register('name', {
                required: 'Product name is required',
                validate: (value) => value.trim() !== '' || 'Product name is required'
              })}
              placeholder={t('cogs.tempProductForm.fields.name')}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('cogs.tempProductForm.fields.description')}</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder={t('cogs.tempProductForm.fields.description')}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">{t('cogs.tempProductForm.fields.note')}</Label>
            <Textarea
              id="note"
              {...register('note')}
              placeholder={t('cogs.tempProductForm.fields.additionalNotes')}
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={watch('isActive')}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
            <Label htmlFor="isActive">{t('cogs.tempProductForm.fields.isActive')}</Label>
          </div>

          {/* Ingredients Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{t('cogs.tempProductForm.table.ingredient')}</CardTitle>
                <Button
                  type="button"
                  onClick={() => setIsAddingIngredient(!isAddingIngredient)}
                  disabled={getAvailableIngredients().length === 0}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('cogs.tempProductForm.buttons.addIngredient')}
                </Button>
              </div>
              {getAvailableIngredients().length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {t('cogs.tempProductForm.noIngredientsWarning')}
                </p>
              )}
            </CardHeader>
            <CardContent>
              {isAddingIngredient && getAvailableIngredients().length > 0 && (
                <div className="space-y-4 p-4 border rounded-lg mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t('cogs.tempProductForm.fields.ingredient')}</Label>
                      <Select value={selectedIngredientId} onValueChange={setSelectedIngredientId}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('cogs.tempProductForm.fields.selectIngredient')} />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableIngredients().map((ingredient) => (
                            <SelectItem key={ingredient.id} value={ingredient.id}>
                              {ingredient.name} ({ingredient.unit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>{t('cogs.tempProductForm.fields.usagePerCup')}</Label>
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
                    <Label>{t('cogs.tempProductForm.fields.noteOptional')}</Label>
                    <Input
                      value={ingredientNote}
                      onChange={(e) => setIngredientNote(e.target.value)}
                      placeholder={t('cogs.tempProductForm.fields.additionalNotes')}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" onClick={handleAddIngredient}>{t('cogs.tempProductForm.buttons.addIngredient')}</Button>
                    <Button type="button" variant="outline" onClick={() => setIsAddingIngredient(false)}>
                      {t('cogs.tempProductForm.buttons.cancel')}
                    </Button>
                  </div>
                </div>
              )}

              {productIngredients.length > 0 ? (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('cogs.tempProductForm.table.ingredient')}</TableHead>
                        <TableHead>{t('cogs.tempProductForm.table.usagePerCup')}</TableHead>
                        <TableHead>{t('cogs.tempProductForm.table.costPerCup')}</TableHead>
                        <TableHead>{t('cogs.tempProductForm.table.note')}</TableHead>
                        <TableHead className="w-[80px]">{t('cogs.tempProductForm.table.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productIngredients.map((pi) => {
                        const ingredient = availableIngredients.find(ing => ing.id === pi.ingredientId)
                        if (!ingredient) return null

                        const financialItem = tempIngredientToFinancialItem(ingredient, pi.usagePerCup)
                        const costPerCup = calculateCostPerCup(financialItem)

                        return (
                          <TableRow key={pi.ingredientId}>
                            <TableCell className="font-medium">
                              {ingredient.name}
                              <Badge variant="secondary" className="ml-2">
                                {ingredient.unit}
                              </Badge>
                            </TableCell>
                            <TableCell>{pi.usagePerCup} {ingredient.unit}</TableCell>
                            <TableCell>{formatCurrency(costPerCup)}</TableCell>
                            <TableCell>{pi.note || '-'}</TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveIngredient(pi.ingredientId)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>

                  {/* Total COGS Display */}
                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total COGS per Cup</p>
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(calculateTotalCOGS())}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {productIngredients.length} ingredient{productIngredients.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  {t('cogs.tempProductForm.emptyIngredients')}
                </p>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? (isEditing ? t('cogs.tempProductForm.buttons.updating') : t('cogs.tempProductForm.buttons.adding'))
                : (isEditing ? t('cogs.tempProductForm.buttons.update') : t('cogs.tempProductForm.buttons.add'))
              }
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              {t('cogs.tempProductForm.buttons.cancel')}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
