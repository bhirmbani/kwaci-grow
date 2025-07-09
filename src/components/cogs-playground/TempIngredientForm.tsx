import { useState, useEffect } from 'react'
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
            {isEditing ? 'Edit Temporary Ingredient' : 'Add Temporary Ingredient'}
          </SheetTitle>
          <SheetDescription>
            Create ingredients for COGS experimentation. This data is temporary and won't be saved to the database until you choose to save it.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="name">Ingredient Name *</Label>
            <Input
              id="name"
              {...register('name', {
                required: 'Ingredient name is required',
                validate: (value) => value.trim() !== '' || 'Ingredient name is required'
              })}
              placeholder="Enter ingredient name"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="baseUnitCost">Base Unit Cost *</Label>
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
                Cost for the base quantity
              </p>
              {errors.baseUnitCost && (
                <p className="text-sm text-red-600">{errors.baseUnitCost.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="baseUnitQuantity">Base Unit Quantity *</Label>
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
                Quantity in the base unit
              </p>
              {errors.baseUnitQuantity && (
                <p className="text-sm text-red-600">{errors.baseUnitQuantity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Select value={watch('unit')} onValueChange={(value) => setValue('unit', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
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
                Unit of measurement
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={watch('category')} onValueChange={(value) => setValue('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__NONE__">No Category</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplierInfo">Supplier Information</Label>
            <Textarea
              id="supplierInfo"
              {...register('supplierInfo')}
              placeholder="Enter supplier details"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Notes</Label>
            <Textarea
              id="note"
              {...register('note')}
              placeholder="Additional notes about this ingredient"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={watch('isActive')}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
            <Label htmlFor="isActive">Active ingredient</Label>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? (isEditing ? 'Updating...' : 'Adding...')
                : (isEditing ? 'Update Ingredient' : 'Add Ingredient')
              }
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
