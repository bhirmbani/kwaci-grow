import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { BranchService } from '@/lib/services/branchService'
import type { Branch } from '@/lib/db/schema'

const branchFormSchema = z.object({
  name: z.string().min(1, 'Branch name is required').max(100, 'Branch name must be less than 100 characters'),
  location: z.string().max(500, 'Location must be less than 500 characters').optional(),
  businessHoursStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format'),
  businessHoursEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format'),
  isActive: z.boolean(),
  note: z.string().max(1000, 'Note must be less than 1000 characters').optional(),
}).refine((data) => {
  // Validate that end time is after start time
  const [startHour, startMin] = data.businessHoursStart.split(':').map(Number)
  const [endHour, endMin] = data.businessHoursEnd.split(':').map(Number)
  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  return endMinutes > startMinutes
}, {
  message: 'End time must be after start time',
  path: ['businessHoursEnd']
})

type BranchFormData = z.infer<typeof branchFormSchema>

interface BranchFormProps {
  branch?: Branch
  onSuccess: () => void
  onCancel: () => void
}

export function BranchForm({ branch, onSuccess, onCancel }: BranchFormProps) {
  const isEditing = !!branch
  const { t } = useTranslation()

  const form = useForm<BranchFormData>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: {
      name: '',
      location: '',
      businessHoursStart: '06:00',
      businessHoursEnd: '22:00',
      isActive: true,
      note: '',
    },
  })

  const { handleSubmit, formState: { isSubmitting, errors }, reset, watch, register } = form

  // Initialize form data when branch prop changes
  useEffect(() => {
    if (branch) {
      reset({
        name: branch.name,
        location: branch.location || '',
        businessHoursStart: branch.businessHoursStart || '06:00',
        businessHoursEnd: branch.businessHoursEnd || '22:00',
        isActive: branch.isActive,
        note: branch.note || '',
      })
    } else {
      reset({
        name: '',
        location: '',
        businessHoursStart: '06:00',
        businessHoursEnd: '22:00',
        isActive: true,
        note: '',
      })
    }
  }, [branch, reset])

  const onSubmit = async (data: BranchFormData) => {
    try {
      if (isEditing) {
        await BranchService.update(branch.id, {
          name: data.name.trim(),
          location: data.location?.trim() || '',
          businessHoursStart: data.businessHoursStart,
          businessHoursEnd: data.businessHoursEnd,
          isActive: data.isActive,
          note: data.note?.trim() || '',
        })
      } else {
        await BranchService.create({
          name: data.name.trim(),
          location: data.location?.trim() || '',
          businessHoursStart: data.businessHoursStart,
          businessHoursEnd: data.businessHoursEnd,
          note: data.note?.trim() || '',
        })
      }

      onSuccess()
    } catch (error) {
      console.error('Failed to save branch:', error)
      // You might want to show a toast notification here
    }
  }

  const watchedIsActive = watch('isActive')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
      {/* Error Display */}
      {Object.keys(errors).length > 0 && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {Object.values(errors).map((error, index) => (
            <div key={index}>{error?.message}</div>
          ))}
        </div>
      )}

      {/* Branch Name */}
      <div className="space-y-2">
        <Label htmlFor="name">{t('menus.branchForm.name')}</Label>
        <Input
          id="name"
          placeholder={t('menus.branchForm.placeholders.name')}
          {...register('name')}
        />
        <p className="text-xs text-muted-foreground">
          {t('menus.branchForm.help.name')}
        </p>
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location">{t('menus.branchForm.location')}</Label>
        <Textarea
          id="location"
          placeholder={t('menus.branchForm.placeholders.location')}
          rows={2}
          {...register('location')}
        />
        <p className="text-xs text-muted-foreground">
          {t('menus.branchForm.help.location')}
        </p>
        {errors.location && (
          <p className="text-sm text-red-600">{errors.location.message}</p>
        )}
      </div>

      {/* Business Hours */}
      <div className="space-y-4">
        <div>
          <Label className="text-base">{t('menus.branchForm.businessHours')}</Label>
          <p className="text-sm text-muted-foreground">
            {t('menus.branchForm.help.businessHours')}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Start Time */}
          <div className="space-y-2">
            <Label htmlFor="businessHoursStart">{t('menus.branchForm.startTime')}</Label>
            <Input
              id="businessHoursStart"
              type="time"
              {...register('businessHoursStart')}
            />
            {errors.businessHoursStart && (
              <p className="text-sm text-red-600">{errors.businessHoursStart.message}</p>
            )}
          </div>

          {/* End Time */}
          <div className="space-y-2">
            <Label htmlFor="businessHoursEnd">{t('menus.branchForm.endTime')}</Label>
            <Input
              id="businessHoursEnd"
              type="time"
              {...register('businessHoursEnd')}
            />
            {errors.businessHoursEnd && (
              <p className="text-sm text-red-600">{errors.businessHoursEnd.message}</p>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {t('menus.branchForm.help.businessHoursInfo')}
        </p>
      </div>

      {/* Active Status */}
      <div className="flex flex-row items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label className="text-base">{t('menus.branchForm.activeStatus')}</Label>
          <p className="text-sm text-muted-foreground">
            {watchedIsActive
              ? t('menus.branchForm.activeHelp')
              : t('menus.branchForm.inactiveHelp')
            }
          </p>
        </div>
        <Switch
          checked={watchedIsActive}
          onCheckedChange={(checked) => {
            form.setValue('isActive', checked)
          }}
        />
      </div>

      {/* Note */}
      <div className="space-y-2">
        <Label htmlFor="note">{t('menus.branchForm.note')}</Label>
        <Textarea
          id="note"
          placeholder={t('menus.branchForm.placeholders.note')}
          rows={2}
          {...register('note')}
        />
        <p className="text-xs text-muted-foreground">
          {t('menus.branchForm.help.note')}
        </p>
        {errors.note && (
          <p className="text-sm text-red-600">{errors.note.message}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? (isEditing ? t('menus.branchForm.buttons.updating') : t('menus.branchForm.buttons.creating'))
            : (isEditing ? t('menus.branchForm.buttons.update') : t('menus.branchForm.buttons.create'))
          }
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {t('menus.branchForm.buttons.cancel')}
        </Button>
      </div>

      {/* Help Text */}
      {!isEditing && (
        <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <p className="font-medium mb-1">Branch Management:</p>
          <ul className="space-y-1">
            <li>• Branches represent physical locations where you serve customers</li>
            <li>• Each branch can have multiple menus assigned to it</li>
            <li>• Use branches to manage location-specific offerings and targets</li>
            <li>• Inactive branches are hidden but can be reactivated later</li>
          </ul>
        </div>
      )}
    </form>
  )
}
