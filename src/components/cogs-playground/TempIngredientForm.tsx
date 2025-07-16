import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { UNIT_OPTIONS } from '@/utils/cogsCalculations'
import { useIngredientCategories } from '@/hooks/useIngredients'
import type { TempIngredient } from './types'

interface FormData {
  name: string
  baseUnitCost: string
  baseUnitQuantity: string
  unit: string
  supplierInfo: string
  category: string
  note: string
  isActive: boolean
}

interface TempIngredientFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (ingredient: Omit<TempIngredient, 'id'>) => void
  ingredient?: TempIngredient
}

export function TempIngredientForm({ isOpen, onClose, onSave, ingredient }: TempIngredientFormProps) {
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
      baseUnitCost: '',
      baseUnitQuantity: '',
      unit: '__NONE__',
      supplierInfo: '',
      category: '__NONE__',
      note: '',
      isActive: true
    }
  })

  const { categories } = useIngredientCategories()
  const isEditing = !!ingredient

  // Initialize form data when editing
  useEffect(() => {
    if (ingredient) {
      reset({
        name: ingredient.name,
        baseUnitCost: ingredient.baseUnitCost.toString(),
        baseUnitQuantity: ingredient.baseUnitQuantity.toString(),
        unit: ingredient.unit,
        supplierInfo: ingredient.supplierInfo || '',
        category: ingredient.category || '__NONE__',
        note: ingredient.note,
        isActive: ingredient.isActive
      })
    } else {
      reset({
        name: '',
        baseUnitCost: '',
        baseUnitQuantity: '',
        unit: '__NONE__',
        supplierInfo: '',
        category: '__NONE__',
        note: '',
        isActive: true
      })
    }
  }, [ingredient, reset])

  const onSubmit = async (data: FormData) => {
    try {
      const ingredientData: Omit<TempIngredient, 'id'> = {
        name: data.name.trim(),
        baseUnitCost: parseFloat(data.baseUnitCost),
        baseUnitQuantity: parseFloat(data.baseUnitQuantity),
        unit: data.unit === '__NONE__' ? 'ml' : data.unit,
        supplierInfo: data.supplierInfo.trim(),
        category: data.category === '__NONE__' ? undefined : data.category,
        note: data.note.trim(),
        isActive: data.isActive
      }

      onSave(ingredientData)
      onClose()
    } catch (error) {
      console.error('Error saving temporary ingredient:', error)
    }
  }

  const handleCancel = () => {
    reset()
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:w-[600px] h-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? t('cogs.tempIngredientForm.editTitle') : t('cogs.tempIngredientForm.addTitle')}
          </SheetTitle>
          <SheetDescription>
            {t('cogs.tempIngredientForm.description')}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="name">{t('cogs.tempIngredientForm.fields.name')}</Label>
            <Input
              id="name"
              {...register('name', {
                required: 'Ingredient name is required',
                validate: (value) => value.trim() !== '' || 'Ingredient name is required'
              })}
              placeholder={t('cogs.tempIngredientForm.fields.name')}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="baseUnitCost">{t('cogs.tempIngredientForm.fields.baseUnitCost')}</Label>
              <Input
                id="baseUnitCost"
                type="number"
                step="0.01"
                min="0"
                {...register('baseUnitCost', {
                  required: 'Base unit cost is required',
                  min: { value: 0, message: 'Base unit cost must be positive' },
                  validate: (value) => !isNaN(parseFloat(value)) || 'Base unit cost must be a valid number'
                })}
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground">
                {t('cogs.tempIngredientForm.fields.costBaseHelp')}
              </p>
              {errors.baseUnitCost && (
                <p className="text-sm text-red-600">{errors.baseUnitCost.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="baseUnitQuantity">{t('cogs.tempIngredientForm.fields.baseUnitQuantity')}</Label>
              <Input
                id="baseUnitQuantity"
                type="number"
                step="0.01"
                min="0.01"
                {...register('baseUnitQuantity', {
                  required: 'Base unit quantity is required',
                  min: { value: 0.01, message: 'Base unit quantity must be positive' },
                  validate: (value) => !isNaN(parseFloat(value)) || 'Base unit quantity must be a valid number'
                })}
                placeholder="1.00"
              />
              <p className="text-xs text-muted-foreground">
                {t('cogs.tempIngredientForm.fields.quantityHelp')}
              </p>
              {errors.baseUnitQuantity && (
                <p className="text-sm text-red-600">{errors.baseUnitQuantity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">{t('cogs.tempIngredientForm.fields.unit')}</Label>
              <Select value={watch('unit')} onValueChange={(value) => setValue('unit', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('cogs.tempIngredientForm.fields.selectUnit')} />
                </SelectTrigger>
                <SelectContent>
                  {UNIT_OPTIONS.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t('cogs.tempIngredientForm.fields.unitHelp')}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">{t('cogs.tempIngredientForm.fields.category')}</Label>
            <Select value={watch('category')} onValueChange={(value) => setValue('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder={t('cogs.tempIngredientForm.fields.selectCategory')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__NONE__">{t('cogs.tempIngredientForm.fields.noCategory')}</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplierInfo">{t('cogs.tempIngredientForm.fields.supplierInfo')}</Label>
            <Textarea
              id="supplierInfo"
              {...register('supplierInfo')}
              placeholder={t('cogs.tempIngredientForm.fields.supplierPlaceholder')}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">{t('cogs.tempIngredientForm.fields.note')}</Label>
            <Textarea
              id="note"
              {...register('note')}
              placeholder={t('cogs.tempIngredientForm.fields.notePlaceholder')}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={watch('isActive')}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
            <Label htmlFor="isActive">{t('cogs.tempIngredientForm.fields.isActive')}</Label>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? (isEditing ? t('cogs.tempIngredientForm.buttons.updating') : t('cogs.tempIngredientForm.buttons.adding'))
                : (isEditing ? t('cogs.tempIngredientForm.buttons.update') : t('cogs.tempIngredientForm.buttons.add'))
              }
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              {t('cogs.tempIngredientForm.buttons.cancel')}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
