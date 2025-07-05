import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useIngredients, useIngredientCategories } from '@/hooks/useIngredients'
import { UNIT_OPTIONS } from '@/utils/cogsCalculations'
import { formatCurrency } from '@/utils/formatters'
import type { Ingredient } from '@/lib/db/schema'

interface IngredientFormProps {
  ingredient?: Ingredient
  onSuccess: () => void
  onCancel: () => void
}

export function IngredientForm({ ingredient, onSuccess, onCancel }: IngredientFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    baseUnitCost: '',
    baseUnitQuantity: '',
    unit: '',
    supplierInfo: '',
    category: '',
    note: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { createIngredient, updateIngredient } = useIngredients()
  const { categories } = useIngredientCategories()
  const isEditing = !!ingredient

  // Initialize form data
  useEffect(() => {
    if (ingredient) {
      setFormData({
        name: ingredient.name,
        baseUnitCost: ingredient.baseUnitCost.toString(),
        baseUnitQuantity: ingredient.baseUnitQuantity.toString(),
        unit: ingredient.unit,
        supplierInfo: ingredient.supplierInfo || '',
        category: ingredient.category || '',
        note: ingredient.note
      })
    }
  }, [ingredient])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Validate form
      if (!formData.name.trim()) {
        setError('Ingredient name is required')
        return
      }

      if (!formData.unit) {
        setError('Unit is required')
        return
      }

      const baseUnitCost = parseFloat(formData.baseUnitCost)
      const baseUnitQuantity = parseFloat(formData.baseUnitQuantity)

      if (isNaN(baseUnitCost) || baseUnitCost < 0) {
        setError('Base unit cost must be a valid positive number')
        return
      }

      if (isNaN(baseUnitQuantity) || baseUnitQuantity <= 0) {
        setError('Base unit quantity must be a valid positive number')
        return
      }

      const ingredientData = {
        name: formData.name.trim(),
        baseUnitCost,
        baseUnitQuantity,
        unit: formData.unit,
        supplierInfo: formData.supplierInfo.trim(),
        category: formData.category.trim(),
        note: formData.note.trim()
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
        setError(result.error || 'Failed to save ingredient')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  // Calculate unit cost for preview
  const baseUnitCost = parseFloat(formData.baseUnitCost) || 0
  const baseUnitQuantity = parseFloat(formData.baseUnitQuantity) || 1
  const unitCost = baseUnitQuantity > 0 ? baseUnitCost / baseUnitQuantity : 0

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Ingredient Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter ingredient name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select or enter category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            placeholder="Or enter new category"
            className="mt-2"
          />
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
            value={formData.baseUnitCost}
            onChange={(e) => handleInputChange('baseUnitCost', e.target.value)}
            placeholder="0.00"
            required
          />
          <p className="text-xs text-muted-foreground">
            Cost for the base quantity
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="baseUnitQuantity">Base Unit Quantity *</Label>
          <Input
            id="baseUnitQuantity"
            type="number"
            step="0.01"
            min="0.01"
            value={formData.baseUnitQuantity}
            onChange={(e) => handleInputChange('baseUnitQuantity', e.target.value)}
            placeholder="1.00"
            required
          />
          <p className="text-xs text-muted-foreground">
            Quantity in the base unit
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">Unit *</Label>
          <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              {UNIT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Unit Cost Preview */}
      {baseUnitCost > 0 && baseUnitQuantity > 0 && (
        <div className="p-3 bg-muted/30 rounded-lg">
          <p className="text-sm font-medium">Cost Preview:</p>
          <p className="text-lg font-bold text-primary">
            {formatCurrency(unitCost)} per {formData.unit || 'unit'}
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
          value={formData.supplierInfo}
          onChange={(e) => handleInputChange('supplierInfo', e.target.value)}
          placeholder="Supplier name, contact, etc."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Notes</Label>
        <Textarea
          id="note"
          value={formData.note}
          onChange={(e) => handleInputChange('note', e.target.value)}
          placeholder="Additional notes about this ingredient"
          rows={3}
        />
      </div>

      <div className="flex items-center gap-3 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting || !formData.name.trim() || !formData.unit}
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
