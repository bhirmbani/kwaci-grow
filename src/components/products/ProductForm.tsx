import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useProducts } from '@/hooks/useProducts'
import { COGSBreakdown } from './COGSBreakdown'
import type { Product } from '@/lib/db/schema'

interface ProductFormProps {
  product?: Product
  onSuccess: () => void
  onCancel: () => void
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    note: '',
    isActive: true
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { createProduct, updateProduct } = useProducts()
  const isEditing = !!product

  // Initialize form data
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        note: product.note,
        isActive: product.isActive
      })
    }
  }, [product])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Validate form
      if (!formData.name.trim()) {
        setError(t('products.form.nameRequired'))
        return
      }

      let result
      if (isEditing) {
        result = await updateProduct(product.id, {
          name: formData.name.trim(),
          description: formData.description.trim(),
          note: formData.note.trim(),
          isActive: formData.isActive
        })
      } else {
        result = await createProduct({
          name: formData.name.trim(),
          description: formData.description.trim(),
          note: formData.note.trim(),
          isActive: formData.isActive
        })
      }

      if (result.success) {
        onSuccess()
      } else {
        setError(result.error || t('products.form.saveFailed'))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('products.form.unexpectedError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">{t('products.form.fields.name')}</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder={t('products.form.placeholders.name')}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t('products.form.fields.description')}</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder={t('products.form.placeholders.description')}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">{t('products.form.fields.note')}</Label>
        <Textarea
          id="note"
          value={formData.note}
          onChange={(e) => handleInputChange('note', e.target.value)}
          placeholder={t('products.form.placeholders.note')}
          rows={2}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => handleInputChange('isActive', checked)}
        />
        <Label htmlFor="isActive" className="text-sm font-medium">
          {t('products.form.fields.activeStatus')}
        </Label>
        <span className="text-sm text-muted-foreground">
          {formData.isActive ? t('products.form.active') : t('products.form.inactive')}
        </span>
      </div>

      {/* COGS Display for Existing Products */}
      {isEditing && product && (
        <div className="pt-4 border-t">
          <COGSBreakdown
            productId={product.id}
            productName={product.name}
            showExplanation={false}
          />
        </div>
      )}

      <div className="flex items-center gap-3 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting || !formData.name.trim()}
        >
          {isSubmitting
            ? (isEditing ? t('products.form.buttons.updating') : t('products.form.buttons.creating'))
            : (isEditing ? t('products.form.buttons.update') : t('products.form.buttons.create'))
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
          <p className="font-medium mb-1">{t('products.form.nextSteps.title')}</p>
          <ul className="space-y-1">
            <li>• {t('products.form.nextSteps.step1')}</li>
            <li>• {t('products.form.nextSteps.step2')}</li>
            <li>• {t('products.form.nextSteps.step3')}</li>
          </ul>
        </div>
      )}
    </form>
  )
}
