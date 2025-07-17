import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useIngredients } from '@/hooks/useIngredients'
import { CategoryCombobox } from './CategoryCombobox'
import { UnitCombobox } from './UnitCombobox'
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
          <Label htmlFor="name">{t('ingredients.form.fields.name')}</Label>
          <Input
            id="name"
            {...register('name', {
              required: t('ingredients.form.validation.nameRequired'),
              validate: (value) => value.trim() !== '' || t('ingredients.form.validation.nameRequired')
            })}
            placeholder={t('ingredients.form.placeholders.name')}
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">{t('ingredients.form.fields.category')}</Label>
          <CategoryCombobox
            key={`category-${ingredient?.id || 'new'}`}
            value={watchedCategory === '__NONE__' ? '' : watchedCategory}
            onValueChange={(value) => setValue('category', value || '__NONE__')}
            placeholder={t('ingredients.form.placeholders.selectCategory')}
            disabled={isSubmitting}
          />
          {/* Hidden input for validation */}
          <input
            type="hidden"
            {...register('category', {
              required: t('ingredients.form.validation.categoryRequired'),
              validate: (value) => (value && value.trim() !== '' && value !== '__NONE__') || t('ingredients.form.validation.categoryRequired')
            })}
          />
          {errors.category && (
            <p className="text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="baseUnitCost">{t('ingredients.form.fields.baseUnitCost')}</Label>
          <Input
            id="baseUnitCost"
            type="number"
            step="0.01"
            min="0"
            {...register('baseUnitCost', {
              required: t('ingredients.form.validation.baseUnitCostRequired'),
              min: { value: 0, message: t('ingredients.form.validation.baseUnitCostPositive') },
              validate: (value) => !isNaN(parseFloat(value)) || t('ingredients.form.validation.baseUnitCostNumber')
            })}
            placeholder={t('ingredients.form.placeholders.baseUnitCost')}
          />
          <p className="text-xs text-muted-foreground">
            {t('ingredients.form.placeholders.costBaseHelp')}
          </p>
          {errors.baseUnitCost && (
            <p className="text-sm text-red-600">{errors.baseUnitCost.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="baseUnitQuantity">{t('ingredients.form.fields.baseUnitQuantity')}</Label>
          <Input
            id="baseUnitQuantity"
            type="number"
            step="0.01"
            min="0.01"
            {...register('baseUnitQuantity', {
              required: t('ingredients.form.validation.baseUnitQuantityRequired'),
              min: { value: 0.01, message: t('ingredients.form.validation.baseUnitQuantityPositive') },
              validate: (value) => !isNaN(parseFloat(value)) || t('ingredients.form.validation.baseUnitQuantityNumber')
            })}
            placeholder={t('ingredients.form.placeholders.baseUnitQuantity')}
          />
          <p className="text-xs text-muted-foreground">
            {t('ingredients.form.placeholders.quantityHelp')}
          </p>
          {errors.baseUnitQuantity && (
            <p className="text-sm text-red-600">{errors.baseUnitQuantity.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">{t('ingredients.form.fields.unit')}</Label>
          <UnitCombobox
            key={`unit-${ingredient?.id || 'new'}`}
            value={watchedUnit === '__NONE__' ? '' : watchedUnit}
            onValueChange={(value) => setValue('unit', value || '__NONE__')}
            placeholder={t('ingredients.form.placeholders.selectUnit')}
            disabled={isSubmitting}
          />
          {/* Hidden input for validation */}
          <input
            type="hidden"
            {...register('unit', {
              required: t('ingredients.form.validation.unitRequired'),
              validate: (value) => (value && value.trim() !== '' && value !== '__NONE__') || t('ingredients.form.validation.unitRequired')
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
          <p className="text-sm font-medium">{t('ingredients.form.costPreview')}</p>
          <p className="text-lg font-bold text-primary">
            {formatCurrency(unitCost)} per {watchedUnit && watchedUnit !== '__NONE__' ? watchedUnit : 'unit'}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(baseUnitCost)} ÷ {baseUnitQuantity} = {formatCurrency(unitCost)}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="supplierInfo">{t('ingredients.form.fields.supplierInfo')}</Label>
        <Input
          id="supplierInfo"
          {...register('supplierInfo')}
          placeholder={t('ingredients.form.placeholders.supplierInfo')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">{t('ingredients.form.fields.note')}</Label>
        <Textarea
          id="note"
          {...register('note')}
          placeholder={t('ingredients.form.placeholders.note')}
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
          {t('ingredients.form.fields.activeStatus')}
        </Label>
        <span className="text-sm text-muted-foreground">
          {watchedIsActive ? t('ingredients.form.activeIngredient') : t('ingredients.form.inactiveIngredient')}
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
            ? (isEditing ? t('ingredients.form.buttons.updating') : t('ingredients.form.buttons.creating'))
            : (isEditing ? t('ingredients.form.buttons.update') : t('ingredients.form.buttons.create'))
          }
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {t('common.cancel')}
        </Button>
      </div>

      {!isEditing && (
        <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <p className="font-medium mb-1">{t('ingredients.form.exampleTitle')}</p>
          <ul className="space-y-1">
            <li>{t('ingredients.form.exampleItem1')}</li>
            <li>{t('ingredients.form.exampleItem2')}</li>
            <li>{t('ingredients.form.exampleItem3')}</li>
          </ul>
        </div>
      )}
    </form>
  )
}
