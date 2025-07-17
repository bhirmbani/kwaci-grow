import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { AssetCategoryCombobox } from './AssetCategoryCombobox'
import { FixedAssetService } from '@/lib/services/fixedAssetService'
import { formatCurrency } from '@/utils/formatters'
import { cn } from '@/lib/utils'
import type { FixedAsset, NewFixedAsset } from '@/lib/db/schema'

const fixedAssetFormSchema = z.object({
  name: z.string()
    .min(1, 'Asset name is required')
    .max(100, 'Asset name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_()]+$/, 'Asset name contains invalid characters'),
  categoryId: z.string().min(1, 'Category is required'),
  purchaseDate: z.string()
    .min(1, 'Purchase date is required')
    .refine((date) => {
      const purchaseDate = new Date(date)
      const today = new Date()
      const tenYearsAgo = new Date()
      tenYearsAgo.setFullYear(today.getFullYear() - 10)

      return purchaseDate <= today && purchaseDate >= tenYearsAgo
    }, 'Purchase date must be within the last 10 years and not in the future'),
  purchaseCost: z.number()
    .min(0.01, 'Purchase cost must be greater than 0')
    .max(1000000000000, 'Purchase cost cannot exceed 1 trillion IDR')
    .refine((cost) => Number.isFinite(cost), 'Purchase cost must be a valid number'),
  depreciationMonths: z.number()
    .min(1, 'Depreciation period must be at least 1 month')
    .max(600, 'Depreciation period cannot exceed 50 years')
    .int('Depreciation period must be a whole number'),
  note: z.string()
    .max(1000, 'Note must be less than 1000 characters')
    .optional(),
})

type FixedAssetFormData = z.infer<typeof fixedAssetFormSchema>

interface FixedAssetFormProps {
  asset?: FixedAsset
  onSuccess: () => void
  onCancel: () => void
  onSubmit: (data: NewFixedAsset) => Promise<void>
}

// Depreciation duration presets
const DEPRECIATION_PRESETS = [
  { label: '1 Year', value: 12 },
  { label: '2 Years', value: 24 },
  { label: '3 Years', value: 36 },
  { label: '5 Years', value: 60 },
  { label: '10 Years', value: 120 },
  { label: 'Custom', value: 0 }, // 0 indicates custom input
]

export function FixedAssetForm({ asset, onSuccess, onCancel, onSubmit: onSubmitProp }: FixedAssetFormProps) {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [useCustomDuration, setUseCustomDuration] = useState(false)
  const [currentValue, setCurrentValue] = useState<number | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const isEditing = !!asset

  const form = useForm<FixedAssetFormData>({
    resolver: zodResolver(fixedAssetFormSchema),
    defaultValues: {
      name: '',
      categoryId: '',
      purchaseDate: format(new Date(), 'yyyy-MM-dd'),
      purchaseCost: 0,
      depreciationMonths: 36, // Default to 3 years
      note: '',
    },
  })

  const watchedValues = form.watch(['purchaseCost', 'purchaseDate', 'depreciationMonths'])

  // Calculate current value in real-time
  useEffect(() => {
    const [purchaseCost, purchaseDate, depreciationMonths] = watchedValues
    if (purchaseCost > 0 && purchaseDate && depreciationMonths > 0) {
      const calculated = FixedAssetService.calculateCurrentValue(purchaseCost, purchaseDate, depreciationMonths)
      setCurrentValue(calculated)
    } else {
      setCurrentValue(null)
    }
  }, [watchedValues])

  // Set form values when editing
  useEffect(() => {
    if (asset) {
      form.reset({
        name: asset.name,
        categoryId: asset.categoryId,
        purchaseDate: asset.purchaseDate,
        purchaseCost: asset.purchaseCost,
        depreciationMonths: asset.depreciationMonths,
        note: asset.note || '',
      })

      // Check if using custom duration by seeing if the asset's depreciation months matches any preset
      const matchingPreset = DEPRECIATION_PRESETS.find(preset => preset.value === asset.depreciationMonths && preset.value !== 0)
      console.log('Asset depreciation months:', asset.depreciationMonths)
      console.log('Matching preset:', matchingPreset)
      console.log('Setting useCustomDuration to:', !matchingPreset)
      setUseCustomDuration(!matchingPreset)
    } else {
      // Reset to default when not editing
      setUseCustomDuration(false)
    }
  }, [asset, form])

  const handleDepreciationPresetChange = (value: string) => {
    const numValue = parseInt(value)
    if (numValue === 0) {
      setUseCustomDuration(true)
      // Keep current value if it's custom, otherwise set to 12 months
      const currentMonths = form.getValues('depreciationMonths')
      const isCurrentCustom = !DEPRECIATION_PRESETS.some(preset => preset.value === currentMonths)
      if (!isCurrentCustom) {
        form.setValue('depreciationMonths', 12)
      }
    } else {
      setUseCustomDuration(false)
      form.setValue('depreciationMonths', numValue)
    }
  }

  const onSubmit = async (data: FixedAssetFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const assetData: NewFixedAsset = {
        id: asset?.id || `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: data.name.trim(),
        categoryId: data.categoryId,
        purchaseDate: data.purchaseDate,
        purchaseCost: data.purchaseCost,
        depreciationMonths: data.depreciationMonths,
        note: data.note?.trim() || '',
      }

      await onSubmitProp(assetData)
      onSuccess()
    } catch (error) {
      console.error('Error submitting asset:', error)

      // Set specific error message based on error type
      let errorMessage = 'Failed to save asset. Please try again.'

      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.'
        } else if (error.message.includes('validation') || error.message.includes('invalid')) {
          errorMessage = 'Invalid data provided. Please check your inputs and try again.'
        } else if (error.message.includes('duplicate') || error.message.includes('exists')) {
          errorMessage = 'An asset with this name already exists. Please choose a different name.'
        } else {
          errorMessage = error.message
        }
      }

      setSubmitError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('fixedAssets.form.fields.name')}</FormLabel>
              <FormControl>
                <Input placeholder={t('fixedAssets.form.placeholders.name')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('fixedAssets.form.fields.category')}</FormLabel>
              <FormControl>
                <AssetCategoryCombobox
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder={t('fixedAssets.form.placeholders.selectCategory')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="purchaseDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('fixedAssets.form.fields.purchaseDate')}</FormLabel>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(new Date(field.value), "PPP")
                      ) : (
                        <span>{t('fixedAssets.form.placeholders.pickDate')}</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        field.onChange(format(date, 'yyyy-MM-dd'))
                        setCalendarOpen(false)
                      }
                    }}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="purchaseCost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('fixedAssets.form.fields.purchaseCost')}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder={t('fixedAssets.form.placeholders.purchaseCost')}
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel>{t('fixedAssets.form.fields.depreciation')}</FormLabel>
          <Select
            value={useCustomDuration ? '0' : (
              DEPRECIATION_PRESETS.find(preset => preset.value === form.getValues('depreciationMonths'))?.value.toString() || '0'
            )}
            onValueChange={handleDepreciationPresetChange}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('fixedAssets.form.placeholders.depreciation')} />
            </SelectTrigger>
            <SelectContent>
              {DEPRECIATION_PRESETS.map((preset) => (
                <SelectItem key={preset.value} value={preset.value.toString()}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {useCustomDuration && (
            <FormField
              control={form.control}
              name="depreciationMonths"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fixedAssets.form.fields.customDuration')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={t('fixedAssets.form.placeholders.customDuration')}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the depreciation period in months (1-600)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {currentValue !== null && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">{t('fixedAssets.form.preview.title')}</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">{t('fixedAssets.form.preview.currentValue')}</p>
                <p className="font-medium">{formatCurrency(currentValue)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('fixedAssets.form.preview.totalDepreciation')}</p>
                <p className="font-medium">{formatCurrency(form.getValues('purchaseCost') - currentValue)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('fixedAssets.form.preview.monthlyDepreciation')}</p>
                <p className="font-medium">{formatCurrency(form.getValues('purchaseCost') / form.getValues('depreciationMonths'))}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('fixedAssets.form.preview.remainingMonths')}</p>
                <p className="font-medium">
                  {Math.max(0, form.getValues('depreciationMonths') -
                    ((new Date().getFullYear() - new Date(form.getValues('purchaseDate')).getFullYear()) * 12 +
                     (new Date().getMonth() - new Date(form.getValues('purchaseDate')).getMonth())))} months
                </p>
              </div>
            </div>
          </div>
        )}

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('fixedAssets.form.fields.note')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('fixedAssets.form.placeholders.note')}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {t('fixedAssets.form.placeholders.note')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {submitError && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {submitError}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? t('fixedAssets.form.buttons.saving') : isEditing ? t('fixedAssets.form.buttons.update') : t('fixedAssets.form.buttons.create')}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            {t('fixedAssets.form.buttons.cancel')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
