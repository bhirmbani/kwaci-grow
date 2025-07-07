import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useIngredients } from '@/hooks/useIngredients'
import { CategoryCombobox } from './CategoryCombobox'
import { UNIT_OPTIONS } from '@/utils/cogsCalculations'
import { formatCurrency } from '@/utils/formatters'
import type { Ingredient } from '@/lib/db/schema'

interface IngredientFormProps {
  ingredient?: Ingredient
  onSuccess: () => void
  onCancel: () => void
}

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

export function IngredientForm({ ingredient, onSuccess, onCancel }: IngredientFormProps) {
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

  const { createIngredient, updateIngredient } = useIngredients()
  const isEditing = !!ingredient

  // Initialize form data
  useEffect(() => {
    if (ingredient) {
      reset({
        name: ingredient.name,
        baseUnitCost: ingredient.baseUnitCost.toString(),
        baseUnitQuantity: ingredient.baseUnitQuantity.toString(),
        unit: ingredient.unit && ingredient.unit.trim() !== '' ? ingredient.unit : '__NONE__',
        supplierInfo: ingredient.supplierInfo || '',
        category: ingredient.category && ingredient.category.trim() !== '' ? ingredient.category : '__NONE__',
        note: ingredient.note || '',
        isActive: ingredient.isActive
      })
    } else {
      // Reset form when no ingredient (creating new)
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

  const onSubmit = async (formData: FormData) => {
    try {
      const baseUnitCost = parseFloat(formData.baseUnitCost)
      const baseUnitQuantity = parseFloat(formData.baseUnitQuantity)

      const ingredientData = {
        name: formData.name.trim(),
        baseUnitCost,
        baseUnitQuantity,
        unit: formData.unit === '__NONE__' ? '' : formData.unit,
        supplierInfo: formData.supplierInfo.trim(),
        category: formData.category === '__NONE__' ? '' : formData.category.trim(),
        note: formData.note.trim(),
        isActive: formData.isActive
      }

      let result
      if (isEditing) {
        result = await updateIngredient(ingredient.id, ingredientData)
      } else {
        result = await createIngredient(ingredientData)
      }

      if (result.success) {
        onSuccess()
      } else {
        // Handle API errors - you might want to use setError from react-hook-form here
        console.error(result.error || 'Failed to save ingredient')
      }
    } catch (err) {
      console.error(err instanceof Error ? err.message : 'An unexpected error occurred')
    }
  }

  // Watch form values for unit cost preview and form state
  const watchedValues = watch(['baseUnitCost', 'baseUnitQuantity', 'category', 'unit', 'isActive'])
  const [watchedBaseUnitCost, watchedBaseUnitQuantity, watchedCategory, watchedUnit, watchedIsActive] = watchedValues

  const handleUnitChange = (value: string) => {
    setValue('unit', value)
  }

  const handleIsActiveChange = (checked: boolean) => {
    setValue('isActive', checked)
  }

  // Calculate unit cost for preview
  const { baseUnitCost, baseUnitQuantity, unitCost } = useMemo(() => {
    const baseUnitCost = parseFloat(watchedBaseUnitCost) || 0
    const baseUnitQuantity = parseFloat(watchedBaseUnitQuantity) || 1
    const unitCost = baseUnitQuantity > 0 ? baseUnitCost / baseUnitQuantity : 0

    return { baseUnitCost, baseUnitQuantity, unitCost }
  }, [watchedBaseUnitCost, watchedBaseUnitQuantity])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
      {(errors.name || errors.unit || errors.category || errors.baseUnitCost || errors.baseUnitQuantity) && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {errors.name?.message || errors.unit?.message || errors.category?.message ||
           errors.baseUnitCost?.message || errors.baseUnitQuantity?.message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
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

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <CategoryCombobox
            key={`category-${ingredient?.id || 'new'}`}
            value={watchedCategory === '__NONE__' ? '' : watchedCategory}
            onValueChange={(value) => setValue('category', value || '__NONE__')}
            placeholder="Select or create category..."
            disabled={isSubmitting}
          />
          {/* Hidden input for validation */}
          <input
            type="hidden"
            {...register('category', {
              required: 'Category is required',
              validate: (value) => (value && value.trim() !== '' && value !== '__NONE__') || 'Category is required'
            })}
          />
          {errors.category && (
            <p className="text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>
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
          <Select
            key={`unit-${ingredient?.id || 'new'}`}
            value={watchedUnit}
            onValueChange={handleUnitChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__NONE__">
                <span className="text-muted-foreground">No unit selected</span>
              </SelectItem>
              {UNIT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Hidden input for validation */}
          <input
            type="hidden"
            {...register('unit', {
              required: 'Unit is required',
              validate: (value) => value !== '__NONE__' || 'Unit is required'
            })}
          />
          {errors.unit && (
            <p className="text-sm text-red-600">{errors.unit.message}</p>
          )}
        </div>
      </div>

      {/* Unit Cost Preview */}
      {baseUnitCost > 0 && baseUnitQuantity > 0 && (
        <div className="p-3 bg-muted/30 rounded-lg">
          <p className="text-sm font-medium">Cost Preview:</p>
          <p className="text-lg font-bold text-primary">
            {formatCurrency(unitCost)} per {watchedUnit && watchedUnit !== '__NONE__' ? watchedUnit : 'unit'}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(baseUnitCost)} ÷ {baseUnitQuantity} = {formatCurrency(unitCost)}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="supplierInfo">Supplier Information</Label>
        <Input
          id="supplierInfo"
          {...register('supplierInfo')}
          placeholder="Supplier name, contact, etc."
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
          checked={watchedIsActive}
          onCheckedChange={handleIsActiveChange}
        />
        <Label htmlFor="isActive" className="text-sm font-medium">
          Active Status
        </Label>
        <span className="text-sm text-muted-foreground">
          {watchedIsActive ? 'Ingredient is active' : 'Ingredient is inactive'}
        </span>
        {/* Hidden input for form validation */}
        <input
          type="hidden"
          {...register('isActive')}
        />
      </div>

      <div className="flex items-center gap-3 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting || Object.keys(errors).length > 0}
        >
          {isSubmitting
            ? (isEditing ? 'Updating...' : 'Creating...')
            : (isEditing ? 'Update Ingredient' : 'Create Ingredient')
          }
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>

      {!isEditing && (
        <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <p className="font-medium mb-1">Example:</p>
          <ul className="space-y-1">
            <li>• Milk: Base cost 20,000 IDR for 1,000 ml = 20 IDR per ml</li>
            <li>• Coffee beans: Base cost 200,000 IDR for 1,000 g = 200 IDR per g</li>
            <li>• Cups: Base cost 850 IDR for 1 piece = 850 IDR per piece</li>
          </ul>
        </div>
      )}
    </form>
  )
}
